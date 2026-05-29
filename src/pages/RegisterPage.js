import { useState } from 'react';
import { authAPI } from '../services/api';

function RegisterPage() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async () => {
        try {
            await authAPI.register(formData);
            setSuccess('Ro\'yxatdan o\'tdingiz! Endi kiring.');
            setTimeout(() => window.location.href = '/login', 2000);
        } catch (err) {
            setError('Xatolik yuz berdi. Qayta urinib ko\'ring.');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '100px auto', padding: '20px' }}>
            <h2>Ro'yxatdan o'tish</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}
            <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
            />
            <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
            />
            <input
                type="password"
                name="password"
                placeholder="Parol"
                value={formData.password}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
            />
            <button
                onClick={handleRegister}
                style={{ width: '100%', padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer' }}
            >
                Ro'yxatdan o'tish
            </button>
            <p>Akkaunt bormi? <a href="/login">Kiring</a></p>
        </div>
    );
}

export default RegisterPage;