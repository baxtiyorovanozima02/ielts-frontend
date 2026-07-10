import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { liveSpeakingAPI, getWsBaseUrl } from '../services/api';


import StreamingAvatar, {
    AvatarQuality,
    StreamingEvents,
    TaskType,
    TaskMode,
} from '@heygen/streaming-avatar';

function LiveSpeakingPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const testId = searchParams.get('test_id');
    const voiceId = searchParams.get('voice_id');

    const videoRef = useRef(null);
    const avatarRef = useRef(null);
    const socketRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const streamRef = useRef(null);

    const [connecting, setConnecting] = useState(true);
    const [avatarReady, setAvatarReady] = useState(false);
    const [wsReady, setWsReady] = useState(false);
    const [status, setStatus] = useState('idle'); // idle | listening | thinking | speaking
    const [recording, setRecording] = useState(false);
    const [messages, setMessages] = useState([]); // {role, text}
    const [errorMsg, setErrorMsg] = useState('');
    const [session, setSession] = useState(null);


    const setupAvatar = useCallback(async (avatarToken, avatarId) => {
        if (!avatarToken) {
            setErrorMsg("Avatar tokeni olinmadi. Faqat ovozli rejimda davom etamiz.");
            return;
        }
        try {
            const avatar = new StreamingAvatar({ token: avatarToken });
            avatarRef.current = avatar;

            avatar.on(StreamingEvents.STREAM_READY, (event) => {
                if (videoRef.current) {
                    videoRef.current.srcObject = event.detail;
                }
                setAvatarReady(true);
            });

            avatar.on(StreamingEvents.STREAM_DISCONNECTED, () => {
                setAvatarReady(false);
            });

            await avatar.createStartAvatar({
                quality: AvatarQuality.Low,
                avatarName: avatarId,
            });
        } catch (exc) {
            console.error('HeyGen avatar ulanishida xatolik:', exc);
            setErrorMsg("Avatar videosini yuklab bo'lmadi. Ovozli rejimda davom etamiz.");
        }
    }, []);


    const speakThroughAvatar = useCallback(async (text) => {
        if (!avatarRef.current || !avatarReady) return;
        try {
            await avatarRef.current.speak({
                text,
                task_type: TaskType.REPEAT,
                task_mode: TaskMode.SYNC,
            });
        } catch (exc) {
            console.error('Avatar gapirishda xatolik:', exc);
        }
    }, [avatarReady]);


    const setupSocket = useCallback((sessionIdVal, wsUrl) => {
        const accessToken = localStorage.getItem('access_token');
        const socket = new WebSocket(`${getWsBaseUrl()}${wsUrl}?token=${accessToken}`);
        socketRef.current = socket;

        socket.onopen = () => setWsReady(true);

        socket.onmessage = async (event) => {
            const data = JSON.parse(event.data);

            switch (data.type) {
                case 'status':
                    setStatus(data.state);
                    break;

                case 'transcript':
                    setMessages(prev => [...prev, { role: 'user', text: data.text }]);
                    break;

                case 'assistant_text':
                    setMessages(prev => [...prev, { role: 'assistant', text: data.text }]);

                    if (avatarReady) {
                        speakThroughAvatar(data.text);
                    }
                    break;

                case 'assistant_audio':
                    if (!avatarReady) {
                        const audio = new Audio(`data:${data.mime};base64,${data.audio_base64}`);
                        audio.play().catch(() => {});
                    }
                    break;

                case 'error':
                    setErrorMsg(data.message);
                    break;

                default:
                    break;
            }
        };

        socket.onerror = () => {
            setErrorMsg("WebSocket ulanishida xatolik yuz berdi.");
        };

        socket.onclose = () => setWsReady(false);
    }, [avatarReady, speakThroughAvatar]);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const res = await liveSpeakingAPI.startSession({
                    test_id: testId || undefined,
                    voice_id: voiceId || undefined,
                });
                if (cancelled) return;

                const { session: sessionData, websocket_url, avatar_token, avatar_id } = res.data;
                setSession(sessionData);
                setupSocket(sessionData.id, websocket_url);
                await setupAvatar(avatar_token, avatar_id);
            } catch (exc) {
                console.error('Sessiya boshlanmadi:', exc);
                setErrorMsg("Sessiyani boshlab bo'lmadi. Qayta urinib ko'ring.");
            } finally {
                if (!cancelled) setConnecting(false);
            }
        })();

        return () => {
            cancelled = true;
            if (socketRef.current) socketRef.current.close();
            if (avatarRef.current) avatarRef.current.stopAvatar().catch(() => {});
            if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    const startRecording = async () => {
        if (!wsReady) return;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            mediaRecorderRef.current = recorder;

            recorder.ondataavailable = (e) => {
                if (e.data.size === 0 || !socketRef.current) return;
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64 = reader.result.split(',')[1];
                    if (socketRef.current?.readyState === WebSocket.OPEN) {
                        socketRef.current.send(JSON.stringify({
                            type: 'audio_chunk',
                            audio_base64: base64,
                        }));
                    }
                };
                reader.readAsDataURL(e.data);
            };

            recorder.start(250); // har 250ms da bo'lakcha yuboriladi
            setRecording(true);
        } catch (exc) {
            setErrorMsg("Mikrofonga ruxsat berilmadi. Brauzer sozlamalarini tekshiring.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
        }
        setRecording(false);

        setTimeout(() => {
            if (socketRef.current?.readyState === WebSocket.OPEN) {
                socketRef.current.send(JSON.stringify({ type: 'end_of_turn' }));
            }
        }, 300);
    };

    const endSession = async () => {
        try {
            if (session) await liveSpeakingAPI.endSession(session.id);
        } catch { /* noop */ }
        if (socketRef.current) socketRef.current.close();
        if (avatarRef.current) avatarRef.current.stopAvatar().catch(() => {});
        navigate('/tests');
    };

    const statusLabel = {
        idle: 'Kutilmoqda...',
        listening: '🎤 Tinglayapman',
        thinking: '🤔 O\'ylayapman...',
        speaking: '🗣 Gapiryapman...',
    }[status] || status;

    if (connecting) {
        return (
            <div style={styles.page}>
                <Navbar />
                <div style={styles.loading}>Avatar bilan ulanmoqda...</div>
            </div>
        );
    }

    return (
        <div style={styles.page}>
            <Navbar />
            <main style={styles.main}>
                <div style={styles.header}>
                    <button onClick={() => navigate(-1)} style={styles.backBtn}>← Orqaga</button>
                    <h1 style={styles.title}>🧑‍🏫 Live Speaking — AI Avatar</h1>
                    <div style={styles.statusBadge}>{statusLabel}</div>
                </div>

                {errorMsg && <div style={styles.errorBanner}>{errorMsg}</div>}

                <div style={styles.layout}>
                    <div style={styles.avatarCard}>
                        {avatarReady ? (
                            <video ref={videoRef} autoPlay playsInline style={styles.video} />
                        ) : (
                            <div style={styles.avatarPlaceholder}>
                                <div style={styles.avatarPlaceholderIcon}>🤖</div>
                                <div>Avatar video kutilmoqda...</div>
                            </div>
                        )}
                    </div>

                    <div style={styles.sideCard}>
                        <div style={styles.transcriptBox}>
                            {messages.length === 0 && (
                                <div style={styles.emptyHint}>
                                    Mikrofon tugmasini bosib ushlab turing va gapiring,
                                    qo'yib yuborsangiz AI javob beradi.
                                </div>
                            )}
                            {messages.map((m, i) => (
                                <div
                                    key={i}
                                    style={{
                                        ...styles.bubble,
                                        ...(m.role === 'user' ? styles.bubbleUser : styles.bubbleAssistant),
                                    }}
                                >
                                    <span style={styles.bubbleRole}>
                                        {m.role === 'user' ? 'Siz' : 'Examiner'}
                                    </span>
                                    {m.text}
                                </div>
                            ))}
                        </div>

                        <div style={styles.controls}>
                            <button
                                style={{
                                    ...styles.micBtn,
                                    ...(recording ? styles.micBtnRecording : {}),
                                    opacity: wsReady ? 1 : 0.5,
                                }}
                                disabled={!wsReady || status === 'thinking' || status === 'speaking'}
                                onMouseDown={startRecording}
                                onMouseUp={stopRecording}
                                onTouchStart={startRecording}
                                onTouchEnd={stopRecording}
                            >
                                {recording ? '⏹' : '🎤'}
                            </button>
                            <div style={styles.micHint}>
                                {recording ? "Gapiring... qo'yib yuboring" : 'Ushlab turib gapiring'}
                            </div>
                            <button onClick={endSession} style={styles.endBtn}>
                                🔚 Suhbatni tugatish
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

const styles = {
    page: { minHeight: '100vh', backgroundColor: 'var(--bg-base)' },
    loading: { textAlign: 'center', padding: '80px', color: 'var(--text-muted)', fontSize: '14px' },
    main: { maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' },
    header: {
        display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', flexWrap: 'wrap',
    },
    backBtn: {
        padding: '5px 12px', backgroundColor: 'transparent', color: 'var(--accent)',
        border: '1px solid var(--border)', borderRadius: '6px', fontSize: '12px',
        fontWeight: '600', cursor: 'pointer', fontFamily: 'Sora, sans-serif',
    },
    title: { fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', flex: 1 },
    statusBadge: {
        padding: '8px 16px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: '999px', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)',
    },
    errorBanner: {
        backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)',
        color: '#f87171', padding: '12px 16px', borderRadius: '10px', marginBottom: '16px', fontSize: '13px',
    },
    layout: { display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '24px' },
    avatarCard: {
        backgroundColor: '#0a0a0f', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
        aspectRatio: '4 / 3', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
    },
    video: { width: '100%', height: '100%', objectFit: 'cover' },
    avatarPlaceholder: {
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', color: 'var(--text-muted)',
    },
    avatarPlaceholderIcon: { fontSize: '48px' },
    sideCard: {
        backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
        padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px',
    },
    transcriptBox: {
        flex: 1, minHeight: '260px', maxHeight: '360px', overflowY: 'auto',
        display: 'flex', flexDirection: 'column', gap: '10px',
    },
    emptyHint: { fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6' },
    bubble: {
        padding: '10px 14px', borderRadius: '10px', fontSize: '13px', lineHeight: '1.5', maxWidth: '95%',
    },
    bubbleUser: { backgroundColor: 'rgba(59,130,246,0.1)', alignSelf: 'flex-end', color: 'var(--text-primary)' },
    bubbleAssistant: { backgroundColor: 'rgba(255,255,255,0.04)', alignSelf: 'flex-start', color: 'var(--text-secondary)' },
    bubbleRole: { display: 'block', fontSize: '10px', fontWeight: '700', opacity: 0.6, marginBottom: '4px', textTransform: 'uppercase' },
    controls: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' },
    micBtn: {
        width: '72px', height: '72px', borderRadius: '50%', backgroundColor: 'var(--accent)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px',
        border: 'none', cursor: 'pointer', transition: 'all 0.2s', userSelect: 'none',
    },
    micBtnRecording: {
        backgroundColor: '#ef4444', boxShadow: '0 0 0 10px rgba(239,68,68,0.2)',
    },
    micHint: { fontSize: '12px', color: 'var(--text-muted)' },
    endBtn: {
        marginTop: '8px', padding: '10px 20px', backgroundColor: 'transparent', color: '#f87171',
        border: '1px solid rgba(239,68,68,0.4)', borderRadius: '8px', fontSize: '13px',
        fontWeight: '600', cursor: 'pointer', fontFamily: 'Sora, sans-serif',
    },
};

export default LiveSpeakingPage;