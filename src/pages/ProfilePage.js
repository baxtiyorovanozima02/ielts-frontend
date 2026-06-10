import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { authAPI } from '../services/api';
import { useLang, translations } from '../context/LanguageContext';

function ProfilePage() {
    const navigate = useNavigate();
    const { lang } = useLang();
    const t = translations[lang];

    const [user, setUser] = useState(null);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        authAPI.getMe().then(res => {
            setUser(res.data);
            setFormData({
                username: res.data.username,
                email: res.data.email,
                phone_number: res.data.phone_number || '',
            });
        }).catch(() => {});
    }, []);

    const handleSave = async () => {
        try {
            await authAPI.updateMe(formData);
            setUser({ ...user, ...formData });
            setSuccess(t.dataSaved);
            setEditing(false);
            setTimeout(() => setSuccess(''), 3000);
        } catch {
            setError(t.error);
        }
    };

    const initials = user?.username?.slice(0, 2).toUpperCase() || '??';

    return (
        <div style={styles.page}>
            <Navbar />
            <main style={styles.main}>

                <button onClick={() => navigate(-1)} style={styles.backBtn}>{t.back}</button>
                <h1 style={styles.pageTitle}>{t.profileTitle}</h1>

                {/* Avatar section */}
                <div style={styles.avatarSection}>
                    <div style={styles.avatarBig}>{initials}</div>
                    <div>
                        <div style={styles.userName}>{user?.username}</div>
                        <div style={styles.userEmail}>{user?.email}</div>
                        <div style={styles.badge}>
                            {user?.is_premium ? '⭐ Premium' : '🆓 Free'}
                        </div>
                    </div>
                </div>

                {/* Info card */}
                <div style={styles.card}>
                    <div style={styles.cardHeader}>
                        <h2 style={styles.cardTitle}>{t.personalInfo}</h2>
                        <button onClick={() => setEditing(!editing)} style={styles.editBtn}>
                            {editing ? t.cancelEdit : t.editBtn}
                        </button>
                    </div>

                    {success && <div style={styles.success}>{success}</div>}
                    {error && <div style={styles.errorBox}>{error}</div>}

                    <div style={styles.field}>
                        <label style={styles.label}>Username</label>
                        {editing ? (
                            <input
                                value={formData.username}
                                onChange={e => setFormData({ ...formData, username: e.target.value })}
                                style={styles.input}
                            />
                        ) : (
                            <div style={styles.value}>{user?.username}</div>
                        )}
                    </div>

                    <div style={styles.field}>
                        <label style={styles.label}>Email</label>
                        {editing ? (
                            <input
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                style={styles.input}
                            />
                        ) : (
                            <div style={styles.value}>{user?.email}</div>
                        )}
                    </div>

                    <div style={styles.field}>
                        <label style={styles.label}>{t.phoneLabel}</label>
                        {editing ? (
                            <input
                                value={formData.phone_number}
                                placeholder="+998901234567"
                                onChange={e => setFormData({ ...formData, phone_number: e.target.value })}
                                style={styles.input}
                            />
                        ) : (
                            <div style={styles.value}>
                                {user?.phone_number || <span style={{ color: 'var(--text-muted)' }}>{t.notEntered}</span>}
                            </div>
                        )}
                    </div>

                    {editing && (
                        <button onClick={handleSave} style={styles.saveBtn}>
                            {t.saveBtn2}
                        </button>
                    )}
                </div>

                {/* Subscription card */}
                <div style={styles.card}>
                    <h2 style={styles.cardTitle}>{t.subscription}</h2>
                    <div style={styles.subCard}>
                        <div>
                            <div style={styles.subName}>
                                {user?.is_premium ? t.premiumPlan : t.freePlan}
                            </div>
                            <div style={styles.subDesc}>
                                {user?.is_premium ? t.allFeats : t.limitedFeats}
                            </div>
                        </div>
                        {!user?.is_premium && (
                            <a href="/pricing" style={styles.upgradeBtn}>
                                {t.upgradePrem}
                            </a>
                        )}
                    </div>
                </div>

            </main>
        </div>
    );
}

const styles = {
    page: { minHeight: '100vh', backgroundColor: 'var(--bg-base)' },
    main: { maxWidth: '700px', margin: '0 auto', padding: '40px 24px' },
    backBtn: {
        display: 'inline-block', marginBottom: '12px', padding: '7px 16px',
        backgroundColor: 'var(--bg-card)', color: 'var(--text-secondary)',
        border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13px',
        fontWeight: '600', cursor: 'pointer', fontFamily: 'Sora, sans-serif',
    },
    pageTitle: { fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '32px' },
    avatarSection: { display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' },
    avatarBig: {
        width: '72px', height: '72px', borderRadius: '50%', backgroundColor: 'var(--accent)',
        color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: '700', fontSize: '24px', flexShrink: 0,
    },
    userName: { fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' },
    userEmail: { fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' },
    badge: {
        display: 'inline-block', padding: '3px 10px', backgroundColor: 'rgba(59,130,246,0.15)',
        color: 'var(--accent)', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
    },
    card: {
        backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', padding: '28px', marginBottom: '20px',
    },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
    cardTitle: { fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' },
    editBtn: {
        padding: '7px 16px', backgroundColor: 'transparent', border: '1px solid var(--border)',
        borderRadius: '8px', color: 'var(--text-secondary)', fontSize: '13px',
        cursor: 'pointer', fontFamily: 'Sora, sans-serif',
    },
    success: {
        backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
        color: '#34d399', padding: '10px 14px', borderRadius: '8px', fontSize: '14px', marginBottom: '16px',
    },
    errorBox: {
        backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
        color: '#f87171', padding: '10px 14px', borderRadius: '8px', fontSize: '14px', marginBottom: '16px',
    },
    field: { marginBottom: '20px' },
    label: {
        display: 'block', fontSize: '12px', fontWeight: '500', color: 'var(--text-muted)',
        marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em',
    },
    value: { fontSize: '15px', color: 'var(--text-primary)', padding: '10px 0', borderBottom: '1px solid var(--border)' },
    input: {
        width: '100%', padding: '10px 14px', backgroundColor: '#111827',
        border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)',
        fontSize: '14px', outline: 'none', fontFamily: 'Sora, sans-serif',
    },
    saveBtn: {
        padding: '10px 24px', backgroundColor: 'var(--accent)', color: 'white', border: 'none',
        borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
        fontFamily: 'Sora, sans-serif', marginTop: '8px',
    },
    subCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' },
    subName: { fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' },
    subDesc: { fontSize: '13px', color: 'var(--text-secondary)' },
    upgradeBtn: {
        padding: '9px 18px', backgroundColor: 'var(--accent)', color: 'white',
        borderRadius: '8px', fontSize: '13px', fontWeight: '600', textDecoration: 'none',
    },
};

export default ProfilePage;