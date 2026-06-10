import { useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { useLang, translations } from '../context/LanguageContext';

function Navbar() {
    const [user, setUser] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const { lang } = useLang();
    const t = translations[lang];

    useEffect(() => {
        authAPI.getMe().then(res => setUser(res.data)).catch(() => {});
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
    };

    const initials = user?.username?.slice(0, 2).toUpperCase() || '??';

    const links = [
        { href: '/dashboard',  label: t.dashboard },
        { href: '/vocabulary', label: t.vocabulary },
        { href: '/statistics', label: t.statistics },
        { href: '/tests',      label: t.tests },
        { href: '/ai-tutor',   label: t.ai },
        { href: '/profile',    label: t.profile },
    ];

    return (
        <>
            <nav style={styles.navbar}>
                <a href="/dashboard" style={styles.logoWrap}>
                    <img
                        src="/logo.jpg"
                        alt="SelfStudy.uz"
                        style={styles.logoImg}
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <span style={styles.logoText}>
                        SelfStudy<span style={styles.logoAccent}>.uz</span>
                    </span>
                </a>

                <div style={styles.links} className="navbar-links">
                    {links.map(l => (
                        <a key={l.href} href={l.href} style={styles.link}>{l.label}</a>
                    ))}
                </div>

                <div style={styles.right}>
                    <button style={styles.iconBtn} title={t.notifications}>
                        🔔
                    </button>

                    <div style={styles.avatarWrap}>
                        <div
                            style={styles.avatar}
                            onClick={() => setMenuOpen(!menuOpen)}
                        >
                            {initials}
                        </div>

                        {menuOpen && (
                            <div style={styles.dropdown}>
                                <div style={styles.dropdownUser}>
                                    <div style={styles.dropdownName}>{user?.username}</div>
                                    <div style={styles.dropdownEmail}>{user?.email}</div>
                                </div>
                                <hr style={styles.divider} />
                                <a href="/profile" style={styles.dropdownItem}>👤 {t.profile}</a>
                                <a href="/settings" style={styles.dropdownItem}>⚙️ {t.settings}</a>
                                <hr style={styles.divider} />
                                <button onClick={handleLogout} style={styles.dropdownLogout}>
                                    🚪 {t.logout}
                                </button>
                            </div>
                        )}
                    </div>

                    <button
                        className="hamburger-btn"
                        style={styles.hamburger}
                        onClick={() => setMobileOpen(!mobileOpen)}
                    >
                        {mobileOpen ? '✕' : '☰'}
                    </button>
                </div>
            </nav>

            {mobileOpen && (
                <div style={styles.mobileMenu}>
                    {links.map(l => (
                        <a key={l.href} href={l.href} style={styles.mobileLink} onClick={() => setMobileOpen(false)}>
                            {l.label}
                        </a>
                    ))}
                    <hr style={styles.divider} />
                    <button onClick={handleLogout} style={styles.mobileLogout}>
                        🚪 {t.logout}
                    </button>
                </div>
            )}
        </>
    );
}

const styles = {
    navbar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 32px',
        height: '64px',
        borderBottom: '1px solid var(--border)',
        backgroundColor: 'var(--bg-card)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
    },
    logoWrap: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        textDecoration: 'none',
        flexShrink: 0,
    },
    logoImg: {
        height: '36px',
        width: 'auto',
        objectFit: 'contain',
        borderRadius: '6px',
    },
    logoText: {
        fontSize: '22px',
        fontWeight: '700',
        color: 'var(--text-primary)',
    },
    logoAccent: {
        color: 'var(--accent)',
    },
    links: {
        display: 'flex',
        gap: '8px',
    },
    link: {
        color: 'var(--text-secondary)',
        fontSize: '14px',
        fontWeight: '500',
        textDecoration: 'none',
        padding: '6px 12px',
        borderRadius: '8px',
        transition: 'background 0.2s',
    },
    right: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    iconBtn: {
        background: 'transparent',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '8px 10px',
        cursor: 'pointer',
        fontSize: '16px',
        color: 'var(--text-secondary)',
    },
    avatarWrap: {
        position: 'relative',
    },
    avatar: {
        width: '38px',
        height: '38px',
        borderRadius: '50%',
        backgroundColor: 'var(--accent)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '700',
        fontSize: '14px',
        cursor: 'pointer',
        userSelect: 'none',
    },
    hamburger: {
        display: 'none',
        background: 'transparent',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '8px 12px',
        cursor: 'pointer',
        fontSize: '18px',
        color: 'var(--text-primary)',
        fontFamily: 'Sora, sans-serif',
    },
    mobileMenu: {
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
        padding: '16px 24px',
        gap: '4px',
        position: 'sticky',
        top: '64px',
        zIndex: 99,
    },
    mobileLink: {
        color: 'var(--text-secondary)',
        fontSize: '15px',
        fontWeight: '500',
        textDecoration: 'none',
        padding: '12px 8px',
        borderRadius: '8px',
        borderBottom: '1px solid var(--border)',
    },
    mobileLogout: {
        background: 'transparent',
        border: 'none',
        color: '#f87171',
        fontSize: '15px',
        fontWeight: '500',
        padding: '12px 8px',
        textAlign: 'left',
        cursor: 'pointer',
        fontFamily: 'Sora, sans-serif',
    },
    dropdown: {
        position: 'absolute',
        top: '48px',
        right: 0,
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '8px',
        minWidth: '200px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        zIndex: 200,
    },
    dropdownUser: {
        padding: '8px 12px',
    },
    dropdownName: {
        fontSize: '14px',
        fontWeight: '600',
        color: 'var(--text-primary)',
    },
    dropdownEmail: {
        fontSize: '12px',
        color: 'var(--text-muted)',
        marginTop: '2px',
    },
    divider: {
        border: 'none',
        borderTop: '1px solid var(--border)',
        margin: '6px 0',
    },
    dropdownItem: {
        display: 'block',
        padding: '8px 12px',
        color: 'var(--text-secondary)',
        textDecoration: 'none',
        fontSize: '14px',
        borderRadius: '6px',
        cursor: 'pointer',
    },
    dropdownLogout: {
        display: 'block',
        width: '100%',
        padding: '8px 12px',
        color: '#f87171',
        background: 'transparent',
        border: 'none',
        fontSize: '14px',
        textAlign: 'left',
        borderRadius: '6px',
        cursor: 'pointer',
        fontFamily: 'Sora, sans-serif',
    },
};

export default Navbar;