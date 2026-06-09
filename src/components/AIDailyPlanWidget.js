import { useState, useEffect } from 'react';
import { aiAPI } from '../services/api';

function AIDailyPlanWidget({ inline = false }) {
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        aiAPI.getDailyPlan()
            .then(res => setPlan(res.data))
            .catch(() => setPlan(null))
            .finally(() => setLoading(false));
    }, []);

    const parsePlan = (text) => {
        if (!text) return [];
        return text.split('\n').filter(l => l.trim()).slice(0, expanded ? 999 : 4);
    };

    const cardStyle = inline ? s.inlineCard : s.card;

    if (loading) return (
        <div style={cardStyle}>
            <div style={s.shimmer} />
            <style>{`
                @keyframes shimmerAnim {
                    from { background-position: 200% 0; }
                    to { background-position: -200% 0; }
                }
            `}</style>
        </div>
    );

    if (!plan?.plan_text) return (
        <div style={cardStyle}>
            <div style={s.aiIcon}>🤖</div>
            <div style={s.emptyHeader}>AI Kunlik Reja</div>
            <p style={s.emptyText}>
                Test topshirgandan so'ng AI sizga shaxsiy o'quv reja yaratadi.
            </p>
        </div>
    );

    const lines = parsePlan(plan.plan_text);
    const totalLines = plan.plan_text.split('\n').filter(l => l.trim()).length;

    return (
        <div style={cardStyle}>
            <div style={s.titleRow}>
                <div style={s.aiIcon}>🤖</div>
                <div>
                    <div style={s.title}>AI Kunlik Reja</div>
                    {plan.ai_generated && (
                        <div style={s.badge}>AI • Bugun</div>
                    )}
                </div>
            </div>

            <div style={s.planBody}>
                {lines.map((line, i) => {
                    const isHeader = /^\d\./.test(line.trim()) || line.endsWith(':') || line.startsWith('#');
                    const clean = line.replace(/^#+\s*/, '').replace(/\*\*/g, '');
                    return (
                        <div key={i} style={isHeader ? s.planHeader : s.planLine}>
                            {!isHeader && <div style={s.planBullet} />}
                            <span>{clean}</span>
                        </div>
                    );
                })}
            </div>

            {totalLines > 4 && (
                <button
                    onClick={() => setExpanded(!expanded)}
                    style={s.expandBtn}
                >
                    {expanded ? '▲ Qisqartirish' : `▼ Ko'proq (${totalLines - 4})`}
                </button>
            )}

            <style>{`
                @keyframes shimmerAnim {
                    from { background-position: 200% 0; }
                    to { background-position: -200% 0; }
                }
            `}</style>
        </div>
    );
}

const s = {
    card: {
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderLeft: '3px solid var(--accent)',
        borderRadius: 'var(--radius)',
        padding: '20px',
        display: 'flex', flexDirection: 'column', gap: '14px',
    },
    inlineCard: {
        flex: 1,
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderTop: '3px solid var(--accent)',
        borderRadius: '14px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    shimmer: {
        height: '80px', borderRadius: '8px',
        background: 'linear-gradient(90deg, var(--border) 25%, rgba(255,255,255,0.05) 50%, var(--border) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmerAnim 1.5s infinite',
    },
    titleRow: { display: 'flex', alignItems: 'flex-start', gap: '10px' },
    aiIcon: { fontSize: '24px' },
    title: { fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' },
    badge: {
        fontSize: '11px', color: 'var(--accent)',
        fontWeight: '500', marginTop: '2px',
    },
    emptyHeader: {
        fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)',
    },
    emptyText: { fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.6', margin: 0 },
    planBody: { display: 'flex', flexDirection: 'column', gap: '5px' },
    planHeader: {
        fontSize: '12px', fontWeight: '600',
        color: 'var(--accent)', marginTop: '4px',
    },
    planLine: {
        fontSize: '12px', color: 'var(--text-secondary)',
        lineHeight: '1.5', display: 'flex', alignItems: 'flex-start', gap: '7px',
    },
    planBullet: {
        width: '4px', height: '4px', borderRadius: '50%',
        backgroundColor: 'var(--border)', flexShrink: 0, marginTop: '6px',
    },
    expandBtn: {
        background: 'none', border: 'none',
        color: 'var(--accent)', fontSize: '11px',
        fontWeight: '600', cursor: 'pointer',
        padding: '2px 0', fontFamily: 'Sora, sans-serif',
        marginTop: 'auto',
    },
};

export default AIDailyPlanWidget;