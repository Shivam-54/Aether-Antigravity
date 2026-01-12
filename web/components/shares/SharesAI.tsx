'use client';

import { useState } from 'react';
import { AIShareInsight } from '@/types/shares';
import { AlertTriangle, TrendingUp, AlertCircle, Send, Loader2 } from 'lucide-react';
import { useShares } from '@/context/SharesContext';

export default function SharesAI() {
    const { shares } = useShares();
    const insights: AIShareInsight[] = []; // Placeholder empty for now
    const [chatInput, setChatInput] = useState('');
    const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'ai'; content: string }>>([]);
    const [isLoading, setIsLoading] = useState(false);

    const getImpactIcon = (impact: string) => {
        switch (impact) {
            case 'High':
                return <AlertTriangle size={18} strokeWidth={1.5} className="text-red-400/80" />;
            case 'Medium':
                return <AlertCircle size={18} strokeWidth={1.5} className="text-yellow-400/80" />;
            default:
                return <AlertCircle size={18} strokeWidth={1.5} className="text-blue-400/80" />;
        }
    };

    const getImpactColor = (impact: string) => {
        switch (impact) {
            case 'High':
                return 'border-red-400/20 bg-red-400/5';
            case 'Medium':
                return 'border-yellow-400/20 bg-yellow-400/5';
            default:
                return 'border-blue-400/20 bg-blue-400/5';
        }
    };

    const getCategoryBadge = (category: string) => {
        const styles = {
            risk: 'bg-red-500/10 text-red-400/80',
            opportunity: 'bg-green-500/10 text-green-400/80',
            alert: 'bg-yellow-500/10 text-yellow-400/80',
        };
        return styles[category as keyof typeof styles] || styles.alert;
    };

    const handleSendMessage = async () => {
        if (!chatInput.trim() || isLoading) return;

        const userMessage = chatInput;
        setChatInput('');
        setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat/shares', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage, shares }),
            });

            const data = await response.json();

            if (data.error) throw new Error(data.error);

            setChatMessages(prev => [...prev, {
                role: 'ai',
                content: data.reply
            }]);
        } catch (error) {
            console.error('AI Chat Error:', error);
            setChatMessages(prev => [...prev, {
                role: 'ai',
                content: "I apologize, but I'm having trouble connecting to the analysis server right now. Please check your connection or API key."
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-light tracking-wider text-white/90 mb-2">
                    AI Insights
                </h2>
                <p className="text-sm font-light tracking-wide text-white/50">
                    Strategic intelligence for equity portfolio management
                </p>
            </div>

            {/* AI Insights Cards */}
            <div className="space-y-4">
                {insights.length === 0 ? (
                    <div className="p-8 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm text-center">
                        <AlertCircle className="w-10 h-10 text-white/20 mx-auto mb-3" />
                        <h3 className="text-md font-light text-white mb-1">No AI Insights Yet</h3>
                        <p className="text-sm text-white/40">
                            AI analysis will appear here once you add shares to your portfolio.
                        </p>
                    </div>
                ) : (
                    insights.map((insight) => (
                        <div
                            key={insight.id}
                            className={`relative p-6 rounded-2xl overflow-hidden border ${getImpactColor(insight.impact)}`}
                            style={{
                                background: 'rgba(255, 255, 255, 0.03)',
                                boxShadow: '0 0 30px 0 rgba(255, 255, 255, 0.05)',
                                backdropFilter: 'blur(10px)',
                                WebkitBackdropFilter: 'blur(10px)',
                            }}
                        >
                            <div className="flex items-start gap-4">
                                <div className="mt-1">
                                    {getImpactIcon(insight.impact)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`px-2 py-0.5 rounded text-xs font-light tracking-wider ${getCategoryBadge(insight.category)}`}>
                                            {insight.category.charAt(0).toUpperCase() + insight.category.slice(1)}
                                        </span>
                                        <span className="text-xs font-light text-white/40">
                                            {insight.impact} Impact
                                        </span>
                                        <span className="text-xs font-light text-white/40">
                                            •
                                        </span>
                                        <span className="text-xs font-light text-white/40">
                                            {insight.confidence}% confidence
                                        </span>
                                    </div>
                                    <p className="text-sm font-light text-white/80 leading-relaxed">
                                        {insight.message}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* AI Chat Interface */}
            <div
                className="relative p-6 rounded-2xl overflow-hidden"
                style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 0 30px 0 rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                }}
            >
                <h3 className="text-lg font-light tracking-wide text-white/90 mb-4">
                    Ask About Your Portfolio
                </h3>

                {/* Chat Messages */}
                {chatMessages.length > 0 && (
                    <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto">
                        {chatMessages.map((message, index) => (
                            <div
                                key={index}
                                className={`p-4 rounded-xl ${message.role === 'user'
                                    ? 'bg-white/10 ml-8'
                                    : 'bg-white/5 mr-8'
                                    }`}
                            >
                                <p className="text-xs font-light tracking-widest uppercase text-white/50 mb-1">
                                    {message.role === 'user' ? 'You' : 'AI Assistant'}
                                </p>
                                <p className="text-sm font-light text-white/80 leading-relaxed">
                                    {message.content}
                                </p>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="bg-white/5 mr-8 p-4 rounded-xl flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin text-white/50" />
                                <span className="text-sm font-light text-white/50">Analyzing portfolio...</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Input */}
                <div className="flex gap-3">
                    <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Ask about portfolio performance, risks, or opportunities..."
                        className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/90 placeholder-white/30 focus:outline-none focus:border-white/20 transition-colors font-light text-sm"
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={isLoading}
                        className="px-6 py-3 rounded-xl bg-white/10 border border-white/20 text-white/90 hover:bg-white/15 transition-all duration-200 font-light"
                    >
                        {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} strokeWidth={1.5} />}
                    </button>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                    {[
                        'What are my top performers?',
                        'Analyze sector risk',
                        'Should I rebalance?',
                    ].map((suggestion, index) => (
                        <button
                            key={index}
                            onClick={() => setChatInput(suggestion)}
                            className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-light text-white/60 hover:bg-white/8 hover:text-white/80 transition-all"
                        >
                            {suggestion}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
