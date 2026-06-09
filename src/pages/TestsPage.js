import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { testsAPI } from '../services/api';

const FALLBACK_SECTIONS = [
    { id: 1, name: 'writing',   display_name: 'Writing' },
    { id: 2, name: 'speaking',  display_name: 'Speaking' },
    { id: 3, name: 'reading',   display_name: 'Reading' },
    { id: 4, name: 'listening', display_name: 'Listening' },
];

const SECTION_ICONS = {
    writing:   '✍️',
    speaking:  '🎤',
    reading:   '📖',
    listening: '🎧',
};

const SECTION_COLORS = {
    writing:   'var(--accent)',
    speaking:  'var(--accent-green)',
    reading:   '#3b82f6',
    listening: '#f59e0b',
};

function TestsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const [sections, setSections] = useState(FALLBACK_SECTIONS);
    const [tests, setTests] = useState([]);
    const [activeSection, setActiveSection] = useState(
        () => searchParams.get('section') || 'writing'
    );
    const [testsLoading, setTestsLoading] = useState(true);

    useEffect(() => {
        testsAPI.getSections()
            .then(res => {
                if (res.data?.length > 0) {
                    setSections(res.data);
                }
            })
            .catch(() => {});
    }, []);

    const loadTests = useCallback((section) => {
        setTestsLoading(true);
        setTests([]);
        testsAPI.getTests(section)
            .then(res => setTests(res.data))
            .catch(() => {})
            .finally(() => setTestsLoading(false));
    }, []);

    useEffect(() => {
        loadTests(activeSection);
    }, [activeSection, loadTests]);

    const handleSectionChange = (sectionName) => {
        setActiveSection(sectionName);
        setSearchParams({ section: sectionName }, { replace: true });
    };

    const getSectionName = (test) => {
        if (test.section && typeof test.section === 'object') return test.section.name;
        if (typeof test.section === 'number') {
            const found = sections.find(s => s.id === test.section);
            return found ? found.name : '';
        }
        return test.section || '';
    };

    const handleStart = (test) => {
        const sectionName = getSectionName(test);
        const routes = {
            writing:   `/tests/writing/${test.id}`,
            speaking:  `/tests/speaking/${test.id}`,
            reading:   `/tests/reading/${test.id}`,
            listening: `/tests/listening/${test.id}`,
        };
        const route = routes[sectionName];
        if (route) {
            navigate(route);
        } else {
            alert("Bu bo'lim tez orada qo'shiladi!");
        }
    };

    const accentColor = SECTION_COLORS[activeSection] || 'var(--accent)';

    return (
        <div style={styles.page}>
            <Navbar />
            <main style={styles.main}>

                <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>
                    ← Orqaga
                </button>

                <div style={styles.header}>
                    <h1 style={styles.pageTitle}>Mock Testlar</h1>
                    <p style={styles.pageSub}>Bo'limni tanlang va testni boshlang</p>
                </div>

                <div style={styles.tabs}>
                    {sections.map(sec => {
                        const isActive = activeSection === sec.name;
                        const color = SECTION_COLORS[sec.name] || 'var(--accent)';
                        return (
                            <button
                                key={sec.name}
                                onClick={() => handleSectionChange(sec.name)}
                                style={{
                                    ...styles.tab,
                                    ...(isActive ? {
                                        ...styles.tabActive,
                                        backgroundColor: color,
                                        borderColor: color,
                                        boxShadow: `0 4px 14px ${color}40`,
                                    } : {}),
                                }}
                            >
                                <span style={styles.tabIcon}>{SECTION_ICONS[sec.name] || '📝'}</span>
                                {sec.display_name || sec.name}
                            </button>
                        );
                    })}
                </div>

                {testsLoading ? (
                    <div style={styles.loadingGrid}>
                        {Array(3).fill(0).map((_, i) => (
                            <div key={i} style={styles.skeletonCard}>
                                <div style={{ ...styles.skeletonLine, width: '40px', height: '40px', borderRadius: '12px', marginBottom: '16px' }} />
                                <div style={{ ...styles.skeletonLine, width: '70%', height: '20px', marginBottom: '12px' }} />
                                <div style={{ ...styles.skeletonLine, width: '100%', height: '14px', marginBottom: '6px' }} />
                                <div style={{ ...styles.skeletonLine, width: '80%', height: '14px', marginBottom: '24px' }} />
                                <div style={{ ...styles.skeletonLine, width: '100%', height: '46px', borderRadius: '12px' }} />
                            </div>
                        ))}
                    </div>
                ) : tests.length === 0 ? (
                    <div style={styles.empty}>
                        <div style={styles.emptyIcon}>{SECTION_ICONS[activeSection] || '📭'}</div>
                        <div style={styles.emptyTitle}>
                            {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} bo'limi
                        </div>
                        <div style={styles.emptyText}>Bu bo'limda hali testlar yo'q</div>
                    </div>
                ) : (
                    <div style={styles.testGrid}>
                        {tests.map(test => (
                            <div
                                key={test.id}
                                style={styles.testCard}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                    e.currentTarget.style.borderColor = accentColor;
                                    e.currentTarget.style.boxShadow = `0 8px 24px ${accentColor}20`;
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.borderColor = 'var(--border)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <div style={{ ...styles.testCardAccent, backgroundColor: accentColor }} />
                                <div style={styles.testCardTop}>
                                    <div style={{ ...styles.testIconWrap, backgroundColor: `${accentColor}15` }}>
                                        <span style={styles.testIcon}>
                                            {SECTION_ICONS[getSectionName(test)] || '📝'}
                                        </span>
                                    </div>
                                    <div style={{
                                        ...styles.testDifficulty,
                                        backgroundColor: `${accentColor}15`,
                                        color: accentColor,
                                    }}>
                                        {test.difficulty || 'Medium'}
                                    </div>
                                </div>
                                <div style={styles.testTitle}>{test.title}</div>
                                <div style={styles.testDesc}>
                                    {test.description || "Test topshiriq va savollardan iborat"}
                                </div>
                                <div style={styles.testMeta}>
                                    <span style={styles.testMetaItem}>
                                        ⏱ {test.duration_minutes || test.duration || 60} daqiqa
                                    </span>
                                    {test.questions_count && (
                                        <span style={styles.testMetaItem}>
                                            📋 {test.questions_count} savol
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleStart(test)}
                                    style={{
                                        ...styles.startBtn,
                                        backgroundColor: accentColor,
                                        boxShadow: `0 4px 14px ${accentColor}40`,
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; }}
                                    onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                                >
                                    Boshlash →
                                </button>
                            </div>
                        ))}
                    </div>
                )}
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
        padding: '40px 24px',
        maxWidth: '960px',
        margin: '0 auto',
    },
    backBtn: {
        display: 'inline-block',
        marginBottom: '24px',
        padding: '7px 16px',
        backgroundColor: 'var(--bg-card)',
        color: 'var(--text-secondary)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
        fontFamily: 'Sora, sans-serif',
        transition: 'border-color 0.2s',
    },
    header: {
        marginBottom: '32px',
    },
    pageTitle: {
        fontSize: '28px',
        fontWeight: '700',
        color: 'var(--text-primary)',
        marginBottom: '8px',
    },
    pageSub: {
        color: 'var(--text-secondary)',
        fontSize: '14px',
    },
    tabs: {
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap',
        marginBottom: '32px',
    },
    tab: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 20px',
        borderRadius: '10px',
        border: '1px solid var(--border)',
        backgroundColor: 'var(--bg-card)',
        color: 'var(--text-secondary)',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
        fontFamily: 'Sora, sans-serif',
        transition: 'all 0.2s',
    },
    tabActive: {
        color: '#fff',
    },
    tabIcon: {
        fontSize: '16px',
    },
    loadingGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '20px',
    },
    skeletonCard: {
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '24px',
    },
    skeletonLine: {
        backgroundColor: 'var(--border)',
        borderRadius: '6px',
        animation: 'pulse 1.5s ease-in-out infinite',
    },
    empty: {
        textAlign: 'center',
        padding: '80px 20px',
    },
    emptyIcon: {
        fontSize: '52px',
        marginBottom: '16px',
    },
    emptyTitle: {
        fontSize: '18px',
        fontWeight: '600',
        color: 'var(--text-primary)',
        marginBottom: '8px',
    },
    emptyText: {
        fontSize: '14px',
        color: 'var(--text-secondary)',
    },
    testGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '20px',
    },
    testCard: {
        position: 'relative',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '24px',
        overflow: 'hidden',
        transition: 'transform 0.2s, border-color 0.2s, box-shadow 0.2s',
        cursor: 'default',
    },
    testCardAccent: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
    },
    testCardTop: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
    },
    testIconWrap: {
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    testIcon: {
        fontSize: '24px',
    },
    testDifficulty: {
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
    },
    testTitle: {
        fontSize: '17px',
        fontWeight: '700',
        marginBottom: '10px',
        color: 'var(--text-primary)',
        lineHeight: '1.3',
    },
    testDesc: {
        color: 'var(--text-secondary)',
        fontSize: '13px',
        lineHeight: '1.6',
        marginBottom: '18px',
    },
    testMeta: {
        display: 'flex',
        gap: '16px',
        marginBottom: '20px',
    },
    testMetaItem: {
        color: 'var(--text-muted)',
        fontSize: '12px',
        fontWeight: '500',
    },
    startBtn: {
        width: '100%',
        padding: '12px',
        color: '#fff',
        border: 'none',
        borderRadius: '10px',
        fontSize: '14px',
        fontWeight: '700',
        cursor: 'pointer',
        fontFamily: 'Sora, sans-serif',
        transition: 'opacity 0.2s',
        letterSpacing: '0.02em',
    },
};

export default TestsPage;