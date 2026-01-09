'use client';

import { useState } from 'react';
import { MessageCircle, Send, Sparkles } from 'lucide-react';

const suggestedQuestions = [
    'Which property is underperforming?',
    'Should I hold or sell this asset?',
    'What is my real estate risk exposure?',
    'How can I optimize my portfolio?',
];

export default function AIAssistant() {
    const [isExpanded, setIsExpanded] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Array<{ type: 'user' | 'ai'; content: string }>>([]);

    const handleSend = () => {
        if (!input.trim()) return;

        // Add user message
        setMessages([...messages, { type: 'user', content: input }]);

        // Mock AI response
        setTimeout(() => {
            setMessages(prev => [
                ...prev,
                {
                    type: 'ai',
                    content: `Based on your Real Estate portfolio analysis, ${input.toLowerCase().includes('risk') ? 'your risk exposure is moderate with 50% concentration in Maharashtra. Consider geographic diversification.' : input.toLowerCase().includes('underperforming') ? 'Green Meadows Apartment shows 30.7% appreciation, below your portfolio average of 51%. Monitor market trends in Pune.' : 'I recommend reviewing your portfolio allocation and considering refinancing options for properties with low LTV ratios.'}`
                }
            ]);
        }, 1000);

        setInput('');
    };

    const handleSuggestedQuestion = (question: string) => {
        setInput(question);
        setIsExpanded(true);
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            {!isExpanded && (
                <div className="flex items-center gap-3">
                    <MessageCircle size={24} strokeWidth={1.5} className="text-white/70" />
                    <div>
                        <h2 className="text-2xl font-light tracking-wider text-white/90">
                            AI Assistant
                        </h2>
                        <p className="text-sm font-light tracking-wide text-white/50">
                            Ask questions about your portfolio
                        </p>
                    </div>
                </div>
            )}

            {/* Suggested Questions */}
            {!isExpanded && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {suggestedQuestions.map((question, index) => (
                        <button
                            key={index}
                            onClick={() => handleSuggestedQuestion(question)}
                            className="relative p-4 rounded-xl text-left overflow-hidden group transition-all duration-300 hover:scale-[1.02]"
                            style={{
                                background: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                backdropFilter: 'blur(10px)',
                                WebkitBackdropFilter: 'blur(10px)',
                            }}
                        >
                            <div
                                className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-out z-0 mix-blend-overlay"
                                style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                                    opacity: 0.06
                                }}
                            />
                            <div className="relative z-10 flex items-center gap-3">
                                <Sparkles size={16} strokeWidth={1.5} className="text-white/50 flex-shrink-0" />
                                <span className="text-sm font-light tracking-wide text-white/80">
                                    {question}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* Chat Interface */}
            {isExpanded && (
                <div
                    className="relative p-6 rounded-2xl overflow-hidden"
                    style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 0 50px 0 rgba(255, 255, 255, 0.05), inset 0 0 20px 0 rgba(255, 255, 255, 0.02)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                    }}
                >
                    {/* Chat Messages */}
                    <div className="space-y-4 mb-4 max-h-[400px] overflow-y-auto">
                        {messages.length === 0 ? (
                            <p className="text-sm font-light text-white/40 text-center py-8">
                                Ask me anything about your real estate portfolio...
                            </p>
                        ) : (
                            messages.map((message, index) => (
                                <div
                                    key={index}
                                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] p-4 rounded-2xl ${message.type === 'user'
                                                ? 'bg-white/10 text-white/90'
                                                : 'bg-white/5 text-white/80 border border-white/10'
                                            }`}
                                    >
                                        {message.type === 'ai' && (
                                            <div className="flex items-center gap-2 mb-2">
                                                <Sparkles size={14} strokeWidth={1.5} className="text-white/60" />
                                                <span className="text-xs font-light tracking-wider text-white/50">
                                                    AI Assistant
                                                </span>
                                            </div>
                                        )}
                                        <p className="text-sm font-light tracking-wide leading-relaxed">
                                            {message.content}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Input */}
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ask a question..."
                            className="flex-1 px-4 py-3 rounded-full bg-white/5 border border-white/10 text-sm font-light tracking-wide text-white/90 placeholder:text-white/30 focus:outline-none focus:border-white/20 transition-colors duration-200"
                        />
                        <button
                            onClick={handleSend}
                            className="p-3 rounded-full bg-white/10 hover:bg-white/15 transition-colors duration-200"
                        >
                            <Send size={18} strokeWidth={1.5} className="text-white/80" />
                        </button>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs font-light tracking-wider text-white/50 hover:text-white/70 transition-colors duration-200"
            >
                {isExpanded ? 'Collapse' : 'Expand chat'}
            </button>
        </div>
    );
}
