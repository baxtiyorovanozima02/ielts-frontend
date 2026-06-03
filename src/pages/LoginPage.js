import { useState } from 'react';
import { authAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();
    const handleLogin = async () => {
        setLoading(true);
        try {
            const response = await authAPI.login({ username, password });
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
            window.location.href = '/dashboard';
            showToast("Xush kelibsiz!", 'success');
        } catch (err) {
            setError("Username yoki parol noto'g'ri");
            showToast("Username yoki parol noto'g'ri", 'error');

        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleLogin();
    };

    return (
        <div style={styles.page}>
            <div style={styles.card}>

                <div style={styles.logo}>IELTS<span style={styles.logoAccent}>.uz</span></div>
                <p style={styles.subtitle}>Akkauntingizga kiring</p>

                {error && <div style={styles.error}>{error}</div>}

                <div style={styles.field}>
                    <label style={styles.label}>Username</label>
                    <input
                        type="text"
                        placeholder="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        onKeyDown={handleKeyDown}
                        style={styles.input}
                    />
                </div>

                <div style={styles.field}>
                    <label style={styles.label}>Parol</label>
                    <input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={handleKeyDown}
                        style={styles.input}
                    />
                </div>

                <button
                    onClick={handleLogin}
                    disabled={loading}
                    style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
                >
                    {loading ? 'Kirilmoqda...' : 'Kirish'}
                </button>

                <p style={styles.footer}>
                    Akkaunt yo'qmi?{' '}
                    <a href="/register" style={styles.link}>Ro'yxatdan o'ting</a>
                </p>
            </div>
        </div>
    );
}

const styles = {
    page: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
    },
    card: {
        width: '100%',
        maxWidth: '420px',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '40px',
    },
    logo: {
        fontSize: '28px',
        fontWeight: '700',
        color: 'var(--text-primary)',
        marginBottom: '8px',
        textAlign: 'center',
    },
    logoAccent: {
        color: 'var(--accent)',
    },
    subtitle: {
        color: 'var(--text-secondary)',
        fontSize: '14px',
        textAlign: 'center',
        marginBottom: '32px',
    },
    error: {
        backgroundColor: 'rgba(239,68,68,0.1)',
        border: '1px solid rgba(239,68,68,0.3)',
        color: '#f87171',
        padding: '12px',
        borderRadius: '8px',
        fontSize: '14px',
        marginBottom: '20px',
    },
    field: {
        marginBottom: '20px',
    },
    label: {
        display: 'block',
        fontSize: '13px',
        fontWeight: '500',
        color: 'var(--text-secondary)',
        marginBottom: '8px',
    },
    input: {
        width: '100%',
        padding: '12px 16px',
        backgroundColor: '#111827',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        color: 'var(--text-primary)',
        fontSize: '15px',
        outline: 'none',
        fontFamily: 'Sora, sans-serif',
        transition: 'border-color 0.2s',
    },
    button: {
        width: '100%',
        padding: '13px',
        backgroundColor: 'var(--accent)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '15px',
        fontWeight: '600',
        cursor: 'pointer',
        fontFamily: 'Sora, sans-serif',
        marginTop: '8px',
        transition: 'opacity 0.2s',
    },
    footer: {
        textAlign: 'center',
        marginTop: '24px',
        fontSize: '14px',
        color: 'var(--text-secondary)',
    },
    link: {
        color: 'var(--accent)',
        fontWeight: '500',
    },
};

export default LoginPage;