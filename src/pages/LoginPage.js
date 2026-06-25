import { useState } from 'react';
import { authAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();

    const validate = () => {
        const newErrors = {};
        if (!username.trim()) {
            newErrors.username = "Username kiritish majburiy";
        }
        if (!password) {
            newErrors.password = "Parol kiritish majburiy";
        } else if (password.length < 6) {
            newErrors.password = "Parol kamida 6 ta belgi bo'lishi kerak";
        }
        return newErrors;
    };

    const handleLogin = async () => {
        const newErrors = validate();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        setErrors({});
        setLoading(true);
        try {
            const response = await authAPI.login({ username, password });
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
            showToast("Xush kelibsiz!", 'success');
            window.location.href = '/dashboard';
        } catch (err) {
            const status = err.response?.status;
            if (status === 401) {
                setErrors({ general: "Username yoki parol noto'g'ri" });
                showToast("Username yoki parol noto'g'ri", 'error');
            } else {
                setErrors({ general: "Server bilan bog'lanishda xatolik" });
                showToast("Server bilan bog'lanishda xatolik", 'error');
            }
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

                <div style={styles.logo}>IELTSERA<span style={styles.logoAccent}>.uz</span></div>
                <p style={styles.subtitle}>Akkauntingizga kiring</p>

                {errors.general && <div style={styles.errorBox}>{errors.general}</div>}

                <div style={styles.field}>
                    <label style={styles.label}>Username</label>
                    <input
                        type="text"
                        placeholder="username"
                        value={username}
                        onChange={(e) => {
                            setUsername(e.target.value);
                            if (errors.username) setErrors(prev => ({ ...prev, username: '' }));
                        }}
                        onKeyDown={handleKeyDown}
                        style={{
                            ...styles.input,
                            borderColor: errors.username ? '#ef4444' : undefined,
                        }}
                    />
                    {errors.username && <div style={styles.fieldError}>{errors.username}</div>}
                </div>

                <div style={styles.field}>
                    <label style={styles.label}>Parol</label>
                    <input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                        }}
                        onKeyDown={handleKeyDown}
                        style={{
                            ...styles.input,
                            borderColor: errors.password ? '#ef4444' : undefined,
                        }}
                    />
                    {errors.password && <div style={styles.fieldError}>{errors.password}</div>}
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
    errorBox: {
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
        boxSizing: 'border-box',
    },
    fieldError: {
        color: '#f87171',
        fontSize: '12px',
        marginTop: '6px',
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