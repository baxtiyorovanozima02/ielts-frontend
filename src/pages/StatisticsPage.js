import { useState, useEffect } from 'react';
import { statisticsAPI } from '../services/api';
import Navbar from '../components/Navbar';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer
} from 'recharts';

function EmptyState({ icon, title, desc, btnText, btnHref }) {
    return (
        <div style={emptyStyles.wrap}>
            <div style={emptyStyles.icon}>{icon}</div>
            <div style={emptyStyles.title}>{title}</div>
            <div style={emptyStyles.desc}>{desc}</div>
            {btnText && (
                <a href={btnHref} style={emptyStyles.btn}>{btnText}</a>
            )}
        </div>
    );
}

const emptyStyles = {
    wrap: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        backgroundColor: 'var(--bg-card)',
        border: '1px dashed var(--border)',
        borderRadius: 'var(--radius)',
        textAlign: 'center',
    },
    icon: {
        fontSize: '48px',
        marginBottom: '16px',
        filter: 'grayscale(0.2)',
    },
    title: {
        fontSize: '16px',
        fontWeight: '600',
        color: 'var(--text-primary)',
        marginBottom: '8px',
    },
    desc: {
        fontSize: '13px',
        color: 'var(--text-muted)',
        lineHeight: '1.6',
        maxWidth: '280px',
        marginBottom: '20px',
    },
    btn: {
        display: 'inline-block',
        padding: '10px 24px',
        backgroundColor: 'var(--accent)',
        color: 'white',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        textDecoration: 'none',
    },
};

function StatisticsPage() {
    const [history, setHistory] = useState({
        writing: [],
        speaking: [],
        reading: [],
        listening: [],
    });
    const [weakAreas, setWeakAreas] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            statisticsAPI.getHistory(),
            statisticsAPI.getWeakAreas(),
        ]).then(([histRes, weakRes]) => {
            setHistory({
                writing: histRes.data.writing || [],
                speaking: histRes.data.speaking || [],
                reading: histRes.data.reading || [],
                listening: histRes.data.listening || [],
            });
            setWeakAreas(weakRes.data.weak_areas || []);
        }).catch(() => {}).finally(() => setLoading(false));
    }, []);

    const chartData = () => {
        const maxLen = Math.max(
            history.writing.length,
            history.speaking.length,
            history.reading.length,
            history.listening.length,
        );
        if (maxLen === 0) return [];
        const data = [];
        for (let i = 0; i < maxLen; i++) {
            data.push({
                name: `Test ${i + 1}`,
                Writing:   history.writing[i]?.band_score   || null,
                Speaking:  history.speaking[i]?.band_score  || null,
                Reading:   history.reading[i]?.band_score   || null,
                Listening: history.listening[i]?.band_score || null,
            });
        }
        return data;
    };

    const data = chartData();
    const hasAnyData =
        history.writing.length > 0 ||
        history.speaking.length > 0 ||
        history.reading.length > 0 ||
        history.listening.length > 0;

    if (loading) {
        return (
            <div style={styles.page}>
                <Navbar />
                <main style={styles.main}>
                    <div style={styles.loadingWrap}>
                        <div style={styles.loadingDot} />
                        <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Yuklanmoqda...</div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div style={styles.page}>
            <Navbar />
            <main style={styles.main}>

                <h1 style={styles.pageTitle}>Statistika</h1>

                {/* Agar hech qanday ma'lumot yo'q bo'lsa */}
                {!hasAnyData && (
                    <EmptyState
                        icon="📊"
                        title="Hali natijalar yo'q"
                        desc="Birinchi testingizni topshiring va natijalaringiz shu yerda ko'rinadi"
                        btnText="Testlarga o'tish →"
                        btnHref="/tests"
                    />
                )}

                {/* Zaif tomonlar */}
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

                {/* Grafik — barcha 4 bo'lim */}
                {hasAnyData && (
                    <div style={styles.chartCard}>
                        <h2 style={styles.cardTitle}>📈 Band Score tarixi</h2>
                        {data.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#4b5563"
                                        tick={{ fill: '#6b7280', fontSize: 12 }}
                                    />
                                    <YAxis
                                        domain={[0, 9]}
                                        stroke="#4b5563"
                                        tick={{ fill: '#6b7280', fontSize: 12 }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#0f172a',
                                            border: '1px solid #1e2d45',
                                            borderRadius: '8px',
                                            color: '#f1f5f9',
                                        }}
                                    />
                                    <Legend wrapperStyle={{ color: '#6b7280', fontSize: '13px' }} />
                                    <Line
                                        type="monotone"
                                        dataKey="Writing"
                                        stroke="#3b82f6"
                                        strokeWidth={2}
                                        dot={{ fill: '#3b82f6', r: 4 }}
                                        activeDot={{ r: 6 }}
                                        connectNulls
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="Speaking"
                                        stroke="#10b981"
                                        strokeWidth={2}
                                        dot={{ fill: '#10b981', r: 4 }}
                                        activeDot={{ r: 6 }}
                                        connectNulls
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="Reading"
                                        stroke="#6366f1"
                                        strokeWidth={2}
                                        dot={{ fill: '#6366f1', r: 4 }}
                                        activeDot={{ r: 6 }}
                                        connectNulls
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="Listening"
                                        stroke="#f59e0b"
                                        strokeWidth={2}
                                        dot={{ fill: '#f59e0b', r: 4 }}
                                        activeDot={{ r: 6 }}
                                        connectNulls
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyState
                                icon="📈"
                                title="Grafik uchun ma'lumot yo'q"
                                desc="Testlarni topshirgach grafik shu yerda ko'rinadi"
                            />
                        )}

                        {/* Rang izoh */}
                        <div style={styles.legendRow}>
                            <div style={styles.legendItem}>
                                <div style={{ ...styles.legendDot, backgroundColor: '#3b82f6' }} />
                                <span>Writing</span>
                            </div>
                            <div style={styles.legendItem}>
                                <div style={{ ...styles.legendDot, backgroundColor: '#10b981' }} />
                                <span>Speaking</span>
                            </div>
                            <div style={styles.legendItem}>
                                <div style={{ ...styles.legendDot, backgroundColor: '#6366f1' }} />
                                <span>Reading</span>
                            </div>
                            <div style={styles.legendItem}>
                                <div style={{ ...styles.legendDot, backgroundColor: '#f59e0b' }} />
                                <span>Listening</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Writing tarixi */}
                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>✍️ Writing tarixi</h2>
                    {history.writing.length === 0 ? (
                        <EmptyState
                            icon="✍️"
                            title="Writing testlari yo'q"
                            desc="Hali birorta writing testi topshirmagansiz"
                            btnText="Writing testini boshlash →"
                            btnHref="/tests"
                        />
                    ) : (
                        history.writing.map((r, i) => (
                            <div key={i} style={{ ...styles.historyCard, borderLeft: '3px solid #3b82f6' }}>
                                <div style={styles.historyLeft}>
                                    <div style={styles.historyTestName}>{r.test__title}</div>
                                    <div style={styles.historyDate}>
                                        {new Date(r.created_at).toLocaleDateString('uz-UZ')}
                                    </div>
                                </div>
                                <div style={{ ...styles.bandBadge, backgroundColor: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>
                                    {r.band_score}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Speaking tarixi */}
                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>🎤 Speaking tarixi</h2>
                    {history.speaking.length === 0 ? (
                        <EmptyState
                            icon="🎤"
                            title="Speaking testlari yo'q"
                            desc="Hali birorta speaking testi topshirmagansiz"
                            btnText="Speaking testini boshlash →"
                            btnHref="/tests"
                        />
                    ) : (
                        history.speaking.map((r, i) => (
                            <div key={i} style={{ ...styles.historyCard, borderLeft: '3px solid #10b981' }}>
                                <div style={styles.historyLeft}>
                                    <div style={styles.historyTestName}>{r.test__title}</div>
                                    <div style={styles.historyDate}>
                                        {new Date(r.created_at).toLocaleDateString('uz-UZ')}
                                    </div>
                                </div>
                                <div style={{ ...styles.bandBadge, backgroundColor: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                                    {r.band_score}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Reading tarixi */}
                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>📖 Reading tarixi</h2>
                    {history.reading.length === 0 ? (
                        <EmptyState
                            icon="📖"
                            title="Reading testlari yo'q"
                            desc="Hali birorta reading testi topshirmagansiz"
                            btnText="Reading testini boshlash →"
                            btnHref="/tests"
                        />
                    ) : (
                        history.reading.map((r, i) => (
                            <div key={i} style={{ ...styles.historyCard, borderLeft: '3px solid #6366f1' }}>
                                <div style={styles.historyLeft}>
                                    <div style={styles.historyTestName}>{r.test__title || 'Reading testi'}</div>
                                    <div style={styles.historyDate}>
                                        {r.created_at ? new Date(r.created_at).toLocaleDateString('uz-UZ') : ''}
                                    </div>
                                </div>
                                <div style={{ ...styles.bandBadge, backgroundColor: 'rgba(99,102,241,0.15)', color: '#6366f1' }}>
                                    {r.band_score}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Listening tarixi */}
                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>🎧 Listening tarixi</h2>
                    {history.listening.length === 0 ? (
                        <EmptyState
                            icon="🎧"
                            title="Listening testlari yo'q"
                            desc="Hali birorta listening testi topshirmagansiz"
                            btnText="Listening testini boshlash →"
                            btnHref="/tests"
                        />
                    ) : (
                        history.listening.map((r, i) => (
                            <div key={i} style={{ ...styles.historyCard, borderLeft: '3px solid #f59e0b' }}>
                                <div style={styles.historyLeft}>
                                    <div style={styles.historyTestName}>{r.test__title || 'Listening testi'}</div>
                                    <div style={styles.historyDate}>
                                        {r.created_at ? new Date(r.created_at).toLocaleDateString('uz-UZ') : ''}
                                    </div>
                                </div>
                                <div style={{ ...styles.bandBadge, backgroundColor: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
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
    loadingWrap: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        padding: '80px',
    },
    loadingDot: {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        border: '3px solid var(--border)',
        borderTop: '3px solid var(--accent)',
        animation: 'spin 0.8s linear infinite',
    },
    warningCard: {
        backgroundColor: 'rgba(245, 158, 11, 0.08)',
        border: '1px solid rgba(245, 158, 11, 0.25)',
        borderRadius: 'var(--radius)',
        padding: '20px 24px',
        marginBottom: '24px',
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
    chartCard: {
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '28px',
        marginBottom: '32px',
    },
    cardTitle: {
        fontSize: '16px',
        fontWeight: '600',
        color: 'var(--text-primary)',
        marginBottom: '24px',
    },
    legendRow: {
        display: 'flex',
        gap: '20px',
        flexWrap: 'wrap',
        marginTop: '16px',
        paddingTop: '16px',
        borderTop: '1px solid var(--border)',
    },
    legendItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '13px',
        color: 'var(--text-muted)',
    },
    legendDot: {
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        flexShrink: 0,
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
    historyCard: {
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '16px 20px',
        marginBottom: '10px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
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
        fontWeight: '700',
        fontSize: '18px',
        padding: '8px 16px',
        borderRadius: '8px',
        minWidth: '52px',
        textAlign: 'center',
    },
};

export default StatisticsPage;