import { useState, useEffect } from 'react';
import { aiAPI } from '../services/api';

function AIDailyPlanWidget() {
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
        return text.split('\n').filter(l => l.trim()).slice(0, expanded ? 999 : 6);
    };

    if (loading) return (
        <div style={s.card}>
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
        <div style={s.card}>
            <div style={s.emptyHeader}>🤖 AI Kunlik Reja</div>
            <p style={s.emptyText}>
                Test topshirgandan so'ng AI sizga shaxsiy o'quv reja yaratadi.
            </p>
        </div>
    );

    const lines = parsePlan(plan.plan_text);
    const totalLines = plan.plan_text.split('\n').filter(l => l.trim()).length;

    return (
        <div style={s.card}>
            <div style={s.header}>
                <div style={s.titleRow}>
                    <div style={s.aiIcon}>🤖</div>
                    <div>
                        <div style={s.title}>AI Kunlik O'quv Reja</div>
                        {plan.ai_generated && (
                            <div style={s.badge}>AI tomonidan yaratilgan • Bugun</div>
                        )}
                    </div>
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

            {totalLines > 6 && (
                <button
                    onClick={() => setExpanded(!expanded)}
                    style={s.expandBtn}
                >
                    {expanded ? '▲ Qisqartirish' : `▼ Ko'proq ko'rish (${totalLines - 6} ta band)`}
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
    shimmer: {
        height: '120px', borderRadius: '8px',
        background: 'linear-gradient(90deg, var(--border) 25%, rgba(255,255,255,0.05) 50%, var(--border) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmerAnim 1.5s infinite',
    },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
    titleRow: { display: 'flex', alignItems: 'flex-start', gap: '12px' },
    aiIcon: { fontSize: '24px' },
    title: { fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' },
    badge: {
        fontSize: '11px', color: 'var(--accent)',
        fontWeight: '500', marginTop: '2px',
    },
    emptyHeader: {
        fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)',
    },
    emptyText: { fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6' },
    planBody: { display: 'flex', flexDirection: 'column', gap: '6px' },
    planHeader: {
        fontSize: '13px', fontWeight: '600',
        color: 'var(--accent)', marginTop: '6px',
    },
    planLine: {
        fontSize: '13px', color: 'var(--text-secondary)',
        lineHeight: '1.6', display: 'flex', alignItems: 'flex-start', gap: '8px',
    },
    planBullet: {
        width: '5px', height: '5px', borderRadius: '50%',
        backgroundColor: 'var(--border)', flexShrink: 0, marginTop: '7px',
    },
    expandBtn: {
        background: 'none', border: 'none',
        color: 'var(--accent)', fontSize: '12px',
        fontWeight: '600', cursor: 'pointer',
        padding: '4px 0', fontFamily: 'Sora, sans-serif',
    },
};

export default AIDailyPlanWidget;