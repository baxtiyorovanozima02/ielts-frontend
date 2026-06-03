import { useState, useEffect } from 'react';
import { authAPI } from '../services/api';

function Navbar() {
    const [user, setUser] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        authAPI.getMe().then(res => setUser(res.data)).catch(() => {});
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
    };

    const initials = user?.username?.slice(0, 2).toUpperCase() || '??';

    return (
        <nav style={styles.navbar}>
            {/* Logo */}
            <a href="/dashboard" style={styles.logo}>
                IELTS<span style={styles.logoAccent}>.uz</span>
            </a>

            {/* Nav links */}
            <div style={styles.links}>
                <a href="/dashboard" style={styles.link}>Dashboard</a>
                <a href="/vocabulary" style={styles.link}>Lug'at</a>
                <a href="/statistics" style={styles.link}>Statistika</a>
            </div>

            {/* Right side */}
            <div style={styles.right}>
                {/* Notification bell */}
                <button style={styles.iconBtn} title="Bildirishnomalar">
                    🔔
                </button>

                {/* Avatar dropdown */}
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
                            <a href="/profile" style={styles.dropdownItem}>👤 Profil</a>
                            <a href="/settings" style={styles.dropdownItem}>⚙️ Sozlamalar</a>
                            <hr style={styles.divider} />
                            <button onClick={handleLogout} style={styles.dropdownLogout}>
                                🚪 Chiqish
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
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
    logo: {
        fontSize: '22px',
        fontWeight: '700',
        color: 'var(--text-primary)',
        textDecoration: 'none',
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