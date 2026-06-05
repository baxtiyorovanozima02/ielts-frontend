import { useState, useEffect } from 'react';
import { statisticsAPI } from '../services/api';
import Navbar from '../components/Navbar';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer
} from 'recharts';

function StatisticsPage() {
    const [history, setHistory] = useState({ writing: [], speaking: [] });
    const [weakAreas, setWeakAreas] = useState([]);

    useEffect(() => {
        statisticsAPI.getHistory().then(res => setHistory(res.data)).catch(() => {});
        statisticsAPI.getWeakAreas().then(res => setWeakAreas(res.data.weak_areas)).catch(() => {});
    }, []);

    // Grafik uchun ma'lumot tayyorlash
    const chartData = () => {
        const maxLen = Math.max(history.writing.length, history.speaking.length);
        if (maxLen === 0) return [];
        const data = [];
        for (let i = 0; i < maxLen; i++) {
            data.push({
                name: `Test ${i + 1}`,
                Writing: history.writing[i]?.band_score || null,
                Speaking: history.speaking[i]?.band_score || null,
            });
        }
        return data;
    };

    const data = chartData();

    return (
        <div style={styles.page}>
            <Navbar />
            <main style={styles.main}>

                <h1 style={styles.pageTitle}>Statistika</h1>

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

                {/* Grafik */}
                {data.length > 0 ? (
                    <div style={styles.chartCard}>
                        <h2 style={styles.cardTitle}>📈 Band Score tarixi</h2>
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
                                <Legend
                                    wrapperStyle={{ color: '#6b7280', fontSize: '13px' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="Writing"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    dot={{ fill: '#3b82f6', r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="Speaking"
                                    stroke="#10b981"
                                    strokeWidth={2}
                                    dot={{ fill: '#10b981', r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div style={styles.chartCard}>
                        <h2 style={styles.cardTitle}>📈 Band Score tarixi</h2>
                        <div style={styles.chartEmpty}>
                            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📊</div>
                            <div>Hali natijalar yo'q. Test topshiring!</div>
                        </div>
                    </div>
                )}

                {/* Writing tarixi */}
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

                {/* Speaking tarixi */}
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
    chartEmpty: {
        textAlign: 'center',
        padding: '40px',
        color: 'var(--text-muted)',
        fontSize: '14px',
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