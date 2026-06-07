import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Skeleton from '../components/Skeleton';
import { vocabularyAPI } from '../services/api';


function Flashcard({ wordObj, onRate, onSkip, current, total }) {
    const [flipped, setFlipped] = useState(false);

    const qualityLabels = [
        { q: 0, label: "Bilmadim", color: '#ef4444', emoji: '😞' },
        { q: 1, label: "Qiyin",    color: '#f59e0b', emoji: '😐' },
        { q: 2, label: "Esladim",  color: '#3b82f6', emoji: '🙂' },
        { q: 3, label: "Oson!",    color: '#10b981', emoji: '😊' },
    ];

    useEffect(() => { setFlipped(false); }, [wordObj?.id]);

    return (
        <div style={flashcardWrap}>
            {/* Progress */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '480px', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{current} / {total}</span>
                <div style={miniProgressWrap}>
                    <div style={{ ...miniProgressFill, width: `${((current - 1) / total) * 100}%` }} />
                </div>
            </div>

            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px', textAlign: 'center' }}>
                {flipped ? 'Qanchalik yaxshi bildingiz?' : 'Kartani bosing — tarjimani ko\'ring'}
            </div>

            {/* Karta */}
            <div onClick={() => setFlipped(!flipped)} style={flashcard}>
                {!flipped ? (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
                            {wordObj.word}
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>bosing →</div>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tarjima</div>
                        <div style={{ fontSize: '26px', fontWeight: '700', color: 'var(--accent)', marginBottom: '12px' }}>
                            {wordObj.translation}
                        </div>
                        {wordObj.example && (
                            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: 1.6 }}>
                                "{wordObj.example}"
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Baholash tugmalari — faqat flip bo'lganda */}
            {flipped && (
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {qualityLabels.map(({ q, label, color, emoji }) => (
                        <button
                            key={q}
                            onClick={() => onRate(wordObj, q)}
                            style={{ ...rateBtn, borderColor: color, color }}
                        >
                            {emoji} {label}
                        </button>
                    ))}
                </div>
            )}

            <button onClick={onSkip} style={skipBtn}>O'tkazib yuborish →</button>
        </div>
    );
}

function AddWordModal({ onClose, onAdd }) {
    const [form, setForm] = useState({ word: '', translation: '', example: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!form.word.trim() || !form.translation.trim()) {
            setError("So'z va tarjima majburiy!");
            return;
        }
        setLoading(true);
        try {
            const res = await vocabularyAPI.addWord(form);
            onAdd(res.data);
            onClose();
        } catch {
            setError("Xatolik yuz berdi. Qaytadan urinib ko'ring.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={modalOverlay} onClick={onClose}>
            <div style={modalBox} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>➕ Yangi so'z</h3>
                    <button onClick={onClose} style={closeBtn}>✕</button>
                </div>
                {error && <div style={errorBox}>{error}</div>}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                        <label style={inputLabel}>So'z (inglizcha) *</label>
                        <input style={inputStyle} placeholder="e.g. perseverance" value={form.word} onChange={e => setForm({ ...form, word: e.target.value })} />
                    </div>
                    <div>
                        <label style={inputLabel}>Tarjima *</label>
                        <input style={inputStyle} placeholder="e.g. qat'iyat" value={form.translation} onChange={e => setForm({ ...form, translation: e.target.value })} />
                    </div>
                    <div>
                        <label style={inputLabel}>Misol jumla (ixtiyoriy)</label>
                        <textarea style={{ ...inputStyle, height: '72px', resize: 'vertical' }} placeholder="e.g. Perseverance is the key to success." value={form.example} onChange={e => setForm({ ...form, example: e.target.value })} />
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
                    <button onClick={onClose} style={btnSecondary}>Bekor qilish</button>
                    <button onClick={handleSubmit} disabled={loading} style={{ ...btnPrimary, opacity: loading ? 0.7 : 1 }}>
                        {loading ? 'Saqlanmoqda...' : 'Saqlash'}
                    </button>
                </div>
            </div>
        </div>
    );
}


export default function VocabularyPage() {
    const [words, setWords] = useState([]);
    const [dueReviews, setDueReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('words');
    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState('');
    const [reviewMode, setReviewMode] = useState('due'); // 'due' | 'all'
    const [currentIndex, setCurrentIndex] = useState(0);
    const [reviewDone, setReviewDone] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [toast, setToast] = useState('');

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [wordsRes, dueRes] = await Promise.all([
                vocabularyAPI.getWords(),
                vocabularyAPI.getDueWords(),
            ]);
            setWords(wordsRes.data);
            setDueReviews(dueRes.data);
        } catch {}
        finally { setLoading(false); }
    };

    const handleAddWord = (newWord) => {
        setWords(prev => [newWord, ...prev]);
        showToast("✅ So'z qo'shildi!");
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bu so'zni o'chirishni istaysizmi?")) return;
        setDeletingId(id);
        try {
            await vocabularyAPI.deleteWord(id);
            setWords(prev => prev.filter(w => w.id !== id));
            showToast("🗑️ So'z o'chirildi");
        } catch { showToast("❌ Xatolik yuz berdi"); }
        finally { setDeletingId(null); }
    };

    const handleRate = async (word, quality) => {
        try { await vocabularyAPI.reviewWord({ word_id: word.id, quality }); } catch {}
        goNext();
    };

    const handleSkip = () => goNext();

    const goNext = () => {
        const list = reviewMode === 'due'
            ? dueReviews.map(r => ({ id: r.word, word: r.word_text, translation: r.translation }))
            : words;
        if (currentIndex + 1 >= list.length) {
            setReviewDone(true);
        } else {
            setCurrentIndex(prev => prev + 1);
        }
    };

    const startReview = (mode) => {
        setReviewMode(mode);
        setCurrentIndex(0);
        setReviewDone(false);
    };

    const resetReview = () => {
        setCurrentIndex(0);
        setReviewDone(false);
        loadData();
    };

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 2500);
    };

    const filteredWords = words.filter(w =>
        w.word.toLowerCase().includes(search.toLowerCase()) ||
        w.translation.toLowerCase().includes(search.toLowerCase())
    );

    const reviewList = reviewMode === 'due'
        ? dueReviews.map(r => ({ id: r.word, word: r.word_text, translation: r.translation }))
        : words;
    const currentWord = reviewList[currentIndex];

    return (
        <div style={page}>
            <Navbar />
            {toast && <div style={toastStyle}>{toast}</div>}

            <main style={main}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                        <h1 style={pageTitle}>📚 Lug'at</h1>
                        <p style={pageSub}>{words.length} ta so'z saqlangan</p>
                    </div>
                    <button onClick={() => setShowModal(true)} style={btnPrimary}>➕ So'z qo'shish</button>
                </div>

                {/* Tabs */}
                <div style={tabRow}>
                    <button onClick={() => setTab('words')} style={{ ...tabBtn, ...(tab === 'words' ? tabActive : {}) }}>
                        📖 Barcha so'zlar ({words.length})
                    </button>
                    <button onClick={() => setTab('review')} style={{ ...tabBtn, ...(tab === 'review' ? tabActive : {}) }}>
                        🔄 Flashcard
                        {dueReviews.length > 0 && <span style={badge}>{dueReviews.length}</span>}
                    </button>
                </div>

                {/* ── Words tab ── */}
                {tab === 'words' && (
                    <>
                        <input style={{ ...inputStyle, marginBottom: '16px' }} placeholder="🔍 So'z yoki tarjima bo'yicha qidirish..." value={search} onChange={e => setSearch(e.target.value)} />
                        {loading ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {[1,2,3,4,5].map(i => <Skeleton key={i} height="70px" />)}
                            </div>
                        ) : filteredWords.length === 0 ? (
                            <div style={emptyBox}>
                                <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
                                <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '6px' }}>
                                    {search ? "Topilmadi" : "Hali so'z yo'q"}
                                </div>
                                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                                    {search ? "Boshqa so'z bilan qidiring" : "\"So'z qo'shish\" tugmasini bosing"}
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {filteredWords.map(w => (
                                    <div key={w.id} style={wordCard}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                                                <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>{w.word}</span>
                                                <span style={{ fontSize: '13px', color: 'var(--accent)' }}>— {w.translation}</span>
                                            </div>
                                            {w.example && (
                                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>"{w.example}"</div>
                                            )}
                                        </div>
                                        <button onClick={() => handleDelete(w.id)} disabled={deletingId === w.id} style={deleteBtn} title="O'chirish">
                                            {deletingId === w.id ? '...' : '🗑️'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* ── Flashcard tab ── */}
                {tab === 'review' && (
                    <>
                        {loading ? (
                            <Skeleton height="300px" />
                        ) : reviewDone ? (
                            <div style={emptyBox}>
                                <div style={{ fontSize: '40px', marginBottom: '12px' }}>✅</div>
                                <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '6px' }}>
                                    {reviewList.length} ta so'z takrorlandi!
                                </div>
                                <div style={{ display: 'flex', gap: '10px', marginTop: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                    <button onClick={resetReview} style={btnSecondary}>🔄 Qaytadan</button>
                                    <button onClick={() => { startReview('all'); }} style={btnPrimary}>📖 Hammasini takrorla</button>
                                </div>
                            </div>
                        ) : currentWord ? (
                            <Flashcard
                                wordObj={currentWord}
                                onRate={handleRate}
                                onSkip={handleSkip}
                                current={currentIndex + 1}
                                total={reviewList.length}
                            />
                        ) : (

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {/* Due words */}
                                <div style={{ ...reviewOptionCard, borderColor: dueReviews.length > 0 ? 'var(--accent)' : 'var(--border)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                        <div>
                                            <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>
                                                🔔 Bugungi takrorlash
                                            </div>
                                            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                                                SM-2 algoritmi bo'yicha takrorlash vaqti kelgan so'zlar
                                            </div>
                                        </div>
                                        <span style={{ fontSize: '28px', fontWeight: '800', color: dueReviews.length > 0 ? 'var(--accent)' : 'var(--text-muted)' }}>
                                            {dueReviews.length}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => startReview('due')}
                                        disabled={dueReviews.length === 0}
                                        style={{ ...btnPrimary, width: '100%', opacity: dueReviews.length === 0 ? 0.5 : 1, cursor: dueReviews.length === 0 ? 'not-allowed' : 'pointer' }}
                                    >
                                        {dueReviews.length === 0 ? 'Hozircha tayyor so\'z yo\'q' : `Boshlash (${dueReviews.length} ta)`}
                                    </button>
                                </div>

                                {/* All words */}
                                <div style={reviewOptionCard}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                        <div>
                                            <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>
                                                📖 Barcha so'zlarni takrorlash
                                            </div>
                                            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                                                Lug'atdagi barcha so'zlarni flashcard sifatida o'rganish
                                            </div>
                                        </div>
                                        <span style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)' }}>
                                            {words.length}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => startReview('all')}
                                        disabled={words.length === 0}
                                        style={{ ...btnSecondary, width: '100%', opacity: words.length === 0 ? 0.5 : 1 }}
                                    >
                                        {words.length === 0 ? "Hali so'z yo'q" : `Hammasini takrorla (${words.length} ta)`}
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>

            {showModal && <AddWordModal onClose={() => setShowModal(false)} onAdd={handleAddWord} />}
        </div>
    );
}

const page = { minHeight: '100vh', backgroundColor: 'var(--bg-base)' };
const main = { maxWidth: '800px', margin: '0 auto', padding: '40px 24px 60px' };
const pageTitle = { fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' };
const pageSub = { fontSize: '14px', color: 'var(--text-secondary)' };

const tabRow = { display: 'flex', gap: '8px', marginBottom: '20px' };
const tabBtn = { padding: '9px 18px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'transparent', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500', cursor: 'pointer', fontFamily: 'Sora, sans-serif', display: 'flex', alignItems: 'center', gap: '6px' };
const tabActive = { backgroundColor: 'var(--accent)', borderColor: 'var(--accent)', color: 'white' };
const badge = { backgroundColor: '#ef4444', color: 'white', borderRadius: '20px', padding: '1px 7px', fontSize: '11px', fontWeight: '700' };

const wordCard = { backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px' };
const deleteBtn = { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '4px', borderRadius: '6px', flexShrink: 0 };
const emptyBox = { backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '48px 24px', textAlign: 'center' };

const reviewOptionCard = { backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' };

const flashcardWrap = { display: 'flex', flexDirection: 'column', alignItems: 'center' };
const flashcard = { backgroundColor: 'var(--bg-card)', border: '2px solid var(--accent)', borderRadius: '16px', padding: '48px 32px', width: '100%', maxWidth: '480px', minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxSizing: 'border-box', boxShadow: '0 0 24px rgba(99,102,241,0.3)', transition: 'box-shadow 0.2s' };
const rateBtn = { padding: '10px 16px', borderRadius: '8px', border: '1px solid', backgroundColor: 'transparent', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Sora, sans-serif' };
const skipBtn = { marginTop: '16px', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '13px', cursor: 'pointer', fontFamily: 'Sora, sans-serif' };

const miniProgressWrap = { flex: 1, height: '4px', backgroundColor: 'var(--border)', borderRadius: '4px', overflow: 'hidden', marginLeft: '12px' };
const miniProgressFill = { height: '100%', backgroundColor: 'var(--accent)', borderRadius: '4px', transition: 'width 0.3s' };

const inputStyle = { width: '100%', padding: '10px 14px', backgroundColor: 'var(--bg-page)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '14px', fontFamily: 'Sora, sans-serif', boxSizing: 'border-box', outline: 'none' };
const inputLabel = { display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' };

const btnPrimary = { padding: '10px 20px', backgroundColor: 'var(--accent)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Sora, sans-serif' };
const btnSecondary = { padding: '10px 20px', backgroundColor: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Sora, sans-serif' };

const modalOverlay = { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' };
const modalBox = { backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '440px' };
const closeBtn = { background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '18px', cursor: 'pointer', padding: '4px' };
const errorBox = { backgroundColor: '#7f1d1d', border: '1px solid #ef4444', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#fca5a5', marginBottom: '14px' };
const toastStyle = { position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 24px', fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', zIndex: 2000, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' };