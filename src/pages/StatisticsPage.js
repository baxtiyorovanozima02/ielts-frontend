import { useState, useEffect } from 'react';
import { statisticsAPI } from '../services/api';

function StatisticsPage() {
    const [history, setHistory] = useState({ writing: [], speaking: [] });
    const [weakAreas, setWeakAreas] = useState([]);

    useEffect(() => {
        statisticsAPI.getHistory().then(res => setHistory(res.data)).catch(() => {});
        statisticsAPI.getWeakAreas().then(res => setWeakAreas(res.data.weak_areas)).catch(() => {});
    }, []);

    return (
        <div style={styles.page}>

            {/* Navbar */}
            <nav style={styles.navbar}>
                <a href="/dashboard" style={styles.navLogo}>
                    IELTS<span style={styles.logoAccent}>.uz</span>
                </a>
                <div style={styles.navLinks}>
                    <a href="/vocabulary" style={styles.navLink}>Lug'at</a>
                    <a href="/statistics" style={{ ...styles.navLink, color: 'var(--text-primary)' }}>Statistika</a>
                </div>
            </nav>

            <main style={styles.main}>

                <h1 style={styles.pageTitle}>Statistika</h1>

                {/* Weak areas */}
                {weakAreas.length > 0 && (
                    <div style={styles.warningCard}>
                        <div style={styles.warningTitle}>⚠️ Zaif tomonlar</div>
                        <div style={styles.warningList}>
                            {weakAreas.map(a => (
                                <div key={a.section} style={styles.warningItem}>
                                    <span style={styles.warningSection}>{a.section}</span>
                                    <span style={styles.warningScore}>{a.average_band_score} ball</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Writing history */}
                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>✍️ Writing tarixi</h2>
                    {history.writing.length === 0 ? (
                        <div style={styles.empty}>Hali natija yo'q</div>
                    ) : (
                        history.writing.map((r, i) => (
                            <div key={i} style={styles.historyCard}>
                                <div style={styles.historyLeft}>
                                    <div style={styles.historyTestName}>{r.test__title}</div>
                                    <div style={styles.historyDate}>
                                        {new Date(r.created_at).toLocaleDateString('uz-UZ')}
                                    </div>
                                </div>
                                <div style={styles.bandBadge}>{r.band_score}</div>
                            </div>
                        ))
                    )}
                </div>

                {/* Speaking history */}
                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>🎤 Speaking tarixi</h2>
                    {history.speaking.length === 0 ? (
                        <div style={styles.empty}>Hali natija yo'q</div>
                    ) : (
                        history.speaking.map((r, i) => (
                            <div key={i} style={{ ...styles.historyCard, ...styles.historyCardGreen }}>
                                <div style={styles.historyLeft}>
                                    <div style={styles.historyTestName}>{r.test__title}</div>
                                    <div style={styles.historyDate}>
                                        {new Date(r.created_at).toLocaleDateString('uz-UZ')}
                                    </div>
                                </div>
                                <div style={{ ...styles.bandBadge, ...styles.bandBadgeGreen }}>
                                    {r.band_score}
                                </div>
                            </div>
                        ))
                    )}
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
        textDecoration: 'none',
    },
    logoAccent: {
        color: 'var(--accent)',
    },
    navLinks: {
        display: 'flex',
        gap: '24px',
    },
    navLink: {
        color: 'var(--text-secondary)',
        fontSize: '14px',
        fontWeight: '500',
        textDecoration: 'none',
    },
    main: {
        maxWidth: '800px',
        margin: '0 auto',
        padding: '40px 24px',
    },
    pageTitle: {
        fontSize: '28px',
        fontWeight: '700',
        color: 'var(--text-primary)',
        marginBottom: '32px',
    },
    warningCard: {
        backgroundColor: 'rgba(245, 158, 11, 0.08)',
        border: '1px solid rgba(245, 158, 11, 0.25)',
        borderRadius: 'var(--radius)',
        padding: '20px 24px',
        marginBottom: '32px',
    },
    warningTitle: {
        fontSize: '15px',
        fontWeight: '600',
        color: '#fbbf24',
        marginBottom: '12px',
    },
    warningList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    warningItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    warningSection: {
        fontSize: '14px',
        color: 'var(--text-secondary)',
    },
    warningScore: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#fbbf24',
    },
    section: {
        marginBottom: '40px',
    },
    sectionTitle: {
        fontSize: '16px',
        fontWeight: '600',
        color: 'var(--text-secondary)',
        marginBottom: '16px',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
    },
    empty: {
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '24px',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '14px',
    },
    historyCard: {
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderLeft: '3px solid var(--accent)',
        borderRadius: 'var(--radius)',
        padding: '16px 20px',
        marginBottom: '10px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    historyCardGreen: {
        borderLeft: '3px solid var(--accent-green)',
    },
    historyLeft: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
    },
    historyTestName: {
        fontSize: '15px',
        fontWeight: '500',
        color: 'var(--text-primary)',
    },
    historyDate: {
        fontSize: '13px',
        color: 'var(--text-muted)',
    },
    bandBadge: {
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        color: 'var(--accent)',
        fontWeight: '700',
        fontSize: '18px',
        padding: '8px 16px',
        borderRadius: '8px',
        minWidth: '52px',
        textAlign: 'center',
    },
    bandBadgeGreen: {
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        color: 'var(--accent-green)',
    },
};

export default StatisticsPage;