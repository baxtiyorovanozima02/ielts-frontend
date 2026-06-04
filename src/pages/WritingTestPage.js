import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { testsAPI } from '../services/api';

function WritingTestPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [test, setTest] = useState(null);
    const [answer, setAnswer] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [timeLeft, setTimeLeft] = useState(60 * 60); // 60 daqiqa

    useEffect(() => {
        testsAPI.getTest(id)
            .then(res => setTest(res.data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [id]);

    // Timer
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmit();
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

    const wordCount = answer.trim() === '' ? 0 : answer.trim().split(/\s+/).length;

    const handleSubmit = async () => {
        if (!answer.trim()) return;
        setSubmitting(true);
        try {
            const res = await testsAPI.submitWriting(id, { answer });
            navigate('/tests/result', { state: { result: res.data, type: 'writing' } });
        } catch {
            alert('Xatolik yuz berdi. Qayta urinib ko\'ring.');
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
                            <span>Writing</span>
                        </div>
                        <h1 style={styles.title}>{test?.title}</h1>
                    </div>
                    <div style={{
                        ...styles.timer,
                        ...(timeLeft < 300 ? styles.timerDanger : {})
                    }}>
                        ⏱ {formatTime(timeLeft)}
                    </div>
                </div>

                <div style={styles.layout}>

                    {/* Task */}
                    <div style={styles.taskCard}>
                        <div style={styles.taskLabel}>📋 Topshiriq</div>
                        <div style={styles.taskText}>
                            {test?.question || test?.prompt || 'Topshiriq yuklanmoqda...'}
                        </div>
                        {test?.image && (
                            <img src={test.image} alt="task" style={styles.taskImage} />
                        )}
                    </div>

                    {/* Answer */}
                    <div style={styles.answerCard}>
                        <div style={styles.answerHeader}>
                            <div style={styles.taskLabel}>✍️ Javobingiz</div>
                            <div style={{
                                ...styles.wordCounter,
                                ...(wordCount < 150 ? styles.wordCounterWarn : styles.wordCounterOk)
                            }}>
                                {wordCount} so'z {wordCount < 150 ? '(min: 150)' : '✓'}
                            </div>
                        </div>
                        <textarea
                            style={styles.textarea}
                            placeholder="Javobingizni shu yerga yozing..."
                            value={answer}
                            onChange={e => setAnswer(e.target.value)}
                            rows={16}
                        />
                        <button
                            onClick={handleSubmit}
                            disabled={submitting || wordCount < 50}
                            style={{
                                ...styles.submitBtn,
                                opacity: (submitting || wordCount < 50) ? 0.6 : 1
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
        height: 'fit-content',
    },
    taskLabel: {
        fontSize: '12px',
        fontWeight: '600',
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        marginBottom: '14px',
    },
    taskText: {
        fontSize: '15px',
        color: 'var(--text-secondary)',
        lineHeight: '1.8',
        whiteSpace: 'pre-wrap',
    },
    taskImage: {
        width: '100%',
        borderRadius: '8px',
        marginTop: '16px',
        border: '1px solid var(--border)',
    },
    answerCard: {
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
    },
    answerHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    wordCounter: {
        fontSize: '12px',
        fontWeight: '600',
        padding: '3px 10px',
        borderRadius: '20px',
    },
    wordCounterWarn: {
        backgroundColor: 'rgba(245,158,11,0.1)',
        color: '#fbbf24',
    },
    wordCounterOk: {
        backgroundColor: 'rgba(16,185,129,0.1)',
        color: '#34d399',
    },
    textarea: {
        width: '100%',
        backgroundColor: '#0a0f1e',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        padding: '16px',
        color: 'var(--text-primary)',
        fontSize: '15px',
        lineHeight: '1.7',
        fontFamily: 'Sora, sans-serif',
        resize: 'vertical',
        outline: 'none',
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
        transition: 'opacity 0.2s',
    },
};

export default WritingTestPage;