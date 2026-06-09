import { useState } from 'react';
import { aiAPI } from '../services/api';

function getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return { label: 'Ertalabki reja', icon: '🌅', greeting: 'Xayrli tong!' };
    if (hour >= 12 && hour < 18) return { label: 'Kunduzgi reja', icon: '☀️', greeting: 'Xayrli kun!' };
    return { label: 'Kechki reja', icon: '🌙', greeting: 'Xayrli kech!' };
}

function AIDailyPlanWidget({ compact = false, expandable = false }) {
    const [open, setOpen] = useState(false);
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const timeOfDay = getTimeOfDay();

    const handleToggle = () => {
        if (open) {
            setOpen(false);
            return;
        }
        setOpen(true);
        if (plan || loading) return;
        setLoading(true);
        setError(false);
        aiAPI.getDailyPlan()
            .then(res => setPlan(res.data))
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    };

    if (expandable) {
        return (
            <div style={s.accordion}>
                <button style={s.accordionTrigger} onClick={handleToggle}>
                    <div style={s.triggerLeft}>
                        <div style={s.triggerIconWrap}>
                            <span style={s.triggerIcon}>📋</span>
                        </div>
                        <div>
                            <div style={s.triggerTitle}>Kunlik O'quv Reja</div>
                            <div style={s.triggerSub}>
                                {timeOfDay.icon} {timeOfDay.label} — AI sizga shaxsiy reja tuzadi
                            </div>
                        </div>
                    </div>
                    <div style={{ ...s.triggerArrow, transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                        ▾
                    </div>
                </button>

                {open && (
                    <div style={s.accordionBody}>
                        <div style={s.accordionDivider} />

                        {loading && (
                            <div style={s.loadingWrap}>
                                <div style={s.shimmer} />
                                <div style={s.shimmerShort} />
                                <div style={s.shimmerShorter} />
                                <style>{`
                                    @keyframes shimmerAnim {
                                        from { background-position: 200% 0; }
                                        to { background-position: -200% 0; }
                                    }
                                `}</style>
                            </div>
                        )}

                        {error && (
                            <div style={s.errorWrap}>
                                <span style={s.errorIcon}>⚠️</span>
                                <div>
                                    <div style={s.errorTitle}>Reja yuklanmadi</div>
                                    <div style={s.errorSub}>Internet aloqani tekshiring yoki keyinroq urinib ko'ring.</div>
                                </div>
                            </div>
                        )}

                        {!loading && !error && !plan?.plan_text && (
                            <div style={s.emptyWrap}>
                                <div style={s.emptyIcon}>{timeOfDay.icon}</div>
                                <div>
                                    <div style={s.emptyTitle}>{timeOfDay.greeting}</div>
                                    <div style={s.emptySub}>
                                        Hozircha reja yo'q. Test topshirgandan so'ng AI sizga shaxsiy o'quv reja yaratadi.
                                    </div>
                                </div>
                            </div>
                        )}

                        {!loading && !error && plan?.plan_text && (
                            <PlanContent plan={plan} timeOfDay={timeOfDay} />
                        )}
                    </div>
                )}
            </div>
        );
    }

    // compact/standalone mode
    if (compact) {
        return (
            <div style={s.compactWrap}>
                <p style={s.emptyText}>
                    Test topshirgandan so'ng AI sizga shaxsiy o'quv reja yaratadi.
                </p>
            </div>
        );
    }

    return null;
}

function PlanContent({ plan, timeOfDay }) {
    const [expanded, setExpanded] = useState(false);

    const allLines = plan.plan_text.split('\n').filter(l => l.trim());
    const lines = allLines.slice(0, expanded ? 999 : 8);

    return (
        <div style={s.planWrap}>
            <div style={s.planHeader}>
                <span style={s.planHeaderIcon}>{timeOfDay.icon}</span>
                <div>
                    <div style={s.planHeaderTitle}>{timeOfDay.label}</div>
                    {plan.ai_generated && (
                        <div style={s.planBadge}>✦ AI tomonidan yaratilgan • Bugun</div>
                    )}
                </div>
            </div>

            <div style={s.planLines}>
                {lines.map((line, i) => {
                    const isHeader = /^\d\./.test(line.trim()) || line.endsWith(':') || line.startsWith('#');
                    const clean = line.replace(/^#+\s*/, '').replace(/\*\*/g, '');
                    return (
                        <div key={i} style={isHeader ? s.planLineHeader : s.planLine}>
                            {!isHeader && <div style={s.bullet} />}
                            <span>{clean}</span>
                        </div>
                    );
                })}
            </div>

            {allLines.length > 8 && (
                <button onClick={() => setExpanded(!expanded)} style={s.expandBtn}>
                    {expanded ? "▲ Yig'ish" : `▼ Ko'proq ko'rish (${allLines.length - 8} ta)`}
                </button>
            )}
        </div>
    );
}

const shimmerBase = {
    height: '14px',
    borderRadius: '6px',
    background: 'linear-gradient(90deg, var(--border) 25%, rgba(255,255,255,0.05) 50%, var(--border) 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmerAnim 1.5s infinite',
};

const s = {
    accordion: {
        display: 'flex',
        flexDirection: 'column',
    },
    accordionTrigger: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        background: 'none',
        border: 'none',
        padding: '24px 28px',
        cursor: 'pointer',
        gap: '16px',
        fontFamily: 'Sora, sans-serif',
        textAlign: 'left',
    },
    triggerLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
    },
    triggerIconWrap: {
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        backgroundColor: 'var(--accent-transparent, rgba(99,179,237,0.12))',
        border: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    triggerIcon: { fontSize: '22px' },
    triggerTitle: {
        fontSize: '15px',
        fontWeight: '700',
        color: 'var(--text-primary)',
        marginBottom: '3px',
    },
    triggerSub: {
        fontSize: '13px',
        color: 'var(--text-secondary)',
    },
    triggerArrow: {
        fontSize: '20px',
        color: 'var(--text-muted)',
        transition: 'transform 0.25s ease',
        flexShrink: 0,
    },
    accordionBody: {
        padding: '0 28px 24px',
    },
    accordionDivider: {
        height: '1px',
        backgroundColor: 'var(--border)',
        marginBottom: '20px',
    },
    loadingWrap: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        padding: '4px 0',
    },
    shimmer: { ...shimmerBase, width: '90%' },
    shimmerShort: { ...shimmerBase, width: '70%' },
    shimmerShorter: { ...shimmerBase, width: '55%' },
    errorWrap: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '16px',
        backgroundColor: 'rgba(248,113,113,0.08)',
        borderRadius: '10px',
        border: '1px solid rgba(248,113,113,0.2)',
    },
    errorIcon: { fontSize: '20px', flexShrink: 0 },
    errorTitle: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#f87171',
        marginBottom: '4px',
    },
    errorSub: {
        fontSize: '13px',
        color: 'var(--text-muted)',
    },
    emptyWrap: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px',
        padding: '4px 0',
    },
    emptyIcon: { fontSize: '28px', flexShrink: 0 },
    emptyTitle: {
        fontSize: '14px',
        fontWeight: '600',
        color: 'var(--text-primary)',
        marginBottom: '4px',
    },
    emptySub: {
        fontSize: '13px',
        color: 'var(--text-muted)',
        lineHeight: '1.6',
    },
    planWrap: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    planHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '4px',
    },
    planHeaderIcon: { fontSize: '20px' },
    planHeaderTitle: {
        fontSize: '14px',
        fontWeight: '700',
        color: 'var(--text-primary)',
        marginBottom: '2px',
    },
    planBadge: {
        fontSize: '11px',
        color: 'var(--accent)',
        fontWeight: '500',
    },
    planLines: {
        display: 'flex',
        flexDirection: 'column',
        gap: '7px',
    },
    planLineHeader: {
        fontSize: '13px',
        fontWeight: '600',
        color: 'var(--accent)',
        marginTop: '6px',
    },
    planLine: {
        fontSize: '13px',
        color: 'var(--text-secondary)',
        lineHeight: '1.55',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '8px',
    },
    bullet: {
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
        padding: '6px 0 0',
        fontFamily: 'Sora, sans-serif',
        textAlign: 'left',
    },
    compactWrap: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    emptyText: {
        fontSize: '13px',
        color: 'var(--text-muted)',
        lineHeight: '1.6',
        margin: 0,
    },
};

export default AIDailyPlanWidget;