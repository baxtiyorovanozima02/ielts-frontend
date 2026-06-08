import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Skeleton from '../components/Skeleton';
import { statisticsAPI } from '../services/api';

function BarChart({ data, color }) {
    if (!data || data.length === 0) return (
        <div style={emptyChart}>Hali ma'lumot yo'q</div>
    );
    const max = Math.max(...data.map(d => d.value), 9);
    return (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '120px', padding: '8px 0' }}>
            {data.map((d, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600' }}>{d.value}</span>
                    <div style={{
                        width: '100%',
                        height: `${(d.value / max) * 80}%`,
                        backgroundColor: color,
                        borderRadius: '4px 4px 0 0',
                        minHeight: '4px',
                        transition: 'height 0.5s ease',
                    }} />
                    <span style={{ fontSize: '9px', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.2 }}>{d.label}</span>
                </div>
            ))}
        </div>
    );
}

function BandBadge({ score }) {
    const color = score >= 7 ? '#10b981' : score >= 5.5 ? '#f59e0b' : score > 0 ? '#ef4444' : 'var(--text-muted)';
    return (
        <span style={{
            display: 'inline-block',
            padding: '2px 10px',
            borderRadius: '20px',
            backgroundColor: `${color}20`,
            color,
            fontWeight: '700',
            fontSize: '13px',
            border: `1px solid ${color}40`,
        }}>
            {score > 0 ? score : '—'}
        </span>
    );
}


function SectionCard({ icon, label, color, avg, total, chartData }) {
    return (
        <div style={{ ...sectionCard, borderTop: `3px solid ${color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                    <div style={{ fontSize: '24px', marginBottom: '4px' }}>{icon}</div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)' }}>{label}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)' }}>
                        {avg > 0 ? avg : '—'}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{total} ta test</div>
                </div>
            </div>
            <BarChart data={chartData} color={color} />
        </div>
    );
}


export default function StatisticsPage() {
    const navigate = useNavigate();
    const [overall, setOverall] = useState(null);
    const [history, setHistory] = useState(null);
    const [weakAreas, setWeakAreas] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            statisticsAPI.getOverall(),
            statisticsAPI.getHistory(),
            statisticsAPI.getWeakAreas(),
        ]).then(([ov, hist, weak]) => {
            setOverall(ov.data);
            setHistory(hist.data);
            setWeakAreas(weak.data);
        }).catch(() => {}).finally(() => setLoading(false));
    }, []);

    const makeChartData = (results) => {
        if (!results || results.length === 0) return [];
        return results.slice(-8).map((r, i) => ({
            label: `#${i + 1}`,
            value: parseFloat(r.band_score) || 0,
        }));
    };

    const writingChart = makeChartData(history?.writing);
    const speakingChart = makeChartData(history?.speaking);

    const writingAvg = overall?.writing?.average_band_score || 0;
    const speakingAvg = overall?.speaking?.average_band_score || 0;
    const overallAvg = writingAvg > 0 && speakingAvg > 0
        ? Math.round(((writingAvg + speakingAvg) / 2) * 10) / 10
        : writingAvg || speakingAvg || 0;

    const sections = [
        {
            icon: '✍️', label: 'Writing', color: '#6366f1',
            avg: overall?.writing?.average_band_score || 0,
            total: overall?.writing?.total_tests || 0,
            chartData: writingChart,
        },
        {
            icon: '🎤', label: 'Speaking', color: '#10b981',
            avg: overall?.speaking?.average_band_score || 0,
            total: overall?.speaking?.total_tests || 0,
            chartData: speakingChart,
        },
        {
            icon: '📖', label: 'Reading', color: '#3b82f6',
            avg: overall?.reading?.average_band_score || 0,
            total: overall?.reading?.total_tests || 0,
            chartData: makeChartData(history?.reading),
        },
        {
            icon: '🎧', label: 'Listening', color: '#f59e0b',
            avg: overall?.listening?.average_band_score || 0,
            total: overall?.listening?.total_tests || 0,
            chartData: makeChartData(history?.listening),
        },
    ];

    return (
        <div style={page}>
            <Navbar />
            <main style={main}>

                <button onClick={() => navigate(-1)} style={backBtn}>← Orqaga</button>
                <h1 style={pageTitle}>📊 Statistika</h1>
                <p style={pageSub}>Progressingiz va zaif tomonlaringiz</p>

                {/* Overall Score */}
                <div style={overallCard}>
                    {loading ? (
                        <Skeleton height="80px" />
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                            <div>
                                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Umumiy Band Score</div>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                    <span style={{ fontSize: '56px', fontWeight: '800', color: 'var(--text-primary)', lineHeight: 1 }}>
                                        {overallAvg || '—'}
                                    </span>
                                    <span style={{ fontSize: '16px', color: 'var(--text-muted)' }}>/9.0</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                {sections.map(s => (
                                    <div key={s.label} style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '18px', marginBottom: '4px' }}>{s.icon}</div>
                                        <BandBadge score={s.avg} />
                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{s.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Section Cards */}
                <h2 style={sectionTitle}>Bo'limlar bo'yicha</h2>
                {loading ? (
                    <div style={grid2}>
                        {[1,2,3,4].map(i => <Skeleton key={i} height="200px" />)}
                    </div>
                ) : (
                    <div style={grid2}>
                        {sections.map(s => (
                            <SectionCard key={s.label} {...s} />
                        ))}
                    </div>
                )}

                {/* Weak Areas */}
                <h2 style={sectionTitle}>⚠️ Zaif tomonlar</h2>
                {loading ? (
                    <Skeleton height="100px" />
                ) : weakAreas?.weak_areas?.length > 0 ? (
                    <div style={weakCard}>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                            Quyidagi bo'limlar bo'yicha ko'proq mashq qiling:
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {weakAreas.weak_areas.map(area => (
                                <div key={area.section} style={weakItem}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ fontSize: '20px' }}>
                                            {area.section === 'writing' ? '✍️' : area.section === 'speaking' ? '🎤' : area.section === 'reading' ? '📖' : '🎧'}
                                        </span>
                                        <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                                            {area.section}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={weakBarWrap}>
                                            <div style={{
                                                ...weakBarFill,
                                                width: `${(area.average_band_score / 9) * 100}%`,
                                                backgroundColor: area.average_band_score < 4 ? '#ef4444' : '#f59e0b',
                                            }} />
                                        </div>
                                        <BandBadge score={area.average_band_score} />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div style={{ marginTop: '20px', padding: '12px 16px', backgroundColor: 'rgba(99,102,241,0.08)', borderRadius: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                            💡 <strong>Tavsiya:</strong> Zaif bo'limlar bo'yicha kuniga kamida 1 ta test ishlang.
                        </div>
                    </div>
                ) : (
                    <div style={weakCard}>
                        {weakAreas?.all_areas?.length > 0 ? (
                            <div style={{ textAlign: 'center', padding: '16px' }}>
                                <div style={{ fontSize: '36px', marginBottom: '8px' }}>🎉</div>
                                <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
                                    Zaif tomonlar yo'q!
                                </div>
                                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                                    Barcha bo'limlarda 6.0 dan yuqori ball to'plangansiz.
                                </div>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '16px', color: 'var(--text-muted)', fontSize: '14px' }}>
                                Hali hech qanday test topshirilmagan. Statistika test ishlangandan keyin ko'rinadi.
                            </div>
                        )}
                    </div>
                )}

                {/* Last Results */}
                {history && (history.writing?.length > 0 || history.speaking?.length > 0) && (
                    <>
                        <h2 style={sectionTitle}>📋 So'nggi natijalar</h2>
                        <div style={historyCard}>
                            {[...( history.writing?.map(r => ({ ...r, section: 'Writing', icon: '✍️', color: '#6366f1' })) || []),
                              ...( history.speaking?.map(r => ({ ...r, section: 'Speaking', icon: '🎤', color: '#10b981' })) || [])]
                                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                                .slice(0, 8)
                                .map((r, i) => (
                                    <div key={i} style={historyRow}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span style={{ fontSize: '18px' }}>{r.icon}</span>
                                            <div>
                                                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
                                                    {r['test__title'] || r.section}
                                                </div>
                                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                                    {new Date(r.created_at).toLocaleDateString('uz-UZ')}
                                                </div>
                                            </div>
                                        </div>
                                        <BandBadge score={parseFloat(r.band_score)} />
                                    </div>
                                ))
                            }
                        </div>
                    </>
                )}

            </main>
        </div>
    );
}

const page = { minHeight: '100vh', backgroundColor: 'var(--bg-base)' };
const main = { maxWidth: '900px', margin: '0 auto', padding: '40px 24px 60px' };
const backBtn = {
    display: 'inline-block',
    marginBottom: '12px',
    padding: '7px 16px',
    backgroundColor: 'var(--bg-card)',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'Sora, sans-serif',
};
const pageTitle = { fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' };
const pageSub = { fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '32px' };
const sectionTitle = { fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '16px', marginTop: '36px', textTransform: 'uppercase', letterSpacing: '0.05em' };
const grid2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' };

const overallCard = {
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '16px',
    padding: '28px 32px',
    marginBottom: '8px',
};

const sectionCard = {
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '24px',
};

const emptyChart = {
    height: '120px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-muted)',
    fontSize: '13px',
};

const weakCard = {
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '24px',
};

const weakItem = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid var(--border)',
};

const weakBarWrap = {
    width: '120px',
    height: '6px',
    backgroundColor: 'var(--border)',
    borderRadius: '4px',
    overflow: 'hidden',
};

const weakBarFill = {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.5s ease',
};

const historyCard = {
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    overflow: 'hidden',
};

const historyRow = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 20px',
    borderBottom: '1px solid var(--border)',
};