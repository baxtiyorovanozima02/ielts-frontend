import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { testsAPI } from '../services/api';

function AIResultPage() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const resultId = state?.resultId;
    const type = state?.type || 'writing';

    const [result, setResult] = useState(null);
    const [polling, setPolling] = useState(true);
    const [dots, setDots] = useState('');
    const pollRef = useRef(null);
    const dotRef = useRef(null);

    useEffect(() => {
        if (!resultId) { navigate('/tests'); return; }

        dotRef.current = setInterval(() => {
            setDots(d => d.length >= 3 ? '' : d + '.');
        }, 500);

        const fetchResult = async () => {
            try {
                const fetchFn = type === 'speaking'
                    ? () => testsAPI.getSpeakingResults()
                    : () => testsAPI.getWritingResults();

                const res = await fetchFn();
                const found = res.data.find(r => r.id === resultId);

                if (found?.ai_feedback || found?.band_score) {
                    setResult(found);
                    setPolling(false);
                    clearInterval(pollRef.current);
                    clearInterval(dotRef.current);
                }
            } catch {}
        };

        fetchResult();
        pollRef.current = setInterval(fetchResult, 3000);

        return () => {
            clearInterval(pollRef.current);
            clearInterval(dotRef.current);
        };
    }, [resultId, type, navigate]);

    const getBandColor = (s) => s >= 7 ? '#10b981' : s >= 5 ? '#f59e0b' : '#ef4444';

    const getBandLabel = (s) => {
        if (s >= 8) return 'Mukammal!';
        if (s >= 7) return 'Juda yaxshi!';
        if (s >= 6) return "Yaxshi bo'lmoqda";
        if (s >= 5) return "O'rtacha";
        return "Ko'proq mashq kerak";
    };

    const parseFeedback = (text) => {
        if (!text) return [];
        return text.split('\n').filter(l => l.trim()).map((line, i) => {
            const isBand = line.toLowerCase().includes('band score');
            const isHeader = /^\d\./.test(line.trim()) || line.endsWith(':');
            return { line, isBand, isHeader, key: i };
        });
    };

    const typeInfo = {
        writing: { icon: '✍️', label: 'Writing', color: 'var(--accent)' },
        speaking: { icon: '🎤', label: 'Speaking', color: '#10b981' },
    };
    const info = typeInfo[type] || typeInfo.writing;

    return (
        <div style={s.page}>
            <Navbar />
            <main style={s.main}>

                {polling ? (
                    <div style={s.loadingWrap}>
                        <div style={s.aiOrb}>
                            <div style={s.orbRing1} />
                            <div style={s.orbRing2} />
                            <div style={s.orbCore}>🤖</div>
                        </div>
                        <h2 style={s.loadTitle}>AI baholamoqda{dots}</h2>
                        <p style={s.loadSub}>
                            Javobingiz IELTS mezonlari bo'yicha tahlil qilinmoqda.<br />
                            Bu 10–30 soniya vaqt olishi mumkin.
                        </p>
                        <div style={s.steps}>
                            {(type === 'writing'
                                ? ['Esse tahlil', 'Grammatika tekshiruv', 'Leksika baholash', 'Band score hisoblash']
                                : ['Audio tahlil', 'Talaffuz tekshiruv', 'Ravonlik baholash', 'Band score hisoblash']
                            ).map((step, i) => (
                                <div key={i} style={{ ...s.step, animationDelay: `${i * 0.4}s` }}>
                                    <div style={s.stepDot} />
                                    <span>{step}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : result ? (
                    <div style={s.resultWrap}>
                        <div style={s.header}>
                            <div style={s.breadcrumb}>
                                <a href="/tests" style={s.bcLink}>Testlar</a>
                                <span style={s.bcSep}>/</span>
                                <span>{info.label}</span>
                                <span style={s.bcSep}>/</span>
                                <span>AI Natija</span>
                            </div>
                            <h1 style={s.pageTitle}>AI Baholash Natijasi</h1>
                        </div>

                        <div style={s.scoreHero}>
                            <div style={s.scoreGlow} />
                            <div style={s.scoreLeft}>
                                <div style={s.scoreTypeTag}>
                                    <span>{info.icon}</span> {info.label}
                                </div>
                                <div style={{ ...s.scoreBig, color: getBandColor(result.band_score) }}>
                                    {result.band_score ?? '—'}
                                </div>
                                <div style={s.scoreOf}>/ 9.0 band</div>
                                <div style={{
                                    ...s.scoreBadge,
                                    background: `${getBandColor(result.band_score)}18`,
                                    color: getBandColor(result.band_score),
                                }}>
                                    {getBandLabel(result.band_score)}
                                </div>
                            </div>
                            <div style={s.scoreRight}>
                                <div style={s.scoreBarLabel}>
                                    <span>0</span><span>Band Score</span><span>9.0</span>
                                </div>
                                <div style={s.scoreBarTrack}>
                                    <div style={{
                                        ...s.scoreBarFill,
                                        width: `${(result.band_score / 9) * 100}%`,
                                        background: getBandColor(result.band_score),
                                    }} />
                                </div>
                                <div style={s.scoreNote}>
                                    IELTS rasmiy mezonlari asosida baholandi
                                </div>
                            </div>
                        </div>

                        {result.ai_feedback && (
                            <div style={s.feedbackCard}>
                                <div style={s.feedbackHeader}>
                                    <div style={s.feedbackTitle}>🤖 AI Fikr-mulohaza</div>
                                    <div style={s.aiBadge}>OpenRouter AI</div>
                                </div>
                                <div style={s.feedbackBody}>
                                    {parseFeedback(result.ai_feedback).map(({ line, isBand, isHeader, key }) => (
                                        <p key={key} style={
                                            isBand ? s.fbBand :
                                            isHeader ? s.fbHeader :
                                            s.fbLine
                                        }>{line}</p>
                                    ))}
                                </div>
                            </div>
                        )}

                        {result.essay_text && (
                            <div style={s.essayCard}>
                                <div style={s.feedbackTitle}>📝 Sizning javobingiz</div>
                                <p style={s.essayText}>{result.essay_text}</p>
                            </div>
                        )}

                        <div style={s.actions}>
                            <button onClick={() => navigate('/tests')} style={s.btnPrimary}>
                                🔄 Yana test topshirish
                            </button>
                            <button onClick={() => navigate('/statistics')} style={s.btnSecondary}>
                                📊 Statistika
                            </button>
                            <button onClick={() => navigate('/ai-tutor')} style={s.btnAI}>
                                🤖 AI Tutor bilan mashq
                            </button>
                        </div>
                    </div>
                ) : (
                    <div style={s.loadingWrap}>
                        <p style={s.loadSub}>Natija topilmadi. Iltimos qayta urinib ko'ring.</p>
                        <button onClick={() => navigate('/tests')} style={s.btnPrimary}>Testlarga qaytish</button>
                    </div>
                )}
            </main>

            <style>{`
                @keyframes orbPulse {
                    0%, 100% { transform: scale(1); opacity: 0.6; }
                    50% { transform: scale(1.15); opacity: 1; }
                }
                @keyframes stepFade {
                    0% { opacity: 0; transform: translateX(-10px); }
                    100% { opacity: 1; transform: translateX(0); }
                }
                @keyframes barFill {
                    from { width: 0; }
                }
            `}</style>
        </div>
    );
}

const s = {
    page: { minHeight: '100vh', backgroundColor: 'var(--bg-base)' },
    main: { maxWidth: '820px', margin: '0 auto', padding: '40px 24px' },
    loadingWrap: {
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: '28px', padding: '60px 0',
    },
    aiOrb: {
        position: 'relative', width: '100px', height: '100px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    orbRing1: {
        position: 'absolute', width: '100px', height: '100px',
        borderRadius: '50%', border: '2px solid rgba(59,130,246,0.3)',
        animation: 'orbPulse 2s ease-in-out infinite',
    },
    orbRing2: {
        position: 'absolute', width: '70px', height: '70px',
        borderRadius: '50%', border: '2px solid rgba(59,130,246,0.5)',
        animation: 'orbPulse 2s ease-in-out infinite 0.5s',
    },
    orbCore: {
        fontSize: '36px', zIndex: 1,
        animation: 'orbPulse 2s ease-in-out infinite 1s',
    },
    loadTitle: {
        fontSize: '22px', fontWeight: '700',
        color: 'var(--text-primary)', fontFamily: 'monospace',
    },
    loadSub: {
        fontSize: '14px', color: 'var(--text-muted)',
        textAlign: 'center', lineHeight: '1.7',
    },
    steps: { display: 'flex', flexDirection: 'column', gap: '10px', width: '240px' },
    step: {
        display: 'flex', alignItems: 'center', gap: '10px',
        fontSize: '13px', color: 'var(--text-secondary)',
        opacity: 0, animation: 'stepFade 0.5s ease forwards',
    },
    stepDot: {
        width: '8px', height: '8px', borderRadius: '50%',
        backgroundColor: 'var(--accent)', flexShrink: 0,
    },
    resultWrap: { display: 'flex', flexDirection: 'column', gap: '20px' },
    header: { marginBottom: '4px' },
    breadcrumb: {
        fontSize: '13px', color: 'var(--text-muted)',
        display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px',
    },
    bcLink: { color: 'var(--accent)', textDecoration: 'none' },
    bcSep: { color: 'var(--text-muted)' },
    pageTitle: { fontSize: '26px', fontWeight: '700', color: 'var(--text-primary)' },
    scoreHero: {
        position: 'relative', overflow: 'hidden',
        backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: '16px', padding: '32px',
        display: 'flex', gap: '32px', alignItems: 'center',
    },
    scoreGlow: {
        position: 'absolute', top: '-40px', right: '-40px',
        width: '200px', height: '200px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
    },
    scoreLeft: {
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: '6px', minWidth: '120px',
    },
    scoreTypeTag: {
        fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.08em',
        display: 'flex', alignItems: 'center', gap: '4px',
    },
    scoreBig: { fontSize: '76px', fontWeight: '800', lineHeight: 1 },
    scoreOf: { fontSize: '13px', color: 'var(--text-muted)' },
    scoreBadge: {
        padding: '5px 14px', borderRadius: '20px',
        fontSize: '13px', fontWeight: '600',
    },
    scoreRight: { flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' },
    scoreBarLabel: {
        display: 'flex', justifyContent: 'space-between',
        fontSize: '12px', color: 'var(--text-muted)',
    },
    scoreBarTrack: {
        height: '10px', backgroundColor: 'var(--border)',
        borderRadius: '5px', overflow: 'hidden',
    },
    scoreBarFill: {
        height: '100%', borderRadius: '5px',
        transition: 'width 1.2s ease',
        animation: 'barFill 1.2s ease',
    },
    scoreNote: { fontSize: '12px', color: 'var(--text-muted)' },
    feedbackCard: {
        backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: '14px', overflow: 'hidden',
    },
    feedbackHeader: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '18px 24px', borderBottom: '1px solid var(--border)',
        backgroundColor: 'rgba(59,130,246,0.04)',
    },
    feedbackTitle: { fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' },
    aiBadge: {
        fontSize: '11px', fontWeight: '600', padding: '3px 10px',
        borderRadius: '20px', backgroundColor: 'rgba(59,130,246,0.1)',
        color: 'var(--accent)',
    },
    feedbackBody: {
        padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '8px',
    },
    fbBand: {
        fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)',
        borderBottom: '1px solid var(--border)', paddingBottom: '10px', marginBottom: '4px',
    },
    fbHeader: {
        fontSize: '14px', fontWeight: '600', color: 'var(--accent)',
        marginTop: '8px',
    },
    fbLine: { fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.7' },
    essayCard: {
        backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: '14px', padding: '24px',
    },
    essayText: {
        fontSize: '14px', color: 'var(--text-secondary)',
        lineHeight: '1.8', whiteSpace: 'pre-wrap', marginTop: '12px',
    },
    actions: { display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '8px' },
    btnPrimary: {
        padding: '12px 24px', backgroundColor: 'var(--accent)',
        color: 'white', border: 'none', borderRadius: '8px',
        fontSize: '14px', fontWeight: '600', cursor: 'pointer',
        fontFamily: 'Sora, sans-serif',
    },
    btnSecondary: {
        padding: '12px 24px', backgroundColor: 'transparent',
        border: '1px solid var(--border)', color: 'var(--text-secondary)',
        borderRadius: '8px', fontSize: '14px', fontWeight: '600',
        cursor: 'pointer', fontFamily: 'Sora, sans-serif',
    },
    btnAI: {
        padding: '12px 24px',
        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
        color: 'white', border: 'none', borderRadius: '8px',
        fontSize: '14px', fontWeight: '600', cursor: 'pointer',
        fontFamily: 'Sora, sans-serif',
    },
};

export default AIResultPage;