'use client';

import { useState } from 'react';
import { AIShareInsight } from '@/types/shares';
import { AlertTriangle, TrendingUp, AlertCircle, Send } from 'lucide-react';

interface SharesAIProps {
    insights: AIShareInsight[];
}

export default function SharesAI({ insights }: SharesAIProps) {
    const [chatInput, setChatInput] = useState('');
    const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'ai'; content: string }>>([]);

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

    const handleSendMessage = () => {
        if (!chatInput.trim()) return;

        // Add user message
        setChatMessages(prev => [...prev, { role: 'user', content: chatInput }]);

        // Simulate AI response
        setTimeout(() => {
            setChatMessages(prev => [...prev, {
                role: 'ai',
                content: `Based on your share portfolio analysis, ${chatInput.toLowerCase().includes('risk') ?
                    'your current risk exposure is moderate with technology sector concentration at 33.26%. Consider diversification strategies.' :
                    chatInput.toLowerCase().includes('buy') || chatInput.toLowerCase().includes('sell') ?
                        'I recommend reviewing your portfolio allocation and market trends before making decisions. BHARTIARTL shows strong momentum while ASIANPAINT may present opportunity at current levels.' :
                        'I can help analyze your portfolio performance, sector allocation, and provide strategic recommendations for your equity investments.'
                    }`
            }]);
        }, 1000);

        setChatInput('');
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
                {insights.map((insight) => (
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
                ))}
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
                        className="px-6 py-3 rounded-xl bg-white/10 border border-white/20 text-white/90 hover:bg-white/15 transition-all duration-200 font-light"
                    >
                        <Send size={18} strokeWidth={1.5} />
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
