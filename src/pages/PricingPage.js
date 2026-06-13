import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useLang, translations } from '../context/LanguageContext';

function PricingPage() {
    const navigate = useNavigate();
    const { lang } = useLang();
    const t = translations[lang];

    return (
        <div style={styles.page}>
            <Navbar />
            <main style={styles.main}>

                <button onClick={() => navigate(-1)} style={styles.backBtn}>
                    ← Orqaga
                </button>

                <div style={styles.header}>
                    <h1 style={styles.title}>{t.pricingTitle}</h1>
                    <p style={styles.subtitle}>{t.pricingSubtitle}</p>
                </div>

                <div style={styles.grid}>

                    {/* Free */}
                    <div style={styles.card}>
                        <div style={styles.planIcon}>🆓</div>
                        <div style={styles.planName}>Free</div>
                        <div style={styles.planPrice}>
                            0 <span style={styles.currency}>{t.pricingPerMonth}</span>
                        </div>
                        <ul style={styles.features}>
                            {t.pricingFreeFeatures.map((f, i) => (
                                <li key={i} style={{ ...styles.feature, ...(f.startsWith('❌') ? styles.featureOff : {}) }}>{f}</li>
                            ))}
                        </ul>
                        <a href="/register" style={styles.btn}>{t.pricingFreeBtn}</a>
                    </div>

                    {/* Premium */}
                    <div style={{ ...styles.card, ...styles.premiumCard }}>
                        <div style={styles.popularBadge}>{t.pricingPopular}</div>
                        <div style={styles.planIcon}>💎</div>
                        <div style={styles.planName}>Premium</div>
                        <div style={styles.planPrice}>
                            49,900 <span style={styles.currency}>{t.pricingPerMonth}</span>
                        </div>
                        <ul style={styles.features}>
                            {t.pricingPremiumFeatures.map((f, i) => (
                                <li key={i} style={styles.feature}>{f}</li>
                            ))}
                        </ul>
                        <a href="/register" style={{ ...styles.btn, ...styles.btnPremium }}>
                            {t.pricingPremiumBtn}
                        </a>
                    </div>

                </div>

                {/* FAQ */}
                <div style={styles.faq}>
                    <h2 style={styles.faqTitle}>{t.pricingFaqTitle}</h2>
                    {t.pricingFaq.map((item, i) => (
                        <div key={i} style={styles.faqItem}>
                            <div style={styles.faqQ}>❓ {item.q}</div>
                            <div style={styles.faqA}>{item.a}</div>
                        </div>
                    ))}
                </div>

            </main>
        </div>
    );
}

const styles = {
    backBtn: {
        background: '#0f172a',
        border: '1px solid #1e2d45',
        color: '#94a3b8',
        borderRadius: '10px',
        padding: '8px 16px',
        cursor: 'pointer',
        fontSize: '14px',
        fontFamily: 'Sora, sans-serif',
        marginBottom: '20px',
    },
    page: {
        minHeight: '100vh',
        backgroundColor: 'var(--bg-base)',
    },
    main: {
        maxWidth: '900px',
        margin: '0 auto',
        padding: '40px 24px',
    },
    header: {
        textAlign: 'center',
        marginBottom: '48px',
    },
    title: {
        fontSize: '36px',
        fontWeight: '800',
        color: 'var(--text-primary)',
        marginBottom: '12px',
    },
    subtitle: {
        fontSize: '16px',
        color: 'var(--text-secondary)',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px',
        maxWidth: '700px',
        margin: '0 auto 48px',
    },
    card: {
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '32px',
    },
    premiumCard: {
        border: '2px solid var(--accent)',
        position: 'relative',
    },
    popularBadge: {
        position: 'absolute',
        top: '-14px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'var(--accent)',
        color: 'white',
        padding: '4px 18px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
        whiteSpace: 'nowrap',
    },
    planIcon: {
        fontSize: '36px',
        marginBottom: '12px',
    },
    planName: {
        fontSize: '20px',
        fontWeight: '700',
        color: 'var(--text-primary)',
        marginBottom: '8px',
    },
    planPrice: {
        fontSize: '32px',
        fontWeight: '800',
        color: 'var(--text-primary)',
        marginBottom: '24px',
    },
    currency: {
        fontSize: '14px',
        fontWeight: '400',
        color: 'var(--text-muted)',
    },
    features: {
        listStyle: 'none',
        padding: 0,
        marginBottom: '28px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
    feature: {
        fontSize: '14px',
        color: 'var(--text-secondary)',
    },
    featureOff: {
        opacity: 0.5,
    },
    btn: {
        display: 'block',
        textAlign: 'center',
        padding: '12px',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        color: 'var(--text-secondary)',
        textDecoration: 'none',
        fontSize: '14px',
        fontWeight: '600',
    },
    btnPremium: {
        backgroundColor: 'var(--accent)',
        border: 'none',
        color: 'white',
    },
    faq: {
        maxWidth: '600px',
        margin: '0 auto',
    },
    faqTitle: {
        fontSize: '24px',
        fontWeight: '700',
        color: 'var(--text-primary)',
        textAlign: 'center',
        marginBottom: '24px',
    },
    faqItem: {
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '20px',
        marginBottom: '12px',
    },
    faqQ: {
        fontSize: '15px',
        fontWeight: '600',
        color: 'var(--text-primary)',
        marginBottom: '8px',
    },
    faqA: {
        fontSize: '14px',
        color: 'var(--text-secondary)',
    },
};

export default PricingPage;