import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useLang, translations } from '../context/LanguageContext';

function SettingsPage() {
    const navigate = useNavigate();
    const { lang, changeLang } = useLang();
    const t = translations[lang];

    const [notifications, setNotifications] = useState({
        email: true,
        telegram: false,
        reminders: true,
    });
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div style={styles.page}>
            <Navbar />
            <main style={styles.main}>

                <button onClick={() => navigate(-1)} style={styles.backBtn}>← Orqaga</button>
                <h1 style={styles.pageTitle}>⚙️ {t.settings}</h1>

                {saved && <div style={styles.success}>{t.saved}</div>}

                {/* Notifications */}
                <div style={styles.card}>
                    <h2 style={styles.cardTitle}>🔔 {t.notifications}</h2>

                    <div style={styles.toggleRow}>
                        <div>
                            <div style={styles.toggleLabel}>{t.emailNotif}</div>
                            <div style={styles.toggleDesc}>{t.emailDesc}</div>
                        </div>
                        <div
                            style={{ ...styles.toggle, ...(notifications.email ? styles.toggleOn : {}) }}
                            onClick={() => setNotifications({ ...notifications, email: !notifications.email })}
                        >
                            <div style={{ ...styles.toggleDot, ...(notifications.email ? styles.toggleDotOn : {}) }} />
                        </div>
                    </div>

                    <div style={styles.toggleRow}>
                        <div>
                            <div style={styles.toggleLabel}>{t.telegramNotif}</div>
                            <div style={styles.toggleDesc}>{t.telegramDesc}</div>
                        </div>
                        <div
                            style={{ ...styles.toggle, ...(notifications.telegram ? styles.toggleOn : {}) }}
                            onClick={() => setNotifications({ ...notifications, telegram: !notifications.telegram })}
                        >
                            <div style={{ ...styles.toggleDot, ...(notifications.telegram ? styles.toggleDotOn : {}) }} />
                        </div>
                    </div>

                    <div style={styles.toggleRow}>
                        <div>
                            <div style={styles.toggleLabel}>{t.dailyReminder}</div>
                            <div style={styles.toggleDesc}>{t.dailyDesc}</div>
                        </div>
                        <div
                            style={{ ...styles.toggle, ...(notifications.reminders ? styles.toggleOn : {}) }}
                            onClick={() => setNotifications({ ...notifications, reminders: !notifications.reminders })}
                        >
                            <div style={{ ...styles.toggleDot, ...(notifications.reminders ? styles.toggleDotOn : {}) }} />
                        </div>
                    </div>
                </div>

                {/* Language */}
                <div style={styles.card}>
                    <h2 style={styles.cardTitle}>🌐 {t.language}</h2>
                    <div style={styles.langGrid}>
                        {['uz', 'ru', 'en'].map(l => (
                            <div
                                key={l}
                                style={{ ...styles.langCard, ...(lang === l ? styles.langCardActive : {}) }}
                                onClick={() => changeLang(l)}
                            >
                                <div style={styles.langFlag}>
                                    {l === 'uz' ? '🇺🇿' : l === 'ru' ? '🇷🇺' : '🇬🇧'}
                                </div>
                                <div style={styles.langName}>
                                    {l === 'uz' ? "O'zbek" : l === 'ru' ? 'Русский' : 'English'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Danger zone */}
                <div style={{ ...styles.card, ...styles.dangerCard }}>
                    <h2 style={{ ...styles.cardTitle, color: '#f87171' }}>{t.dangerZone}</h2>
                    <div style={styles.dangerRow}>
                        <div>
                            <div style={styles.toggleLabel}>{t.deleteAcc}</div>
                            <div style={styles.toggleDesc}>{t.deleteDesc}</div>
                        </div>
                        <button style={styles.dangerBtn}>{t.delete}</button>
                    </div>
                </div>

                <button onClick={handleSave} style={styles.saveBtn}>
                    💾 {t.save}
                </button>

            </main>
        </div>
    );
}

const styles = {
    page: {
        minHeight: '100vh',
        backgroundColor: 'var(--bg-base)',
    },
    main: {
        maxWidth: '700px',
        margin: '0 auto',
        padding: '40px 24px',
    },
    backBtn: {
        display: 'inline-block',
        marginBottom: '12px',
        padding: '7px 16px',
        backgroundColor: 'var(--bg-card)',
        color: 'var(--text-secondary)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
        fontFamily: 'Sora, sans-serif',
    },
    pageTitle: {
        fontSize: '28px',
        fontWeight: '700',
        color: 'var(--text-primary)',
        marginBottom: '32px',
    },
    success: {
        backgroundColor: 'rgba(16,185,129,0.1)',
        border: '1px solid rgba(16,185,129,0.3)',
        color: '#34d399',
        padding: '12px 16px',
        borderRadius: '8px',
        fontSize: '14px',
        marginBottom: '20px',
    },
    card: {
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '28px',
        marginBottom: '20px',
    },
    cardTitle: {
        fontSize: '16px',
        fontWeight: '600',
        color: 'var(--text-primary)',
        marginBottom: '20px',
    },
    toggleRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '14px 0',
        borderBottom: '1px solid var(--border)',
    },
    toggleLabel: {
        fontSize: '14px',
        fontWeight: '500',
        color: 'var(--text-primary)',
        marginBottom: '3px',
    },
    toggleDesc: {
        fontSize: '12px',
        color: 'var(--text-muted)',
    },
    toggle: {
        width: '44px',
        height: '24px',
        backgroundColor: 'var(--border)',
        borderRadius: '12px',
        padding: '2px',
        cursor: 'pointer',
        transition: 'background 0.2s',
        flexShrink: 0,
    },
    toggleOn: {
        backgroundColor: 'var(--accent)',
    },
    toggleDot: {
        width: '20px',
        height: '20px',
        backgroundColor: 'white',
        borderRadius: '50%',
        transition: 'transform 0.2s',
    },
    toggleDotOn: {
        transform: 'translateX(20px)',
    },
    langGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '12px',
    },
    langCard: {
        border: '1px solid var(--border)',
        borderRadius: '10px',
        padding: '16px',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'border-color 0.2s',
    },
    langCardActive: {
        border: '1px solid var(--accent)',
        backgroundColor: 'rgba(59,130,246,0.08)',
    },
    langFlag: {
        fontSize: '28px',
        marginBottom: '8px',
    },
    langName: {
        fontSize: '13px',
        fontWeight: '500',
        color: 'var(--text-secondary)',
    },
    dangerCard: {
        border: '1px solid rgba(239,68,68,0.3)',
    },
    dangerRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dangerBtn: {
        padding: '8px 18px',
        backgroundColor: 'transparent',
        border: '1px solid #ef4444',
        borderRadius: '8px',
        color: '#f87171',
        fontSize: '13px',
        cursor: 'pointer',
        fontFamily: 'Sora, sans-serif',
    },
    saveBtn: {
        padding: '12px 32px',
        backgroundColor: 'var(--accent)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '15px',
        fontWeight: '600',
        cursor: 'pointer',
        fontFamily: 'Sora, sans-serif',
    },
};

export default SettingsPage;