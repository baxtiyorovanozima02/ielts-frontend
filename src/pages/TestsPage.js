import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { testsAPI } from '../services/api';

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
    const [sections, setSections]         = useState([]);
    const [tests, setTests]               = useState([]);
    const [activeSection, setActiveSection] = useState(null);
    const [loading, setLoading]           = useState(true);

    const navigate  = useNavigate();
    const location  = useLocation();

    useEffect(() => {
        testsAPI.getSections()
            .then(res => {
                const data = res.data;
                setSections(data);

                const params      = new URLSearchParams(location.search);
                const fromQuery   = params.get('section');
                const initialKey  = fromQuery && data.find(s => s.name === fromQuery)
                    ? fromQuery
                    : data[0]?.name ?? null;

                setActiveSection(initialKey);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [location.search]);

    useEffect(() => {
        if (!activeSection) return;
        setLoading(true);
        testsAPI.getTests(activeSection)
            .then(res => setTests(res.data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [activeSection]);

    const getSectionName = (test) => {
        if (test.section && typeof test.section === 'object') return test.section.name;
        if (typeof test.section === 'number') {
            return sections.find(s => s.id === test.section)?.name ?? '';
        }
        return test.section ?? '';
    };

    const handleStart = (test) => {
        const section = getSectionName(test);
        const routes = {
            writing:   `/tests/writing/${test.id}`,
            speaking:  `/tests/speaking/${test.id}`,
            reading:   `/tests/reading/${test.id}`,
            listening: `/tests/listening/${test.id}`,
        };
        if (routes[section]) {
            navigate(routes[section]);
        }
    };

    return (
        <div style={styles.page}>
            <Navbar />
            <main style={styles.main}>

                <h1 style={styles.pageTitle}>Mock Testlar</h1>
                <p style={styles.pageSub}>Bo'limni tanlang va testni boshlang</p>

                <div style={styles.tabs}>
                    {sections.map(sec => (
                        <button
                            key={sec.name}
                            onClick={() => setActiveSection(sec.name)}
                            style={{
                                ...styles.tab,
                                ...(activeSection === sec.name ? {
                                    backgroundColor: SECTION_COLORS[sec.name] ?? 'var(--accent)',
                                    borderColor:     SECTION_COLORS[sec.name] ?? 'var(--accent)',
                                    color: 'white',
                                } : {}),
                            }}
                        >
                            {SECTION_ICONS[sec.name] ?? '📝'} {sec.display_name ?? sec.name}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div style={styles.empty}>Yuklanmoqda...</div>
                ) : tests.length === 0 ? (
                    <div style={styles.empty}>
                        <div style={styles.emptyIcon}>📭</div>
                        <div>Bu bo'limda hali testlar yo'q</div>
                    </div>
                ) : (
                    <div style={styles.testGrid}>
                        {tests.map(test => {
                            const secName = getSectionName(test);
                            const color   = SECTION_COLORS[secName] ?? 'var(--accent)';
                            return (
                                <div key={test.id} style={{ ...styles.testCard, borderTop: `3px solid ${color}` }}>
                                    <div style={styles.testCardTop}>
                                        <div style={styles.testIcon}>
                                            {SECTION_ICONS[secName] ?? '📝'}
                                        </div>
                                        <div style={{ ...styles.testBadge, color, backgroundColor: `${color}18`, border: `1px solid ${color}30` }}>
                                            {test.difficulty ?? 'Medium'}
                                        </div>
                                    </div>
                                    <div style={styles.testTitle}>{test.title}</div>
                                    <div style={styles.testDesc}>
                                        {test.description ?? "Test topshiriq va savollardan iborat"}
                                    </div>
                                    <div style={styles.testMeta}>
                                        ⏱ {test.duration_minutes ?? test.duration ?? 60} daqiqa
                                    </div>
                                    <button
                                        onClick={() => handleStart(test)}
                                        style={{ ...styles.startBtn, backgroundColor: color }}
                                    >
                                        Boshlash →
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}

const styles = {
    page: { minHeight: '100vh', backgroundColor: 'var(--bg-base)' },
    main: { maxWidth: '900px', margin: '0 auto', padding: '40px 24px' },
    pageTitle: { fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' },
    pageSub: { fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '32px' },
    tabs: { display: 'flex', gap: '10px', marginBottom: '32px', flexWrap: 'wrap' },
    tab: {
        padding: '10px 20px',
        borderRadius: '10px',
        border: '1px solid var(--border)',
        backgroundColor: 'transparent',
        color: 'var(--text-secondary)',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        fontFamily: 'Sora, sans-serif',
        transition: 'all 0.2s',
    },
    empty: {
        textAlign: 'center',
        color: 'var(--text-muted)',
        padding: '60px',
        fontSize: '14px',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
    },
    emptyIcon: { fontSize: '40px', marginBottom: '12px' },
    testGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' },
    testCard: {
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        transition: 'transform 0.15s, border-color 0.2s',
    },
    testCardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    testIcon: { fontSize: '28px' },
    testBadge: { fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.05em' },
    testTitle: { fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' },
    testDesc: { fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', flex: 1 },
    testMeta: { fontSize: '12px', color: 'var(--text-muted)' },
    startBtn: {
        padding: '10px',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        fontFamily: 'Sora, sans-serif',
        marginTop: '4px',
        transition: 'opacity 0.2s',
    },
};

export default TestsPage;