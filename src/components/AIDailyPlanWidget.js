import { useNavigate } from 'react-router-dom';

function getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return { label: 'Ertalabki reja', icon: '🌅' };
    if (hour >= 12 && hour < 18) return { label: 'Kunduzgi reja', icon: '☀️' };
    return { label: 'Kechki reja', icon: '🌙' };
}

function AIDailyPlanWidget({ expandable = false, compact = false }) {
    const navigate = useNavigate();
    const timeOfDay = getTimeOfDay();

    const handleClick = () => navigate('/daily-plan');

    if (expandable) {
        return (
            <button style={s.trigger} onClick={handleClick}>
                <div style={s.triggerLeft}>
                    <div style={s.iconWrap}>
                        <span style={{ fontSize: '22px' }}>📋</span>
                    </div>
                    <div style={s.triggerTexts}>
                        <div style={s.triggerTitle}>Kunlik O'quv Reja</div>
                        <div style={s.triggerSub}>
                            {timeOfDay.icon} {timeOfDay.label} — AI sizga shaxsiy reja tuzadi
                        </div>
                    </div>
                </div>
                <div style={s.arrow}>→</div>
            </button>
        );
    }

    if (compact) {
        return (
            <button style={s.compactBtn} onClick={handleClick}>
                <span>📋 Reja yaratish</span>
                <span>→</span>
            </button>
        );
    }

    return null;
}

const s = {
    trigger: {
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
        transition: 'background 0.15s',
    },
    triggerLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
    },
    iconWrap: {
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        backgroundColor: 'rgba(99,102,241,0.12)',
        border: '1px solid rgba(99,102,241,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    triggerTexts: { flex: 1 },
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
    arrow: {
        fontSize: '18px',
        color: '#6366f1',
        background: 'rgba(99,102,241,0.1)',
        border: '1px solid rgba(99,102,241,0.25)',
        borderRadius: '10px',
        padding: '8px 14px',
        flexShrink: 0,
        fontWeight: '700',
        transition: 'background 0.15s',
    },
    compactBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: 'rgba(99,102,241,0.1)',
        border: '1px solid rgba(99,102,241,0.25)',
        borderRadius: '10px',
        color: '#6366f1',
        fontSize: '13px',
        fontWeight: '600',
        padding: '10px 16px',
        cursor: 'pointer',
        fontFamily: 'Sora, sans-serif',
        transition: 'background 0.15s',
    },
};

export default AIDailyPlanWidget;