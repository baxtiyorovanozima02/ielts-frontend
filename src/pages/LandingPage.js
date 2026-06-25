import { useEffect, useRef, useState } from 'react';
import { useLang, translations } from '../context/LanguageContext';

function LandingPage() {
    const heroRef = useRef(null);
    const { lang, changeLang } = useLang();
    const t = translations[lang];

    const words = t.landingHeroWords;
    const [wordIndex, setWordIndex] = useState(0);
    const [displayed, setDisplayed] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [langMenuOpen, setLangMenuOpen] = useState(false);

    // animated mesh background
    useEffect(() => {
        const el = document.getElementById('mesh-bg');
        let angle = 0;
        let raf;
        const animate = () => {
            angle += 0.3;
            if (el) {
                el.style.background = `
                    radial-gradient(ellipse 80% 60% at ${20 + Math.sin(angle * 0.01) * 10}% ${20 + Math.cos(angle * 0.01) * 10}%, rgba(59,130,246,0.15) 0%, transparent 60%),
                    radial-gradient(ellipse 60% 80% at ${80 + Math.cos(angle * 0.008) * 10}% ${10 + Math.sin(angle * 0.008) * 10}%, rgba(139,92,246,0.12) 0%, transparent 55%),
                    radial-gradient(ellipse 70% 50% at ${50 + Math.sin(angle * 0.012) * 12}% ${80 + Math.cos(angle * 0.012) * 8}%, rgba(16,185,129,0.10) 0%, transparent 60%),
                    radial-gradient(circle, #1e2d45 1px, transparent 1px)
                `;
                el.style.backgroundSize = 'auto, auto, auto, 32px 32px';
            }
            raf = requestAnimationFrame(animate);
        };
        raf = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(raf);
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

    // fade-in on scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
            { threshold: 0.1 }
        );
        document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
        return () => observer.disconnect();
    }, [lang]);

    const langOptions = [
        { code: 'uz', label: "O'zbek", flag: '🇺🇿' },
        { code: 'ru', label: 'Русский', flag: '🇷🇺' },
        { code: 'en', label: 'English', flag: '🇬🇧' },
    ];
    const currentLang = langOptions.find(l => l.code === lang);

    return (
        <div style={styles.page}>
            <style>{`
                .fade-in { opacity: 0; transform: translateY(24px); transition: opacity 0.6s ease, transform 0.6s ease; }
                .fade-in.visible { opacity: 1; transform: translateY(0); }
                @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
                @media (max-width: 768px) {
                    .band-row { flex-wrap: wrap !important; }
                    .features-grid { grid-template-columns: 1fr 1fr !important; }
                    .testimonials-grid { grid-template-columns: 1fr !important; }
                    .pricing-grid { grid-template-columns: 1fr !important; }
                }
                @media (max-width: 480px) {
                    .features-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>

            <div id="mesh-bg" style={styles.bgDots} />

            {/* Navbar */}
            <nav style={styles.navbar}>
                <div style={styles.logo}>
                    IELTSERA<span style={styles.accent}>.uz</span>
                </div>
                <div style={styles.navLinks}>
                    <a href="/pricing" style={styles.navLink}>{t.landingNavPricing}</a>
                    <a href="/login" style={styles.navLink}>{t.landingNavLogin}</a>

                    {/* Language switcher */}
                    <div style={styles.langWrap}>
                        <button
                            style={styles.langBtn}
                            onClick={() => setLangMenuOpen(o => !o)}
                        >
                            {currentLang.flag} {currentLang.label} ▾
                        </button>
                        {langMenuOpen && (
                            <div style={styles.langDropdown}>
                                {langOptions.map(l => (
                                    <button
                                        key={l.code}
                                        style={{
                                            ...styles.langOption,
                                            ...(lang === l.code ? styles.langOptionActive : {}),
                                        }}
                                        onClick={() => { changeLang(l.code); setLangMenuOpen(false); }}
                                    >
                                        {l.flag} {l.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <a href="/register" style={styles.registerBtn}>{t.landingNavRegister}</a>
                </div>
            </nav>

            {/* Hero */}
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
                    {t.landingHeroTitle}
                </h1>

                <p style={styles.heroSubtitle}>
                    {t.landingHeroSub.split('\n').map((line, i) => (
                        <span key={i}>{line}{i === 0 && <br />}</span>
                    ))}
                </p>

                <div style={styles.heroBtns}>
                    <a href="/register" style={styles.primaryBtn}>{t.landingHeroBtn}</a>
                    <a href="/login" style={styles.outlineBtn}>{t.landingHeroLogin}</a>
                </div>

                {/* Stats bar */}
                <div style={styles.statsBar}>
                    {t.landingStats.map((s, i) => (
                        <div key={i} style={styles.statItem}>
                            <div style={styles.statNum}>{s.num}</div>
                            <div style={styles.statLabel}>{s.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Band score visual */}
            <section style={styles.bandSection}>
                <div className="fade-in" style={{ transitionDelay: '0.1s' }}>
                    <h2 style={styles.sectionTitle}>{t.landingPathTitle}</h2>
                    <p style={styles.sectionSub}>{t.landingPathSub}</p>
                </div>
                <div className="fade-in" style={{ transitionDelay: '0.2s' }}>
                    <div style={styles.bandRow} className="band-row">
                        {t.landingBands.map((b, i) => (
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
                <div className="fade-in">
                    <h2 style={styles.sectionTitle}>{t.landingFeatTitle}</h2>
                    <p style={styles.sectionSub}>{t.landingFeatSub}</p>
                </div>
                <div style={styles.featuresGrid} className="features-grid">
                    {t.landingFeatures.map((f, i) => (
                        <div
                            key={i}
                            className="fade-in"
                            style={{ ...styles.featureCard, transitionDelay: `${i * 0.1}s` }}
                            onMouseMove={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const x = e.clientX - rect.left;
                                const y = e.clientY - rect.top;
                                const cx = rect.width / 2;
                                const cy = rect.height / 2;
                                const rotateX = ((y - cy) / cy) * -10;
                                const rotateY = ((x - cx) / cx) * 10;
                                e.currentTarget.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
                                e.currentTarget.style.boxShadow = '0 20px 40px rgba(59,130,246,0.2)';
                                e.currentTarget.style.borderColor = 'rgba(59,130,246,0.4)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) scale(1)';
                                e.currentTarget.style.boxShadow = 'none';
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
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
                <div className="fade-in">
                    <h2 style={styles.sectionTitle}>{t.landingTestimonialsTitle}</h2>
                </div>
                <div style={styles.testimonialsGrid} className="testimonials-grid">
                    {t.landingTestimonials.map((tm, i) => (
                        <div
                            key={i}
                            className="fade-in"
                            style={{ ...styles.testimonialCard, transitionDelay: `${i * 0.15}s` }}
                        >
                            <div style={styles.testimonialHeader}>
                                <div style={styles.avatar}>{tm.flag}</div>
                                <div>
                                    <div style={styles.testimonialName}>{tm.name}</div>
                                    <div style={styles.testimonialScore}>
                                        Band <span style={{ color: '#10b981', fontWeight: '700' }}>{tm.score}</span>
                                    </div>
                                </div>
                            </div>
                            <p style={styles.testimonialText}>"{tm.text}"</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Pricing */}
            <section style={styles.section}>
                <div className="fade-in">
                    <h2 style={styles.sectionTitle}>{t.landingPricingTitle}</h2>
                    <p style={styles.sectionSub}>{t.landingPricingSub}</p>
                </div>
                <div style={styles.pricingGrid} className="pricing-grid">
                    {/* Free */}
                    <div className="fade-in" style={styles.pricingCard}>
                        <div style={styles.planName}>🆓 Free</div>
                        <div style={styles.planPrice}>0 <span style={styles.planCur}>{t.landingPricingPerMo}</span></div>
                        <ul style={styles.planList}>
                            {t.landingFreeFeat.map((f, i) => (
                                <li key={i} style={f.startsWith('❌') ? { opacity: 0.4 } : {}}>{f}</li>
                            ))}
                        </ul>
                        <a href="/register" style={styles.planBtn}>{t.landingPricingBtn}</a>
                    </div>

                    {/* Premium */}
                    <div className="fade-in" style={{ ...styles.pricingCard, ...styles.pricingPremium }}>
                        <div style={styles.premiumBadge}>{t.landingPricingPopular}</div>
                        <div style={styles.planName}>💎 Premium</div>
                        <div style={styles.planPrice}>49,900 <span style={styles.planCur}>{t.landingPricingPerMo}</span></div>
                        <ul style={styles.planList}>
                            {t.landingPremFeat.map((f, i) => (
                                <li key={i}>{f}</li>
                            ))}
                        </ul>
                        <a href="/register" style={{ ...styles.planBtn, ...styles.planBtnPremium }}>{t.landingPricingBtn}</a>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section style={styles.ctaSection}>
                <div className="fade-in">
                    <h2 style={styles.ctaTitle}>{t.landingCtaTitle}</h2>
                    <p style={styles.ctaSub}>{t.landingCtaSub}</p>
                    <a href="/register" style={styles.ctaBtn}>{t.landingCtaBtn}</a>
                </div>
            </section>

            {/* Footer */}
            <footer style={styles.footer}>
                <div style={styles.logo}>IELTSERA<span style={styles.accent}>.uz</span></div>
                <p style={styles.footerText}>© 2026 IELTSERA — Made with ❤️ in Uzbekistan</p>
            </footer>
        </div>
    );
}

const styles = {
    page: { minHeight: '100vh', backgroundColor: 'var(--bg-base)', overflowX: 'hidden' },
    bgDots: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 0 },
    navbar: {
        position: 'sticky', top: 0, zIndex: 100,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 48px',
        backgroundColor: 'rgba(10,15,30,0.85)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
    },
    logo: { fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)', position: 'relative', zIndex: 1 },
    accent: { color: 'var(--accent)' },
    navLinks: { display: 'flex', alignItems: 'center', gap: '20px', position: 'relative', zIndex: 1 },
    navLink: { color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px', fontWeight: '500' },
    registerBtn: {
        padding: '9px 20px', backgroundColor: 'var(--accent)', color: 'white',
        borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: '600',
    },
    // Language switcher
    langWrap: { position: 'relative' },
    langBtn: {
        display: 'flex', alignItems: 'center', gap: '6px',
        background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)',
        borderRadius: '8px', padding: '7px 12px', cursor: 'pointer',
        color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '500',
        fontFamily: 'Sora, sans-serif',
    },
    langDropdown: {
        position: 'absolute', top: '42px', right: 0,
        backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: '10px', padding: '6px', minWidth: '140px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)', zIndex: 200,
        display: 'flex', flexDirection: 'column', gap: '2px',
    },
    langOption: {
        display: 'flex', alignItems: 'center', gap: '8px',
        width: '100%', padding: '9px 12px', background: 'transparent',
        border: 'none', borderRadius: '7px', cursor: 'pointer',
        color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '500',
        fontFamily: 'Sora, sans-serif', textAlign: 'left',
    },
    langOptionActive: { backgroundColor: 'rgba(99,102,241,0.15)', color: 'var(--text-primary)' },
    // Hero
    hero: { textAlign: 'center', padding: '100px 24px 80px', maxWidth: '820px', margin: '0 auto', position: 'relative', zIndex: 1 },
    heroBadge: {
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        padding: '6px 18px', backgroundColor: 'rgba(59,130,246,0.1)',
        border: '1px solid rgba(59,130,246,0.3)', borderRadius: '20px',
        fontSize: '13px', color: 'var(--accent)', marginBottom: '28px',
    },
    badgeDot: { width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block', animation: 'pulse 2s infinite' },
    heroTitle: { fontSize: '58px', fontWeight: '800', color: 'var(--text-primary)', lineHeight: '1.15', marginBottom: '22px' },
    gradientText: { background: 'linear-gradient(135deg, #3b82f6, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' },
    cursor: { display: 'inline-block', color: '#3b82f6', WebkitTextFillColor: '#3b82f6', marginLeft: '2px', animation: 'pulse 1s step-end infinite', fontWeight: '300' },
    heroSubtitle: { fontSize: '18px', color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '40px' },
    heroBtns: { display: 'flex', gap: '14px', justifyContent: 'center', marginBottom: '56px' },
    primaryBtn: { padding: '15px 36px', backgroundColor: 'var(--accent)', color: 'white', borderRadius: '10px', textDecoration: 'none', fontSize: '16px', fontWeight: '600', transition: 'transform 0.2s, box-shadow 0.2s' },
    outlineBtn: { padding: '15px 36px', backgroundColor: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', borderRadius: '10px', textDecoration: 'none', fontSize: '16px', fontWeight: '600' },
    statsBar: { display: 'flex', justifyContent: 'center', gap: '0', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' },
    statItem: { flex: 1, padding: '20px', textAlign: 'center', borderRight: '1px solid var(--border)' },
    statNum: { fontSize: '26px', fontWeight: '800', color: 'var(--accent)', marginBottom: '4px' },
    statLabel: { fontSize: '12px', color: 'var(--text-muted)' },
    // Band
    bandSection: { maxWidth: '900px', margin: '0 auto', padding: '40px 24px 60px', position: 'relative', zIndex: 1 },
    bandRow: { display: 'flex', gap: '12px' },
    bandCard: { flex: 1, backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px 16px', textAlign: 'center' },
    bandScore: { fontSize: '28px', fontWeight: '800', marginBottom: '6px' },
    bandLabel: { fontSize: '12px', color: 'var(--text-muted)' },
    // Sections
    section: { maxWidth: '1000px', margin: '0 auto', padding: '40px 24px 80px', position: 'relative', zIndex: 1 },
    sectionTitle: { fontSize: '34px', fontWeight: '700', color: 'var(--text-primary)', textAlign: 'center', marginBottom: '12px' },
    sectionSub: { fontSize: '16px', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '48px' },
    featuresGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' },
    featureCard: { backgroundColor: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '28px 24px', transition: 'border-color 0.3s, transform 0.3s, box-shadow 0.3s', cursor: 'default', boxShadow: '0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)' },
    featureIcon: { fontSize: '36px', marginBottom: '16px' },
    featureTitle: { fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' },
    featureDesc: { fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' },
    testimonialsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' },
    testimonialCard: { backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '24px' },
    testimonialHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' },
    avatar: { width: '44px', height: '44px', borderRadius: '50%', backgroundColor: 'rgba(59,130,246,0.1)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' },
    testimonialName: { fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' },
    testimonialScore: { fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' },
    testimonialText: { fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', fontStyle: 'italic' },
    pricingGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', maxWidth: '680px', margin: '0 auto' },
    pricingCard: { backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '32px', position: 'relative' },
    pricingPremium: { border: '2px solid var(--accent)' },
    premiumBadge: { position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'var(--accent)', color: 'white', padding: '4px 18px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', whiteSpace: 'nowrap' },
    planName: { fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '12px' },
    planPrice: { fontSize: '26px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '24px' },
    planCur: { fontSize: '13px', fontWeight: '400', color: 'var(--text-muted)' },
    planList: { listStyle: 'none', padding: 0, marginBottom: '28px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: 'var(--text-secondary)' },
    planBtn: { display: 'block', textAlign: 'center', padding: '13px', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '15px', fontWeight: '600' },
    planBtnPremium: { backgroundColor: 'var(--accent)', borderColor: 'var(--accent)', color: 'white' },
    ctaSection: { textAlign: 'center', padding: '80px 24px', position: 'relative', zIndex: 1, borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-card)' },
    ctaTitle: { fontSize: '40px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '14px' },
    ctaSub: { fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '36px' },
    ctaBtn: { display: 'inline-block', padding: '16px 48px', backgroundColor: 'var(--accent)', color: 'white', borderRadius: '12px', textDecoration: 'none', fontSize: '17px', fontWeight: '700' },
    footer: { textAlign: 'center', padding: '36px', position: 'relative', zIndex: 1 },
    footerText: { fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' },
};

export default LandingPage;