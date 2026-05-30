import { useState, useEffect } from 'react';
import { authAPI, statisticsAPI } from '../services/api';

function DashboardPage() {
    const [user, setUser] = useState(null);
    const [overall, setOverall] = useState(null);

    useEffect(() => {
        authAPI.getMe().then(res => setUser(res.data));
        statisticsAPI.getOverall().then(res => setOverall(res.data));
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
    };

    return (
        <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Dashboard</h2>
                <button onClick={handleLogout} style={{ padding: '8px 16px', backgroundColor: '#dc3545', color: 'white', border: 'none', cursor: 'pointer' }}>
                    Chiqish
                </button>
            </div>

            {user && (
                <div style={{ backgroundColor: '#f8f9fa', padding: '20px', marginBottom: '20px', borderRadius: '8px' }}>
                    <h3>Salom, {user.username}!</h3>
                    <p>Email: {user.email}</p>
                </div>
            )}

            {overall && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div style={{ backgroundColor: '#007bff', color: 'white', padding: '20px', borderRadius: '8px' }}>
                        <h3>Writing</h3>
                        <p>O'rtacha ball: {overall.writing.average_band_score}</p>
                        <p>Jami testlar: {overall.writing.total_tests}</p>
                    </div>
                    <div style={{ backgroundColor: '#28a745', color: 'white', padding: '20px', borderRadius: '8px' }}>
                        <h3>Speaking</h3>
                        <p>O'rtacha ball: {overall.speaking.average_band_score}</p>
                        <p>Jami testlar: {overall.speaking.total_tests}</p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DashboardPage;