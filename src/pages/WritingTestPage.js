import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { testsAPI } from '../services/api';

async function evaluateWithGroq(essayText, taskPrompt) {
    const response = await fetch("/api/evaluate-writing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            essay_text: essayText,
            task_prompt: taskPrompt,
        })
    });
    if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody.error || 'AI evaluation failed');
    }
    return await response.json();
}

function WritingTestPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [test, setTest] = useState(null);
    const [answer, setAnswer] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState('');
    const [timeLeft, setTimeLeft] = useState(60 * 60);
    const timerRef = useRef(null);

    useEffect(() => {
        testsAPI.getTest(id)
            .then(res => setTest(res.data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [id]);

    useEffect(() => {
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const formatTime = (sec) => {
        const m = Math.floor(sec / 60).toString().padStart(2, '0');
        const s = (sec % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const wordCount = answer.trim() === '' ? 0 : answer.trim().split(/\s+/).length;

    const addXP = (amount) => {
        const current = parseInt(localStorage.getItem('xp_total') || '0');
        localStorage.setItem('xp_total', current + amount);
        const goal = JSON.parse(localStorage.getItem('daily_goal') || '{}');
        const today = new Date().toDateString();
        const done = goal.date === today ? (goal.done || 0) : 0;
        localStorage.setItem('daily_goal', JSON.stringify({ date: today, done: done + 1 }));
    };

    const handleSubmit = async () => {
        if (!answer.trim()) return;
        clearInterval(timerRef.current);
        setSubmitting(true);

        try {
            const taskTitle = test?.title || 'Writing Test';
            const taskPrompt = test?.question || test?.prompt || 'IELTS Writing Task';

            // 1. Javobni backendga saqlash uchun yuboramiz (natijasini kutmaymiz)
            setSubmitStatus('Javobingiz saqlanmoqda...');
            testsAPI.submitWriting(id, { essay_text: answer }).catch(() => {});

            // 2. Darhol AI orqali baholaymiz
            setSubmitStatus("AI yozuvingizni o'qib, baholamoqda...");
            const aiResult = await evaluateWithGroq(answer, taskPrompt);

            const result = {
                band_score: aiResult.band_score,
                feedback: aiResult.feedback,
                criteria: aiResult.criteria,
                test_title: taskTitle,
            };

            addXP(50);
            navigate('/tests/result', { state: { result, type: 'writing' } });

        } catch (err) {
            console.error(err);
            alert("Xatolik yuz berdi: " + err.message + "\nQayta urinib ko'ring.");
        } finally {
            setSubmitting(false);
            setSubmitStatus('');
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
                <div style={styles.header}>
                    <div>
                        <div style={styles.breadcrumb}>
                            <button onClick={() => navigate(-1)} style={styles.backBtn}>← Orqaga</button>
                            <span style={styles.breadcrumbSep}>|</span>
                            <a href="/tests" style={styles.breadcrumbLink}>Testlar</a>
                            <span style={styles.breadcrumbSep}>/</span>
                            <span>Writing</span>
                        </div>
                        <h1 style={styles.title}>{test?.title}</h1>
                    </div>
                    <div style={{ ...styles.timer, ...(timeLeft < 300 ? styles.timerDanger : {}) }}>
                        ⏱ {formatTime(timeLeft)}
                    </div>
                </div>

                <div style={styles.layout}>
                    <div style={styles.taskCard}>
                        <div style={styles.taskLabel}>📋 Topshiriq</div>
                        <div style={styles.taskText}>
                            {test?.question || test?.prompt || 'Topshiriq yuklanmoqda...'}
                        </div>
                        {test?.image && (
                            <img src={test.image} alt="task" style={styles.taskImage} />
                        )}
                    </div>

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
                            disabled={submitting}
                        />

                        {submitting && submitStatus && (
                            <div style={styles.statusBox}>
                                <div style={styles.spinner} />
                                <span>{submitStatus}</span>
                            </div>
                        )}

                        <button
                            onClick={handleSubmit}
                            disabled={submitting || wordCount < 50}
                            style={{
                                ...styles.submitBtn,
                                opacity: (submitting || wordCount < 50) ? 0.6 : 1,
                                cursor: (submitting || wordCount < 50) ? 'not-allowed' : 'pointer',
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
    page: { minHeight: '100vh', backgroundColor: 'var(--bg-base)' },
    loading: { textAlign: 'center', padding: '80px', color: 'var(--text-muted)', fontSize: '14px' },
    main: { maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' },
    backBtn: { padding: '5px 12px', backgroundColor: 'transparent', color: 'var(--accent)', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Sora, sans-serif' },
    breadcrumb: { fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' },
    breadcrumbLink: { color: 'var(--accent)', textDecoration: 'none' },
    breadcrumbSep: { color: 'var(--text-muted)' },
    title: { fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' },
    timer: { padding: '10px 20px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'monospace' },
    timerDanger: { borderColor: '#ef4444', color: '#f87171', backgroundColor: 'rgba(239,68,68,0.08)' },
    layout: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' },
    taskCard: { backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '24px', height: 'fit-content' },
    taskLabel: { fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' },
    taskText: { fontSize: '15px', color: 'var(--text-secondary)', lineHeight: '1.8', whiteSpace: 'pre-wrap' },
    taskImage: { width: '100%', borderRadius: '8px', marginTop: '16px', border: '1px solid var(--border)' },
    answerCard: { backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' },
    answerHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    wordCounter: { fontSize: '12px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px' },
    wordCounterWarn: { backgroundColor: 'rgba(245,158,11,0.1)', color: '#fbbf24' },
    wordCounterOk: { backgroundColor: 'rgba(16,185,129,0.1)', color: '#34d399' },
    textarea: { width: '100%', backgroundColor: '#0a0f1e', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px', color: 'var(--text-primary)', fontSize: '15px', lineHeight: '1.7', fontFamily: 'Sora, sans-serif', resize: 'vertical', outline: 'none' },
    statusBox: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', backgroundColor: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '8px', fontSize: '14px', color: 'var(--accent)' },
    spinner: { width: '16px', height: '16px', border: '2px solid rgba(99,102,241,0.3)', borderTop: '2px solid var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', flexShrink: 0 },
    submitBtn: { padding: '13px', backgroundColor: 'var(--accent)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', fontFamily: 'Sora, sans-serif', transition: 'opacity 0.2s' },
};

const styleEl = document.createElement('style');
styleEl.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
document.head.appendChild(styleEl);

export default WritingTestPage;