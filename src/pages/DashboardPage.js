import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, statisticsAPI } from '../services/api';
import Navbar from '../components/Navbar';
import Skeleton from '../components/Skeleton';

const LEVEL_THRESHOLDS = [0, 50, 200, 500, 1000];

const LEVELS = [
    { level: 1, title: 'Beginner',     color: '#ef4444' },
    { level: 2, title: 'Beginner+',    color: '#f59e0b' },
    { level: 3, title: 'Intermediate', color: '#10b981' },
    { level: 4, title: 'Advanced',     color: '#3b82f6' },
    { level: 5, title: 'Expert',       color: '#8b5cf6' },
];

function getLevel(xp) {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
        if (xp >= LEVEL_THRESHOLDS[i]) return LEVELS[i];
    }
    return LEVELS[0];
}

function getXpProgress(xp) {
    const lvl = getLevel(xp);
    const idx = lvl.level - 1;
    const from = LEVEL_THRESHOLDS[idx];
    const to   = LEVEL_THRESHOLDS[idx + 1];
    if (!to) return 100;
    return Math.min(((xp - from) / (to - from)) * 100, 100);
}

const SECTIONS = [
    { key: 'writing',   icon: '✍️',  label: 'Writing',   color: 'var(--accent)',        desc: 'Esse yozish va baholash' },
    { key: 'speaking',  icon: '🎤',  label: 'Speaking',  color: 'var(--accent-green)',   desc: 'Nutq va talaffuz' },
    { key: 'reading',   icon: '📖',  label: 'Reading',   color: '#3b82f6',               desc: 'Matn o\'qish va tushunish' },
    { key: 'listening', icon: '🎧',  label: 'Listening', color: '#f59e0b',               desc: 'Tinglash va idrok etish' },
];

function DashboardPage() {
    const [user, setUser]       = useState(null);
    const [overall, setOverall] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        authAPI.getMe()
            .then(res => setUser(res.data))
            .catch(() => {});
        statisticsAPI.getOverall()
            .then(res => setOverall(res.data))
            .catch(() => {});
    }, []);

    const xp         = user?.xp_total ?? 0;
    const streak     = user?.streak_count ?? 0;
    const level      = getLevel(xp);
    const xpProgress = getXpProgress(xp);
    const nextXp     = LEVEL_THRESHOLDS[level.level] ?? null;

    const today         = new Date().toISOString().split('T')[0];
    const dailyDone     = user?.daily_goal_date === today ? (user?.daily_goal_done ?? 0) : 0;
    const dailyTotal    = 3;
    const dailyProgress = Math.min((dailyDone / dailyTotal) * 100, 100);

    const goToSection = (sectionKey) => {
        navigate(`/tests?section=${sectionKey}`);
    };

    return (
        <div style={styles.page}>
            <Navbar />
            <main style={styles.main}>

                {user ? (
                    <div style={styles.welcome}>
                        <h1 style={styles.welcomeTitle}>
                            Salom, <span style={{ color: 'var(--accent)' }}>{user.username}</span> 👋
                        </h1>
                        <p style={styles.welcomeSub}>{user.email}</p>
                    </div>
                ) : (
                    <div style={styles.welcome}>
                        <Skeleton height="32px" width="260px" style={{ marginBottom: '8px' }} />
                        <Skeleton height="16px" width="180px" />
                    </div>
                )}

                <div style={styles.gamRow}>
                    <div style={styles.gamCard}>
                        <div style={styles.gamIcon}>🔥</div>
                        <div style={styles.gamValue}>{streak}</div>
                        <div style={styles.gamLabel}>Kunlik streak</div>
                        <div style={styles.gamSub}>kun ketma-ket</div>
                    </div>

                    <div style={{ ...styles.gamCard, flex: 2 }}>
                        <div style={styles.levelHeader}>
                            <div>
                                <div style={styles.gamIcon}>⚡</div>
                                <div style={styles.gamValue}>{xp} XP</div>
                                <div style={styles.gamLabel}>
                                    Level {level.level} —{' '}
                                    <span style={{ color: level.color }}>{level.title}</span>
                                </div>
                            </div>
                            <div style={{
                                ...styles.levelBadge,
                                backgroundColor: `${level.color}20`,
                                color: level.color,
                                border: `1px solid ${level.color}40`,
                            }}>
                                LVL {level.level}
                            </div>
                        </div>
                        <div style={styles.progressBar}>
                            <div style={{ ...styles.progressFill, width: `${xpProgress}%`, backgroundColor: level.color }} />
                        </div>
                        <div style={styles.progressLabels}>
                            <span>{xp} XP</span>
                            <span>{nextXp ? `${nextXp} XP gacha` : 'Max level! 🏆'}</span>
                        </div>
                    </div>

                    <div style={styles.gamCard}>
                        <div style={styles.gamIcon}>🎯</div>
                        <div style={styles.gamValue}>{dailyDone}/{dailyTotal}</div>
                        <div style={styles.gamLabel}>Kunlik maqsad</div>
                        <div style={styles.progressBar}>
                            <div style={{
                                ...styles.progressFill,
                                width: `${dailyProgress}%`,
                                backgroundColor: dailyProgress === 100 ? '#10b981' : 'var(--accent)',
                            }} />
                        </div>
                        <div style={styles.gamSub}>
                            {dailyProgress === 100 ? '✅ Bajarildi!' : `${dailyTotal - dailyDone} ta qoldi`}
                        </div>
                    </div>
                </div>

                <h2 style={styles.sectionTitle}>Natijalarim</h2>
                <div style={styles.statsGrid}>
                    {SECTIONS.map(sec => (
                        <div
                            key={sec.key}
                            style={{ ...styles.statCard, borderTop: `3px solid ${sec.color}`, cursor: 'pointer' }}
                            onClick={() => goToSection(sec.key)}
                        >
                            <div style={styles.statIcon}>{sec.icon}</div>
                            <div style={styles.statLabel}>{sec.label}</div>
                            <div style={styles.statScore}>
                                {overall ? (overall[sec.key]?.average_band_score ?? '—') : (
                                    <Skeleton height="36px" width="60px" />
                                )}
                            </div>
                            <div style={styles.statSub}>
                                {overall
                                    ? `${overall[sec.key]?.total_tests ?? 0} ta test`
                                    : <Skeleton height="12px" width="80px" />
                                }
                            </div>
                            <div style={{ ...styles.statAction, color: sec.color }}>
                                Testga kirish →
                            </div>
                        </div>
                    ))}
                </div>

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
                    <a href="/tests" style={styles.navCard}>
                        <div style={styles.navCardIcon}>📝</div>
                        <div style={styles.navCardTitle}>Barcha testlar</div>
                        <div style={styles.navCardSub}>Mock testlarni boshlash</div>
                    </a>
                    <a href="/ai-tutor" style={styles.navCard}>
                        <div style={styles.navCardIcon}>🤖</div>
                        <div style={styles.navCardTitle}>AI Tutor</div>
                        <div style={styles.navCardSub}>Sun'iy intellekt bilan mashq</div>
                    </a>
                </div>

            </main>
        </div>
    );
}

const styles = {
    page: { minHeight: '100vh', backgroundColor: 'var(--bg-base)' },
    main: { maxWidth: '900px', margin: '0 auto', padding: '40px 24px' },
    welcome: { marginBottom: '32px' },
    welcomeTitle: { fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' },
    welcomeSub: { color: 'var(--text-secondary)', fontSize: '14px' },
    gamRow: { display: 'flex', gap: '16px', marginBottom: '40px' },
    gamCard: {
        flex: 1,
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '14px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    gamIcon: { fontSize: '28px', marginBottom: '4px' },
    gamValue: { fontSize: '32px', fontWeight: '800', color: 'var(--text-primary)' },
    gamLabel: { fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '500' },
    gamSub: { fontSize: '12px', color: 'var(--text-muted)' },
    levelHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' },
    levelBadge: { padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '700' },
    progressBar: { height: '8px', backgroundColor: 'var(--border)', borderRadius: '4px', overflow: 'hidden', marginTop: '8px' },
    progressFill: { height: '100%', borderRadius: '4px', transition: 'width 1s ease' },
    progressLabels: { display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' },
    sectionTitle: { fontSize: '16px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' },
    statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '40px' },
    statCard: {
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '28px',
        transition: 'border-color 0.2s, transform 0.15s',
    },
    statIcon: { fontSize: '24px', marginBottom: '12px' },
    statLabel: { fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '500', marginBottom: '8px' },
    statScore: { fontSize: '36px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' },
    statSub: { fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' },
    statAction: { fontSize: '13px', fontWeight: '600' },
    navGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
    navCard: {
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '28px',
        textDecoration: 'none',
        display: 'block',
        transition: 'border-color 0.2s',
    },
    navCardIcon: { fontSize: '28px', marginBottom: '12px' },
    navCardTitle: { fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '6px' },
    navCardSub: { fontSize: '13px', color: 'var(--text-secondary)' },
};

export default DashboardPage;