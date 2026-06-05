import { useEffect, useRef, useState } from 'react';

function LandingPage() {
    const heroRef = useRef(null);
    const words = ['Band 7+', 'Band 8+', 'Muvaffaqiyat', 'Yuqori ball'];
    const [wordIndex, setWordIndex] = useState(0);
    const [displayed, setDisplayed] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(el => {
                    if (el.isIntersecting) {
                        el.target.style.opacity = '1';
                        el.target.style.transform = 'translateY(0)';
                    }
                });
            },
            { threshold: 0.1 }
        );
        document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const currentWord = words[wordIndex];
        let timeout;

        if (!isDeleting && displayed.length < currentWord.length) {
            timeout = setTimeout(() => {
                setDisplayed(currentWord.slice(0, displayed.length + 1));
            }, 80);
        } else if (!isDeleting && displayed.length === currentWord.length) {
            timeout = setTimeout(() => setIsDeleting(true), 1800);
        } else if (isDeleting && displayed.length > 0) {
            timeout = setTimeout(() => {
                setDisplayed(currentWord.slice(0, displayed.length - 1));
            }, 45);
        } else if (isDeleting && displayed.length === 0) {
            setIsDeleting(false);
            setWordIndex(i => (i + 1) % words.length);
        }

        return () => clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [displayed, isDeleting, wordIndex]);
    const features = [
        { icon: '🧠', title: 'AI Baholash', desc: "Writing va Speaking uchun sun'iy intellekt baholash" },
        { icon: '📝', title: 'Mock Testlar', desc: 'Reading, Listening, Writing, Speaking — 4 bo\'lim' },
        { icon: '📊', title: 'Statistika', desc: 'Band score tarixi va zaif tomonlarni tahlil qilish' },
        { icon: '📅', title: 'Shaxsiy Reja', desc: 'Har bir foydalanuvchi uchun alohida o\'quv rejasi' },
        { icon: '📚', title: 'Lug\'at', desc: 'Spaced repetition bilan so\'z yodlash' },
        { icon: '🤖', title: 'Telegram Bot', desc: 'Istalgan joyda mashq qilish imkoniyati' },
    ];

    const testimonials = [
        { name: 'Ali X.', score: '7.5', text: '3 oyda bandimni 5.5 dan 7.5 ga chiqardim!', flag: '🇺🇿' },
        { name: 'Nozima B.', score: '8.0', text: 'AI feedback juda aniq va foydali bo\'ldi.', flag: '🇺🇿' },
        { name: 'Malika T.', score: '7.0', text: 'Speaking testlari menga eng ko\'p yordam berdi.', flag: '🇺🇿' },
    ];

    return (
        <div style={styles.page}>
            <div style={styles.bgDots} />

            <nav style={styles.navbar}>
                <div style={styles.logo}>
                    SelfStudy<span style={styles.accent}>.uz</span>
                </div>
                <div style={styles.navLinks}>
                    <a href="/pricing" style={styles.navLink}>Narxlar</a>
                    <a href="/login" style={styles.navLink}>Kirish</a>
                    <a href="/register" style={styles.registerBtn}>Bepul boshlash →</a>
                </div>
            </nav>

            <section style={styles.hero} ref={heroRef}>
                <div style={styles.heroBadge}>
                    <span style={styles.badgeDot} />
                    🚀 AI powered IELTS platform
                </div>

                <h1 style={styles.heroTitle}>
                    IELTS da{' '}
                    <span style={styles.gradientText}>
                        {displayed}
                        <span style={styles.cursor}>|</span>
                    </span>
                    <br />
                    olishga tayyor bo'ling
                </h1>

                <p style={styles.heroSubtitle}>
                    AI baholash, mock testlar, shaxsiy o'quv rejasi —<br />
                    barchasi bitta platformada. O'zbek tilida. 🇺🇿
                </p>

                <div style={styles.heroBtns}>
                    <a href="/register" style={styles.primaryBtn}>
                        Bepul boshlash →
                    </a>
                    <a href="/login" style={styles.outlineBtn}>
                        Kirish
                    </a>
                </div>

                {/* Stats bar */}
                <div style={styles.statsBar}>
                    {[
                        { num: '50+', label: 'Faol foydalanuvchi' },
                        { num: '4', label: 'IELTS bo\'limi' },
                        { num: 'AI', label: 'Baholash tizimi' },
                        { num: '24/7', label: 'Ishlaydi' },
                    ].map((s, i) => (
                        <div key={i} style={styles.statItem}>
                            <div style={styles.statNum}>{s.num}</div>
                            <div style={styles.statLabel}>{s.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Band score visual */}
            <section style={styles.bandSection}>
                <div className="fade-in" style={{ ...styles.fadeEl, transitionDelay: '0.1s' }}>
                    <h2 style={styles.sectionTitle}>Sizning yo'lingiz</h2>
                    <p style={styles.sectionSub}>Har bir darajada nima qilish kerakligini bilib oling</p>
                </div>
                <div className="fade-in" style={{ ...styles.fadeEl, transitionDelay: '0.2s' }}>
                    <div style={styles.bandRow}>
                        {[
                            { band: '5.0', label: 'Boshlang\'ich', color: '#ef4444' },
                            { band: '6.0', label: 'O\'rta', color: '#f59e0b' },
                            { band: '7.0', label: 'Yaxshi', color: '#10b981' },
                            { band: '8.0', label: 'Ajoyib', color: '#3b82f6' },
                            { band: '9.0', label: 'Expert', color: '#8b5cf6' },
                        ].map((b, i) => (
                            <div key={i} style={{ ...styles.bandCard, borderTop: `3px solid ${b.color}` }}>
                                <div style={{ ...styles.bandScore, color: b.color }}>{b.band}</div>
                                <div style={styles.bandLabel}>{b.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section style={styles.section}>
                <div className="fade-in" style={styles.fadeEl}>
                    <h2 style={styles.sectionTitle}>Nima imkoniyatlar bor?</h2>
                    <p style={styles.sectionSub}>Maqsadingizga yetish uchun kerak bo'lgan hamma narsa</p>
                </div>
                <div style={styles.featuresGrid}>
                    {features.map((f, i) => (
                        <div
                            key={i}
                            className="fade-in"
                            style={{
                                ...styles.fadeEl,
                                ...styles.featureCard,
                                transitionDelay: `${i * 0.1}s`,
                            }}
                        >
                            <div style={styles.featureIcon}>{f.icon}</div>
                            <div style={styles.featureTitle}>{f.title}</div>
                            <div style={styles.featureDesc}>{f.desc}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Testimonials */}
            <section style={styles.section}>
                <div className="fade-in" style={styles.fadeEl}>
                    <h2 style={styles.sectionTitle}>Foydalanuvchilar nima deydi?</h2>
                </div>
                <div style={styles.testimonialsGrid}>
                    {testimonials.map((t, i) => (
                        <div
                            key={i}
                            className="fade-in"
                            style={{
                                ...styles.fadeEl,
                                ...styles.testimonialCard,
                                transitionDelay: `${i * 0.15}s`,
                            }}
                        >
                            <div style={styles.testimonialHeader}>
                                <div style={styles.avatar}>{t.flag}</div>
                                <div>
                                    <div style={styles.testimonialName}>{t.name}</div>
                                    <div style={styles.testimonialScore}>
                                        Band <span style={{ color: '#10b981', fontWeight: '700' }}>{t.score}</span>
                                    </div>
                                </div>
                            </div>
                            <p style={styles.testimonialText}>"{t.text}"</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Pricing */}
            <section style={styles.section}>
                <div className="fade-in" style={styles.fadeEl}>
                    <h2 style={styles.sectionTitle}>Narxlar</h2>
                    <p style={styles.sectionSub}>Arzon, lekin kuchli</p>
                </div>
                <div style={styles.pricingGrid}>
                    {/* Free */}
                    <div className="fade-in" style={{ ...styles.fadeEl, ...styles.pricingCard }}>
                        <div style={styles.planName}>🆓 Free</div>
                        <div style={styles.planPrice}>0 <span style={styles.planCur}>UZS/oy</span></div>
                        <ul style={styles.planList}>
                            <li>✅ 3 ta mock test</li>
                            <li>✅ Lug'at moduli</li>
                            <li>✅ Statistika</li>
                            <li style={{ opacity: 0.4 }}>❌ AI baholash</li>
                            <li style={{ opacity: 0.4 }}>❌ Cheksiz testlar</li>
                        </ul>
                        <a href="/register" style={styles.planBtn}>Boshlash</a>
                    </div>

                    {/* Premium */}
                    <div className="fade-in" style={{ ...styles.fadeEl, ...styles.pricingCard, ...styles.pricingPremium }}>
                        <div style={styles.premiumBadge}>⭐ Eng mashhur</div>
                        <div style={styles.planName}>💎 Premium</div>
                        <div style={styles.planPrice}>49,900 <span style={styles.planCur}>UZS/oy</span></div>
                        <ul style={styles.planList}>
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

            {/* CTA */}
            <section style={styles.ctaSection}>
                <div className="fade-in" style={styles.fadeEl}>
                    <h2 style={styles.ctaTitle}>Bugun boshlang — bepul!</h2>
                    <p style={styles.ctaSub}>Ro'yxatdan o'tish 1 daqiqa oladi. Kredit karta kerak emas.</p>
                    <a href="/register" style={styles.ctaBtn}>Hoziroq boshlash →</a>
                </div>
            </section>

            {/* Footer */}
            <footer style={styles.footer}>
                <div style={styles.logo}>SelfStudy<span style={styles.accent}>.uz</span></div>
                <p style={styles.footerText}>© 2026 SelfStudy.uz — Made with ❤️ in Uzbekistan</p>
            </footer>
        </div>
    );
}

const styles = {
    page: {
        minHeight: '100vh',
        backgroundColor: 'var(--bg-base)',
        overflowX: 'hidden',
    },
    bgDots: {
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: 'radial-gradient(circle, #1e2d45 1px, transparent 1px)',
        backgroundSize: '32px 32px',
        opacity: 0.4,
        pointerEvents: 'none',
        zIndex: 0,
    },
    navbar: {
        position: 'sticky',
        top: 0,
        zIndex: 100,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 48px',
        backgroundColor: 'rgba(10,15,30,0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
    },
    logo: {
        fontSize: '22px',
        fontWeight: '700',
        color: 'var(--text-primary)',
        position: 'relative',
        zIndex: 1,
    },
    accent: { color: 'var(--accent)' },
    navLinks: {
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        position: 'relative',
        zIndex: 1,
    },
    navLink: {
        color: 'var(--text-secondary)',
        textDecoration: 'none',
        fontSize: '14px',
        fontWeight: '500',
    },
    registerBtn: {
        padding: '9px 20px',
        backgroundColor: 'var(--accent)',
        color: 'white',
        borderRadius: '8px',
        textDecoration: 'none',
        fontSize: '14px',
        fontWeight: '600',
    },
    hero: {
        textAlign: 'center',
        padding: '100px 24px 80px',
        maxWidth: '820px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 1,
    },
    heroBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 18px',
        backgroundColor: 'rgba(59,130,246,0.1)',
        border: '1px solid rgba(59,130,246,0.3)',
        borderRadius: '20px',
        fontSize: '13px',
        color: 'var(--accent)',
        marginBottom: '28px',
    },
    badgeDot: {
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        backgroundColor: '#10b981',
        display: 'inline-block',
        animation: 'pulse 2s infinite',
    },
    heroTitle: {
        fontSize: '58px',
        fontWeight: '800',
        color: 'var(--text-primary)',
        lineHeight: '1.15',
        marginBottom: '22px',
    },
    gradientText: {
        background: 'linear-gradient(135deg, #3b82f6, #10b981)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
    },
    heroSubtitle: {
        fontSize: '18px',
        color: 'var(--text-secondary)',
        lineHeight: '1.7',
        marginBottom: '40px',
    },
    heroBtns: {
        display: 'flex',
        gap: '14px',
        justifyContent: 'center',
        marginBottom: '56px',
    },
    primaryBtn: {
        padding: '15px 36px',
        backgroundColor: 'var(--accent)',
        color: 'white',
        borderRadius: '10px',
        textDecoration: 'none',
        fontSize: '16px',
        fontWeight: '600',
        transition: 'transform 0.2s, box-shadow 0.2s',
    },
    outlineBtn: {
        padding: '15px 36px',
        backgroundColor: 'transparent',
        border: '1px solid var(--border)',
        color: 'var(--text-secondary)',
        borderRadius: '10px',
        textDecoration: 'none',
        fontSize: '16px',
        fontWeight: '600',
    },
    statsBar: {
        display: 'flex',
        justifyContent: 'center',
        gap: '0',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        overflow: 'hidden',
    },
    statItem: {
        flex: 1,
        padding: '20px',
        textAlign: 'center',
        borderRight: '1px solid var(--border)',
    },
    statNum: {
        fontSize: '26px',
        fontWeight: '800',
        color: 'var(--accent)',
        marginBottom: '4px',
    },
    statLabel: {
        fontSize: '12px',
        color: 'var(--text-muted)',
    },
    bandSection: {
        maxWidth: '900px',
        margin: '0 auto',
        padding: '40px 24px 60px',
        position: 'relative',
        zIndex: 1,
    },
    bandRow: {
        display: 'flex',
        gap: '12px',
    },
    bandCard: {
        flex: 1,
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '20px 16px',
        textAlign: 'center',
    },
    bandScore: {
        fontSize: '28px',
        fontWeight: '800',
        marginBottom: '6px',
    },
    bandLabel: {
        fontSize: '12px',
        color: 'var(--text-muted)',
    },
    section: {
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '40px 24px 80px',
        position: 'relative',
        zIndex: 1,
    },
    sectionTitle: {
        fontSize: '34px',
        fontWeight: '700',
        color: 'var(--text-primary)',
        textAlign: 'center',
        marginBottom: '12px',
    },
    sectionSub: {
        fontSize: '16px',
        color: 'var(--text-secondary)',
        textAlign: 'center',
        marginBottom: '48px',
    },
    featuresGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '20px',
    },
    featureCard: {
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '14px',
        padding: '28px 24px',
        transition: 'border-color 0.2s, transform 0.2s',
    },
    featureIcon: {
        fontSize: '36px',
        marginBottom: '16px',
    },
    featureTitle: {
        fontSize: '16px',
        fontWeight: '600',
        color: 'var(--text-primary)',
        marginBottom: '8px',
    },
    featureDesc: {
        fontSize: '13px',
        color: 'var(--text-secondary)',
        lineHeight: '1.6',
    },
    testimonialsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '20px',
    },
    testimonialCard: {
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '14px',
        padding: '24px',
    },
    testimonialHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '16px',
    },
    avatar: {
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        backgroundColor: 'rgba(59,130,246,0.1)',
        border: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '22px',
    },
    testimonialName: {
        fontSize: '14px',
        fontWeight: '600',
        color: 'var(--text-primary)',
    },
    testimonialScore: {
        fontSize: '12px',
        color: 'var(--text-muted)',
        marginTop: '2px',
    },
    testimonialText: {
        fontSize: '14px',
        color: 'var(--text-secondary)',
        lineHeight: '1.6',
        fontStyle: 'italic',
    },
    pricingGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px',
        maxWidth: '680px',
        margin: '0 auto',
    },
    pricingCard: {
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '32px',
        position: 'relative',
    },
    pricingPremium: {
        border: '2px solid var(--accent)',
    },
    premiumBadge: {
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
    planName: {
        fontSize: '18px',
        fontWeight: '700',
        color: 'var(--text-primary)',
        marginBottom: '12px',
    },
    planPrice: {
        fontSize: '26px',
        fontWeight: '800',
        color: 'var(--text-primary)',
        marginBottom: '24px',
    },
    planCur: {
        fontSize: '13px',
        fontWeight: '400',
        color: 'var(--text-muted)',
    },
    planList: {
        listStyle: 'none',
        padding: 0,
        marginBottom: '28px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        fontSize: '14px',
        color: 'var(--text-secondary)',
    },
    planBtn: {
        display: 'block',
        textAlign: 'center',
        padding: '13px',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        color: 'var(--text-secondary)',
        textDecoration: 'none',
        fontSize: '15px',
        fontWeight: '600',
    },
    planBtnPremium: {
        backgroundColor: 'var(--accent)',
        borderColor: 'var(--accent)',
        color: 'white',
    },
    ctaSection: {
        textAlign: 'center',
        padding: '80px 24px',
        position: 'relative',
        zIndex: 1,
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        backgroundColor: 'var(--bg-card)',
    },
    ctaTitle: {
        fontSize: '40px',
        fontWeight: '800',
        color: 'var(--text-primary)',
        marginBottom: '14px',
    },
    ctaSub: {
        fontSize: '16px',
        color: 'var(--text-secondary)',
        marginBottom: '36px',
    },
    ctaBtn: {
        display: 'inline-block',
        padding: '16px 48px',
        backgroundColor: 'var(--accent)',
        color: 'white',
        borderRadius: '12px',
        textDecoration: 'none',
        fontSize: '17px',
        fontWeight: '700',
    },
    footer: {
        textAlign: 'center',
        padding: '36px',
        position: 'relative',
        zIndex: 1,
    },
    footerText: {
        fontSize: '13px',
        color: 'var(--text-muted)',
        marginTop: '8px',
    },
    fadeEl: {
        opacity: 0,
        transform: 'translateY(24px)',
        transition: 'opacity 0.6s ease, transform 0.6s ease',
    },
    cursor: {
        display: 'inline-block',
        color: '#3b82f6',
        marginLeft: '2px',
        animation: 'pulse 1s step-end infinite',
        fontWeight: '300',
    },
};

export default LandingPage;