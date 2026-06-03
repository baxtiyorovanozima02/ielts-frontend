import { useState, useEffect } from 'react';
import { authAPI, statisticsAPI } from '../services/api';
import Navbar from '../components/Navbar';

function DashboardPage() {
    const [user, setUser] = useState(null);
    const [overall, setOverall] = useState(null);

    useEffect(() => {
        authAPI.getMe().then(res => setUser(res.data)).catch(() => {});
        statisticsAPI.getOverall().then(res => setOverall(res.data)).catch(() => {});
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
    };

    return (
        <div style={styles.page}>

            {/* Navbar */}
            <Navbar />

            {/* Content */}
            <main style={styles.main}>

                {/* Welcome */}
                {user && (
                    <div style={styles.welcome}>
                        <h1 style={styles.welcomeTitle}>
                            Salom, <span style={styles.logoAccent}>{user.username}</span> 👋
                        </h1>
                        <p style={styles.welcomeSub}>{user.email}</p>
                    </div>
                )}

                {/* Stats */}
                <h2 style={styles.sectionTitle}>Natijalarim</h2>
                <div style={styles.statsGrid}>
                    <div style={styles.statCard}>
                        <div style={styles.statIcon}>✍️</div>
                        <div style={styles.statLabel}>Writing</div>
                        <div style={styles.statScore}>
                            {overall ? overall.writing.average_band_score ?? '—' : '—'}
                        </div>
                        <div style={styles.statSub}>
                            {overall ? `${overall.writing.total_tests} ta test` : 'Yuklanmoqda...'}
                        </div>
                    </div>

                    <div style={{ ...styles.statCard, ...styles.statCardGreen }}>
                        <div style={styles.statIcon}>🎤</div>
                        <div style={styles.statLabel}>Speaking</div>
                        <div style={styles.statScore}>
                            {overall ? overall.speaking.average_band_score ?? '—' : '—'}
                        </div>
                        <div style={styles.statSub}>
                            {overall ? `${overall.speaking.total_tests} ta test` : 'Yuklanmoqda...'}
                        </div>
                    </div>
                </div>

                {/* Navigation cards */}
                <h2 style={styles.sectionTitle}>Bo'limlar</h2>
                <div style={styles.navGrid}>
                    <a href="/vocabulary" style={styles.navCard}>
                        <div style={styles.navCardIcon}>📚</div>
                        <div style={styles.navCardTitle}>Lug'at</div>
                        <div style={styles.navCardSub}>So'zlarni saqlash va takrorlash</div>
                    </a>
                    <a href="/statistics" style={styles.navCard}>
                        <div style={styles.navCardIcon}>📊</div>
                        <div style={styles.navCardTitle}>Statistika</div>
                        <div style={styles.navCardSub}>Progress va zaif tomonlar</div>
                    </a>
                </div>

            </main>
        </div>
    );
}

const styles = {
    page: {
        minHeight: '100vh',
        backgroundColor: 'var(--bg-base)',
    },
    navbar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 32px',
        borderBottom: '1px solid var(--border)',
        backgroundColor: 'var(--bg-card)',
    },
    navLogo: {
        fontSize: '22px',
        fontWeight: '700',
        color: 'var(--text-primary)',
    },
    logoAccent: {
        color: 'var(--accent)',
    },
    navLinks: {
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
    },
    navLink: {
        color: 'var(--text-secondary)',
        fontSize: '14px',
        fontWeight: '500',
        textDecoration: 'none',
        transition: 'color 0.2s',
    },
    logoutBtn: {
        padding: '8px 18px',
        backgroundColor: 'transparent',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        color: 'var(--text-secondary)',
        fontSize: '14px',
        cursor: 'pointer',
        fontFamily: 'Sora, sans-serif',
    },
    main: {
        maxWidth: '900px',
        margin: '0 auto',
        padding: '40px 24px',
    },
    welcome: {
        marginBottom: '40px',
    },
    welcomeTitle: {
        fontSize: '28px',
        fontWeight: '700',
        color: 'var(--text-primary)',
        marginBottom: '6px',
    },
    welcomeSub: {
        color: 'var(--text-secondary)',
        fontSize: '14px',
    },
    sectionTitle: {
        fontSize: '16px',
        fontWeight: '600',
        color: 'var(--text-secondary)',
        marginBottom: '16px',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
        marginBottom: '40px',
    },
    statCard: {
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '28px',
        borderTop: '3px solid var(--accent)',
    },
    statCardGreen: {
        borderTop: '3px solid var(--accent-green)',
    },
    statIcon: {
        fontSize: '24px',
        marginBottom: '12px',
    },
    statLabel: {
        fontSize: '13px',
        color: 'var(--text-secondary)',
        fontWeight: '500',
        marginBottom: '8px',
    },
    statScore: {
        fontSize: '36px',
        fontWeight: '700',
        color: 'var(--text-primary)',
        marginBottom: '4px',
    },
    statSub: {
        fontSize: '13px',
        color: 'var(--text-muted)',
    },
    navGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
    },
    navCard: {
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '28px',
        textDecoration: 'none',
        display: 'block',
        transition: 'border-color 0.2s',
    },
    navCardIcon: {
        fontSize: '28px',
        marginBottom: '12px',
    },
    navCardTitle: {
        fontSize: '16px',
        fontWeight: '600',
        color: 'var(--text-primary)',
        marginBottom: '6px',
    },
    navCardSub: {
        fontSize: '13px',
        color: 'var(--text-secondary)',
    },
};

export default DashboardPage;