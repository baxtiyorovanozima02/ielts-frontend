import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { testsAPI } from '../services/api';

function TestsPage() {
    const [sections, setSections] = useState([]);
    const [tests, setTests] = useState([]);
    const [activeSection, setActiveSection] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        testsAPI.getSections().then(res => {
            setSections(res.data);
            if (res.data.length > 0) {
                setActiveSection(res.data[0].name);
            }
        }).catch(() => {}).finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (activeSection) {
            setLoading(true);
            testsAPI.getTests(activeSection)
                .then(res => setTests(res.data))
                .catch(() => {})
                .finally(() => setLoading(false));
        }
    }, [activeSection]);

    const sectionIcons = {
        writing: '✍️',
        speaking: '🎤',
        reading: '📖',
        listening: '🎧',
    };

    // section ID yoki name bo'lishi mumkin — ikkalasini ham tekshiramiz
    const getSectionName = (test) => {
        // Agar section object bo'lsa
        if (test.section && typeof test.section === 'object') {
            return test.section.name;
        }
        // Agar section ID (raqam) bo'lsa — sections listidan topamiz
        if (typeof test.section === 'number') {
            const found = sections.find(s => s.id === test.section);
            return found ? found.name : '';
        }
        // Agar to'g'ridan-to'g'ri string bo'lsa
        return test.section || '';
    };

    const handleStart = (test) => {
        const sectionName = getSectionName(test);
        console.log('section name:', sectionName, '| raw:', test.section);

        if (sectionName === 'writing') {
            navigate(`/tests/writing/${test.id}`);
        } else if (sectionName === 'speaking') {
            navigate(`/tests/speaking/${test.id}`);
        } else if (sectionName === 'reading') {
            navigate(`/tests/reading/${test.id}`);
        } else if (sectionName === 'listening') {
            navigate(`/tests/listening/${test.id}`);
        } else {
            alert("Bu bo'lim tez orada qo'shiladi!");
        }
    };

    return (
        <div style={styles.page}>
            <Navbar />
            <main style={styles.main}>

                <h1 style={styles.pageTitle}>Mock Testlar</h1>
                <p style={styles.pageSub}>Bo'limni tanlang va testni boshlang</p>

                {/* Section tabs */}
                <div style={styles.tabs}>
                    {sections.map(sec => (
                        <button
                            key={sec.name}
                            onClick={() => setActiveSection(sec.name)}
                            style={{
                                ...styles.tab,
                                ...(activeSection === sec.name ? styles.tabActive : {})
                            }}
                        >
                            {sectionIcons[sec.name] || '📝'} {sec.display_name || sec.name}
                        </button>
                    ))}
                </div>

                {/* Tests list */}
                {loading ? (
                    <div style={styles.loading}>Yuklanmoqda...</div>
                ) : tests.length === 0 ? (
                    <div style={styles.empty}>
                        <div style={styles.emptyIcon}>📭</div>
                        <div>Bu bo'limda hali testlar yo'q</div>
                    </div>
                ) : (
                    <div style={styles.testGrid}>
                        {tests.map(test => (
                            <div key={test.id} style={styles.testCard}>
                                <div style={styles.testCardTop}>
                                    <div style={styles.testIcon}>
                                        {sectionIcons[getSectionName(test)] || '📝'}
                                    </div>
                                    <div style={styles.testDifficulty}>
                                        {test.difficulty || 'Medium'}
                                    </div>
                                </div>
                                <div style={styles.testTitle}>{test.title}</div>
                                <div style={styles.testDesc}>
                                    {test.description || "Test topshiriq va savollardan iborat"}
                                </div>
                                <div style={styles.testMeta}>
                                    <span>⏱ {test.duration_minutes || test.duration || 60} daqiqa</span>
                                </div>
                                <button
                                    onClick={() => handleStart(test)}
                                    style={styles.startBtn}
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
        maxWidth: '900px',
        margin: '0 auto',
        padding: '40px 24px',
    },
    pageTitle: {
        fontSize: '28px',
        fontWeight: '700',
        color: 'var(--text-primary)',
        marginBottom: '8px',
    },
    pageSub: {
        fontSize: '14px',
        color: 'var(--text-secondary)',
        marginBottom: '32px',
    },
    tabs: {
        display: 'flex',
        gap: '10px',
        marginBottom: '32px',
        flexWrap: 'wrap',
    },
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
    tabActive: {
        backgroundColor: 'var(--accent)',
        borderColor: 'var(--accent)',
        color: 'white',
    },
    loading: {
        textAlign: 'center',
        color: 'var(--text-muted)',
        padding: '60px',
        fontSize: '14px',
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
    emptyIcon: {
        fontSize: '40px',
        marginBottom: '12px',
    },
    testGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '20px',
    },
    testCard: {
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        transition: 'border-color 0.2s',
    },
    testCardTop: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    testIcon: {
        fontSize: '28px',
    },
    testDifficulty: {
        fontSize: '11px',
        fontWeight: '600',
        color: 'var(--accent)',
        backgroundColor: 'rgba(59,130,246,0.1)',
        padding: '3px 10px',
        borderRadius: '20px',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
    },
    testTitle: {
        fontSize: '16px',
        fontWeight: '600',
        color: 'var(--text-primary)',
    },
    testDesc: {
        fontSize: '13px',
        color: 'var(--text-secondary)',
        lineHeight: '1.5',
        flex: 1,
    },
    testMeta: {
        fontSize: '12px',
        color: 'var(--text-muted)',
    },
    startBtn: {
        padding: '10px',
        backgroundColor: 'var(--accent)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        fontFamily: 'Sora, sans-serif',
        marginTop: '4px',
    },
};

export default TestsPage;