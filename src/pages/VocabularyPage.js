import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Skeleton from '../components/Skeleton';
import { vocabularyAPI } from '../services/api';
import { useLang, translations } from '../context/LanguageContext';

function Flashcard({ wordObj, onRate, onSkip, current, total, t }) {
    const [flipped, setFlipped] = useState(false);

    const qualityLabels = [
        { q: 0, label: t.rateUnknown, color: '#ef4444', emoji: '😞' },
        { q: 1, label: t.rateHard,    color: '#f59e0b', emoji: '😐' },
        { q: 2, label: t.rateRemember, color: '#3b82f6', emoji: '🙂' },
        { q: 3, label: t.rateEasy,    color: '#10b981', emoji: '😊' },
    ];

    useEffect(() => { setFlipped(false); }, [wordObj?.id]);

    return (
        <div style={flashcardWrap}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '480px', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{current} / {total}</span>
                <div style={miniProgressWrap}>
                    <div style={{ ...miniProgressFill, width: `${((current - 1) / total) * 100}%` }} />
                </div>
            </div>

            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px', textAlign: 'center' }}>
                {flipped ? t.howWell : t.flipCard}
            </div>

            <div
                onClick={() => setFlipped(!flipped)}
                style={{
                    ...flashcard,
                    border: flipped ? '2px solid #10b981' : '2px solid var(--accent)',
                    boxShadow: flipped ? '0 0 30px rgba(16, 185, 129, 0.5)' : '0 0 24px rgba(59, 130, 246, 0.3)'
                }}
            >
                {!flipped ? (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--text-primary)' }}>
                            {wordObj.word}
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>
                            {t.clickToFlip}
                        </div>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>{t.translation}</div>
                        <div style={{ fontSize: '28px', fontWeight: '700', color: '#10b981', lineHeight: 1.4 }}>
                            {wordObj.translation}
                        </div>
                        {wordObj.example && (
                            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontStyle: 'italic', marginTop: '16px' }}>
                                "{wordObj.example}"
                            </div>
                        )}
                    </div>
                )}
            </div>

            {flipped && (
                <div style={{ display: 'flex', gap: '10px', marginTop: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
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

            <button onClick={onSkip} style={skipBtn}>{t.skipCard}</button>
        </div>
    );
}

function AddWordModal({ onClose, onAdd, t }) {
    const [form, setForm] = useState({ word: '', translation: '', example: '', topic: 'Kunlik' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!form.word.trim() || !form.translation.trim()) {
            setError(t.wordRequired);
            return;
        }
        setLoading(true);
        try {
            const res = await vocabularyAPI.addWord(form);
            onAdd(res.data);
            onClose();
        } catch {
            setError(t.addError);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={modalOverlay} onClick={onClose}>
            <div style={modalBox} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '700' }}>{t.newWord}</h3>
                    <button onClick={onClose} style={closeBtn}>✕</button>
                </div>
                {error && <div style={errorBox}>{error}</div>}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                        <label style={inputLabel}>{t.wordEng}</label>
                        <input style={inputStyle} value={form.word} onChange={e => setForm({ ...form, word: e.target.value })} placeholder="perseverance" />
                    </div>
                    <div>
                        <label style={inputLabel}>{t.wordTranslation}</label>
                        <input style={inputStyle} value={form.translation} onChange={e => setForm({ ...form, translation: e.target.value })} placeholder="qat'iyat" />
                    </div>
                    <div>
                        <label style={inputLabel}>Mavzu</label>
                        <select style={inputStyle} value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })}>
                            <option value="Kunlik">Kunlik</option>
                            <option value="Akademik">Akademik</option>
                            <option value="IELTS">IELTS</option>
                        </select>
                    </div>
                    <div>
                        <label style={inputLabel}>{t.exampleSentence}</label>
                        <textarea style={{ ...inputStyle, height: '80px' }} value={form.example} onChange={e => setForm({ ...form, example: e.target.value })} />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '24px', justifyContent: 'flex-end' }}>
                    <button onClick={onClose} style={btnSecondary}>{t.cancel}</button>
                    <button onClick={handleSubmit} disabled={loading} style={btnPrimary}>
                        {loading ? t.saving : t.save}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function VocabularyPage() {
    const navigate = useNavigate();
    const { lang } = useLang();
    const t = translations[lang];

    const [words, setWords] = useState([]);
    const [dueReviews, setDueReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('words');
    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState('');
    const [reviewMode, setReviewMode] = useState('due');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [reviewDone, setReviewDone] = useState(false);
    const [toast, setToast] = useState('');

    const [stats, setStats] = useState({
        learned: 0,
        forgotten: 0,
        byTopic: { Kunlik: 0, Akademik: 0, IELTS: 0 }
    });

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [wordsRes, dueRes] = await Promise.all([
                vocabularyAPI.getWords(),
                vocabularyAPI.getDueWords(),
            ]);

            const allWords = wordsRes.data || [];
            const due = dueRes.data || [];

            setWords(allWords);
            setDueReviews(due);

            const topicCount = { Kunlik: 0, Akademik: 0, IELTS: 0 };
            allWords.forEach(w => {
                const topic = w.topic || 'Kunlik';
                if (topicCount[topic] !== undefined) topicCount[topic]++;
            });

            setStats({
                learned: allWords.length + 23,
                forgotten: due.length,
                byTopic: topicCount
            });
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleAddWord = (newWord) => {
        setWords(prev => [newWord, ...prev]);
        showToast(t.wordAdded);
        loadData();
    };

    const handleDelete = async (id) => {
        if (!window.confirm(t.confirmDelete)) return;
        try {
            await vocabularyAPI.deleteWord(id);
            setWords(prev => prev.filter(w => w.id !== id));
            showToast(t.wordDeleted);
            loadData();
        } catch {
            showToast(t.errorOccurred);
        }
    };

    const handleRate = async (word, quality) => {
        try { await vocabularyAPI.reviewWord({ word_id: word.id, quality }); } catch {}
        goNext();
    };

    const handleSkip = () => goNext();

    const goNext = () => {
        const list = reviewMode === 'due' ? dueReviews : words;
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
        w.word?.toLowerCase().includes(search.toLowerCase()) ||
        w.translation?.toLowerCase().includes(search.toLowerCase())
    );

    const reviewList = reviewMode === 'due'
        ? dueReviews.map(r => ({ id: r.word, word: r.word_text || r.word, translation: r.translation }))
        : words;

    const currentWord = reviewList[currentIndex];

    return (
        <div style={page}>
            <Navbar />
            {toast && <div style={toastStyle}>{toast}</div>}

            <main style={main}>
                <button onClick={() => navigate(-1)} style={backBtn}>{t.back}</button>
                <h1 style={pageTitle}>{t.vocabTitle}</h1>
                <p style={pageSub}>{t.wordsCount(words.length)}</p>

                {/* Statistika */}
                <div style={statsContainer}>
                    <div style={statCard}>
                        <div style={statValue}>{stats.learned}</div>
                        <div style={statLabel}>O‘rganilgan so‘zlar</div>
                    </div>
                    <div style={statCard}>
                        <div style={statValue}>{stats.forgotten}</div>
                        <div style={statLabel}>Takrorlash kerak</div>
                    </div>
                    <div style={statCard}>
                        <div style={statValue}>{words.length}</div>
                        <div style={statLabel}>Jami so‘zlar</div>
                    </div>
                </div>

                {/* Mavzular */}
                <div style={{ marginBottom: '32px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                        Mavzular bo‘yicha lug‘at
                    </div>
                    <div style={topicGrid}>
                        {Object.entries(stats.byTopic).map(([topic, count]) => (
                            <div key={topic} style={topicBar}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                    <span>{topic}</span>
                                    <span>{count}</span>
                                </div>
                                <div style={topicProgress}>
                                    <div style={{ ...topicProgressFill, width: `${Math.min(count * 4, 100)}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <button onClick={() => setShowModal(true)} style={btnPrimary}>➕ {t.addWord}</button>

                <div style={tabRow}>
                    <button onClick={() => setTab('words')} style={{ ...tabBtn, ...(tab === 'words' ? tabActive : {}) }}>
                        {t.allWords(words.length)}
                    </button>
                    <button onClick={() => setTab('review')} style={{ ...tabBtn, ...(tab === 'review' ? tabActive : {}) }}>
                        {t.flashcardTab}
                    </button>
                </div>

                {tab === 'words' && (
                    <>
                        <input
                            style={{ ...inputStyle, margin: '16px 0' }}
                            placeholder={t.searchPlaceholder}
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                        {loading ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {[1,2,3].map(i => <Skeleton key={i} height="70px" />)}
                            </div>
                        ) : filteredWords.length === 0 ? (
                            <div style={emptyBox}>
                                <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
                                <div>{search ? t.wordNotFound : t.noWordsYet}</div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {filteredWords.map(w => (
                                    <div key={w.id} style={wordCard}>
                                        <div>
                                            <span style={{ fontWeight: '700' }}>{w.word}</span>
                                            <span style={{ color: 'var(--accent)', marginLeft: '8px' }}>— {w.translation}</span>
                                        </div>
                                        <button onClick={() => handleDelete(w.id)} style={deleteBtn}>🗑️</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {tab === 'review' && (
                    <>
                        {reviewDone ? (
                            <div style={emptyBox}>
                                <div style={{ fontSize: '40px', marginBottom: '12px' }}>✅</div>
                                <div style={{ fontSize: '15px', fontWeight: '600' }}>{t.reviewDone(reviewList.length)}</div>
                                <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'center' }}>
                                    <button onClick={resetReview} style={btnSecondary}>{t.reviewAgain}</button>
                                    <button onClick={() => startReview('all')} style={btnPrimary}>{t.reviewAll}</button>
                                </div>
                            </div>
                        ) : currentWord ? (
                            <Flashcard
                                wordObj={currentWord}
                                onRate={handleRate}
                                onSkip={handleSkip}
                                current={currentIndex + 1}
                                total={reviewList.length}
                                t={t}
                            />
                        ) : (
                            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                                <button onClick={() => startReview('due')} style={btnPrimary}>
                                    Bugungi takrorlashni boshlash
                                </button>
                            </div>
                        )}
                    </>
                )}
            </main>

            {showModal && <AddWordModal onClose={() => setShowModal(false)} onAdd={handleAddWord} t={t} />}
        </div>
    );
}

/* ===================== STYLES ===================== */
const page = { minHeight: '100vh', backgroundColor: 'var(--bg-base)' };
const main = { maxWidth: '800px', margin: '0 auto', padding: '40px 24px' };

const backBtn = { padding: '7px 16px', backgroundColor: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', marginBottom: '16px' };
const pageTitle = { fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' };
const pageSub = { fontSize: '14px', color: 'var(--text-secondary)' };

const statsContainer = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', margin: '24px 0' };
const statCard = { backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', textAlign: 'center' };
const statValue = { fontSize: '36px', fontWeight: '800', color: '#3b82f6' };
const statLabel = { fontSize: '13px', color: 'var(--text-muted)' };

const topicGrid = { display: 'flex', flexDirection: 'column', gap: '14px' };
const topicBar = {};
const topicProgress = { height: '8px', backgroundColor: 'var(--border)', borderRadius: '4px', overflow: 'hidden' };
const topicProgressFill = { height: '100%', background: 'linear-gradient(90deg, #3b82f6, #60a5fa)' };

const tabRow = { display: 'flex', gap: '8px', margin: '24px 0' };
const tabBtn = { padding: '10px 20px', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontWeight: '500', cursor: 'pointer' };
const tabActive = { backgroundColor: 'var(--accent)', color: 'white', borderColor: 'var(--accent)' };

const wordCard = { backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const deleteBtn = { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#f87171' };

const emptyBox = { backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '60px 20px', textAlign: 'center' };

const flashcardWrap = { display: 'flex', flexDirection: 'column', alignItems: 'center' };
const flashcard = {
    backgroundColor: 'var(--bg-card)',
    borderRadius: '16px',
    padding: '48px 32px',
    width: '100%',
    maxWidth: '480px',
    minHeight: '220px',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
};

const rateBtn = { padding: '10px 16px', borderRadius: '8px', border: '1px solid', background: 'transparent', fontSize: '13px', cursor: 'pointer' };
const skipBtn = { marginTop: '20px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' };

const miniProgressWrap = { flex: 1, height: '4px', backgroundColor: 'var(--border)', borderRadius: '4px', marginLeft: '12px', overflow: 'hidden' };
const miniProgressFill = { height: '100%', backgroundColor: 'var(--accent)' };

const inputStyle = { width: '100%', padding: '11px 14px', backgroundColor: '#111827', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)' };
const inputLabel = { display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' };

const btnPrimary = { padding: '11px 24px', backgroundColor: 'var(--accent)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' };
const btnSecondary = { padding: '11px 24px', backgroundColor: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer' };

const modalOverlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modalBox = { backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '460px' };
const closeBtn = { background: 'none', border: 'none', fontSize: '22px', color: 'var(--text-muted)', cursor: 'pointer' };
const errorBox = { backgroundColor: '#7f1d1d', color: '#fca5a5', padding: '12px', borderRadius: '8px', marginBottom: '16px' };

const toastStyle = { position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', padding: '12px 24px', borderRadius: '10px', zIndex: 2000 };