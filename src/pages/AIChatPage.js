import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { aiAPI } from '../services/api';
import { useLang, translations } from '../context/LanguageContext';

function AIChatPage() {
    const navigate = useNavigate();
    const { lang } = useLang();
    const t = translations[lang];

    const getInitialMessage = () => ({
        role: 'assistant',
        content: t.aiWelcome,
    });

    const getQuickPrompts = () => [
        t.aiQuick1,
        t.aiQuick2,
        t.aiQuick3,
        t.aiQuick4,
    ];

    const [messages, setMessages] = useState([getInitialMessage()]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef(null);

    // Update welcome message when language changes
    useEffect(() => {
        setMessages(prev => {
            if (prev.length === 1 && prev[0].role === 'assistant') {
                return [getInitialMessage()];
            }
            return prev;
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lang]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const sendMessage = async (text) => {
        const userText = (text || input).trim();
        if (!userText || loading) return;

        const newMessages = [...messages, { role: 'user', content: userText }];
        setMessages(newMessages);
        setInput('');
        setLoading(true);

        try {
            const res = await aiAPI.sendChat(
                newMessages.map(m => ({ role: m.role, content: m.content }))
            );
            setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
        } catch (err) {
            const serverError = err.response?.data?.error;
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: serverError || t.aiNetError,
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKey = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const handleClear = () => {
        setMessages([{ role: 'assistant', content: t.aiNewChat }]);
    };

    return (
        <div style={s.page}>
            <Navbar />
            <main style={s.main}>
                <div style={s.layout}>

                    <div style={s.sidebar}>
                        <div style={s.sideTitle}>{t.aiQuickTitle}</div>
                        {getQuickPrompts().map((q, i) => (
                            <button
                                key={i}
                                onClick={() => sendMessage(q)}
                                disabled={loading}
                                style={{ ...s.quickBtn, opacity: loading ? 0.6 : 1 }}
                            >
                                {q}
                            </button>
                        ))}
                        <div style={s.sideInfo}>
                            <div style={s.sideInfoTitle}>{t.aiInfoTitle}</div>
                            <p style={s.sideInfoText}>{t.aiInfoText}</p>
                        </div>
                    </div>

                    <div style={s.chatWrap}>
                        <div style={s.chatHeader}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <button onClick={() => navigate(-1)} style={s.backBtn}>{t.back}</button>
                                <div style={s.chatTitle}>{t.aiChatTitle}</div>
                            </div>
                            <button onClick={handleClear} style={s.clearBtn}>
                                {t.aiClearBtn}
                            </button>
                        </div>

                        <div style={s.messages}>
                            {messages.map((m, i) => (
                                <div key={i} style={m.role === 'user' ? s.userRow : s.aiRow}>
                                    {m.role === 'assistant' && <div style={s.aiAvatar}>🤖</div>}
                                    <div style={m.role === 'user' ? s.userBubble : s.aiBubble}>
                                        {m.content.split('\n').map((line, j) => (
                                            <p key={j} style={j > 0 ? { marginTop: '6px' } : {}}>
                                                {line}
                                            </p>
                                        ))}
                                    </div>
                                    {m.role === 'user' && <div style={s.userAvatar}>👤</div>}
                                </div>
                            ))}

                            {loading && (
                                <div style={s.aiRow}>
                                    <div style={s.aiAvatar}>🤖</div>
                                    <div style={s.aiBubble}>
                                        <div style={s.typingDots}>
                                            <span style={s.dot1} />
                                            <span style={s.dot2} />
                                            <span style={s.dot3} />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={bottomRef} />
                        </div>

                        <div style={s.inputArea}>
                            <textarea
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={handleKey}
                                placeholder={t.aiPlaceholder}
                                style={s.textarea}
                                rows={2}
                                disabled={loading}
                            />
                            <button
                                onClick={() => sendMessage()}
                                disabled={loading || !input.trim()}
                                style={{ ...s.sendBtn, opacity: loading || !input.trim() ? 0.5 : 1 }}
                            >
                                {loading ? '⏳' : '➤'}
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <style>{`
                @keyframes bounce {
                    0%, 80%, 100% { transform: scale(0); }
                    40% { transform: scale(1); }
                }
            `}</style>
        </div>
    );
}

const s = {
    page: { minHeight: '100vh', backgroundColor: 'var(--bg-base)' },
    main: { maxWidth: '1200px', margin: '0 auto', padding: '24px' },
    layout: { display: 'grid', gridTemplateColumns: '240px 1fr', gap: '20px', height: 'calc(100vh - 120px)' },
    sidebar: {
        display: 'flex', flexDirection: 'column', gap: '10px',
        backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: '14px', padding: '18px', height: 'fit-content',
    },
    sideTitle: {
        fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px',
    },
    quickBtn: {
        padding: '10px 14px', backgroundColor: 'var(--bg-base)', border: '1px solid var(--border)',
        borderRadius: '8px', color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer',
        textAlign: 'left', fontFamily: 'Sora, sans-serif', transition: 'border-color 0.2s',
    },
    sideInfo: {
        marginTop: '12px', padding: '14px',
        backgroundColor: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: '10px',
    },
    sideInfoTitle: { fontSize: '13px', fontWeight: '600', color: 'var(--accent)', marginBottom: '6px' },
    sideInfoText: { fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.6' },
    backBtn: {
        padding: '6px 14px', backgroundColor: 'var(--bg-base)', color: 'var(--text-secondary)',
        border: '1px solid var(--border)', borderRadius: '7px', fontSize: '13px',
        fontWeight: '600', cursor: 'pointer', fontFamily: 'Sora, sans-serif', flexShrink: 0,
    },
    chatWrap: {
        display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden',
    },
    chatHeader: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 20px', borderBottom: '1px solid var(--border)',
        backgroundColor: 'rgba(59,130,246,0.04)',
    },
    chatTitle: { fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' },
    clearBtn: {
        background: 'none', border: '1px solid var(--border)', color: 'var(--text-muted)',
        fontSize: '12px', padding: '5px 12px', borderRadius: '6px', cursor: 'pointer',
        fontFamily: 'Sora, sans-serif',
    },
    messages: {
        flex: 1, overflowY: 'auto', padding: '20px',
        display: 'flex', flexDirection: 'column', gap: '16px',
    },
    userRow: { display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', gap: '10px' },
    aiRow: { display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-end', gap: '10px' },
    userBubble: {
        backgroundColor: 'var(--accent)', color: 'white', padding: '12px 16px',
        borderRadius: '16px 16px 4px 16px', fontSize: '14px', lineHeight: '1.6', maxWidth: '70%',
    },
    aiBubble: {
        backgroundColor: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--text-secondary)',
        padding: '12px 16px', borderRadius: '16px 16px 16px 4px', fontSize: '14px', lineHeight: '1.6', maxWidth: '75%',
    },
    userAvatar: {
        width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0,
    },
    aiAvatar: {
        width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(59,130,246,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0,
    },
    typingDots: { display: 'flex', gap: '4px', alignItems: 'center', height: '20px' },
    dot1: { width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--text-muted)', animation: 'bounce 1.4s infinite ease-in-out' },
    dot2: { width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--text-muted)', animation: 'bounce 1.4s infinite ease-in-out 0.16s' },
    dot3: { width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--text-muted)', animation: 'bounce 1.4s infinite ease-in-out 0.32s' },
    inputArea: {
        display: 'flex', gap: '12px', padding: '16px 20px',
        borderTop: '1px solid var(--border)', backgroundColor: 'var(--bg-card)',
    },
    textarea: {
        flex: 1, backgroundColor: 'var(--bg-base)', border: '1px solid var(--border)',
        borderRadius: '10px', padding: '12px 14px', color: 'var(--text-primary)',
        fontSize: '14px', fontFamily: 'Sora, sans-serif', resize: 'none', outline: 'none', lineHeight: '1.5',
    },
    sendBtn: {
        width: '48px', height: '48px', borderRadius: '10px', backgroundColor: 'var(--accent)',
        color: 'white', border: 'none', fontSize: '18px', cursor: 'pointer', flexShrink: 0, alignSelf: 'flex-end',
    },
};

export default AIChatPage;