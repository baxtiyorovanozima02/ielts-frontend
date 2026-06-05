import { useState, useEffect } from 'react';
import { vocabularyAPI } from '../services/api';
import Navbar from '../components/Navbar';

function FlashCard({ word, onNext, onPrev, current, total }) {
    const [flipped, setFlipped] = useState(false);

    useEffect(() => {
        setFlipped(false);
    }, [word]);

    return (
        <div style={styles.flashcardWrapper}>
            <div style={styles.flashcardCounter}>{current + 1} / {total}</div>
            <div
                style={{ ...styles.flashcard, ...(flipped ? styles.flashcardFlipped : {}) }}
                onClick={() => setFlipped(!flipped)}
            >
                {!flipped ? (
                    <div style={styles.flashcardFront}>
                        <div style={styles.flashcardHint}>So'z</div>
                        <div style={styles.flashcardWord}>{word.word}</div>
                        {word.example && <div style={styles.flashcardExample}>"{word.example}"</div>}
                        <div style={styles.flashcardTap}>👆 Tarjimani ko'rish uchun bosing</div>
                    </div>
                ) : (
                    <div style={styles.flashcardBack}>
                        <div style={styles.flashcardHint}>Tarjima</div>
                        <div style={styles.flashcardTranslation}>{word.translation}</div>
                        <div style={styles.flashcardWordSmall}>{word.word}</div>
                        <div style={styles.flashcardTap}>✅ Bildingizmi?</div>
                    </div>
                )}
            </div>
            <div style={styles.flashcardBtns}>
                <button onClick={onPrev} style={styles.navBtn}>← Oldingi</button>
                <button onClick={onNext} style={styles.navBtn}>Keyingi →</button>
            </div>
        </div>
    );
}

function ReviewMode({ onFinish }) {
    const [dueWords, setDueWords] = useState([]);
    const [current, setCurrent] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [flipped, setFlipped] = useState(false);
    const [results, setResults] = useState({ known: 0, unknown: 0 });
    const [done, setDone] = useState(false);

    useEffect(() => {
        vocabularyAPI.getDueWords()
            .then(res => setDueWords(res.data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const handleReview = async (quality) => {
        if (submitting) return;
        setSubmitting(true);
        const word = dueWords[current];
        try {
            await vocabularyAPI.reviewWord({ word_id: word.id, quality });
        } catch {}

        if (quality >= 3) {
            setResults(r => ({ ...r, known: r.known + 1 }));
        } else {
            setResults(r => ({ ...r, unknown: r.unknown + 1 }));
        }

        if (current + 1 >= dueWords.length) {
            setDone(true);
        } else {
            setCurrent(i => i + 1);
            setFlipped(false);
        }
        setSubmitting(false);
    };

    if (loading) return (
        <div style={styles.reviewEmpty}>Yuklanmoqda...</div>
    );

    if (dueWords.length === 0) return (
        <div style={styles.reviewEmpty}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
            <div style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
                Barakallo!
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                Bugun takrorlanadigan so'z yo'q. Ertaga qaytib keling!
            </div>
        </div>
    );

    if (done) return (
        <div style={styles.reviewEmpty}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
            <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
                Takrorlash tugadi!
            </div>
            <div style={styles.reviewResults}>
                <div style={styles.reviewResultItem}>
                    <div style={{ fontSize: '28px', fontWeight: '800', color: '#10b981' }}>{results.known}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Bildim ✅</div>
                </div>
                <div style={styles.reviewResultItem}>
                    <div style={{ fontSize: '28px', fontWeight: '800', color: '#ef4444' }}>{results.unknown}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Bilmadim ❌</div>
                </div>
            </div>
            <button onClick={onFinish} style={styles.finishBtn}>
                Ro'yxatga qaytish
            </button>
        </div>
    );

    const word = dueWords[current];

    return (
        <div style={styles.reviewWrapper}>
            <div style={styles.reviewProgress}>
                <div style={styles.reviewProgressBar}>
                    <div style={{
                        ...styles.reviewProgressFill,
                        width: `${(current / dueWords.length) * 100}%`
                    }} />
                </div>
                <div style={styles.reviewProgressText}>
                    {current + 1} / {dueWords.length}
                </div>
            </div>

            <div
                style={{ ...styles.flashcard, ...(flipped ? styles.flashcardFlipped : {}) }}
                onClick={() => setFlipped(!flipped)}
            >
                {!flipped ? (
                    <div style={styles.flashcardFront}>
                        <div style={styles.flashcardHint}>So'z</div>
                        <div style={styles.flashcardWord}>{word.word}</div>
                        {word.example && <div style={styles.flashcardExample}>"{word.example}"</div>}
                        <div style={styles.flashcardTap}>👆 Tarjimani ko'rish uchun bosing</div>
                    </div>
                ) : (
                    <div style={styles.flashcardBack}>
                        <div style={styles.flashcardHint}>Tarjima</div>
                        <div style={styles.flashcardTranslation}>{word.translation}</div>
                        <div style={styles.flashcardWordSmall}>{word.word}</div>
                    </div>
                )}
            </div>

            {flipped && (
                <div style={styles.reviewBtns}>
                    <button
                        onClick={() => handleReview(1)}
                        style={styles.unknownBtn}
                        disabled={submitting}
                    >
                        ❌ Bilmadim
                    </button>
                    <button
                        onClick={() => handleReview(3)}
                        style={styles.hardBtn}
                        disabled={submitting}
                    >
                        😅 Qiyin
                    </button>
                    <button
                        onClick={() => handleReview(5)}
                        style={styles.knownBtn}
                        disabled={submitting}
                    >
                        ✅ Bildim
                    </button>
                </div>
            )}

            {!flipped && (
                <div style={styles.reviewHint}>
                    Avval tarjimani ko'ring, keyin baholang
                </div>
            )}
        </div>
    );
}

function VocabularyPage() {
    const [words, setWords] = useState([]);
    const [newWord, setNewWord] = useState({ word: '', translation: '', example: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState('list');
    const [cardIndex, setCardIndex] = useState(0);

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

    const handleNext = () => setCardIndex(i => (i + 1) % words.length);
    const handlePrev = () => setCardIndex(i => (i - 1 + words.length) % words.length);

    return (
        <div style={styles.page}>
            <Navbar />
            <main style={styles.main}>

                <div style={styles.pageHeader}>
                    <h1 style={styles.pageTitle}>📚 Lug'at</h1>
                    <span style={styles.wordCount}>{words.length} ta so'z</span>
                </div>

                {/* Mode tabs */}
                <div style={styles.tabs}>
                    <button
                        onClick={() => setMode('list')}
                        style={{ ...styles.tab, ...(mode === 'list' ? styles.tabActive : {}) }}
                    >
                        📋 Ro'yxat
                    </button>
                    <button
                        onClick={() => { setMode('flashcard'); setCardIndex(0); }}
                        style={{ ...styles.tab, ...(mode === 'flashcard' ? styles.tabActive : {}) }}
                        disabled={words.length === 0}
                    >
                        🃏 Flashcard
                    </button>
                    <button
                        onClick={() => setMode('review')}
                        style={{ ...styles.tab, ...(mode === 'review' ? styles.tabActive : {}) }}
                    >
                        🔁 Takrorlash
                    </button>
                </div>

                {/* Flashcard mode */}
                {mode === 'flashcard' && words.length > 0 && (
                    <FlashCard
                        word={words[cardIndex]}
                        onNext={handleNext}
                        onPrev={handlePrev}
                        current={cardIndex}
                        total={words.length}
                    />
                )}

                {/* Review mode */}
                {mode === 'review' && (
                    <ReviewMode onFinish={() => setMode('list')} />
                )}

                {/* List mode */}
                {mode === 'list' && (
                    <>
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
                    </>
                )}

            </main>
        </div>
    );
}

const styles = {
    page: { minHeight: '100vh', backgroundColor: 'var(--bg-base)' },
    main: { maxWidth: '800px', margin: '0 auto', padding: '40px 24px' },
    pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' },
    pageTitle: { fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)' },
    wordCount: { fontSize: '13px', color: 'var(--text-muted)', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', padding: '4px 12px', borderRadius: '20px' },
    tabs: { display: 'flex', gap: '10px', marginBottom: '32px' },
    tab: { padding: '10px 24px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'transparent', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500', cursor: 'pointer', fontFamily: 'Sora, sans-serif', transition: 'all 0.2s' },
    tabActive: { backgroundColor: 'var(--accent)', borderColor: 'var(--accent)', color: 'white' },
    reviewWrapper: { display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' },
    reviewProgress: { display: 'flex', alignItems: 'center', gap: '16px' },
    reviewProgressBar: { flex: 1, height: '6px', backgroundColor: 'var(--border)', borderRadius: '3px', overflow: 'hidden' },
    reviewProgressFill: { height: '100%', backgroundColor: 'var(--accent)', borderRadius: '3px', transition: 'width 0.4s ease' },
    reviewProgressText: { fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500', minWidth: '48px', textAlign: 'right' },
    reviewBtns: { display: 'flex', gap: '12px' },
    unknownBtn: { flex: 1, padding: '14px', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', color: '#f87171', fontSize: '15px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Sora, sans-serif' },
    hardBtn: { flex: 1, padding: '14px', backgroundColor: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '10px', color: '#fbbf24', fontSize: '15px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Sora, sans-serif' },
    knownBtn: { flex: 1, padding: '14px', backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '10px', color: '#34d399', fontSize: '15px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Sora, sans-serif' },
    reviewHint: { textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' },
    reviewEmpty: { textAlign: 'center', padding: '60px 24px', color: 'var(--text-muted)', fontSize: '14px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' },
    reviewResults: { display: 'flex', gap: '32px', justifyContent: 'center', margin: '16px 0' },
    reviewResultItem: { textAlign: 'center' },
    finishBtn: { padding: '12px 32px', backgroundColor: 'var(--accent)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Sora, sans-serif' },
    flashcardWrapper: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', padding: '20px 0 40px' },
    flashcardCounter: { fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' },
    flashcard: { width: '100%', minHeight: '280px', backgroundColor: 'var(--bg-card)', border: '2px solid var(--border)', borderRadius: '20px', padding: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'border-color 0.3s, transform 0.15s', userSelect: 'none' },
    flashcardFlipped: { borderColor: 'var(--accent)', transform: 'scale(1.01)' },
    flashcardFront: { textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' },
    flashcardBack: { textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' },
    flashcardHint: { fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' },
    flashcardWord: { fontSize: '48px', fontWeight: '800', color: 'var(--text-primary)' },
    flashcardTranslation: { fontSize: '42px', fontWeight: '800', color: 'var(--accent)' },
    flashcardWordSmall: { fontSize: '18px', color: 'var(--text-muted)', fontWeight: '500' },
    flashcardExample: { fontSize: '14px', color: 'var(--text-muted)', fontStyle: 'italic', maxWidth: '500px' },
    flashcardTap: { fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' },
    flashcardBtns: { display: 'flex', gap: '16px' },
    navBtn: { padding: '12px 32px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'transparent', color: 'var(--text-secondary)', fontSize: '15px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Sora, sans-serif' },
    formCard: { backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '28px', marginBottom: '32px' },
    formTitle: { fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '20px' },
    formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
    error: { backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', padding: '12px', borderRadius: '8px', fontSize: '14px', marginBottom: '16px' },
    field: { marginBottom: '16px' },
    label: { display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '8px' },
    input: { width: '100%', padding: '11px 16px', backgroundColor: '#111827', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', fontFamily: 'Sora, sans-serif' },
    button: { padding: '11px 24px', backgroundColor: 'var(--accent)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Sora, sans-serif' },
    empty: { backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' },
    wordCard: { backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px 20px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    wordLeft: { display: 'flex', flexDirection: 'column', gap: '6px' },
    wordRow: { display: 'flex', alignItems: 'center', gap: '8px' },
    wordText: { fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' },
    wordDash: { color: 'var(--text-muted)' },
    wordTranslation: { fontSize: '15px', color: 'var(--accent)' },
    wordExample: { fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic' },
    deleteBtn: { background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px 10px', cursor: 'pointer', fontSize: '16px' },
};

export default VocabularyPage;