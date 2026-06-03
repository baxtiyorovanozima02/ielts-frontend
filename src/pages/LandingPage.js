function LandingPage() {
    return (
        <div style={styles.page}>

            {/* Navbar */}
            <nav style={styles.navbar}>
                <div style={styles.logo}>IELTS<span style={styles.accent}>.uz</span></div>
                <div style={styles.navLinks}>
                    <a href="/login" style={styles.navLink}>Kirish</a>
                    <a href="/register" style={styles.registerBtn}>Ro'yxatdan o'tish</a>
                </div>
            </nav>

            {/* Hero */}
            <section style={styles.hero}>
                <div style={styles.heroBadge}>🚀 AI powered platform</div>
                <h1 style={styles.heroTitle}>
                    IELTS da yuqori ball <br />
                    <span style={styles.accent}>olishni xohlaysizmi?</span>
                </h1>
                <p style={styles.heroSubtitle}>
                    AI baholash, mock testlar, shaxsiy o'quv rejasi — <br />
                    barchasi bitta platformada. Arzon narxda. 🇺🇿
                </p>
                <div style={styles.heroBtns}>
                    <a href="/register" style={styles.primaryBtn}>Bepul boshlash →</a>
                    <a href="/login" style={styles.secondaryBtn}>Kirish</a>
                </div>

                {/* Stats */}
                <div style={styles.stats}>
                    <div style={styles.stat}>
                        <div style={styles.statNum}>4</div>
                        <div style={styles.statLabel}>IELTS bo'limi</div>
                    </div>
                    <div style={styles.statDivider} />
                    <div style={styles.stat}>
                        <div style={styles.statNum}>AI</div>
                        <div style={styles.statLabel}>Baholash tizimi</div>
                    </div>
                    <div style={styles.statDivider} />
                    <div style={styles.stat}>
                        <div style={styles.statNum}>24/7</div>
                        <div style={styles.statLabel}>Ishlaydi</div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section style={styles.section}>
                <h2 style={styles.sectionTitle}>Nima imkoniyatlar bor?</h2>
                <div style={styles.featuresGrid}>
                    {[
                        { icon: '🧠', title: 'AI Baholash', desc: 'Writing va Speaking uchun sun\'iy intellekt baholash tizimi' },
                        { icon: '📝', title: 'Mock Testlar', desc: 'Reading, Listening, Writing, Speaking — 4 ta bo\'lim' },
                        { icon: '📊', title: 'Statistika', desc: 'Band score tarixi va zaif tomonlarni tahlil qilish' },
                        { icon: '📅', title: 'Shaxsiy Reja', desc: 'Har bir foydalanuvchi uchun alohida o\'quv rejasi' },
                        { icon: '📚', title: 'Lug\'at', desc: 'Spaced repetition tizimi bilan so\'z yodlash' },
                        { icon: '🤖', title: 'Telegram Bot', desc: 'Telegram orqali istalgan joyda mashq qilish' },
                    ].map((f, i) => (
                        <div key={i} style={styles.featureCard}>
                            <div style={styles.featureIcon}>{f.icon}</div>
                            <div style={styles.featureTitle}>{f.title}</div>
                            <div style={styles.featureDesc}>{f.desc}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Pricing */}
            <section style={styles.section}>
                <h2 style={styles.sectionTitle}>Narxlar</h2>
                <div style={styles.pricingGrid}>
                    <div style={styles.pricingCard}>
                        <div style={styles.planName}>🆓 Free</div>
                        <div style={styles.planPrice}>0 <span style={styles.planCurrency}>UZS/oy</span></div>
                        <ul style={styles.planFeatures}>
                            <li>✅ 3 ta mock test</li>
                            <li>✅ Lug'at moduli</li>
                            <li>✅ Statistika</li>
                            <li>❌ AI baholash</li>
                            <li>❌ Cheksiz testlar</li>
                        </ul>
                        <a href="/register" style={styles.planBtn}>Boshlash</a>
                    </div>
                    <div style={{ ...styles.pricingCard, ...styles.pricingCardPremium }}>
                        <div style={styles.premiumBadge}>⭐ Mashhur</div>
                        <div style={styles.planName}>💎 Premium</div>
                        <div style={styles.planPrice}>49,900 <span style={styles.planCurrency}>UZS/oy</span></div>
                        <ul style={styles.planFeatures}>
                            <li>✅ Cheksiz mock testlar</li>
                            <li>✅ AI Writing baholash</li>
                            <li>✅ AI Speaking baholash</li>
                            <li>✅ Shaxsiy o'quv rejasi</li>
                            <li>✅ Telegram bot</li>
                        </ul>
                        <a href="/register" style={{ ...styles.planBtn, ...styles.planBtnPremium }}>Boshlash</a>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={styles.footer}>
                <div style={styles.footerLogo}>IELTS<span style={styles.accent}>.uz</span></div>
                <div style={styles.footerText}>© 2025 IELTS.uz — Made with ❤️ in Uzbekistan</div>
            </footer>

        </div>
    );
}

const styles = {
    page: {
        minHeight: '100vh',
        backgroundColor: 'var(--bg-base)',
    },
    navbar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 48px',
        borderBottom: '1px solid var(--border)',
        backgroundColor: 'var(--bg-card)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
    },
    logo: {
        fontSize: '22px',
        fontWeight: '700',
        color: 'var(--text-primary)',
    },
    accent: { color: 'var(--accent)' },
    navLinks: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
    },
    navLink: {
        color: 'var(--text-secondary)',
        textDecoration: 'none',
        fontSize: '14px',
        fontWeight: '500',
    },
    registerBtn: {
        padding: '8px 18px',
        backgroundColor: 'var(--accent)',
        color: 'white',
        borderRadius: '8px',
        textDecoration: 'none',
        fontSize: '14px',
        fontWeight: '600',
    },
    hero: {
        textAlign: 'center',
        padding: '80px 24px 60px',
        maxWidth: '800px',
        margin: '0 auto',
    },
    heroBadge: {
        display: 'inline-block',
        padding: '6px 16px',
        backgroundColor: 'rgba(59,130,246,0.1)',
        border: '1px solid rgba(59,130,246,0.3)',
        borderRadius: '20px',
        fontSize: '13px',
        color: 'var(--accent)',
        marginBottom: '24px',
    },
    heroTitle: {
        fontSize: '52px',
        fontWeight: '800',
        color: 'var(--text-primary)',
        lineHeight: '1.2',
        marginBottom: '20px',
    },
    heroSubtitle: {
        fontSize: '18px',
        color: 'var(--text-secondary)',
        lineHeight: '1.6',
        marginBottom: '36px',
    },
    heroBtns: {
        display: 'flex',
        gap: '16px',
        justifyContent: 'center',
        marginBottom: '48px',
    },
    primaryBtn: {
        padding: '14px 32px',
        backgroundColor: 'var(--accent)',
        color: 'white',
        borderRadius: '10px',
        textDecoration: 'none',
        fontSize: '16px',
        fontWeight: '600',
    },
    secondaryBtn: {
        padding: '14px 32px',
        backgroundColor: 'transparent',
        border: '1px solid var(--border)',
        color: 'var(--text-secondary)',
        borderRadius: '10px',
        textDecoration: 'none',
        fontSize: '16px',
        fontWeight: '600',
    },
    stats: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '32px',
        padding: '24px 32px',
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border)',
    },
    stat: { textAlign: 'center' },
    statNum: {
        fontSize: '28px',
        fontWeight: '800',
        color: 'var(--accent)',
    },
    statLabel: {
        fontSize: '12px',
        color: 'var(--text-muted)',
        marginTop: '4px',
    },
    statDivider: {
        width: '1px',
        height: '40px',
        backgroundColor: 'var(--border)',
    },
    section: {
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '60px 24px',
    },
    sectionTitle: {
        fontSize: '32px',
        fontWeight: '700',
        color: 'var(--text-primary)',
        textAlign: 'center',
        marginBottom: '40px',
    },
    featuresGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '20px',
    },
    featureCard: {
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '24px',
    },
    featureIcon: { fontSize: '32px', marginBottom: '12px' },
    featureTitle: {
        fontSize: '16px',
        fontWeight: '600',
        color: 'var(--text-primary)',
        marginBottom: '8px',
    },
    featureDesc: {
        fontSize: '13px',
        color: 'var(--text-secondary)',
        lineHeight: '1.5',
    },
    pricingGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px',
        maxWidth: '700px',
        margin: '0 auto',
    },
    pricingCard: {
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '32px',
    },
    pricingCardPremium: {
        border: '2px solid var(--accent)',
        position: 'relative',
    },
    premiumBadge: {
        position: 'absolute',
        top: '-12px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'var(--accent)',
        color: 'white',
        padding: '4px 16px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
        whiteSpace: 'nowrap',
    },
    planName: {
        fontSize: '18px',
        fontWeight: '700',
        color: 'var(--text-primary)',
        marginBottom: '12px',
    },
    planPrice: {
        fontSize: '28px',
        fontWeight: '800',
        color: 'var(--text-primary)',
        marginBottom: '20px',
    },
    planCurrency: {
        fontSize: '14px',
        fontWeight: '400',
        color: 'var(--text-muted)',
    },
    planFeatures: {
        listStyle: 'none',
        padding: 0,
        marginBottom: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        fontSize: '14px',
        color: 'var(--text-secondary)',
    },
    planBtn: {
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
    planBtnPremium: {
        backgroundColor: 'var(--accent)',
        border: 'none',
        color: 'white',
    },
    footer: {
        textAlign: 'center',
        padding: '32px',
        borderTop: '1px solid var(--border)',
    },
    footerLogo: {
        fontSize: '20px',
        fontWeight: '700',
        color: 'var(--text-primary)',
        marginBottom: '8px',
    },
    footerText: {
        fontSize: '13px',
        color: 'var(--text-muted)',
    },
};

export default LandingPage;