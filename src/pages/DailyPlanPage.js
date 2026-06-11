import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useLang, translations } from '../context/LanguageContext';

const SKILL_COLORS = {
    Reading: { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.3)' },
    Listening: { color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.3)' },
    Writing: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)' },
    Speaking: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)' },
    Vocabulary: { color: '#ec4899', bg: 'rgba(236,72,153,0.1)', border: 'rgba(236,72,153,0.3)' },
    Grammar: { color: '#06b6d4', bg: 'rgba(6,182,212,0.1)', border: 'rgba(6,182,212,0.3)' },
};

function TaskCard({ task, index }) {
    const [checked, setChecked] = useState(false);
    const [visible, setVisible] = useState(false);
    const c = SKILL_COLORS[task.type] || SKILL_COLORS.Reading;

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), index * 70 + 100);
        return () => clearTimeout(t);
    }, [index]);

    return (
        <div
            onClick={() => setChecked(v => !v)}
            style={{
                ...s.taskCard,
                background: checked ? 'rgba(16,185,129,0.05)' : c.bg,
                border: `1px solid ${checked ? 'rgba(16,185,129,0.3)' : c.border}`,
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(16px)',
                transition: 'opacity 0.45s ease, transform 0.45s ease, background 0.2s, border 0.2s',
                cursor: 'pointer',
            }}
        >
            <div style={{ ...s.taskTypeTag, color: c.color, background: c.bg, border: `1px solid ${c.border}` }}>
                {task.type}
            </div>
            <div style={s.taskBody}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                    <p style={{ ...s.taskTitle, color: checked ? '#475569' : '#f1f5f9', textDecoration: checked ? 'line-through' : 'none' }}>
                        {task.title}
                    </p>
                    <div style={{ ...s.taskCheck, borderColor: checked ? '#10b981' : '#334155', background: checked ? '#10b981' : 'transparent', flexShrink: 0 }}>
                        {checked && <span style={{ color: 'white', fontSize: '11px', lineHeight: 1 }}>✓</span>}
                    </div>
                </div>
                {task.tip && (
                    <p style={s.taskTip}>💡 {task.tip}</p>
                )}
            </div>
            <div style={{ ...s.taskDuration, color: c.color }}>{task.duration}</div>
        </div>
    );
}

async function callAI(duration, skill) {
    const durationLabel = { '1day': '1 kunlik', '1week': '1 haftalik', '1month': '1 oylik' }[duration];
    const skillText = skill === 'all'
        ? "barcha ko'nikmalar: Reading, Listening, Writing, Speaking, Vocabulary"
        : skill;

    const taskCount = duration === '1day' ? '5-6 ta vazifa.' : duration === '1week' ? '18-22 ta vazifa, turli kunlarga taqsimlangan.' : '28-35 ta vazifa, haftalik guruhlar bilan.';

    const prompt = `Siz professional IELTS o'qituvchisiz. ${durationLabel} o'quv rejasini tuzing.
Ko'nikma yo'nalishi: ${skillText}

FAQAT JSON formatida javob bering. Boshqa hech narsa yozmang:
{
  "title": "Reja sarlavhasi (qisqa, motivatsion, o'zbekcha)",
  "summary": "Reja haqida 1-2 jumla (o'zbekcha)",
  "targetBand": "Maqsad band score (masalan: Band 6.5+)",
  "motivation": "Motivatsion qisqa xabar (o'zbekcha)",
  "tasks": [
    {
      "type": "Reading|Listening|Writing|Speaking|Vocabulary|Grammar",
      "title": "Aniq vazifa tavsifi (o'zbekcha)",
      "duration": "Vaqt (masalan: 30 daqiqa)",
      "tip": "Foydali maslahat (o'zbekcha, 1 jumla)"
    }
  ]
}

${taskCount}
Faqat JSON, boshqa matn yoq.`;

    const apiKey = process.env.REACT_APP_ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error('API key topilmadi');

    const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1000,
            messages: [{ role: 'user', content: prompt }],
        }),
    });

    const data = await res.json();
    const raw = data.content?.map(b => b.text || '').join('') || '';
    const clean = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
}

export default function DailyPlanPage() {
    const navigate = useNavigate();
    const { lang } = useLang();
    const t = translations[lang];

    const DURATIONS = [
        {
            key: '1day',
            label: t.dpDur1Label,
            sublabel: t.dpDur1Sub,
            icon: '⚡',
            color: '#f59e0b',
            bg: 'rgba(245,158,11,0.08)',
            border: 'rgba(245,158,11,0.25)',
            glow: 'rgba(245,158,11,0.15)',
        },
        {
            key: '1week',
            label: t.dpDur2Label,
            sublabel: t.dpDur2Sub,
            icon: '📅',
            color: '#6366f1',
            bg: 'rgba(99,102,241,0.08)',
            border: 'rgba(99,102,241,0.25)',
            glow: 'rgba(99,102,241,0.15)',
        },
        {
            key: '1month',
            label: t.dpDur3Label,
            sublabel: t.dpDur3Sub,
            icon: '🎯',
            color: '#10b981',
            bg: 'rgba(16,185,129,0.08)',
            border: 'rgba(16,185,129,0.25)',
            glow: 'rgba(16,185,129,0.15)',
        },
    ];

    const SKILLS = [
        { key: 'all', label: t.dpSkillAll, icon: '🌟' },
        { key: 'Reading', label: 'Reading', icon: '📖' },
        { key: 'Listening', label: 'Listening', icon: '🎧' },
        { key: 'Writing', label: 'Writing', icon: '✍️' },
        { key: 'Speaking', label: 'Speaking', icon: '🗣️' },
        { key: 'Vocabulary', label: 'Vocabulary', icon: '📚' },
    ];

    const [step, setStep] = useState('select'); // 'select' | 'loading' | 'plan'
    const [duration, setDuration] = useState(null);
    const [skill, setSkill] = useState('all');
    const [planMeta, setPlanMeta] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [error, setError] = useState(null);
    const [spinAngle, setSpinAngle] = useState(0);

    useEffect(() => {
        if (step !== 'loading') return;
        const interval = setInterval(() => setSpinAngle(a => a + 6), 16);
        return () => clearInterval(interval);
    }, [step]);

    const handleGenerate = async () => {
        if (!duration) return;
        setStep('loading');
        setError(null);
        try {
            const result = await callAI(duration, skill);
            setPlanMeta({
                title: result.title,
                summary: result.summary,
                targetBand: result.targetBand,
                motivation: result.motivation,
            });
            setTasks(result.tasks || []);
            setStep('plan');
        } catch (e) {
            setError(t.dpErrorMsg);
            setStep('select');
        }
    };

    const handleReset = () => {
        setStep('select');
        setDuration(null);
        setSkill('all');
        setPlanMeta(null);
        setTasks([]);
        setError(null);
    };

    const selectedDur = DURATIONS.find(d => d.key === duration);
    const totalMinutes = tasks.reduce((sum, t) => sum + (parseInt(t.duration) || 30), 0);
    const uniqueSkills = [...new Set(tasks.map(t => t.type))].length;

    return (
        <div style={s.page}>
            <style>{`
                @keyframes dpFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
                @keyframes dpFadeIn { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
                @keyframes dpPulse { 0%,100%{opacity:0.4} 50%{opacity:1} }
                .dp-dur-card:hover { transform: translateY(-3px) !important; box-shadow: 0 12px 40px var(--dp-glow) !important; }
                .dp-skill-btn:hover { transform: scale(1.04) !important; }
                .dp-gen-btn:hover:not(:disabled) { transform: translateY(-2px) !important; box-shadow: 0 16px 50px rgba(99,102,241,0.4) !important; }
                .dp-back-btn:hover { background: #1e293b !important; }
                .dp-retry-btn:hover { background: rgba(99,102,241,0.2) !important; }
            `}</style>

            <Navbar />

            <main style={s.main}>

                {/* ── SELECT STEP ── */}
                {step === 'select' && (
                    <div style={{ animation: 'dpFadeIn 0.5s ease-out' }}>

                        {/* Hero */}
                        <div style={s.hero}>
                            <div style={s.heroIcon}>🎓</div>
                            <h1 style={s.heroTitle}>{t.dpHeroTitle}</h1>
                            <p style={s.heroSub}>
                                {t.dpHeroSub.split('\n').map((line, i) => (
                                    <span key={i}>{line}{i === 0 && <br />}</span>
                                ))}
                            </p>
                        </div>

                        {error && (
                            <div style={s.errorBanner}>
                                ⚠️ {error}
                                <button className="dp-retry-btn" onClick={() => setError(null)} style={s.errorClose}>✕</button>
                            </div>
                        )}

                        {/* Skill selector */}
                        <div style={s.block}>
                            <div style={s.blockLabel}>{t.dpSkillLabel}</div>
                            <div style={s.skillRow}>
                                {SKILLS.map(sk => (
                                    <button
                                        key={sk.key}
                                        className="dp-skill-btn"
                                        onClick={() => setSkill(sk.key)}
                                        style={{
                                            ...s.skillBtn,
                                            background: skill === sk.key
                                                ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                                                : '#111827',
                                            border: `1px solid ${skill === sk.key ? '#6366f1' : '#1e2d45'}`,
                                            color: skill === sk.key ? 'white' : '#94a3b8',
                                            boxShadow: skill === sk.key ? '0 4px 16px rgba(99,102,241,0.3)' : 'none',
                                        }}
                                    >
                                        <span>{sk.icon}</span>
                                        <span>{sk.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Duration cards */}
                        <div style={s.block}>
                            <div style={s.blockLabel}>{t.dpDurLabel}</div>
                            <div style={s.durCol}>
                                {DURATIONS.map((d, i) => (
                                    <div
                                        key={d.key}
                                        className="dp-dur-card"
                                        onClick={() => setDuration(d.key)}
                                        style={{
                                            '--dp-glow': d.glow,
                                            ...s.durCard,
                                            background: duration === d.key ? d.bg : '#0f172a',
                                            border: `1.5px solid ${duration === d.key ? d.color : '#1e2d45'}`,
                                            boxShadow: duration === d.key ? `0 8px 32px ${d.glow}` : 'none',
                                            animation: `dpFadeIn 0.4s ${i * 0.08}s ease-out both`,
                                        }}
                                    >
                                        <div style={{ ...s.durIcon, background: d.bg, border: `1px solid ${d.border}` }}>
                                            {d.icon}
                                        </div>
                                        <div style={s.durText}>
                                            <div style={s.durLabel}>{d.label}</div>
                                            <div style={s.durSub}>{d.sublabel}</div>
                                        </div>
                                        <div style={{
                                            ...s.durRadio,
                                            borderColor: duration === d.key ? d.color : '#334155',
                                            background: duration === d.key ? d.color : 'transparent',
                                        }}>
                                            {duration === d.key && <span style={{ color: '#fff', fontSize: '11px' }}>✓</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Generate button */}
                        <button
                            className="dp-gen-btn"
                            onClick={handleGenerate}
                            disabled={!duration}
                            style={{
                                ...s.genBtn,
                                background: duration ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#1e2d45',
                                opacity: duration ? 1 : 0.5,
                                cursor: duration ? 'pointer' : 'not-allowed',
                            }}
                        >
                            <span style={{ fontSize: '20px' }}>🤖</span>
                            <span>{t.dpGenBtn}</span>
                            <span style={{ fontSize: '18px' }}>→</span>
                        </button>
                        {!duration && (
                            <p style={s.genHint}>{t.dpGenHint}</p>
                        )}
                    </div>
                )}

                {/* ── LOADING STEP ── */}
                {step === 'loading' && (
                    <div style={{ ...s.loadingWrap, animation: 'dpFadeIn 0.4s ease-out' }}>
                        <div style={{
                            ...s.spinner,
                            transform: `rotate(${spinAngle}deg)`,
                        }} />
                        <div style={s.loadingTitle}>{t.dpLoadTitle}</div>
                        <div style={s.loadingSub}>{t.dpLoadSub}</div>
                        <div style={s.dotRow}>
                            {[0, 1, 2].map(i => (
                                <div key={i} style={{ ...s.dot, animationDelay: `${i * 0.2}s` }} />
                            ))}
                        </div>
                    </div>
                )}

                {/* ── PLAN STEP ── */}
                {step === 'plan' && planMeta && (
                    <div style={{ animation: 'dpFadeIn 0.5s ease-out' }}>

                        {/* Back + header row */}
                        <div style={s.planTopRow}>
                            <button className="dp-back-btn" onClick={handleReset} style={s.backBtn}>
                                {t.dpBackBtn}
                            </button>
                            <div style={s.planDurBadge}>
                                {selectedDur?.icon} {selectedDur?.label}
                            </div>
                        </div>

                        {/* Plan header card */}
                        <div style={s.planHeader}>
                            <div style={s.planHeaderTop}>
                                <div style={{ flex: 1 }}>
                                    <div style={s.planAiBadge}>{t.dpAiBadge}</div>
                                    <h2 style={s.planTitle}>{planMeta.title}</h2>
                                    <p style={s.planSummary}>{planMeta.summary}</p>
                                </div>
                                <div style={s.bandBadge}>{planMeta.targetBand}</div>
                            </div>
                            <div style={s.motivationBox}>
                                ✨ {planMeta.motivation}
                            </div>
                        </div>

                        {/* Stats row */}
                        <div style={s.statsRow}>
                            {[
                                { icon: '📋', value: tasks.length, label: t.dpTotalTasks },
                                { icon: '⏱', value: `${totalMinutes} min`, label: t.dpEstTime },
                                { icon: '🎯', value: uniqueSkills, label: t.dpSkillTypes },
                            ].map((stat, i) => (
                                <div key={i} style={{ ...s.statCard, animation: `dpFadeIn 0.4s ${i * 0.08 + 0.2}s ease-out both` }}>
                                    <div style={s.statIcon}>{stat.icon}</div>
                                    <div style={s.statValue}>{stat.value}</div>
                                    <div style={s.statLabel}>{stat.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Task list */}
                        <div style={s.taskListHeader}>
                            {t.dpTasksTitle}
                            <span style={s.taskListHint}>{t.dpTasksHint}</span>
                        </div>
                        <div style={s.taskList}>
                            {tasks.map((task, i) => (
                                <TaskCard key={i} task={task} index={i} />
                            ))}
                        </div>

                        {/* Footer */}
                        <div style={s.footer}>
                            <button
                                onClick={handleGenerate}
                                style={s.retryBtn}
                            >
                                {t.dpNewPlan}
                            </button>
                            <button
                                onClick={() => navigate('/tests')}
                                style={s.testsBtn}
                            >
                                {t.dpGoTests}
                            </button>
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
}

const s = {
    page: {
        minHeight: '100vh',
        backgroundColor: 'var(--bg-base)',
    },
    main: {
        maxWidth: '700px',
        margin: '0 auto',
        padding: '40px 24px 60px',
    },

    /* Hero */
    hero: {
        textAlign: 'center',
        marginBottom: '48px',
    },
    heroIcon: {
        fontSize: '56px',
        display: 'block',
        marginBottom: '18px',
        animation: 'dpFloat 4s ease-in-out infinite',
    },
    heroTitle: {
        fontSize: '30px',
        fontWeight: '800',
        color: '#f1f5f9',
        marginBottom: '12px',
        letterSpacing: '-0.3px',
    },
    heroSub: {
        fontSize: '15px',
        color: '#64748b',
        lineHeight: '1.7',
    },

    /* Error */
    errorBanner: {
        background: 'rgba(239,68,68,0.1)',
        border: '1px solid rgba(239,68,68,0.3)',
        borderRadius: '12px',
        padding: '14px 18px',
        color: '#fca5a5',
        fontSize: '14px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
    },
    errorClose: {
        background: 'none',
        border: 'none',
        color: '#fca5a5',
        cursor: 'pointer',
        fontSize: '14px',
        flexShrink: 0,
    },

    /* Block */
    block: { marginBottom: '32px' },
    blockLabel: {
        fontSize: '12px',
        fontWeight: '600',
        color: '#64748b',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        marginBottom: '14px',
    },

    /* Skills */
    skillRow: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
    },
    skillBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 16px',
        borderRadius: '12px',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
        fontFamily: 'Sora, sans-serif',
        transition: 'all 0.2s',
    },

    /* Duration cards */
    durCol: { display: 'flex', flexDirection: 'column', gap: '12px' },
    durCard: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '18px 20px',
        borderRadius: '16px',
        cursor: 'pointer',
        transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
        userSelect: 'none',
    },
    durIcon: {
        width: '48px',
        height: '48px',
        borderRadius: '13px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '22px',
        flexShrink: 0,
    },
    durText: { flex: 1 },
    durLabel: {
        fontSize: '16px',
        fontWeight: '700',
        color: '#f1f5f9',
        marginBottom: '3px',
    },
    durSub: {
        fontSize: '13px',
        color: '#64748b',
    },
    durRadio: {
        width: '22px',
        height: '22px',
        borderRadius: '50%',
        border: '2px solid',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        transition: 'all 0.2s',
    },

    /* Generate */
    genBtn: {
        width: '100%',
        padding: '18px',
        borderRadius: '16px',
        border: 'none',
        color: 'white',
        fontSize: '16px',
        fontWeight: '700',
        fontFamily: 'Sora, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        transition: 'all 0.25s',
    },
    genHint: {
        textAlign: 'center',
        fontSize: '13px',
        color: '#475569',
        marginTop: '10px',
    },

    /* Loading */
    loadingWrap: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 20px',
        gap: '16px',
    },
    spinner: {
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        border: '3px solid #1e2d45',
        borderTop: '3px solid #6366f1',
    },
    loadingTitle: {
        fontSize: '22px',
        fontWeight: '700',
        color: '#f1f5f9',
    },
    loadingSub: {
        fontSize: '14px',
        color: '#64748b',
    },
    dotRow: {
        display: 'flex',
        gap: '8px',
        marginTop: '4px',
    },
    dot: {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: '#6366f1',
        animation: 'dpPulse 1.2s ease-in-out infinite',
    },

    /* Plan */
    planTopRow: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
    },
    backBtn: {
        background: '#0f172a',
        border: '1px solid #1e2d45',
        color: '#94a3b8',
        borderRadius: '10px',
        padding: '8px 16px',
        cursor: 'pointer',
        fontSize: '14px',
        fontFamily: 'Sora, sans-serif',
        transition: 'background 0.15s',
    },
    planDurBadge: {
        fontSize: '13px',
        fontWeight: '600',
        color: '#94a3b8',
        background: '#0f172a',
        border: '1px solid #1e2d45',
        borderRadius: '10px',
        padding: '6px 14px',
    },
    planHeader: {
        background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.05))',
        border: '1px solid rgba(99,102,241,0.2)',
        borderRadius: '18px',
        padding: '24px',
        marginBottom: '20px',
    },
    planHeaderTop: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '16px',
        marginBottom: '16px',
        flexWrap: 'wrap',
    },
    planAiBadge: {
        fontSize: '11px',
        color: '#6366f1',
        fontWeight: '600',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        marginBottom: '8px',
    },
    planTitle: {
        fontSize: '20px',
        fontWeight: '800',
        color: '#f1f5f9',
        marginBottom: '8px',
        lineHeight: '1.3',
    },
    planSummary: {
        fontSize: '14px',
        color: '#94a3b8',
        lineHeight: '1.6',
    },
    bandBadge: {
        background: 'rgba(16,185,129,0.1)',
        border: '1px solid rgba(16,185,129,0.3)',
        color: '#10b981',
        borderRadius: '12px',
        padding: '8px 16px',
        fontSize: '13px',
        fontWeight: '700',
        whiteSpace: 'nowrap',
        alignSelf: 'flex-start',
    },
    motivationBox: {
        background: 'rgba(245,158,11,0.08)',
        border: '1px solid rgba(245,158,11,0.2)',
        borderRadius: '12px',
        padding: '12px 16px',
        fontSize: '13px',
        color: '#fcd34d',
        fontStyle: 'italic',
        lineHeight: '1.5',
    },

    /* Stats */
    statsRow: {
        display: 'flex',
        gap: '12px',
        marginBottom: '28px',
    },
    statCard: {
        flex: 1,
        background: '#0f172a',
        border: '1px solid #1e2d45',
        borderRadius: '14px',
        padding: '16px',
        textAlign: 'center',
    },
    statIcon: { fontSize: '20px', marginBottom: '6px' },
    statValue: { fontSize: '22px', fontWeight: '800', color: '#f1f5f9', marginBottom: '4px' },
    statLabel: { fontSize: '11px', color: '#475569' },

    /* Task list */
    taskListHeader: {
        fontSize: '12px',
        fontWeight: '600',
        color: '#64748b',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        marginBottom: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    taskListHint: {
        fontSize: '11px',
        fontWeight: '400',
        textTransform: 'none',
        letterSpacing: 0,
    },
    taskList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        marginBottom: '28px',
    },
    taskCard: {
        borderRadius: '14px',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        userSelect: 'none',
    },
    taskTypeTag: {
        fontSize: '11px',
        fontWeight: '700',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        borderRadius: '8px',
        padding: '4px 10px',
        flexShrink: 0,
        marginTop: '2px',
        whiteSpace: 'nowrap',
    },
    taskBody: { flex: 1 },
    taskTitle: {
        fontSize: '14px',
        fontWeight: '500',
        lineHeight: '1.5',
        margin: 0,
        transition: 'color 0.2s',
    },
    taskTip: {
        fontSize: '12px',
        color: '#64748b',
        marginTop: '6px',
        lineHeight: '1.5',
    },
    taskDuration: {
        fontSize: '12px',
        fontWeight: '600',
        flexShrink: 0,
        marginTop: '2px',
        background: 'rgba(255,255,255,0.04)',
        borderRadius: '8px',
        padding: '4px 10px',
        whiteSpace: 'nowrap',
    },
    taskCheck: {
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        border: '2px solid',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s',
        marginTop: '2px',
    },

    /* Footer */
    footer: {
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
    },
    retryBtn: {
        flex: 1,
        padding: '14px',
        background: '#0f172a',
        border: '1px solid #1e2d45',
        borderRadius: '12px',
        color: '#94a3b8',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        fontFamily: 'Sora, sans-serif',
        transition: 'background 0.15s',
        minWidth: '160px',
    },
    testsBtn: {
        flex: 1,
        padding: '14px',
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        border: 'none',
        borderRadius: '12px',
        color: 'white',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        fontFamily: 'Sora, sans-serif',
        transition: 'opacity 0.15s',
        minWidth: '160px',
    },
};