import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, statisticsAPI } from '../services/api';
import Navbar from '../components/Navbar';
import Skeleton from '../components/Skeleton';
import AIDailyPlanWidget from '../components/AIDailyPlanWidget';

// ── Animatsiya: raqamni 0 dan target gacha sanaydi ──────────────────
function useCountUp(target, duration = 1000, enabled = true) {
    const [display, setDisplay] = useState(0);
    const rafRef = useRef(null);

    useEffect(() => {
        if (!enabled || target === 0 || target == null) {
            setDisplay(target ?? 0);
            return;
        }
        const start = performance.now();
        const tick = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(target % 1 === 0
                ? Math.round(eased * target)
                : Math.round(eased * target * 10) / 10
            );
            if (progress < 1) rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafRef.current);
    }, [target, duration, enabled]);

    return display;
}

function getStreak() {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    const dataStr = localStorage.getItem('streak_data');
    let data = dataStr ? JSON.parse(dataStr) : {};

    if (!data.lastVisit || typeof data.lastVisit !== 'string') {
        const newData = { lastVisit: today, count: 1 };
        localStorage.setItem('streak_data', JSON.stringify(newData));
        return 1;
    }

    if (data.lastVisit === today) {
        return data.count || 1;
    }

    if (data.lastVisit === yesterday) {
        const newCount = (data.count || 0) + 1;
        localStorage.setItem('streak_data', JSON.stringify({
            lastVisit: today,
            count: newCount
        }));
        return newCount;
    }

    const newData = { lastVisit: today, count: 1 };
    localStorage.setItem('streak_data', JSON.stringify(newData));
    return 1;
}

function getXP() {
    return parseInt(localStorage.getItem('xp_total') || '0');
}

function getLevel(xp) {
    if (xp >= 1000) return { level: 5, title: 'Expert', color: '#8b5cf6', next: null };
    if (xp >= 500) return { level: 4, title: 'Advanced', color: '#3b82f6', next: 1000 };
    if (xp >= 200) return { level: 3, title: 'Intermediate', color: '#10b981', next: 500 };
    if (xp >= 50) return { level: 2, title: 'Beginner+', color: '#f59e0b', next: 200 };
    return { level: 1, title: 'Beginner', color: '#ef4444', next: 50 };
}

function getDailyGoal() {
    const saved = JSON.parse(localStorage.getItem('daily_goal') || '{}');
    const today = new Date().toDateString();
    if (saved.date !== today) return { done: 0, total: 3 };
    return { done: saved.done || 0, total: 3 };
}

function DashboardPage() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [overall, setOverall] = useState(null);
    const [streak, setStreak] = useState(1);
    const [xp, setXp] = useState(0);
    const [dailyGoal, setDailyGoal] = useState({ done: 0, total: 3 });
    const [animated, setAnimated] = useState(false);

    useEffect(() => {
        authAPI.getMe().then(res => setUser(res.data)).catch(() => {});
        statisticsAPI.getOverall().then(res => setOverall(res.data)).catch(() => {});

        setStreak(getStreak());
        setXp(getXP());
        setDailyGoal(getDailyGoal());
        // animatsiya: sahifa ochilgandan 100ms keyin boshlaydi
        const t = setTimeout(() => setAnimated(true), 100);
        return () => clearTimeout(t);
    }, []);

    const level = getLevel(xp);
    const xpProgress = level.next
        ? ((xp - [0, 50, 200, 500][level.level - 1]) / (level.next - [0, 50, 200, 500][level.level - 1])) * 100
        : 100;
    const dailyProgress = (dailyGoal.done / dailyGoal.total) * 100;

    // ── Animatsiyali raqamlar ────────────────────────────────────────
    const animStreak   = useCountUp(streak, 800, animated);
    const animXp       = useCountUp(xp, 1000, animated);
    const animXpPct    = useCountUp(xpProgress, 1000, animated);
    const animDailyPct = useCountUp(dailyProgress, 800, animated);

    const writingScore   = overall?.writing?.average_band_score   ?? 0;
    const speakingScore  = overall?.speaking?.average_band_score  ?? 0;
    const readingScore   = overall?.reading?.average_band_score   ?? 0;
    const listeningScore = overall?.listening?.average_band_score ?? 0;

    const animWriting   = useCountUp(writingScore,   900, animated && !!overall);
    const animSpeaking  = useCountUp(speakingScore,  1000, animated && !!overall);
    const animReading   = useCountUp(readingScore,   1100, animated && !!overall);
    const animListening = useCountUp(listeningScore, 1200, animated && !!overall);

    const handleSectionClick = (section) => {
        navigate(`/tests?section=${section}`);
    };

    return (
        <div style={styles.page}>
            <Navbar />
            <main style={styles.main}>

                {user ? (
                    <div style={styles.welcome}>
                        <h1 style={styles.welcomeTitle}>
                            Salom, <span style={styles.accent}>{user.username}</span> 👋
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
                        <div style={styles.gamValue}>{animStreak}</div>
                        <div style={styles.gamLabel}>Kunlik streak</div>
                        <div style={styles.gamSub}>kun ketma-ket</div>
                    </div>

                    <div style={{ ...styles.gamCard, flex: 2 }}>
                        <div style={styles.levelHeader}>
                            <div>
                                <div style={styles.gamIcon}>⚡</div>
                                <div style={styles.gamValue}>{animXp} XP</div>
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
                            <div style={{
                                ...styles.progressFill,
                                width: `${animXpPct}%`,
                                backgroundColor: level.color,
                            }} />
                        </div>
                        <div style={styles.progressLabels}>
                            <span>{animXp} XP</span>
                            <span>{level.next ? `${level.next} XP gacha` : 'Max level! 🏆'}</span>
                        </div>
                    </div>

                    <div style={styles.gamCard}>
                        <div style={styles.gamIcon}>🎯</div>
                        <div style={styles.gamValue}>{dailyGoal.done}/{dailyGoal.total}</div>
                        <div style={styles.gamLabel}>Kunlik maqsad</div>
                        <div style={styles.progressBar}>
                            <div style={{
                                ...styles.progressFill,
                                width: `${animDailyPct}%`,
                                backgroundColor: animDailyPct >= 100 ? '#10b981' : 'var(--accent)',
                            }} />
                        </div>
                        <div style={styles.gamSub}>
                            {dailyProgress === 100 ? '✅ Bajarildi!' : `${dailyGoal.total - dailyGoal.done} ta qoldi`}
                        </div>
                    </div>

                </div>

                <h2 style={styles.sectionTitle}>Natijalarim</h2>
                <div style={styles.statsGrid}>
                    {overall ? (
                        <>
                            <div style={{ ...styles.statCard, cursor: 'pointer', opacity: animated ? 1 : 0, transform: animated ? 'translateY(0)' : 'translateY(16px)', transition: 'opacity 0.4s ease 0ms, transform 0.4s ease 0ms' }} onClick={() => handleSectionClick('writing')}>
                                <div style={styles.statIcon}>✍️</div>
                                <div style={styles.statLabel}>Writing</div>
                                <div style={styles.statScore}>{animWriting > 0 ? animWriting : '—'}</div>
                                <div style={styles.statSub}>{overall.writing?.total_tests ?? 0} ta test</div>
                            </div>

                            <div style={{ ...styles.statCard, borderTop: '3px solid var(--accent-green)', cursor: 'pointer', opacity: animated ? 1 : 0, transform: animated ? 'translateY(0)' : 'translateY(16px)', transition: 'opacity 0.4s ease 80ms, transform 0.4s ease 80ms' }} onClick={() => handleSectionClick('speaking')}>
                                <div style={styles.statIcon}>🎤</div>
                                <div style={styles.statLabel}>Speaking</div>
                                <div style={styles.statScore}>{animSpeaking > 0 ? animSpeaking : '—'}</div>
                                <div style={styles.statSub}>{overall.speaking?.total_tests ?? 0} ta test</div>
                            </div>

                            <div style={{ ...styles.statCard, borderTop: '3px solid #3b82f6', cursor: 'pointer', opacity: animated ? 1 : 0, transform: animated ? 'translateY(0)' : 'translateY(16px)', transition: 'opacity 0.4s ease 160ms, transform 0.4s ease 160ms' }} onClick={() => handleSectionClick('reading')}>
                                <div style={styles.statIcon}>📖</div>
                                <div style={styles.statLabel}>Reading</div>
                                <div style={styles.statScore}>{animReading > 0 ? animReading : '—'}</div>
                                <div style={styles.statSub}>{overall.reading?.total_tests ?? 0} ta test</div>
                            </div>

                            <div style={{ ...styles.statCard, borderTop: '3px solid #f59e0b', cursor: 'pointer', opacity: animated ? 1 : 0, transform: animated ? 'translateY(0)' : 'translateY(16px)', transition: 'opacity 0.4s ease 240ms, transform 0.4s ease 240ms' }} onClick={() => handleSectionClick('listening')}>
                                <div style={styles.statIcon}>🎧</div>
                                <div style={styles.statLabel}>Listening</div>
                                <div style={styles.statScore}>{animListening > 0 ? animListening : '—'}</div>
                                <div style={styles.statSub}>{overall.listening?.total_tests ?? 0} ta test</div>
                            </div>
                        </>
                    ) : (
                        Array(4).fill(0).map((_, i) => (
                            <div key={i} style={styles.statCard}>
                                <Skeleton height="24px" width="40px" style={{ marginBottom: '12px' }} />
                                <Skeleton height="14px" width="80px" style={{ marginBottom: '8px' }} />
                                <Skeleton height="36px" width="60px" style={{ marginBottom: '4px' }} />
                                <Skeleton height="12px" width="100px" />
                            </div>
                        ))
                    )}
                </div>

                <h2 style={styles.sectionTitle}>AI Xizmatlar</h2>
                <div style={styles.aiSection}>

                    <AIDailyPlanWidget expandable />

                    <div style={styles.aiRowDivider} />

                    <a href="/ai-tutor" style={styles.aiRow}>
                        <div style={styles.aiRowLeft}>
                            <div style={{ ...styles.aiRowIconWrap, backgroundColor: '#8b5cf620', border: '1px solid #8b5cf640' }}>
                                <span style={styles.aiRowIcon}>💬</span>
                            </div>
                            <div>
                                <div style={styles.aiRowTitle}>AI Muallim</div>
                                <div style={styles.aiRowSub}>Essay tekshiruv, speaking mashq, grammatika — istalgan vaqt istalgan mavzu</div>
                            </div>
                        </div>
                        <div style={styles.aiRowAction}>
                            <span style={styles.aiRowActionText}>Suhbat boshlash</span>
                            <span style={styles.aiRowArrow}>→</span>
                        </div>
                    </a>

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
                        <div style={styles.navCardTitle}>Testlar</div>
                        <div style={styles.navCardSub}>Mock testlarni boshlash</div>
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
    main: {
        maxWidth: '900px',
        margin: '0 auto',
        padding: '40px 24px',
    },
    welcome: {
        marginBottom: '32px',
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
    accent: {
        color: 'var(--accent)',
    },
    gamRow: {
        display: 'flex',
        gap: '16px',
        marginBottom: '40px',
    },
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
    gamIcon: {
        fontSize: '28px',
        marginBottom: '4px',
    },
    gamValue: {
        fontSize: '32px',
        fontWeight: '800',
        color: 'var(--text-primary)',
    },
    gamLabel: {
        fontSize: '13px',
        color: 'var(--text-secondary)',
        fontWeight: '500',
    },
    gamSub: {
        fontSize: '12px',
        color: 'var(--text-muted)',
    },
    levelHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '8px',
    },
    levelBadge: {
        padding: '6px 14px',
        borderRadius: '20px',
        fontSize: '13px',
        fontWeight: '700',
    },
    progressBar: {
        height: '8px',
        backgroundColor: 'var(--border)',
        borderRadius: '4px',
        overflow: 'hidden',
        marginTop: '8px',
    },
    progressFill: {
        height: '100%',
        borderRadius: '4px',
        transition: 'width 1s ease',
    },
    progressLabels: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '11px',
        color: 'var(--text-muted)',
        marginTop: '4px',
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
        transition: 'transform 0.2s, box-shadow 0.2s',
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
    aiSection: {
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '14px',
        overflow: 'hidden',
        marginBottom: '40px',
    },
    aiRow: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '24px 28px',
        gap: '24px',
        textDecoration: 'none',
        transition: 'background 0.15s',
    },
    aiRowDivider: {
        height: '1px',
        backgroundColor: 'var(--border)',
        margin: '0 28px',
    },
    aiRowIconWrap: {
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
    aiRowIcon: {
        fontSize: '22px',
    },
    aiRowTitle: {
        fontSize: '15px',
        fontWeight: '700',
        color: 'var(--text-primary)',
        marginBottom: '4px',
    },
    aiRowSub: {
        fontSize: '13px',
        color: 'var(--text-secondary)',
        lineHeight: '1.5',
    },
    aiRowAction: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexShrink: 0,
        backgroundColor: '#8b5cf615',
        border: '1px solid #8b5cf640',
        borderRadius: '10px',
        padding: '10px 18px',
    },
    aiRowActionText: {
        fontSize: '13px',
        fontWeight: '600',
        color: '#8b5cf6',
        whiteSpace: 'nowrap',
    },
    aiRowArrow: {
        fontSize: '16px',
        color: '#8b5cf6',
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