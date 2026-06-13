import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Skeleton from '../components/Skeleton';
import { vocabularyAPI } from '../services/api';
import { useLang, translations } from '../context/LanguageContext';

/* ── CSS injected once ── */
const FLIP_CSS = `
@keyframes fc-shine {
    0%   { transform: translateX(-100%) skewX(-15deg); }
    100% { transform: translateX(250%)  skewX(-15deg); }
}
.fc-scene {
    width: 100%;
    max-width: 500px;
    min-height: 300px;
    perspective: 1400px;
    cursor: pointer;
}
.fc-inner {
    width: 100%;
    height: 300px;
    position: relative;
    transform-style: preserve-3d;
    transition: transform 0.65s cubic-bezier(0.4, 0.2, 0.2, 1);
    border-radius: 24px;
}
.fc-inner.flipped {
    transform: rotateY(180deg);
}
.fc-face {
    position: absolute;
    inset: 0;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    border-radius: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 36px 32px;
    box-sizing: border-box;
    overflow: hidden;
}
.fc-front {
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #1e1b4b 100%);
    border: 2px solid rgba(99,102,241,0.35);
    box-shadow: 0 20px 60px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.07);
}
.fc-front::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at 30% 20%, rgba(99,102,241,0.18) 0%, transparent 60%);
    border-radius: 24px;
    pointer-events: none;
}
.fc-front::after {
    content: '';
    position: absolute;
    top: 0; left: -60%;
    width: 40%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent);
    animation: fc-shine 3.5s ease-in-out infinite;
    border-radius: 24px;
    pointer-events: none;
}
.fc-back {
    background: linear-gradient(135deg, #0d4f3c 0%, #064e3b 50%, #065f46 100%);
    border: 2px solid rgba(16,185,129,0.4);
    box-shadow: 0 20px 60px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.07);
    transform: rotateY(180deg);
}
.fc-back::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at 70% 80%, rgba(16,185,129,0.2) 0%, transparent 60%);
    border-radius: 24px;
    pointer-events: none;
}
.fc-scene:hover .fc-inner:not(.flipped) {
    transform: rotateY(6deg) translateY(-4px);
}
.fc-scene:hover .fc-inner.flipped {
    transform: rotateY(186deg) translateY(-4px);
}
.rate-btn {
    padding: 10px 16px;
    border-radius: 12px;
    border: 2px solid;
    background: transparent;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    transition: all 0.18s ease;
    min-width: 72px;
}
.rate-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.25);
}
.skip-btn {
    margin-top: 20px;
    padding: 9px 22px;
    background: transparent;
    border: 1px solid var(--border);
    border-radius: 10px;
    color: var(--text-muted);
    font-size: 13px;
    cursor: pointer;
    transition: all 0.18s ease;
}
.skip-btn:hover {
    border-color: var(--text-secondary);
    color: var(--text-secondary);
}
.progress-bar-wrap {
    flex: 1;
    height: 6px;
    background: var(--border);
    border-radius: 99px;
    overflow: hidden;
    margin-left: 12px;
}
.progress-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, #6366f1, #8b5cf6);
    border-radius: 99px;
    transition: width 0.4s ease;
}
`;

function injectCSS() {
    if (document.getElementById('fc-styles')) return;
    const el = document.createElement('style');
    el.id = 'fc-styles';
    el.textContent = FLIP_CSS;
    document.head.appendChild(el);
}

function Flashcard({ wordObj, onRate, onSkip, current, total, t }) {
    const [flipped, setFlipped] = useState(false);

    useEffect(() => { injectCSS(); }, []);
    useEffect(() => { setFlipped(false); }, [wordObj?.id]);

    const qualityLabels = [
        { q: 0, label: t.rateUnknown,  color: '#ef4444', emoji: '😞' },
        { q: 1, label: t.rateHard,     color: '#f59e0b', emoji: '😐' },
        { q: 2, label: t.rateRemember, color: '#3b82f6', emoji: '🙂' },
        { q: 3, label: t.rateEasy,     color: '#10b981', emoji: '😊' },
    ];

    const progress = ((current - 1) / total) * 100;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>

            {/* Counter + progress */}
            <div style={{ display: 'flex', alignItems: 'center', width: '100%', maxWidth: '500px', marginBottom: '20px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '700', whiteSpace: 'nowrap' }}>
                    {current} / {total}
                </span>
                <div className="progress-bar-wrap">
                    <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                </div>
            </div>

            {/* Hint badge */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)',
                backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: '999px', padding: '5px 14px', marginBottom: '18px',
                textTransform: 'uppercase', letterSpacing: '0.06em'
            }}>
                <span>{flipped ? '🤔' : '👆'}</span>
                {flipped ? t.howWell : t.flipCard}
            </div>

            {/* 3D Card */}
            <div className="fc-scene" onClick={() => setFlipped(f => !f)}>
                <div className={`fc-inner${flipped ? ' flipped' : ''}`}>

                    {/* FRONT — English word */}
                    <div className="fc-face fc-front">
                        {wordObj.topic && (
                            <div style={{
                                position: 'absolute', top: '18px', left: '20px',
                                fontSize: '10px', fontWeight: '700', letterSpacing: '0.1em',
                                textTransform: 'uppercase', color: 'rgba(165,180,252,0.7)',
                                background: 'rgba(99,102,241,0.15)',
                                border: '1px solid rgba(99,102,241,0.25)',
                                borderRadius: '6px', padding: '3px 10px'
                            }}>
                                {wordObj.topic}
                            </div>
                        )}

                        {/* decorative circles */}
                        <div style={{
                            position: 'absolute', width: '160px', height: '160px',
                            borderRadius: '50%', border: '1px solid rgba(99,102,241,0.12)',
                            top: '-40px', right: '-40px', pointerEvents: 'none'
                        }} />
                        <div style={{
                            position: 'absolute', width: '100px', height: '100px',
                            borderRadius: '50%', border: '1px solid rgba(99,102,241,0.08)',
                            bottom: '-20px', left: '-20px', pointerEvents: 'none'
                        }} />

                        <div style={{ textAlign: 'center', zIndex: 1 }}>
                            <div style={{
                                fontSize: '42px', fontWeight: '800',
                                color: '#fff',
                                letterSpacing: '-0.02em',
                                lineHeight: 1.1,
                                marginBottom: '14px',
                                textShadow: '0 0 40px rgba(165,180,252,0.3)'
                            }}>
                                {wordObj.word}
                            </div>
                            <div style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                fontSize: '13px', color: 'rgba(165,180,252,0.6)', fontWeight: '500'
                            }}>
                                <span style={{ fontSize: '16px', animation: 'none' }}>↻</span>
                                {t.clickToFlip}
                            </div>
                        </div>
                    </div>

                    {/* BACK — Uzbek translation */}
                    <div className="fc-face fc-back">
                        {/* decorative circles */}
                        <div style={{
                            position: 'absolute', width: '180px', height: '180px',
                            borderRadius: '50%', border: '1px solid rgba(16,185,129,0.12)',
                            top: '-50px', left: '-50px', pointerEvents: 'none'
                        }} />
                        <div style={{
                            position: 'absolute', width: '110px', height: '110px',
                            borderRadius: '50%', border: '1px solid rgba(16,185,129,0.08)',
                            bottom: '-20px', right: '-20px', pointerEvents: 'none'
                        }} />

                        <div style={{ textAlign: 'center', zIndex: 1, width: '100%' }}>
                            <div style={{
                                fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em',
                                textTransform: 'uppercase', color: 'rgba(52,211,153,0.7)',
                                marginBottom: '10px'
                            }}>
                                {t.translation}
                            </div>
                            <div style={{
                                fontSize: '38px', fontWeight: '800',
                                color: '#fff',
                                letterSpacing: '-0.02em',
                                lineHeight: 1.15,
                                marginBottom: '16px',
                                textShadow: '0 0 40px rgba(52,211,153,0.25)'
                            }}>
                                {wordObj.translation}
                            </div>
                            {wordObj.example && (
                                <div style={{
                                    fontSize: '13px', color: 'rgba(167,243,208,0.65)',
                                    fontStyle: 'italic', lineHeight: 1.5,
                                    borderTop: '1px solid rgba(16,185,129,0.2)',
                                    paddingTop: '12px', marginTop: '4px',
                                    maxWidth: '340px'
                                }}>
                                    "{wordObj.example}"
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Rating buttons — shown after flip */}
            {flipped && (
                <div style={{
                    display: 'flex', gap: '10px', marginTop: '24px',
                    flexWrap: 'wrap', justifyContent: 'center'
                }}>
                    {qualityLabels.map(({ q, label, color, emoji }) => (
                        <button
                            key={q}
                            className="rate-btn"
                            onClick={() => onRate(wordObj, q)}
                            style={{ borderColor: color, color }}
                            onMouseEnter={e => {
                                e.currentTarget.style.backgroundColor = color;
                                e.currentTarget.style.color = '#fff';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = color;
                            }}
                        >
                            <span style={{ fontSize: '22px' }}>{emoji}</span>
                            <span>{label}</span>
                        </button>
                    ))}
                </div>
            )}

            <button className="skip-btn" onClick={onSkip}>{t.skipCard} →</button>
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
                if (topicCount[topic] !== undefined) { topicCount[topic]++; } else { topicCount[topic] = 1; }
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
        console.log("Backend qaytargan so'z:", newWord);
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
        // due bo'sh bo'lsa 'all' modega o'tish
        const effectiveMode = (mode === 'due' && dueReviews.length === 0) ? 'all' : mode;
        setReviewMode(effectiveMode);
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
                        <div style={statLabel}>O'rganilgan so'zlar</div>
                    </div>
                    <div style={statCard}>
                        <div style={statValue}>{stats.forgotten}</div>
                        <div style={statLabel}>Takrorlash kerak</div>
                    </div>
                    <div style={statCard}>
                        <div style={statValue}>{words.length}</div>
                        <div style={statLabel}>Jami so'zlar</div>
                    </div>
                </div>

                {/* Mavzular */}
                <div style={{ marginBottom: '32px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                        Mavzular bo'yicha lug'at
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
                            <div style={{
                                backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)',
                                borderRadius: '16px', padding: '48px 32px', textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🃏</div>
                                <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
                                    Flashcard rejimiga xush kelibsiz!
                                </div>
                                <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '32px' }}>
                                    {words.length} ta so'z mavjud. Qaysi rejimdan boshlaysiz?
                                </div>
                                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                    <button
                                        onClick={() => startReview('due')}
                                        style={{ ...btnPrimary, opacity: dueReviews.length === 0 ? 0.5 : 1 }}
                                    >
                                        📅 Bugungi takrorlash
                                        {dueReviews.length > 0 && (
                                            <span style={{
                                                marginLeft: '8px', backgroundColor: 'rgba(255,255,255,0.25)',
                                                borderRadius: '99px', padding: '1px 8px', fontSize: '12px'
                                            }}>{dueReviews.length}</span>
                                        )}
                                    </button>
                                    <button onClick={() => startReview('all')} style={btnSecondary}>
                                        📚 Barcha so'zlar ({words.length})
                                    </button>
                                </div>
                                {dueReviews.length === 0 && (
                                    <div style={{ marginTop: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
                                        ✅ Bugun takrorlanadigan so'z yo'q — barcha so'zlarni ko'rib chiqishingiz mumkin
                                    </div>
                                )}
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
const topicProgressFill = { height: '100%', background: 'linear-gradient(90deg, #3b82f6, #60a5fa)', borderRadius: '4px' };

const tabRow = { display: 'flex', gap: '8px', margin: '24px 0' };
const tabBtn = { padding: '10px 20px', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontWeight: '500', cursor: 'pointer' };
const tabActive = { backgroundColor: 'var(--accent)', color: 'white', borderColor: 'var(--accent)' };

const wordCard = { backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const deleteBtn = { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#f87171' };
const emptyBox = { backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '60px 20px', textAlign: 'center' };

const toastStyle = {
    position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
    backgroundColor: '#1e293b', color: '#fff', padding: '12px 24px',
    borderRadius: '10px', fontSize: '14px', zIndex: 9999,
    border: '1px solid rgba(255,255,255,0.1)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
};

const btnPrimary = {
    padding: '10px 22px', backgroundColor: 'var(--accent)', color: 'white',
    border: 'none', borderRadius: '10px', fontWeight: '600', fontSize: '14px',
    cursor: 'pointer'
};
const btnSecondary = {
    padding: '10px 22px', backgroundColor: 'var(--bg-card)', color: 'var(--text-secondary)',
    border: '1px solid var(--border)', borderRadius: '10px', fontWeight: '600',
    fontSize: '14px', cursor: 'pointer'
};

const modalOverlay = {
    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
};
const modalBox = {
    backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '420px'
};
const closeBtn = {
    background: 'none', border: 'none', fontSize: '18px',
    color: 'var(--text-muted)', cursor: 'pointer'
};
const inputLabel = { fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' };
const inputStyle = {
    width: '100%', padding: '10px 14px', backgroundColor: 'var(--bg-base)',
    border: '1px solid var(--border)', borderRadius: '8px',
    color: 'var(--text-primary)', fontSize: '14px', boxSizing: 'border-box', resize: 'vertical'
};
const errorBox = {
    backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: '8px', padding: '10px 14px', fontSize: '13px',
    color: '#f87171', marginBottom: '16px'
};