import { useState, useEffect } from 'react';
import { vocabularyAPI } from '../services/api';
import Navbar from '../components/Navbar';

function VocabularyPage() {
    const [words, setWords] = useState([]);
    const [newWord, setNewWord] = useState({ word: '', translation: '', example: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        vocabularyAPI.getWords().then(res => setWords(res.data)).catch(() => {});
    }, []);

    const handleAdd = async () => {
        if (!newWord.word || !newWord.translation) {
            setError("So'z va tarjima majburiy");
            return;
        }
        setLoading(true);
        try {
            const res = await vocabularyAPI.addWord(newWord);
            setWords([res.data, ...words]);
            setNewWord({ word: '', translation: '', example: '' });
            setError('');
        } catch {
            setError('Xatolik yuz berdi');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        await vocabularyAPI.deleteWord(id);
        setWords(words.filter(w => w.id !== id));
    };

    return (
        <div style={styles.page}>

            {/* Navbar */}
            <Navbar />

            <main style={styles.main}>

                <h1 style={styles.pageTitle}>Lug'at</h1>

                {/* Add word form */}
                <div style={styles.formCard}>
                    <h2 style={styles.formTitle}>Yangi so'z qo'shish</h2>
                    {error && <div style={styles.error}>{error}</div>}

                    <div style={styles.formGrid}>
                        <div style={styles.field}>
                            <label style={styles.label}>So'z</label>
                            <input
                                placeholder="masalan: abundant"
                                value={newWord.word}
                                onChange={e => setNewWord({ ...newWord, word: e.target.value })}
                                style={styles.input}
                            />
                        </div>
                        <div style={styles.field}>
                            <label style={styles.label}>Tarjima</label>
                            <input
                                placeholder="masalan: ko'p, mo'l"
                                value={newWord.translation}
                                onChange={e => setNewWord({ ...newWord, translation: e.target.value })}
                                style={styles.input}
                            />
                        </div>
                    </div>

                    <div style={styles.field}>
                        <label style={styles.label}>Misol jumla (ixtiyoriy)</label>
                        <input
                            placeholder="masalan: There is abundant water in this region."
                            value={newWord.example}
                            onChange={e => setNewWord({ ...newWord, example: e.target.value })}
                            style={styles.input}
                        />
                    </div>

                    <button
                        onClick={handleAdd}
                        disabled={loading}
                        style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
                    >
                        {loading ? "Qo'shilmoqda..." : "+ Qo'shish"}
                    </button>
                </div>

                {/* Word list */}
                <div style={styles.listHeader}>
                    <h2 style={styles.sectionTitle}>Mening so'zlarim</h2>
                    <span style={styles.wordCount}>{words.length} ta so'z</span>
                </div>

                {words.length === 0 ? (
                    <div style={styles.empty}>
                        Hali so'z qo'shilmagan. Yuqoridan boshlang! 👆
                    </div>
                ) : (
                    words.map(w => (
                        <div key={w.id} style={styles.wordCard}>
                            <div style={styles.wordLeft}>
                                <div style={styles.wordRow}>
                                    <span style={styles.wordText}>{w.word}</span>
                                    <span style={styles.wordDash}>—</span>
                                    <span style={styles.wordTranslation}>{w.translation}</span>
                                </div>
                                {w.example && (
                                    <div style={styles.wordExample}>"{w.example}"</div>
                                )}
                            </div>
                            <button
                                onClick={() => handleDelete(w.id)}
                                style={styles.deleteBtn}
                            >
                                🗑
                            </button>
                        </div>
                    ))
                )}

            </main>
        </div>
    );
}

const styles = {
    page: {
        minHeight: '100vh',
        backgroundColor: 'var(--bg-base)',
    },
    navbar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 32px',
        borderBottom: '1px solid var(--border)',
        backgroundColor: 'var(--bg-card)',
    },
    navLogo: {
        fontSize: '22px',
        fontWeight: '700',
        color: 'var(--text-primary)',
        textDecoration: 'none',
    },
    logoAccent: {
        color: 'var(--accent)',
    },
    navLinks: {
        display: 'flex',
        gap: '24px',
    },
    navLink: {
        color: 'var(--text-secondary)',
        fontSize: '14px',
        fontWeight: '500',
        textDecoration: 'none',
    },
    main: {
        maxWidth: '800px',
        margin: '0 auto',
        padding: '40px 24px',
    },
    pageTitle: {
        fontSize: '28px',
        fontWeight: '700',
        color: 'var(--text-primary)',
        marginBottom: '32px',
    },
    formCard: {
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '28px',
        marginBottom: '40px',
    },
    formTitle: {
        fontSize: '16px',
        fontWeight: '600',
        color: 'var(--text-primary)',
        marginBottom: '20px',
    },
    formGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
    },
    error: {
        backgroundColor: 'rgba(239,68,68,0.1)',
        border: '1px solid rgba(239,68,68,0.3)',
        color: '#f87171',
        padding: '12px',
        borderRadius: '8px',
        fontSize: '14px',
        marginBottom: '16px',
    },
    field: {
        marginBottom: '16px',
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
        padding: '11px 16px',
        backgroundColor: '#111827',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        color: 'var(--text-primary)',
        fontSize: '14px',
        outline: 'none',
        fontFamily: 'Sora, sans-serif',
    },
    button: {
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
    listHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
    },
    sectionTitle: {
        fontSize: '16px',
        fontWeight: '600',
        color: 'var(--text-secondary)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
    },
    wordCount: {
        fontSize: '13px',
        color: 'var(--text-muted)',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        padding: '4px 12px',
        borderRadius: '20px',
    },
    empty: {
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '32px',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '14px',
    },
    wordCard: {
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '16px 20px',
        marginBottom: '10px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    wordLeft: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    wordRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    wordText: {
        fontSize: '16px',
        fontWeight: '600',
        color: 'var(--text-primary)',
    },
    wordDash: {
        color: 'var(--text-muted)',
    },
    wordTranslation: {
        fontSize: '15px',
        color: 'var(--accent)',
    },
    wordExample: {
        fontSize: '13px',
        color: 'var(--text-muted)',
        fontStyle: 'italic',
    },
    deleteBtn: {
        background: 'transparent',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '8px 10px',
        cursor: 'pointer',
        fontSize: '16px',
    },
};

export default VocabularyPage;