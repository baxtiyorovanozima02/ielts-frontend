import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { liveSpeakingAPI, getWsBaseUrl } from '../services/api';


function LiveSpeakingPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const testId = searchParams.get('test');

    const [phase, setPhase] = useState('starting');
    const [session, setSession] = useState(null);
    const [avatarMode, setAvatarMode] = useState(false);
    const [messages, setMessages] = useState([]);
    const [recording, setRecording] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const wsRef = useRef(null);
    const avatarRef = useRef(null);
    const videoRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const fallbackAudioRef = useRef(null);

    const addMessage = useCallback((role, text) => {
        setMessages(prev => [...prev, { role, text, id: Date.now() + Math.random() }]);
    }, []);


    useEffect(() => {
        let cancelled = false;

        async function init() {
            try {
                const res = await liveSpeakingAPI.start(testId ? { test_id: Number(testId) } : {});
                if (cancelled) return;

                const { session: sessionData, websocket_url, avatar_token, avatar_id } = res.data;
                setSession(sessionData);

                if (avatar_token) {
                    const ok = await initHeygenAvatar(avatar_token, avatar_id);
                    setAvatarMode(ok);
                } else {
                    setAvatarMode(false);
                }

                connectWebSocket(sessionData.id, websocket_url);
            } catch (err) {
                if (cancelled) return;
                setPhase('error');
                setErrorMsg("Sessiyani boshlab bo'lmadi. Qayta urinib ko'ring.");
            }
        }

        init();

        return () => {
            cancelled = true;
            cleanup();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    async function initHeygenAvatar(avatarToken, avatarId) {
        try {
            const mod = await import('@heygen/streaming-avatar');
            const StreamingAvatar = mod.default;
            const { StreamingEvents, AvatarQuality, TaskType, TaskMode } = mod;

            const avatar = new StreamingAvatar({ token: avatarToken });
            avatarRef.current = avatar;
            avatarRef.current._TaskType = TaskType;
            avatarRef.current._TaskMode = TaskMode;

            avatar.on(StreamingEvents.STREAM_READY, (event) => {
                if (videoRef.current) {
                    videoRef.current.srcObject = event.detail;
                    videoRef.current.play().catch(() => {});
                }
            });

            avatar.on(StreamingEvents.STREAM_DISCONNECTED, () => {
                setAvatarMode(false);
            });

            await avatar.createStartAvatar({
                avatarName: avatarId,
                quality: AvatarQuality.Low,
            });

            return true;
        } catch (err) {
            console.warn("HeyGen avatar ishga tushmadi, audio-orb rejimiga o'tildi:", err);
            return false;
        }
    }

    async function avatarSpeak(text) {
        const avatar = avatarRef.current;
        if (!avatar) return;
        try {
            await avatar.speak({
                text,
                task_type: avatar._TaskType?.REPEAT,
                taskMode: avatar._TaskMode?.SYNC,
            });
        } catch (err) {
            console.warn('Avatar speak xatolik:', err);
        }
    }


    function connectWebSocket(sessionId, websocketUrl) {
        const token = localStorage.getItem('access_token');
        const base = getWsBaseUrl();
        const path = websocketUrl || `/ws/live-speaking/${sessionId}/`;
        const wsUrl = `${base}${path}?token=${encodeURIComponent(token || '')}`;

        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => setPhase('listening');

        ws.onmessage = async (event) => {
            let data;
            try {
                data = JSON.parse(event.data);
            } catch {
                return;
            }

            switch (data.type) {
                case 'status':
                    setPhase(data.state);
                    break;
                case 'transcript':
                    addMessage('user', data.text);
                    break;
                case 'assistant_text':
                    addMessage('assistant', data.text);
                    if (avatarMode) {
                        avatarSpeak(data.text);
                    }
                    break;
                case 'assistant_audio':
                    if (!avatarMode) {
                        playFallbackAudio(data.audio_base64, data.mime || 'audio/mpeg');
                    }
                    break;
                case 'error':
                    setErrorMsg(data.message);
                    break;
                default:
                    break;
            }
        };

        ws.onerror = () => setErrorMsg('WebSocket ulanishida xatolik yuz berdi');

        ws.onclose = () => {
            if (phase !== 'ended') setPhase('ended');
        };
    }

    function playFallbackAudio(base64, mime) {
        try {
            const byteChars = atob(base64);
            const bytes = new Uint8Array(byteChars.length);
            for (let i = 0; i < byteChars.length; i++) bytes[i] = byteChars.charCodeAt(i);
            const blob = new Blob([bytes], { type: mime });
            const url = URL.createObjectURL(blob);
            if (fallbackAudioRef.current) {
                fallbackAudioRef.current.src = url;
                fallbackAudioRef.current.play().catch(() => {});
            }
        } catch (err) {
            console.warn('Audio ijro etishda xatolik:', err);
        }
    }


    const startRecording = async () => {
        if (phase !== 'listening') return;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            audioChunksRef.current = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data);
            };

            recorder.onstop = async () => {
                stream.getTracks().forEach(t => t.stop());
                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const base64 = await blobToBase64(blob);

                if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                    wsRef.current.send(JSON.stringify({ type: 'audio_chunk', audio_base64: base64 }));
                    wsRef.current.send(JSON.stringify({ type: 'end_of_turn' }));
                }
            };

            recorder.start();
            mediaRecorderRef.current = recorder;
            setRecording(true);
        } catch {
            setErrorMsg("Mikrofonga ruxsat berilmadi. Brauzer sozlamalarini tekshiring.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && recording) {
            mediaRecorderRef.current.stop();
            setRecording(false);
        }
    };

    function blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    const endSession = async () => {
        cleanup();
        setPhase('ended');
        if (session) {
            try {
                await liveSpeakingAPI.endSession(session.id);
            } catch {}
        }
        navigate('/tests');
    };

    function cleanup() {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        if (wsRef.current) {
            wsRef.current.close();
        }
        if (avatarRef.current) {
            try { avatarRef.current.stopAvatar(); } catch {}
        }
    }

    const phaseLabel = {
        starting: 'Sessiya boshlanmoqda...',
        connecting: 'Ulanmoqda...',
        listening: 'Sizni eshityapman - gapirish uchun tugmani bosing',
        thinking: '🤔 O\'ylamoqda...',
        speaking: '🗣 Javob bermoqda...',
        ended: 'Suhbat tugadi',
        error: 'Xatolik',
    };

    return (
        <div style={styles.page}>
            <Navbar />
            <main style={styles.main}>
                <div style={styles.header}>
                    <button onClick={() => navigate(-1)} style={styles.backBtn}>← Orqaga</button>
                    <h1 style={styles.title}>🧑‍🏫 AI Avatar bilan Speaking</h1>
                </div>

                {errorMsg && <div style={styles.errorBanner}>{errorMsg}</div>}

                <div style={styles.layout}>
                    <div style={styles.avatarCard}>
                        {avatarMode ? (
                            <video ref={videoRef} autoPlay playsInline style={styles.avatarVideo} />
                        ) : (
                            <div style={{
                                ...styles.orb,
                                ...(phase === 'speaking' ? styles.orbSpeaking : {}),
                                ...(phase === 'thinking' ? styles.orbThinking : {}),
                            }}>
                                🤖
                            </div>
                        )}
                        <div style={styles.phaseLabel}>{phaseLabel[phase] || phase}</div>
                        <audio ref={fallbackAudioRef} style={{ display: 'none' }} />

                        <div style={styles.micSection}>
                            <button
                                onMouseDown={startRecording}
                                onMouseUp={stopRecording}
                                onTouchStart={startRecording}
                                onTouchEnd={stopRecording}
                                disabled={phase !== 'listening'}
                                style={{
                                    ...styles.micBtn,
                                    ...(recording ? styles.micBtnRecording : {}),
                                    opacity: phase !== 'listening' ? 0.4 : 1,
                                    cursor: phase !== 'listening' ? 'not-allowed' : 'pointer',
                                }}
                            >
                                {recording ? '⏹' : '🎤'}
                            </button>
                            <div style={styles.micHint}>
                                {recording ? 'Qo\'yib yuborsangiz javob boshlanadi' : 'Ushlab turib gapiring'}
                            </div>
                        </div>

                        <button onClick={endSession} style={styles.endBtn}>Suhbatni tugatish</button>
                    </div>

                    <div style={styles.chatCard}>
                        <div style={styles.chatTitle}>💬 Suhbat matni</div>
                        <div style={styles.chatLog}>
                            {messages.length === 0 && (
                                <div style={styles.chatEmpty}>Hali xabar yo'q. Gapirishni boshlang.</div>
                            )}
                            {messages.map(m => (
                                <div key={m.id} style={{
                                    ...styles.chatBubble,
                                    ...(m.role === 'user' ? styles.chatBubbleUser : styles.chatBubbleAssistant),
                                }}>
                                    <div style={styles.chatRole}>{m.role === 'user' ? 'Siz' : 'AI Examiner'}</div>
                                    <div>{m.text}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

const styles = {
    page: {
        minHeight: '100vh',
        backgroundColor: 'var(--bg-base)',
    },
    main: {
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '32px 24px',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '24px',
    },
    backBtn: {
        padding: '5px 12px',
        backgroundColor: 'transparent',
        color: 'var(--accent)',
        border: '1px solid var(--border)',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: '600',
        cursor: 'pointer',
        fontFamily: 'Sora, sans-serif',
    },
    title: {
        fontSize: '22px',
        fontWeight: '700',
        color: 'var(--text-primary)',
    },
    errorBanner: {
        backgroundColor: 'rgba(239,68,68,0.1)',
        border: '1px solid rgba(239,68,68,0.3)',
        color: '#f87171',
        padding: '10px 16px',
        borderRadius: '8px',
        marginBottom: '20px',
        fontSize: '13px',
    },
    layout: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px',
    },
    avatarCard: {
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
    },
    avatarVideo: {
        width: '100%',
        maxWidth: '360px',
        borderRadius: '12px',
        backgroundColor: '#000',
        aspectRatio: '1 / 1',
        objectFit: 'cover',
    },
    orb: {
        width: '180px',
        height: '180px',
        borderRadius: '50%',
        backgroundColor: 'var(--accent)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '64px',
        transition: 'all 0.3s',
    },
    orbThinking: {
        opacity: 0.6,
        animation: 'pulse 1.2s infinite',
    },
    orbSpeaking: {
        boxShadow: '0 0 0 16px rgba(59,130,246,0.15)',
    },
    phaseLabel: {
        fontSize: '13px',
        color: 'var(--text-secondary)',
        textAlign: 'center',
        minHeight: '18px',
    },
    micSection: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
    },
    micBtn: {
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        backgroundColor: 'var(--accent)',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '30px',
        transition: 'all 0.2s',
    },
    micBtnRecording: {
        backgroundColor: '#ef4444',
        boxShadow: '0 0 0 10px rgba(239,68,68,0.2)',
    },
    micHint: {
        fontSize: '12px',
        color: 'var(--text-muted)',
    },
    endBtn: {
        padding: '10px 20px',
        backgroundColor: 'transparent',
        color: '#f87171',
        border: '1px solid rgba(239,68,68,0.3)',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
        fontFamily: 'Sora, sans-serif',
    },
    chatCard: {
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        maxHeight: '600px',
    },
    chatTitle: {
        fontSize: '14px',
        fontWeight: '700',
        color: 'var(--text-primary)',
    },
    chatLog: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        overflowY: 'auto',
    },
    chatEmpty: {
        color: 'var(--text-muted)',
        fontSize: '13px',
        textAlign: 'center',
        padding: '32px 0',
    },
    chatBubble: {
        padding: '10px 14px',
        borderRadius: '10px',
        fontSize: '14px',
        lineHeight: '1.6',
        maxWidth: '90%',
    },
    chatBubbleUser: {
        alignSelf: 'flex-end',
        backgroundColor: 'var(--accent)',
        color: 'white',
    },
    chatBubbleAssistant: {
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(255,255,255,0.06)',
        color: 'var(--text-secondary)',
        border: '1px solid var(--border)',
    },
    chatRole: {
        fontSize: '11px',
        fontWeight: '700',
        opacity: 0.7,
        marginBottom: '3px',
    },
};

export default LiveSpeakingPage;