import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { testsAPI } from '../services/api';

function TestsPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [sections, setSections] = useState([]);
    const [tests, setTests] = useState([]);
    const [activeSection, setActiveSection] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const urlSection = searchParams.get('section');
        testsAPI.getSections().then(res => {
            setSections(res.data);
            const initialSection = urlSection || (res.data.length > 0 ? res.data[0].name : null);
            setActiveSection(initialSection);
        }).catch(() => {}).finally(() => setLoading(false));
    }, [searchParams]);

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

    const getSectionName = (test) => {
        if (test.section && typeof test.section === 'object') {
            return test.section.name;
        }
        if (typeof test.section === 'number') {
            const found = sections.find(s => s.id === test.section);
            return found ? found.name : '';
        }
        return test.section || '';
    };

    const handleStart = (test) => {
        const sectionName = getSectionName(test);

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

                <button onClick={() => navigate(-1)} style={styles.backBtn}>← Orqaga</button>
                <h1 style={styles.pageTitle}>Mock Testlar</h1>
                <p style={styles.pageSub}>Bo'limni tanlang va testni boshlang</p>

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
        backgroundColor: '#f8fafc',
    },
    main: {
        padding: '20px',
        maxWidth: '1200px',
        margin: '0 auto',
    },
    backBtn: {
        padding: '8px 16px',
        backgroundColor: 'transparent',
        border: '1px solid #ddd',
        borderRadius: '8px',
        cursor: 'pointer',
        marginBottom: '20px',
        fontSize: '16px',
    },
    pageTitle: {
        fontSize: '32px',
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: '8px',
    },
    pageSub: {
        color: '#6b7280',
        fontSize: '18px',
        marginBottom: '30px',
    },
    tabs: {
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        marginBottom: '30px',
    },
    tab: {
        padding: '12px 24px',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        backgroundColor: '#fff',
        cursor: 'pointer',
        fontSize: '16px',
        transition: 'all 0.2s',
    },
    tabActive: {
        backgroundColor: '#3b82f6',
        color: 'white',
        borderColor: '#3b82f6',
    },
    loading: {
        textAlign: 'center',
        padding: '60px',
        fontSize: '18px',
        color: '#6b7280',
    },
    empty: {
        textAlign: 'center',
        padding: '80px 20px',
        color: '#6b7280',
    },
    emptyIcon: {
        fontSize: '48px',
        marginBottom: '16px',
    },
    testGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '24px',
    },
    testCard: {
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        transition: 'all 0.3s',
    },
    testCardTop: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '16px',
    },
    testIcon: {
        fontSize: '28px',
    },
    testDifficulty: {
        padding: '4px 12px',
        backgroundColor: '#f3f4f6',
        borderRadius: '9999px',
        fontSize: '14px',
        fontWeight: '500',
    },
    testTitle: {
        fontSize: '20px',
        fontWeight: '600',
        marginBottom: '12px',
        color: '#1f2937',
    },
    testDesc: {
        color: '#4b5563',
        lineHeight: '1.5',
        marginBottom: '20px',
    },
    testMeta: {
        color: '#6b7280',
        fontSize: '15px',
        marginBottom: '20px',
    },
    startBtn: {
        width: '100%',
        padding: '14px',
        backgroundColor: '#3b82f6',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
};

export default TestsPage;