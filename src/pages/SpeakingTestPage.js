import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { testsAPI } from '../services/api';

function SpeakingTestPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [test, setTest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [audioFile, setAudioFile] = useState(null);
    const [recording, setRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [audioURL, setAudioURL] = useState('');
    const [timeLeft, setTimeLeft] = useState(15 * 60);
    const [chunks, setChunks] = useState([]);

    useEffect(() => {
        testsAPI.getTest(id)
            .then(res => setTest(res.data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [id]);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (sec) => {
        const m = Math.floor(sec / 60).toString().padStart(2, '0');
        const s = (sec % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const addXP = (amount) => {
        const current = parseInt(localStorage.getItem('xp_total') || '0');
        localStorage.setItem('xp_total', current + amount);
        const goal = JSON.parse(localStorage.getItem('daily_goal') || '{}');
        const today = new Date().toDateString();
        const done = goal.date === today ? (goal.done || 0) : 0;
        localStorage.setItem('daily_goal', JSON.stringify({ date: today, done: done + 1 }));
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const audioChunks = [];

            recorder.ondataavailable = (e) => {
                audioChunks.push(e.data);
            };

            recorder.onstop = () => {
                const blob = new Blob(audioChunks, { type: 'audio/wav' });
                const url = URL.createObjectURL(blob);
                setAudioURL(url);
                setAudioFile(blob);
            };

            recorder.start();
            setMediaRecorder(recorder);
            setRecording(true);
            setChunks(audioChunks);
        } catch {
            alert("Mikrofonga ruxsat berilmadi. Brauzer sozlamalarini tekshiring.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorder) {
            mediaRecorder.stop();
            setRecording(false);
        }
    };

    const handleSubmit = async () => {
        if (!audioFile) return;
        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('audio', audioFile, 'speaking.wav');
            const res = await testsAPI.submitSpeaking(id, formData);
            addXP(60);
            navigate('/tests/result', { state: { result: res.data, type: 'speaking' } });
        } catch {
            alert("Xatolik yuz berdi. Qayta urinib ko'ring.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div style={styles.page}>
            <Navbar />
            <div style={styles.loading}>Yuklanmoqda...</div>
        </div>
    );

    return (
        <div style={styles.page}>
            <Navbar />
            <main style={styles.main}>

                {/* Header */}
                <div style={styles.header}>
                    <div>
                        <div style={styles.breadcrumb}>
                            <a href="/tests" style={styles.breadcrumbLink}>Testlar</a>
                            <span style={styles.breadcrumbSep}>/</span>
                            <span>Speaking</span>
                        </div>
                        <h1 style={styles.title}>{test?.title}</h1>
                    </div>
                    <div style={{
                        ...styles.timer,
                        ...(timeLeft < 120 ? styles.timerDanger : {})
                    }}>
                        ⏱ {formatTime(timeLeft)}
                    </div>
                </div>

                <div style={styles.layout}>

                    {/* Questions */}
                    <div style={styles.taskCard}>
                        <div style={styles.taskLabel}>📋 Savollar</div>
                        <div style={styles.taskText}>
                            {test?.question || test?.prompt || 'Savol yuklanmoqda...'}
                        </div>
                        <div style={styles.tips}>
                            <div style={styles.tipsTitle}>💡 Maslahatlar</div>
                            <ul style={styles.tipsList}>
                                <li>Aniq va ravshan gapiring</li>
                                <li>Misollar keltiring</li>
                                <li>1-2 daqiqa gapiring</li>
                            </ul>
                        </div>
                    </div>

                    {/* Recording */}
                    <div style={styles.recordCard}>
                        <div style={styles.taskLabel}>🎤 Yozib olish</div>

                        <div style={styles.micSection}>
                            <div style={{
                                ...styles.micBtn,
                                ...(recording ? styles.micBtnRecording : {})
                            }}
                                onClick={recording ? stopRecording : startRecording}
                            >
                                {recording ? '⏹' : '🎤'}
                            </div>
                            <div style={styles.micStatus}>
                                {recording
                                    ? "🔴 Yozilmoqda... (to'xtatish uchun bosing)"
                                    : audioURL
                                        ? '✅ Yozib olindi'
                                        : 'Boshlash uchun tugmani bosing'}
                            </div>
                        </div>

                        {audioURL && (
                            <div style={styles.audioSection}>
                                <div style={styles.taskLabel}>🎧 Tinglash</div>
                                <audio controls src={audioURL} style={styles.audioPlayer} />
                            </div>
                        )}

                        <button
                            onClick={handleSubmit}
                            disabled={!audioFile || submitting}
                            style={{
                                ...styles.submitBtn,
                                opacity: (!audioFile || submitting) ? 0.5 : 1
                            }}
                        >
                            {submitting ? '🤖 AI baholamoqda...' : '📤 Yuborish va baholash'}
                        </button>
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
    loading: {
        textAlign: 'center',
        padding: '80px',
        color: 'var(--text-muted)',
        fontSize: '14px',
    },
    main: {
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '32px 24px',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '28px',
    },
    breadcrumb: {
        fontSize: '13px',
        color: 'var(--text-muted)',
        marginBottom: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
    },
    breadcrumbLink: {
        color: 'var(--accent)',
        textDecoration: 'none',
    },
    breadcrumbSep: {
        color: 'var(--text-muted)',
    },
    title: {
        fontSize: '24px',
        fontWeight: '700',
        color: 'var(--text-primary)',
    },
    timer: {
        padding: '10px 20px',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        fontSize: '18px',
        fontWeight: '700',
        color: 'var(--text-primary)',
        fontFamily: 'monospace',
    },
    timerDanger: {
        borderColor: '#ef4444',
        color: '#f87171',
        backgroundColor: 'rgba(239,68,68,0.08)',
    },
    layout: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px',
    },
    taskCard: {
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    taskLabel: {
        fontSize: '12px',
        fontWeight: '600',
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        marginBottom: '4px',
    },
    taskText: {
        fontSize: '15px',
        color: 'var(--text-secondary)',
        lineHeight: '1.8',
        whiteSpace: 'pre-wrap',
    },
    tips: {
        backgroundColor: 'rgba(59,130,246,0.06)',
        border: '1px solid rgba(59,130,246,0.15)',
        borderRadius: '10px',
        padding: '16px',
    },
    tipsTitle: {
        fontSize: '13px',
        fontWeight: '600',
        color: 'var(--accent)',
        marginBottom: '10px',
    },
    tipsList: {
        paddingLeft: '18px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        fontSize: '13px',
        color: 'var(--text-secondary)',
    },
    recordCard: {
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
    },
    micSection: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        padding: '32px 0',
    },
    micBtn: {
        width: '90px',
        height: '90px',
        borderRadius: '50%',
        backgroundColor: 'var(--accent)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '36px',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    micBtnRecording: {
        backgroundColor: '#ef4444',
        boxShadow: '0 0 0 12px rgba(239,68,68,0.2)',
        animation: 'pulse 1.5s infinite',
    },
    micStatus: {
        fontSize: '13px',
        color: 'var(--text-secondary)',
        textAlign: 'center',
    },
    audioSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
    audioPlayer: {
        width: '100%',
        borderRadius: '8px',
    },
    submitBtn: {
        padding: '13px',
        backgroundColor: 'var(--accent)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '15px',
        fontWeight: '600',
        cursor: 'pointer',
        fontFamily: 'Sora, sans-serif',
        marginTop: 'auto',
    },
};

export default SpeakingTestPage;