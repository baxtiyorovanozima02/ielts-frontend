import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3500);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <ToastList toasts={toasts} />
        </ToastContext.Provider>
    );
}

function ToastList({ toasts }) {
    return (
        <div style={styles.container}>
            {toasts.map(t => (
                <Toast key={t.id} toast={t} />
            ))}
        </div>
    );
}

function Toast({ toast }) {
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        info: '#3b82f6',
        warning: '#f59e0b',
    };

    return (
        <div style={{ ...styles.toast, borderLeft: `4px solid ${colors[toast.type]}` }}>
            <span style={styles.message}>{toast.message}</span>
        </div>
    );
}

const styles = {
    container: {
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        zIndex: 9999,
    },
    toast: {
        backgroundColor: '#0f172a',
        border: '1px solid #1e2d45',
        borderRadius: '10px',
        padding: '14px 18px',
        minWidth: '280px',
        maxWidth: '360px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        animation: 'slideIn 0.25s ease',
    },
    message: {
        fontSize: '14px',
        color: '#f1f5f9',
    },
};

export function useToast() {
    return useContext(ToastContext);
}