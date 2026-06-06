import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { testsAPI } from '../services/api';

// ─── Timer ───────────────────────────────────────────────────────────────────
function CountdownTimer({ totalSeconds, onTimeUp }) {
    const [seconds, setSeconds] = useState(totalSeconds);
    const intervalRef = useRef(null);

    useEffect(() => {
        intervalRef.current = setInterval(() => {
            setSeconds(prev => {
                if (prev <= 1) {
                    clearInterval(intervalRef.current);
                    onTimeUp();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(intervalRef.current);
    }, [onTimeUp]);

    const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    const isLow = seconds < 300; // 5 daqiqadan kam

    return (
        <div style={{ ...timerStyle, backgroundColor: isLow ? '#7f1d1d' : 'var(--bg-card)', border: `1px solid ${isLow ? '#f87171' : 'var(--border)'}` }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>⏱ Vaqt</span>
            <span style={{ fontSize: '20px', fontWeight: '700', color: isLow ? '#f87171' : 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                {mins}:{secs}
            </span>
        </div>
    );
}

// ─── Question renderers ───────────────────────────────────────────────────────
function MCQQuestion({ question, value, onChange }) {
    return (
        <div style={questionBox}>
            <p style={questionText}><strong>Q{question.order}.</strong> {question.text}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                {question.answers.map(ans => (
                    <label key={ans.id} style={{ ...optionLabel, backgroundColor: value === ans.id ? 'rgba(99,102,241,0.15)' : 'var(--bg-page)', border: `1px solid ${value === ans.id ? 'var(--accent)' : 'var(--border)'}` }}>
                        <input
                            type="radio"
                            name={`q_${question.id}`}
                            value={ans.id}
                            checked={value === ans.id}
                            onChange={() => onChange(question.id, ans.id)}
                            style={{ marginRight: '10px', accentColor: 'var(--accent)' }}
                        />
                        {ans.text}
                    </label>
                ))}
            </div>
        </div>
    );
}

function TrueFalseQuestion({ question, value, onChange }) {
    const options = [
        { id: 'TRUE', text: 'True' },
        { id: 'FALSE', text: 'False' },
        { id: 'NOT_GIVEN', text: 'Not Given' },
    ];
    return (
        <div style={questionBox}>
            <p style={questionText}><strong>Q{question.order}.</strong> {question.text}</p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                {options.map(opt => (
                    <button
                        key={opt.id}
                        onClick={() => onChange(question.id, opt.id)}
                        style={{ ...tfBtn, backgroundColor: value === opt.id ? 'var(--accent)' : 'var(--bg-page)', color: value === opt.id ? 'white' : 'var(--text-secondary)', border: `1px solid ${value === opt.id ? 'var(--accent)' : 'var(--border)'}` }}
                    >
                        {opt.text}
                    </button>
                ))}
            </div>
        </div>
    );
}

function FillBlankQuestion({ question, value, onChange }) {
    return (
        <div style={questionBox}>
            <p style={questionText}><strong>Q{question.order}.</strong> {question.text}</p>
            <input
                type="text"
                placeholder="Javobingizni kiriting..."
                value={value || ''}
                onChange={e => onChange(question.id, e.target.value)}
                style={fillInput}
            />
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ReadingTestPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [test, setTest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [activePassage, setActivePassage] = useState(0);

    useEffect(() => {
        testsAPI.getTest(id)
            .then(res => {
                setTest(res.data);
                setLoading(false);
            })
            .catch(() => {
                setError('Test yuklanmadi. Iltimos qaytadan urinib ko\'ring.');
                setLoading(false);
            });
    }, [id]);

    const handleAnswer = (questionId, value) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const handleSubmit = () => {
        if (!test || submitted) return;

        const questions = test.questions || [];
        let correct = 0;
        let total = 0;

        questions.forEach(q => {
            if (q.question_type === 'fill_blank') return;
            total++;
            const userAnswer = answers[q.id];
            if (!userAnswer) return;

            if (q.question_type === 'multiple_choice') {
                const correctAns = q.answers.find(a => a.is_correct);
                if (correctAns && userAnswer === correctAns.id) correct++;
            } else if (q.question_type === 'true_false') {
                const correctAns = q.answers.find(a => a.is_correct);
                if (correctAns && userAnswer === correctAns.text.toUpperCase()) correct++;
            }
        });

        const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
        const bandScore = percentage >= 90 ? 9.0
            : percentage >= 80 ? 8.0
            : percentage >= 70 ? 7.0
            : percentage >= 60 ? 6.0
            : percentage >= 50 ? 5.0
            : percentage >= 40 ? 4.0
            : 3.0;

        setSubmitted(true);

        navigate('/tests/result', {
            state: {
                type: 'reading',
                result: {
                    band_score: bandScore,
                    correct,
                    total,
                    percentage,
                    test_title: test.title,
                }
            }
        });
    };

    const handleTimeUp = () => {
        if (!submitted) handleSubmit();
    };

    const groupByPassage = (questions) => {
        const sorted = [...questions].sort((a, b) => a.order - b.order);
        const passages = [];
        const size = Math.ceil(sorted.length / 3) || 13;
        for (let i = 0; i < sorted.length; i += size) {
            passages.push(sorted.slice(i, i + size));
        }
        return passages;
    };

    const answeredCount = Object.keys(answers).length;
    const totalQuestions = test?.questions?.length || 0;

    // ── Render ────────────────────────────────────────────────────────────────
    if (loading) return (
        <>
            <Navbar />
            <div style={centerBox}><div style={spinner} /></div>
        </>
    );

    if (error) return (
        <>
            <Navbar />
            <div style={centerBox}>
                <p style={{ color: '#f87171', marginBottom: '16px' }}>{error}</p>
                <button onClick={() => navigate('/tests')} style={btnSecondary}>← Testlarga qaytish</button>
            </div>
        </>
    );

    const passages = groupByPassage(test.questions || []);
    const currentPassageQuestions = passages[activePassage] || [];

    // ── Test ekrani ───────────────────────────────────────────────────────────
    return (
        <>
            <Navbar />
            <div style={page}>

                {/* Header */}
                <div style={header}>
                    <div>
                        <h1 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>
                            📖 {test.title}
                        </h1>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                            Javob berildi: {answeredCount} / {totalQuestions}
                        </p>
                    </div>
                    <CountdownTimer
                        totalSeconds={(test.duration_minutes || 60) * 60}
                        onTimeUp={handleTimeUp}
                    />
                </div>

                {/* Progress bar */}
                <div style={progressBarWrap}>
                    <div style={{ ...progressBarFill, width: `${totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0}%` }} />
                </div>

                {/* Passage tabs */}
                {passages.length > 1 && (
                    <div style={tabRow}>
                        {passages.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setActivePassage(i)}
                                style={{ ...tabBtn, backgroundColor: activePassage === i ? 'var(--accent)' : 'var(--bg-card)', color: activePassage === i ? 'white' : 'var(--text-secondary)', border: `1px solid ${activePassage === i ? 'var(--accent)' : 'var(--border)'}` }}
                            >
                                Passage {i + 1}
                            </button>
                        ))}
                    </div>
                )}

                {/* Savollar */}
                <div style={questionsWrap}>
                    {currentPassageQuestions.map(q => {
                        if (q.question_type === 'multiple_choice') {
                            return <MCQQuestion key={q.id} question={q} value={answers[q.id]} onChange={handleAnswer} />;
                        } else if (q.question_type === 'true_false') {
                            return <TrueFalseQuestion key={q.id} question={q} value={answers[q.id]} onChange={handleAnswer} />;
                        } else if (q.question_type === 'fill_blank') {
                            return <FillBlankQuestion key={q.id} question={q} value={answers[q.id]} onChange={handleAnswer} />;
                        }
                        return null;
                    })}
                </div>

                {/* Navigation / Submit */}
                <div style={footer}>
                    {passages.length > 1 && (
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {activePassage > 0 && (
                                <button onClick={() => setActivePassage(p => p - 1)} style={btnSecondary}>← Oldingi</button>
                            )}
                            {activePassage < passages.length - 1 && (
                                <button onClick={() => setActivePassage(p => p + 1)} style={btnPrimary}>Keyingi →</button>
                            )}
                        </div>
                    )}

                    {(passages.length === 1 || activePassage === passages.length - 1) && (
                        <button onClick={handleSubmit} style={btnSubmit}>
                            ✅ Testni yakunlash ({answeredCount}/{totalQuestions})
                        </button>
                    )}
                </div>

            </div>
        </>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const page = {
    maxWidth: '860px',
    margin: '0 auto',
    padding: '24px 16px 60px',
};

const centerBox = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    gap: '16px',
};

const spinner = {
    width: '40px',
    height: '40px',
    border: '3px solid var(--border)',
    borderTopColor: 'var(--accent)',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
};

const header = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
    flexWrap: 'wrap',
    gap: '12px',
};

const timerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '8px 16px',
    borderRadius: '10px',
    minWidth: '90px',
    transition: 'all 0.3s',
};

const progressBarWrap = {
    height: '4px',
    backgroundColor: 'var(--border)',
    borderRadius: '4px',
    marginBottom: '20px',
    overflow: 'hidden',
};

const progressBarFill = {
    height: '100%',
    backgroundColor: 'var(--accent)',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
};

const tabRow = {
    display: 'flex',
    gap: '8px',
    marginBottom: '20px',
    flexWrap: 'wrap',
};

const tabBtn = {
    padding: '8px 18px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontFamily: 'Sora, sans-serif',
};

const questionsWrap = {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
};

const questionBox = {
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '20px',
};

const questionText = {
    fontSize: '15px',
    color: 'var(--text-primary)',
    lineHeight: '1.6',
    margin: 0,
};

const optionLabel = {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    color: 'var(--text-primary)',
    transition: 'all 0.2s',
};

const tfBtn = {
    padding: '10px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontFamily: 'Sora, sans-serif',
};

const fillInput = {
    width: '100%',
    marginTop: '10px',
    padding: '10px 14px',
    backgroundColor: 'var(--bg-page)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    color: 'var(--text-primary)',
    fontSize: '14px',
    fontFamily: 'Sora, sans-serif',
    boxSizing: 'border-box',
    outline: 'none',
};

const footer = {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '12px',
    marginTop: '28px',
    flexWrap: 'wrap',
};

const btnPrimary = {
    padding: '10px 22px',
    backgroundColor: 'var(--accent)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'Sora, sans-serif',
};

const btnSecondary = {
    padding: '10px 22px',
    backgroundColor: 'var(--bg-card)',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'Sora, sans-serif',
};

const btnSubmit = {
    padding: '12px 28px',
    backgroundColor: '#16a34a',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: 'Sora, sans-serif',
};