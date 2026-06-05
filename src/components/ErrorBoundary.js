import { Component } from 'react';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        console.error('ErrorBoundary caught:', error, info);
    }

    handleReload() {
        window.location.reload();
    }

    handleGoHome() {
        window.location.href = '/dashboard';
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={styles.page}>
                    <div style={styles.card}>
                        <div style={styles.icon}>⚠️</div>
                        <h1 style={styles.title}>Xatolik yuz berdi</h1>
                        <p style={styles.desc}>
                            Sahifani yuklashda muammo bo'ldi. Qayta urinib ko'ring.
                        </p>
                        {this.state.error && (
                            <div style={styles.errorBox}>
                                {this.state.error.message}
                            </div>
                        )}
                        <div style={styles.btns}>
                            <button onClick={this.handleReload} style={styles.primaryBtn}>
                                🔄 Qayta yuklash
                            </button>
                            <button onClick={this.handleGoHome} style={styles.outlineBtn}>
                                🏠 Bosh sahifa
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

const styles = {
    page: {
        minHeight: '100vh',
        backgroundColor: 'var(--bg-base)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
    },
    card: {
        maxWidth: '480px',
        width: '100%',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '48px 40px',
        textAlign: 'center',
    },
    icon: {
        fontSize: '56px',
        marginBottom: '20px',
    },
    title: {
        fontSize: '24px',
        fontWeight: '700',
        color: 'var(--text-primary)',
        marginBottom: '12px',
    },
    desc: {
        fontSize: '15px',
        color: 'var(--text-secondary)',
        lineHeight: '1.6',
        marginBottom: '24px',
    },
    errorBox: {
        backgroundColor: 'rgba(239,68,68,0.08)',
        border: '1px solid rgba(239,68,68,0.2)',
        borderRadius: '8px',
        padding: '12px 16px',
        fontSize: '12px',
        color: '#f87171',
        marginBottom: '28px',
        textAlign: 'left',
        fontFamily: 'monospace',
        wordBreak: 'break-word',
    },
    btns: {
        display: 'flex',
        gap: '12px',
        justifyContent: 'center',
    },
    primaryBtn: {
        padding: '11px 24px',
        backgroundColor: 'var(--accent)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        fontFamily: 'Sora, sans-serif',
    },
    outlineBtn: {
        padding: '11px 24px',
        backgroundColor: 'transparent',
        color: 'var(--text-secondary)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        fontFamily: 'Sora, sans-serif',
    },
};

export default ErrorBoundary;