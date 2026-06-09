import { useState, useEffect } from 'react';
import { aiAPI } from '../services/api';

function AIDailyPlanWidget({ compact = false }) {
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
        return text.split('\n').filter(l => l.trim()).slice(0, expanded ? 999 : 5);
    };

    if (loading) return (
        <div style={compact ? s.compactWrap : s.card}>
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
        <div style={compact ? s.compactWrap : s.card}>
            <p style={s.emptyText}>
                Test topshirgandan so'ng AI sizga shaxsiy o'quv reja yaratadi.
            </p>
        </div>
    );

    const lines = parsePlan(plan.plan_text);
    const totalLines = plan.plan_text.split('\n').filter(l => l.trim()).length;

    return (
        <div style={compact ? s.compactWrap : s.card}>
            {!compact && (
                <>
                    <div style={s.header}>
                        <span style={s.headerIcon}>📋</span>
                        <div>
                            <div style={s.title}>Kunlik O'quv Reja</div>
                            {plan.ai_generated && <div style={s.badge}>✦ AI yaratdi • Bugun</div>}
                        </div>
                    </div>
                    <div style={s.divider} />
                </>
            )}

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

            {totalLines > 5 && (
                <button onClick={() => setExpanded(!expanded)} style={s.expandBtn}>
                    {expanded ? "▲ Yig'ish" : `▼ Ko'proq (${totalLines - 5} ta)`}
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
        borderTop: '3px solid var(--accent)',
        borderRadius: '14px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    compactWrap: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    shimmer: {
        height: '80px',
        borderRadius: '8px',
        background: 'linear-gradient(90deg, var(--border) 25%, rgba(255,255,255,0.05) 50%, var(--border) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmerAnim 1.5s infinite',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    headerIcon: { fontSize: '22px' },
    title: {
        fontSize: '15px',
        fontWeight: '700',
        color: 'var(--text-primary)',
        marginBottom: '2px',
    },
    badge: {
        fontSize: '11px',
        color: 'var(--accent)',
        fontWeight: '500',
    },
    divider: {
        height: '1px',
        backgroundColor: 'var(--border)',
    },
    emptyText: {
        fontSize: '13px',
        color: 'var(--text-muted)',
        lineHeight: '1.6',
        margin: 0,
    },
    planBody: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    planHeader: {
        fontSize: '13px',
        fontWeight: '600',
        color: 'var(--accent)',
        marginTop: '4px',
    },
    planLine: {
        fontSize: '13px',
        color: 'var(--text-secondary)',
        lineHeight: '1.55',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '8px',
    },
    planBullet: {
        width: '5px',
        height: '5px',
        borderRadius: '50%',
        backgroundColor: 'var(--accent)',
        flexShrink: 0,
        marginTop: '7px',
        opacity: 0.5,
    },
    expandBtn: {
        background: 'none',
        border: 'none',
        color: 'var(--accent)',
        fontSize: '12px',
        fontWeight: '600',
        cursor: 'pointer',
        padding: '4px 0 0',
        fontFamily: 'Sora, sans-serif',
        textAlign: 'left',
    },
};

export default AIDailyPlanWidget;