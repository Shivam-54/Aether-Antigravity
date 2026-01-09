'use client';

import { useState } from 'react';
import { AlertTriangle, TrendingUp, AlertCircle, Send, Sparkles } from 'lucide-react';

interface Insight {
    id: string;
    impact: 'High' | 'Medium' | 'Low';
    category: 'risk' | 'opportunity' | 'alert';
    message: string;
    confidence: number;
}

const mockInsights: Insight[] = [
    {
        id: '1',
        impact: 'High',
        category: 'opportunity',
        message: 'Yield spreads on Corporate bonds have widened. Reallocating 15% from Government Securities could increase portfolio yield by 1.2% annualized.',
        confidence: 89
    },
    {
        id: '2',
        impact: 'Medium',
        category: 'risk',
        message: 'Inflation protection is low. Consider adding Floating Rate Bonds to hedge against potential interest rate hikes in the upcoming quarter.',
        confidence: 76
    },
    {
        id: '3',
        impact: 'Low',
        category: 'alert',
        message: 'HDFC Bank Tier II bond functions call option approaches in 3 months. Review reinvestment strategies.',
        confidence: 95
    }
];

export default function BondsAIInsights() {
    const [chatInput, setChatInput] = useState('');
    const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'ai'; content: string }>>([]);

    const getImpactIcon = (impact: string) => {
        switch (impact) {
            case 'High':
                return <AlertTriangle size={18} strokeWidth={1.5} className="text-red-400/80" />;
            case 'Medium':
                return <AlertCircle size={18} strokeWidth={1.5} className="text-amber-200/80" />; // Used amber instead of yellow for bonds theme
            default:
                return <AlertCircle size={18} strokeWidth={1.5} className="text-blue-400/80" />;
        }
    };

    const getImpactColor = (impact: string) => {
        switch (impact) {
            case 'High':
                return 'border-red-400/20 bg-red-400/5';
            case 'Medium':
                return 'border-amber-200/20 bg-amber-200/5';
            default:
                return 'border-blue-400/20 bg-blue-400/5';
        }
    };

    const handleSendMessage = () => {
        if (!chatInput.trim()) return;

        setChatMessages(prev => [...prev, { role: 'user', content: chatInput }]);

        setTimeout(() => {
            const lowerInput = chatInput.toLowerCase();
            let response = 'I can help analyze your fixed income portfolio, duration risk, and credit exposure.';

            if (lowerInput.includes('rate') || lowerInput.includes('rise')) {
                response = 'If interest rates rise by 50bps, your portfolio value is projected to decline by approximately 1.8% due to duration sensitivity. Short-term bonds would be less affected.';
            } else if (lowerInput.includes('mature') || lowerInput.includes('next')) {
                response = 'Your next maturity is HDFC Bank Tier II on Oct 25, 2025. You should plan for reinvesting ₹20.50 L principal.';
            } else if (lowerInput.includes('risk') || lowerInput.includes('safe')) {
                response = 'Your credit risk is low relative to the market benchmark. 65% of holdings are Sovereign or AAA rated corporate paper.';
            }

            setChatMessages(prev => [...prev, { role: 'ai', content: response }]);
        }, 1000);

        setChatInput('');
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            <div>
                <h1 className="text-3xl font-light tracking-wide text-white/90 mb-2">AI Insights</h1>
                <p className="text-white/50 font-light tracking-wide">
                    Strategic intelligence for fixed income optimization
                </p>
            </div>

            {/* AI Insights Cards */}
            <div className="space-y-4">
                {mockInsights.map((insight) => (
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
                                    <span className="text-xs font-light text-white/40 uppercase tracking-widest">
                                        {insight.category}
                                    </span>
                                    <span className="text-xs font-light text-white/40">•</span>
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
                <div className="flex items-center gap-3 mb-6">
                    <Sparkles size={20} className="text-white/60" />
                    <h3 className="text-lg font-light tracking-wide text-white/90">
                        Bond Assistant
                    </h3>
                </div>

                {chatMessages.length > 0 && (
                    <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto">
                        {chatMessages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-4 rounded-xl ${msg.role === 'user' ? 'bg-white/10 text-white/90' : 'bg-white/5 text-white/80 border border-white/10'
                                    }`}>
                                    <p className="text-sm font-light leading-relaxed">{msg.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex gap-3">
                    <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Ask about interest rates, yields, or maturity..."
                        className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/90 placeholder-white/30 focus:outline-none focus:border-white/20 transition-colors font-light text-sm"
                    />
                    <button
                        onClick={handleSendMessage}
                        className="px-6 py-3 rounded-xl bg-white/10 border border-white/20 text-white/90 hover:bg-white/15 transition-all duration-200"
                    >
                        <Send size={18} strokeWidth={1.5} />
                    </button>
                </div>
            </div>
        </div>
    );
}
