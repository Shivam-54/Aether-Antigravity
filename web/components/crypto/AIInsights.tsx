'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, AlertTriangle, TrendingUp, TrendingDown, Send, Bot } from 'lucide-react';

export default function AIInsights() {
    const [activeTab, setActiveTab] = useState<'feed' | 'chat'>('feed');

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full h-[600px]">
            {/* Insights Feed */}
            <div className={`col-span-1 lg:col-span-1 flex flex-col gap-4 ${activeTab === 'chat' ? 'hidden lg:flex' : 'flex'}`}>
                <header className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-light text-white flex items-center gap-2">
                        <Sparkles size={16} className="text-purple-400" />
                        Market Intelligence
                    </h2>
                    <div className="lg:hidden flex bg-white/5 rounded-full p-1">
                        <button onClick={() => setActiveTab('feed')} className={`px-3 py-1 rounded-full text-xs ${activeTab === 'feed' ? 'bg-white/10 text-white' : 'text-white/40'}`}>Feed</button>
                        <button onClick={() => setActiveTab('chat')} className={`px-3 py-1 rounded-full text-xs ${activeTab === 'chat' ? 'bg-white/10 text-white' : 'text-white/40'}`}>Chat</button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto space-y-4 pr-2 no-scrollbar">
                    <InsightCard
                        type="warning"
                        title="Exposure Risk"
                        content="Solana volatility increased by 15% in 4 hours. Verify stop-loss positions."
                        time="20m ago"
                    />
                    <InsightCard
                        type="neutral"
                        title="Correlation Shift"
                        content="BTC and ETH correlation dropped below 0.75, suggesting decoupling."
                        time="2h ago"
                    />
                    <InsightCard
                        type="positive"
                        title="Accumulation Pattern"
                        content="On-chain metrics show wallet accumulation for ADA in the 0.45-0.50 range."
                        time="5h ago"
                    />
                    <InsightCard
                        type="neutral"
                        title="Gas Fees"
                        content="Ethereum network congestion is low (12 gwei). Optimal for transactions."
                        time="8h ago"
                    />
                </div>
            </div>

            {/* Chat Interface */}
            <div className={`col-span-1 lg:col-span-2 rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-sm flex flex-col overflow-hidden relative ${activeTab === 'feed' ? 'hidden lg:flex' : 'flex'}`}>
                <ChatInterface />
            </div>
        </div>
    );
}

function InsightCard({ type, title, content, time }: { type: 'positive' | 'warning' | 'neutral', title: string, content: string, time: string }) {
    let icon = <TrendingUp size={16} />;
    let colorClass = 'text-white/60';
    let bgClass = 'bg-white/5';

    if (type === 'warning') {
        icon = <AlertTriangle size={16} />;
        colorClass = 'text-orange-400';
        bgClass = 'bg-orange-500/10 border-orange-500/20';
    } else if (type === 'positive') {
        icon = <TrendingUp size={16} />;
        colorClass = 'text-green-400';
        bgClass = 'bg-green-500/10 border-green-500/20';
    } else {
        icon = <TrendingDown size={16} />;
        bgClass = 'bg-white/5 border-white/5';
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`p-4 rounded-xl border ${bgClass} transition-colors hover:bg-white/10`}
        >
            <div className="flex items-center justify-between mb-2">
                <div className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wider ${colorClass}`}>
                    {icon}
                    {title}
                </div>
                <span className="text-[10px] text-white/30">{time}</span>
            </div>
            <p className="text-sm text-white/80 font-light leading-relaxed">
                {content}
            </p>
        </motion.div>
    );
}

function ChatInterface() {
    const [messages, setMessages] = useState<{ role: 'ai' | 'user', text: string }[]>([
        { role: 'ai', text: "I'm analyzing your portfolio against current market conditions. What would you like to know?" }
    ]);
    const [input, setInput] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    const handleSend = () => {
        if (!input.trim()) return;

        const userMsg = input;
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setInput('');

        setTimeout(() => {
            setMessages(prev => [...prev, { role: 'ai', text: generateMockResponse(userMsg) }]);
            scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 1000);
    };

    const generateMockResponse = (query: string) => {
        if (query.toLowerCase().includes('drop')) return "The recent volatility is driven by macro-economic data release scheduled for tomorrow. Your exposure is hedged by your stablecoin holdings.";
        if (query.toLowerCase().includes('btc')) return "Bitcoin is currently testing the 200-week moving average. Key resistance lies at 42k.";
        return "I'm focusing specifically on your portfolio data. Could you clarify your strategy regarding this asset?";
    };

    return (
        <>
            <div className="absolute top-0 w-full p-6 border-b border-white/5 bg-black/20 backdrop-blur-md z-10 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                    <Bot size={16} className="text-white/80" />
                </div>
                <div>
                    <h3 className="text-sm font-medium text-white">Aether Strategist</h3>
                    <div className="text-[10px] text-green-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                        Live Analysis
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 pt-24 space-y-6">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                ? 'bg-white/10 text-white rounded-br-none'
                                : 'bg-black/40 border border-white/5 text-white/80 rounded-bl-none'
                            }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                <div ref={scrollRef} />
            </div>

            <div className="p-4 bg-black/20 border-t border-white/5">
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask about risks, trends, or predictions..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all font-light"
                    />
                    <button
                        onClick={handleSend}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <Send size={16} />
                    </button>
                </div>
            </div>
        </>
    );
}
