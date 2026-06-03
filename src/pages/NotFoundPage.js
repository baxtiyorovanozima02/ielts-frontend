function NotFoundPage() {
    return (
        <div style={styles.page}>
            <div style={styles.content}>
                <div style={styles.code}>404</div>
                <h1 style={styles.title}>Sahifa topilmadi</h1>
                <p style={styles.subtitle}>
                    Siz qidirgan sahifa mavjud emas yoki o'chirilgan 😕
                </p>
                <a href="/" style={styles.btn}>🏠 Bosh sahifaga qaytish</a>
            </div>
        </div>
    );
}

const styles = {
    page: {
        minHeight: '100vh',
        backgroundColor: 'var(--bg-base)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        textAlign: 'center',
        padding: '40px',
    },
    code: {
        fontSize: '120px',
        fontWeight: '800',
        color: 'var(--accent)',
        lineHeight: '1',
        marginBottom: '16px',
        opacity: 0.8,
    },
    title: {
        fontSize: '28px',
        fontWeight: '700',
        color: 'var(--text-primary)',
        marginBottom: '12px',
    },
    subtitle: {
        fontSize: '16px',
        color: 'var(--text-secondary)',
        marginBottom: '32px',
    },
    btn: {
        padding: '12px 28px',
        backgroundColor: 'var(--accent)',
        color: 'white',
        borderRadius: '10px',
        textDecoration: 'none',
        fontSize: '15px',
        fontWeight: '600',
    },
};

export default NotFoundPage;