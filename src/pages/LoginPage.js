import { useState } from 'react';
import { authAPI } from '../services/api';

function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async () => {
        try {
            const response = await authAPI.login({ username, password });
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
            window.location.href = '/dashboard';
        } catch (err) {
            setError('Username yoki parol noto\'g\'ri');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '100px auto', padding: '20px' }}>
            <h2>Kirish</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
                />
            </div>
            <div>
                <input
                    type="password"
                    placeholder="Parol"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
                />
            </div>
            <button
                onClick={handleLogin}
                style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}
            >
                Kirish
            </button>
            <p>Akkaunt yo'qmi? <a href="/register">Ro'yxatdan o'ting</a></p>
        </div>
    );
}

export default LoginPage;