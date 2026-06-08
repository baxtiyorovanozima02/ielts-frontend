import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

function SettingsPage() {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState({
        email: true,
        telegram: false,
        reminders: true,
    });
    const [language, setLanguage] = useState('uz');
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
                <h1 style={styles.pageTitle}>Sozlamalar</h1>

                {saved && <div style={styles.success}>✅ Sozlamalar saqlandi!</div>}

                {/* Notifications */}
                <div style={styles.card}>
                    <h2 style={styles.cardTitle}>🔔 Bildirishnomalar</h2>

                    <div style={styles.toggleRow}>
                        <div>
                            <div style={styles.toggleLabel}>Email bildirishnomalar</div>
                            <div style={styles.toggleDesc}>Yangi testlar va natijalar haqida</div>
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
                            <div style={styles.toggleLabel}>Telegram bildirishnomalar</div>
                            <div style={styles.toggleDesc}>Bot orqali xabar olish</div>
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
                            <div style={styles.toggleLabel}>Kunlik eslatmalar</div>
                            <div style={styles.toggleDesc}>Har kuni o'qishga undash</div>
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
                    <h2 style={styles.cardTitle}>🌐 Til</h2>
                    <div style={styles.langGrid}>
                        {['uz', 'ru', 'en'].map(lang => (
                            <div
                                key={lang}
                                style={{ ...styles.langCard, ...(language === lang ? styles.langCardActive : {}) }}
                                onClick={() => setLanguage(lang)}
                            >
                                <div style={styles.langFlag}>
                                    {lang === 'uz' ? '🇺🇿' : lang === 'ru' ? '🇷🇺' : '🇬🇧'}
                                </div>
                                <div style={styles.langName}>
                                    {lang === 'uz' ? "O'zbek" : lang === 'ru' ? 'Русский' : 'English'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Danger zone */}
                <div style={{ ...styles.card, ...styles.dangerCard }}>
                    <h2 style={{ ...styles.cardTitle, color: '#f87171' }}>⚠️ Xavfli zona</h2>
                    <div style={styles.dangerRow}>
                        <div>
                            <div style={styles.toggleLabel}>Akkauntni o'chirish</div>
                            <div style={styles.toggleDesc}>Bu amalni qaytarib bo'lmaydi</div>
                        </div>
                        <button style={styles.dangerBtn}>O'chirish</button>
                    </div>
                </div>

                <button onClick={handleSave} style={styles.saveBtn}>
                    💾 Saqlash
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
        borderColor: 'var(--accent)',
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
        borderColor: 'rgba(239,68,68,0.3)',
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