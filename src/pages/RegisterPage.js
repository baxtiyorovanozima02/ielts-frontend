import { useState } from 'react';
import { authAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

function RegisterPage() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        re_password: '',
    });
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors(prev => ({ ...prev, [e.target.name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.username.trim()) {
            newErrors.username = "Username kiritish majburiy";
        } else if (formData.username.length < 3) {
            newErrors.username = "Username kamida 3 ta belgi bo'lishi kerak";
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email kiritish majburiy";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Email formati noto'g'ri";
        }

        if (!formData.password) {
            newErrors.password = "Parol kiritish majburiy";
        } else if (formData.password.length < 8) {
            newErrors.password = "Parol kamida 8 ta belgi bo'lishi kerak";
        }

        if (!formData.re_password) {
            newErrors.re_password = "Parolni takrorlash majburiy";
        } else if (formData.password !== formData.re_password) {
            newErrors.re_password = "Parollar mos kelmadi";
        }

        return newErrors;
    };

    const handleRegister = async () => {
        const newErrors = validate();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        setErrors({});
        setLoading(true);
        try {
            await authAPI.register(formData);
            setSuccess("Ro'yxatdan o'tdingiz! Kirish sahifasiga yo'naltirilmoqdasiz...");
            showToast("Ro'yxatdan o'tdingiz!", 'success');
            setTimeout(() => window.location.href = '/login', 2000);
        } catch (err) {
            const data = err.response?.data;
            if (data?.username) {
                setErrors(prev => ({ ...prev, username: "Bu username band" }));
            } else if (data?.email) {
                setErrors(prev => ({ ...prev, email: "Bu email allaqachon ro'yxatdan o'tgan" }));
            } else {
                setErrors({ general: "Xatolik yuz berdi. Qayta urinib ko'ring." });
            }
            showToast("Ro'yxatdan o'tishda xatolik", 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.card}>

                <div style={styles.logo}>SelfStudy<span style={styles.logoAccent}>.uz</span></div>
                <p style={styles.subtitle}>Yangi akkaunt yarating</p>

                {errors.general && <div style={styles.errorBox}>{errors.general}</div>}
                {success && <div style={styles.successBox}>{success}</div>}

                <div style={styles.field}>
                    <label style={styles.label}>Username</label>
                    <input
                        type="text"
                        name="username"
                        placeholder="username"
                        value={formData.username}
                        onChange={handleChange}
                        style={{
                            ...styles.input,
                            borderColor: errors.username ? '#ef4444' : undefined,
                        }}
                    />
                    {errors.username && <div style={styles.fieldError}>{errors.username}</div>}
                </div>

                <div style={styles.field}>
                    <label style={styles.label}>Email</label>
                    <input
                        type="email"
                        name="email"
                        placeholder="email@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        style={{
                            ...styles.input,
                            borderColor: errors.email ? '#ef4444' : undefined,
                        }}
                    />
                    {errors.email && <div style={styles.fieldError}>{errors.email}</div>}
                </div>

                <div style={styles.field}>
                    <label style={styles.label}>Parol</label>
                    <input
                        type="password"
                        name="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        style={{
                            ...styles.input,
                            borderColor: errors.password ? '#ef4444' : undefined,
                        }}
                    />
                    {errors.password && <div style={styles.fieldError}>{errors.password}</div>}
                </div>

                <div style={styles.field}>
                    <label style={styles.label}>Parolni takrorlang</label>
                    <input
                        type="password"
                        name="re_password"
                        placeholder="••••••••"
                        value={formData.re_password}
                        onChange={handleChange}
                        style={{
                            ...styles.input,
                            borderColor: errors.re_password ? '#ef4444' : undefined,
                        }}
                    />
                    {errors.re_password && <div style={styles.fieldError}>{errors.re_password}</div>}
                </div>

                <button
                    onClick={handleRegister}
                    disabled={loading}
                    style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
                >
                    {loading ? "Ro'yxatdan o'tilmoqda..." : "Ro'yxatdan o'tish"}
                </button>

                <p style={styles.footer}>
                    Akkaunt bormi?{' '}
                    <a href="/login" style={styles.link}>Kiring</a>
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
    successBox: {
        backgroundColor: 'rgba(16,185,129,0.1)',
        border: '1px solid rgba(16,185,129,0.3)',
        color: '#34d399',
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

export default RegisterPage;