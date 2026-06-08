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
    const isLow = seconds < 300;

    return (
        <div style={{ ...timerStyle, backgroundColor: isLow ? '#7f1d1d' : 'var(--bg-card)', border: `1px solid ${isLow ? '#f87171' : 'var(--border)'}` }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>⏱ Vaqt</span>
            <span style={{ fontSize: '20px', fontWeight: '700', color: isLow ? '#f87171' : 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                {mins}:{secs}
            </span>
        </div>
    );
}

// ─── Audio Player ─────────────────────────────────────────────────────────────
function AudioPlayer({ audioUrl }) {
    const audioRef = useRef(null);
    const [playing, setPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [playCount, setPlayCount] = useState(0);
    const MAX_PLAYS = 2;

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (playing) {
            audioRef.current.pause();
            setPlaying(false);
        } else {
            if (playCount >= MAX_PLAYS) return;
            audioRef.current.play();
            setPlaying(true);
            if (currentTime === 0 || audioRef.current.ended) {
                setPlayCount(prev => prev + 1);
            }
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) setDuration(audioRef.current.duration);
    };

    const handleEnded = () => {
        setPlaying(false);
    };

    const handleSeek = (e) => {
        if (!audioRef.current) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percent = x / rect.width;
        audioRef.current.currentTime = percent * duration;
    };

    const formatTime = (s) => {
        if (!s || isNaN(s)) return '0:00';
        const m = Math.floor(s / 60);
        const sec = String(Math.floor(s % 60)).padStart(2, '0');
        return `${m}:${sec}`;
    };

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
    const playsLeft = MAX_PLAYS - playCount;
    const canPlay = playsLeft > 0 || playing;

    return (
        <div style={audioCard}>
            <audio
                ref={audioRef}
                src={audioUrl}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleEnded}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button
                    onClick={togglePlay}
                    disabled={!canPlay}
                    style={{
                        ...playBtn,
                        opacity: canPlay ? 1 : 0.4,
                        cursor: canPlay ? 'pointer' : 'not-allowed',
                    }}
                >
                    {playing ? '⏸' : '▶'}
                </button>

                <div style={{ flex: 1 }}>
                    <div style={progressWrap} onClick={handleSeek}>
                        <div style={{ ...progressFill, width: `${progress}%` }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{formatTime(currentTime)}</span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{formatTime(duration)}</span>
                    </div>
                </div>

                <div style={{ textAlign: 'center', minWidth: '60px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Qolgan</div>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: playsLeft > 0 ? 'var(--accent)' : '#f87171' }}>
                        {playsLeft}x
                    </div>
                </div>
            </div>

            {playCount >= MAX_PLAYS && !playing && (
                <div style={{ marginTop: '10px', fontSize: '13px', color: '#f87171', textAlign: 'center' }}>
                    ⚠️ Audio maksimal {MAX_PLAYS} marta eshitildi
                </div>
            )}
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
                    <label key={ans.id} style={{
                        ...optionLabel,
                        backgroundColor: value === ans.id ? 'rgba(99,102,241,0.15)' : 'var(--bg-page)',
                        border: `1px solid ${value === ans.id ? 'var(--accent)' : 'var(--border)'}`
                    }}>
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
                        style={{
                            ...tfBtn,
                            backgroundColor: value === opt.id ? 'var(--accent)' : 'var(--bg-page)',
                            color: value === opt.id ? 'white' : 'var(--text-secondary)',
                            border: `1px solid ${value === opt.id ? 'var(--accent)' : 'var(--border)'}`
                        }}
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
export default function ListeningTestPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [test, setTest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [activePart, setActivePart] = useState(0);

    useEffect(() => {
        testsAPI.getTest(id)
            .then(res => {
                setTest(res.data);
                setLoading(false);
            })
            .catch(() => {
                setError("Test yuklanmadi. Iltimos qaytadan urinib ko'ring.");
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
                type: 'listening',
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

    const groupByPart = (questions) => {
        const sorted = [...questions].sort((a, b) => a.order - b.order);
        const parts = [];
        const size = Math.ceil(sorted.length / 4) || 10;
        for (let i = 0; i < sorted.length; i += size) {
            parts.push(sorted.slice(i, i + size));
        }
        return parts;
    };

    const answeredCount = Object.keys(answers).length;
    const totalQuestions = test?.questions?.length || 0;

    // ── Loading ───────────────────────────────────────────────────────────────
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

    const parts = groupByPart(test.questions || []);
    const currentPartQuestions = parts[activePart] || [];

    // ── Test ekrani ───────────────────────────────────────────────────────────
    return (
        <>
            <Navbar />
            <div style={page}>

                {/* Header */}
                <div style={header}>
                    <div>
                        <button onClick={() => navigate(-1)} style={btnBack}>← Orqaga</button>
                        <h1 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>
                            🎧 {test.title}
                        </h1>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                            Javob berildi: {answeredCount} / {totalQuestions}
                        </p>
                    </div>
                    <CountdownTimer
                        totalSeconds={(test.duration_minutes || 40) * 60}
                        onTimeUp={handleTimeUp}
                    />
                </div>

                {/* Progress bar */}
                <div style={progressBarWrap}>
                    <div style={{ ...progressBarFill, width: `${totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0}%` }} />
                </div>

                {/* Audio Player */}
                {test.audio_url ? (
                    <AudioPlayer audioUrl={test.audio_url} />
                ) : (
                    <div style={noAudioBox}>
                        🎵 Audio fayl hali qo'shilmagan. Admin panelda <strong>audio_url</strong> ni kiriting.
                    </div>
                )}

                {/* Part tabs */}
                {parts.length > 1 && (
                    <div style={tabRow}>
                        {parts.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setActivePart(i)}
                                style={{
                                    ...tabBtn,
                                    backgroundColor: activePart === i ? 'var(--accent)' : 'var(--bg-card)',
                                    color: activePart === i ? 'white' : 'var(--text-secondary)',
                                    border: `1px solid ${activePart === i ? 'var(--accent)' : 'var(--border)'}`
                                }}
                            >
                                Part {i + 1}
                            </button>
                        ))}
                    </div>
                )}

                {/* Savollar */}
                <div style={questionsWrap}>
                    {currentPartQuestions.map(q => {
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
                    {parts.length > 1 && (
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {activePart > 0 && (
                                <button onClick={() => setActivePart(p => p - 1)} style={btnSecondary}>← Oldingi</button>
                            )}
                            {activePart < parts.length - 1 && (
                                <button onClick={() => setActivePart(p => p + 1)} style={btnPrimary}>Keyingi →</button>
                            )}
                        </div>
                    )}

                    {(parts.length === 1 || activePart === parts.length - 1) && (
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
const page = { maxWidth: '860px', margin: '0 auto', padding: '24px 16px 60px' };
const centerBox = { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px' };
const spinner = { width: '40px', height: '40px', border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' };
const header = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: '12px' };
const timerStyle = { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 16px', borderRadius: '10px', minWidth: '90px', transition: 'all 0.3s' };
const progressBarWrap = { height: '4px', backgroundColor: 'var(--border)', borderRadius: '4px', marginBottom: '20px', overflow: 'hidden' };
const progressBarFill = { height: '100%', backgroundColor: 'var(--accent)', borderRadius: '4px', transition: 'width 0.3s ease' };

const audioCard = {
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--accent)',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px',
};

const noAudioBox = {
    backgroundColor: 'var(--bg-card)',
    border: '1px dashed var(--border)',
    borderRadius: '12px',
    padding: '16px 20px',
    marginBottom: '20px',
    fontSize: '14px',
    color: 'var(--text-muted)',
    textAlign: 'center',
};

const playBtn = {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: 'var(--accent)',
    color: 'white',
    border: 'none',
    fontSize: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
};

const progressWrap = {
    height: '6px',
    backgroundColor: 'var(--border)',
    borderRadius: '4px',
    cursor: 'pointer',
    overflow: 'hidden',
};

const progressFill = {
    height: '100%',
    backgroundColor: 'var(--accent)',
    borderRadius: '4px',
    transition: 'width 0.1s',
};

const tabRow = { display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' };
const tabBtn = { padding: '8px 18px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Sora, sans-serif' };
const questionsWrap = { display: 'flex', flexDirection: 'column', gap: '16px' };
const questionBox = { backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' };
const questionText = { fontSize: '15px', color: 'var(--text-primary)', lineHeight: '1.6', margin: 0 };
const optionLabel = { display: 'flex', alignItems: 'center', padding: '12px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', color: 'var(--text-primary)', transition: 'all 0.2s' };
const tfBtn = { padding: '10px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Sora, sans-serif' };
const fillInput = { width: '100%', marginTop: '10px', padding: '10px 14px', backgroundColor: 'var(--bg-page)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '14px', fontFamily: 'Sora, sans-serif', boxSizing: 'border-box', outline: 'none' };
const footer = { display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', marginTop: '28px', flexWrap: 'wrap' };
const btnBack = {
    padding: '7px 16px',
    backgroundColor: 'var(--bg-card)',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'Sora, sans-serif',
    marginBottom: '10px',
    display: 'inline-block',
};
const btnPrimary = { padding: '10px 22px', backgroundColor: 'var(--accent)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Sora, sans-serif' };
const btnSecondary = { padding: '10px 22px', backgroundColor: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Sora, sans-serif' };
const btnSubmit = { padding: '12px 28px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Sora, sans-serif' };