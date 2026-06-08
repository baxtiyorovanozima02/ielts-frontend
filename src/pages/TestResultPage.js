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
                    <button onClick={() => navigate('/tests')} style={styles.emptyBackBtn}>
                        Testlarga qaytish
                    </button>
                </div>
            </div>
        );
    }

    const bandScore = result.band_score || result.score || 0;
    const feedback = result.feedback || result.ai_feedback || '';
    const criteria = result.criteria || null;
    const correct = result.correct ?? null;
    const total = result.total ?? null;
    const percentage = result.percentage ?? null;
    const testTitle = result.test_title || '';

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

    const typeConfig = {
        writing:   { icon: '✍️', label: 'Writing',   color: 'var(--accent)' },
        speaking:  { icon: '🎤', label: 'Speaking',  color: '#10b981' },
        reading:   { icon: '📖', label: 'Reading',   color: '#3b82f6' },
        listening: { icon: '🎧', label: 'Listening', color: '#f59e0b' },
    };

    const config = typeConfig[type] || typeConfig.writing;

    return (
        <div style={styles.page}>
            <Navbar />
            <main style={styles.main}>

                {/* Header */}
                <div style={styles.header}>
                    <div style={styles.breadcrumb}>
                        <a href="/tests" style={styles.breadcrumbLink}>Testlar</a>
                        <span style={styles.breadcrumbSep}>/</span>
                        <span>{config.label}</span>
                        <span style={styles.breadcrumbSep}>/</span>
                        <span>Natija</span>
                    </div>
                    <h1 style={styles.title}>Test natijasi</h1>
                    {testTitle && (
                        <p style={styles.testTitle}>{testTitle}</p>
                    )}
                </div>

                {/* Band score card */}
                <div style={styles.scoreCard}>
                    <div style={styles.scoreLeft}>
                        <div style={styles.scoreLabel}>Band Score</div>
                        <div style={{ ...styles.scoreBig, color: getBandColor(bandScore) }}>
                            {bandScore}
                        </div>
                        <div style={styles.scoreLabel}>/ 9.0</div>
                    </div>
                    <div style={styles.scoreRight}>
                        <div style={styles.scoreType}>
                            <span style={{ marginRight: '8px' }}>{config.icon}</span>
                            {config.label}
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

                {/* Reading / Listening — qo'shimcha statistika */}
                {(type === 'reading' || type === 'listening') && correct !== null && (
                    <div style={styles.card}>
                        <h2 style={styles.cardTitle}>📊 Natija tafsiloti</h2>
                        <div style={styles.statsRow}>
                            <div style={styles.statBox}>
                                <div style={styles.statValue}>{correct} / {total}</div>
                                <div style={styles.statLabel}>To'g'ri javoblar</div>
                            </div>
                            <div style={styles.statBox}>
                                <div style={{ ...styles.statValue, color: getBandColor(bandScore) }}>
                                    {percentage}%
                                </div>
                                <div style={styles.statLabel}>Foiz</div>
                            </div>
                            <div style={styles.statBox}>
                                <div style={{ ...styles.statValue, color: config.color }}>
                                    {bandScore}
                                </div>
                                <div style={styles.statLabel}>Band Score</div>
                            </div>
                        </div>

                        {/* Foiz progress */}
                        <div style={{ marginTop: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Umumiy natija</span>
                                <span style={{ fontSize: '13px', fontWeight: '600', color: getBandColor(bandScore) }}>{percentage}%</span>
                            </div>
                            <div style={styles.progressBar}>
                                <div style={{
                                    ...styles.progressFill,
                                    width: `${percentage}%`,
                                    backgroundColor: getBandColor(bandScore),
                                }} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Writing/Speaking criteria (agar mavjud bo'lsa) */}
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

                {/* AI Feedback (Writing/Speaking uchun) */}
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
                        onClick={() => navigate(-1)}
                        style={styles.backBtn}
                    >
                        ← Orqaga
                    </button>
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
    emptyBackBtn: {
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
        marginBottom: '4px',
    },
    testTitle: {
        fontSize: '14px',
        color: 'var(--text-muted)',
        marginTop: '4px',
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
        display: 'flex',
        alignItems: 'center',
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
    statsRow: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '16px',
    },
    statBox: {
        backgroundColor: 'var(--bg-base)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        padding: '20px',
        textAlign: 'center',
    },
    statValue: {
        fontSize: '28px',
        fontWeight: '700',
        color: 'var(--text-primary)',
        marginBottom: '6px',
    },
    statLabel: {
        fontSize: '12px',
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
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
        flexWrap: 'wrap',
    },
    backBtn: {
        padding: '12px 28px',
        backgroundColor: 'var(--bg-card)',
        color: 'var(--text-secondary)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        fontSize: '15px',
        fontWeight: '600',
        cursor: 'pointer',
        fontFamily: 'Sora, sans-serif',
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