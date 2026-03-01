import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { getCoachingResponse } from '../../services/aiService';
import { Send, User, Award, Zap, Brain, Activity, Utensils, Calendar, Trash2 } from 'lucide-react';

const CHAT_STORAGE_KEY = 'brizai_chat_history';

// Convert markdown to clean plain text
const cleanMarkdown = (text) => {
    if (!text) return '';

    return text
        // Remove bold markers **text** or __text__
        .replace(/\*\*(.+?)\*\*/g, '$1')
        .replace(/__(.+?)__/g, '$1')
        // Remove italic markers *text* or _text_
        .replace(/\*(.+?)\*/g, '$1')
        .replace(/_(.+?)_/g, '$1')
        // Remove headers # ## ### etc
        .replace(/^#{1,6}\s+/gm, '')
        // Remove bullet points - or * at start of lines
        .replace(/^\s*[-*]\s+/gm, '• ')
        // Remove numbered list formatting but keep numbers
        .replace(/^\s*(\d+)\.\s+/gm, '$1. ')
        // Remove code blocks ```text```
        .replace(/```[\s\S]*?```/g, (match) => match.replace(/```/g, '').trim())
        // Remove inline code `text`
        .replace(/`(.+?)`/g, '$1')
        // Remove links [text](url) -> text
        .replace(/\[(.+?)\]\(.+?\)/g, '$1')
        // Clean up multiple newlines
        .replace(/\n{3,}/g, '\n\n')
        .trim();
};

const HealthChat = () => {
    const { userProfile, dailyLogs, tasks } = useApp();

    // Load messages from localStorage on mount
    const getInitialMessages = () => {
        try {
            const saved = localStorage.getItem(CHAT_STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed;
                }
            }
        } catch (e) {
            console.warn('[HealthChat] Failed to load chat history:', e);
        }
        // Default welcome message
        return [{
            role: 'ai',
            content: `Hello ${userProfile.name || 'Champion'}! I'm your elite AI Personal Coach. I've analyzed your recent logs, nutrition, and schedule. How can I help you optimize your health and performance today?`,
            timestamp: new Date().toISOString()
        }];
    };

    const [messages, setMessages] = useState(getInitialMessages);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Save messages to localStorage whenever they change
    useEffect(() => {
        try {
            localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
        } catch (e) {
            console.warn('[HealthChat] Failed to save chat history:', e);
        }
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = { role: 'user', content: input, timestamp: new Date().toISOString() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const appData = { userProfile, dailyLogs, tasks };
            const response = await getCoachingResponse(input, appData);
            // Clean the markdown from AI response
            const cleanedResponse = cleanMarkdown(response);
            setMessages(prev => [...prev, {
                role: 'ai',
                content: cleanedResponse,
                timestamp: new Date().toISOString()
            }]);
        } catch (error) {
            console.error('[HealthChat] Error:', error);
            setMessages(prev => [...prev, {
                role: 'ai',
                content: `Error: ${error.message}. Please verify your Gemini API key in Settings.`,
                timestamp: new Date().toISOString()
            }]);
        }
        setIsLoading(false);
    };

    const clearHistory = () => {
        const welcomeMsg = {
            role: 'ai',
            content: `Hello ${userProfile.name || 'Champion'}! I'm your elite AI Personal Coach. I've analyzed your recent logs, nutrition, and schedule. How can I help you optimize your health and performance today?`,
            timestamp: new Date().toISOString()
        };
        setMessages([welcomeMsg]);
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col animate-fade-in">
            <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-1 flex items-center gap-2">
                        <Award className="text-accent-primary" /> AI Personal Coach
                    </h2>
                    <p className="text-text-secondary">Data-driven performance and wellness coaching</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-accent-primary/5 rounded-lg border border-accent-primary/10">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-accent-primary flex items-center gap-1">
                            <Brain size={12} /> Live Analysis:
                        </span>
                        <div className="flex gap-1.5">
                            <Activity size={12} className="text-green-400" title="Health Stats" />
                            <Utensils size={12} className="text-purple-400" title="Nutrition" />
                            <Calendar size={12} className="text-blue-400" title="Schedule" />
                        </div>
                    </div>
                    <button
                        onClick={clearHistory}
                        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                        title="Clear chat history"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </header>

            <div className="flex-1 card flex flex-col overflow-hidden p-0 bg-bg-secondary/30 backdrop-blur-md">
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                ${msg.role === 'user' ? 'bg-accent-primary text-bg-primary shadow-lg shadow-accent-primary/20' : 'bg-white/10 text-white border border-white/10'}`}>
                                {msg.role === 'user' ? <User size={20} /> : <Zap size={20} className="text-accent-primary" />}
                            </div>
                            <div className={`max-w-[80%] p-4 rounded-2xl leading-relaxed
                ${msg.role === 'user'
                                    ? 'bg-accent-primary/20 text-white rounded-tr-none border border-accent-primary/20'
                                    : 'bg-white/5 text-gray-300 rounded-tl-none border border-white/10'}`}>
                                <div className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</div>
                                {msg.timestamp && (
                                    <div className="text-[10px] text-gray-500 mt-2 text-right">
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 border border-white/10">
                                <Zap size={20} className="text-accent-primary animate-pulse" />
                            </div>
                            <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none border border-white/10 flex items-center gap-2">
                                <div className="w-2 h-2 bg-accent-primary rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-accent-primary rounded-full animate-bounce delay-100"></div>
                                <div className="w-2 h-2 bg-accent-primary rounded-full animate-bounce delay-200"></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t border-white/10 bg-bg-primary/50">
                    <div className="flex gap-2 max-w-4xl mx-auto w-full">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ask your coach anything (e.g., 'Why am I tired today?')"
                            className="input-field py-4 bg-bg-primary/50"
                        />
                        <button
                            onClick={handleSend}
                            disabled={isLoading || !input.trim()}
                            className="btn-primary px-8 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-accent-primary/20"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HealthChat;
