import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

function TestResultPage() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const result = state?.result;
    const type = state?.type || 'writing';

    if (!result) {
        return (
            <div style={styles.page}>
                <Navbar />
                <div style={styles.empty}>
                    <div style={styles.emptyIcon}>😕</div>
                    <div>Natija topilmadi</div>
                    <button onClick={() => navigate('/tests')} style={styles.backBtn}>
                        Testlarga qaytish
                    </button>
                </div>
            </div>
        );
    }

    const bandScore = result.band_score || result.score || 0;
    const feedback = result.feedback || result.ai_feedback || '';
    const criteria = result.criteria || null;

    const getBandColor = (score) => {
        if (score >= 7) return '#10b981';
        if (score >= 5) return '#f59e0b';
        return '#ef4444';
    };

    const getBandLabel = (score) => {
        if (score >= 8) return 'Ajoyib! 🏆';
        if (score >= 7) return 'Yaxshi! 🎉';
        if (score >= 6) return "Yaxshi bo'lmoqda 👍";
        if (score >= 5) return "O'rtacha 📈";
        return "Ko'proq mashq qiling 💪";
    };

    return (
        <div style={styles.page}>
            <Navbar />
            <main style={styles.main}>

                {/* Header */}
                <div style={styles.header}>
                    <div style={styles.breadcrumb}>
                        <a href="/tests" style={styles.breadcrumbLink}>Testlar</a>
                        <span style={styles.breadcrumbSep}>/</span>
                        <span>{type === 'writing' ? 'Writing' : 'Speaking'}</span>
                        <span style={styles.breadcrumbSep}>/</span>
                        <span>Natija</span>
                    </div>
                    <h1 style={styles.title}>Test natijasi</h1>
                </div>

                {/* Band score card */}
                <div style={styles.scoreCard}>
                    <div style={styles.scoreLeft}>
                        <div style={styles.scoreLabel}>Band Score</div>
                        <div style={{
                            ...styles.scoreBig,
                            color: getBandColor(bandScore)
                        }}>
                            {bandScore}
                        </div>
                        <div style={styles.scoreLabel}>/ 9.0</div>
                    </div>
                    <div style={styles.scoreRight}>
                        <div style={styles.scoreType}>
                            {type === 'writing' ? '✍️ Writing' : '🎤 Speaking'}
                        </div>
                        <div style={{
                            ...styles.scoreBadge,
                            backgroundColor: `${getBandColor(bandScore)}20`,
                            color: getBandColor(bandScore),
                        }}>
                            {getBandLabel(bandScore)}
                        </div>

                        {/* Progress bar */}
                        <div style={styles.progressBar}>
                            <div style={{
                                ...styles.progressFill,
                                width: `${(bandScore / 9) * 100}%`,
                                backgroundColor: getBandColor(bandScore),
                            }} />
                        </div>
                        <div style={styles.progressLabels}>
                            <span>0</span>
                            <span>4.5</span>
                            <span>9</span>
                        </div>
                    </div>
                </div>

                {/* Criteria (agar mavjud bo'lsa) */}
                {criteria && (
                    <div style={styles.card}>
                        <h2 style={styles.cardTitle}>📊 Mezonlar bo'yicha baho</h2>
                        <div style={styles.criteriaGrid}>
                            {Object.entries(criteria).map(([key, val]) => (
                                <div key={key} style={styles.criteriaItem}>
                                    <div style={styles.criteriaName}>{key}</div>
                                    <div style={styles.criteriaScore}>
                                        <div style={styles.criteriaBar}>
                                            <div style={{
                                                ...styles.criteriaFill,
                                                width: `${(val / 9) * 100}%`,
                                                backgroundColor: getBandColor(val),
                                            }} />
                                        </div>
                                        <span style={{
                                            color: getBandColor(val),
                                            fontWeight: '700',
                                            fontSize: '15px',
                                            minWidth: '28px',
                                        }}>
                                            {val}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* AI Feedback */}
                {feedback && (
                    <div style={styles.card}>
                        <h2 style={styles.cardTitle}>🤖 AI Fikr-mulohaza</h2>
                        <div style={styles.feedback}>
                            {feedback}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div style={styles.actions}>
                    <button
                        onClick={() => navigate('/tests')}
                        style={styles.primaryBtn}
                    >
                        🔄 Yana test topshirish
                    </button>
                    <button
                        onClick={() => navigate('/statistics')}
                        style={styles.secondaryBtn}
                    >
                        📊 Statistikaga o'tish
                    </button>
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
    empty: {
        textAlign: 'center',
        padding: '80px',
        color: 'var(--text-muted)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
    },
    emptyIcon: {
        fontSize: '48px',
    },
    backBtn: {
        padding: '10px 24px',
        backgroundColor: 'var(--accent)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        fontFamily: 'Sora, sans-serif',
    },
    main: {
        maxWidth: '800px',
        margin: '0 auto',
        padding: '32px 24px',
    },
    header: {
        marginBottom: '32px',
    },
    breadcrumb: {
        fontSize: '13px',
        color: 'var(--text-muted)',
        marginBottom: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
    },
    breadcrumbLink: {
        color: 'var(--accent)',
        textDecoration: 'none',
    },
    breadcrumbSep: {
        color: 'var(--text-muted)',
    },
    title: {
        fontSize: '28px',
        fontWeight: '700',
        color: 'var(--text-primary)',
    },
    scoreCard: {
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '32px',
        display: 'flex',
        gap: '32px',
        alignItems: 'center',
        marginBottom: '20px',
    },
    scoreLeft: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        minWidth: '100px',
    },
    scoreLabel: {
        fontSize: '12px',
        color: 'var(--text-muted)',
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
    },
    scoreBig: {
        fontSize: '72px',
        fontWeight: '800',
        lineHeight: '1',
    },
    scoreRight: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    scoreType: {
        fontSize: '16px',
        fontWeight: '600',
        color: 'var(--text-primary)',
    },
    scoreBadge: {
        display: 'inline-block',
        padding: '6px 16px',
        borderRadius: '20px',
        fontSize: '14px',
        fontWeight: '600',
        width: 'fit-content',
    },
    progressBar: {
        height: '8px',
        backgroundColor: 'var(--border)',
        borderRadius: '4px',
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: '4px',
        transition: 'width 0.8s ease',
    },
    progressLabels: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '11px',
        color: 'var(--text-muted)',
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
    criteriaGrid: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    criteriaItem: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    criteriaName: {
        fontSize: '14px',
        color: 'var(--text-secondary)',
        fontWeight: '500',
    },
    criteriaScore: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    criteriaBar: {
        flex: 1,
        height: '6px',
        backgroundColor: 'var(--border)',
        borderRadius: '3px',
        overflow: 'hidden',
    },
    criteriaFill: {
        height: '100%',
        borderRadius: '3px',
        transition: 'width 0.8s ease',
    },
    feedback: {
        fontSize: '15px',
        color: 'var(--text-secondary)',
        lineHeight: '1.8',
        whiteSpace: 'pre-wrap',
    },
    actions: {
        display: 'flex',
        gap: '12px',
        marginTop: '8px',
    },
    primaryBtn: {
        padding: '12px 28px',
        backgroundColor: 'var(--accent)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '15px',
        fontWeight: '600',
        cursor: 'pointer',
        fontFamily: 'Sora, sans-serif',
    },
    secondaryBtn: {
        padding: '12px 28px',
        backgroundColor: 'transparent',
        border: '1px solid var(--border)',
        color: 'var(--text-secondary)',
        borderRadius: '8px',
        fontSize: '15px',
        fontWeight: '600',
        cursor: 'pointer',
        fontFamily: 'Sora, sans-serif',
    },
};

export default TestResultPage;