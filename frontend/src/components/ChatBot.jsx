import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/api';

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Hi! 👋 I'm LearnBot, your AI educational tutor. Ask me anything about programming, technology, and academics!" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setLoading(true);

        try {
            const response = await api.post('/chat/message', {
                message: userMessage,
                sessionId
            });

            if (response.data.success) {
                setSessionId(response.data.data.sessionId);
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: response.data.data.message
                }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "Sorry, I'm having trouble connecting. Please try again! 🔄"
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const quickQuestions = [
        "Explain async/await",
        "What is React?",
        "How to learn Python?",
        "Explain data structures"
    ];

    return (
        <>
            {/* Chat Toggle Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="fixed right-4 bottom-4 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
                style={{
                    background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                    boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)'
                }}
            >
                <span className="text-2xl">{isOpen ? '✕' : '🤖'}</span>
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="fixed right-4 bottom-20 w-96 h-[500px] z-50 rounded-2xl overflow-hidden flex flex-col"
                        style={{
                            background: 'rgba(15, 23, 42, 0.98)',
                            backdropFilter: 'blur(16px)',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
                        }}
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-gray-700" style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)' }}>
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">🤖</span>
                                <div>
                                    <h3 className="text-white font-bold">LearnBot</h3>
                                    <p className="text-emerald-100 text-xs">Educational AI Tutor</p>
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((msg, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] p-3 rounded-2xl ${msg.role === 'user'
                                                ? 'bg-indigo-600 text-white rounded-br-sm'
                                                : 'bg-gray-700 text-gray-100 rounded-bl-sm'
                                            }`}
                                    >
                                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                    </div>
                                </motion.div>
                            ))}

                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-gray-700 p-3 rounded-2xl rounded-bl-sm">
                                        <div className="flex gap-1">
                                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick Questions */}
                        {messages.length <= 1 && (
                            <div className="px-4 pb-2 flex flex-wrap gap-2">
                                {quickQuestions.map((q, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => { setInput(q); }}
                                        className="text-xs px-3 py-1.5 rounded-full bg-gray-700 text-gray-300 hover:bg-gray-600 transition"
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Input */}
                        <div className="p-4 border-t border-gray-700">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Ask about programming, tech, academics..."
                                    className="flex-1 p-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                                    disabled={loading}
                                />
                                <motion.button
                                    onClick={sendMessage}
                                    disabled={loading || !input.trim()}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-4 rounded-xl text-white disabled:opacity-50"
                                    style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)' }}
                                >
                                    ➤
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ChatBot;
