/**
 * Business AI Lab
 * Handles the Business AI Lab 3-tab structure:
 *   Tab 1: AI Financial Analyst  (Gemini-powered P&L / cashflow insights)
 *   Tab 2: AI Board Member Chat  (Contextual Gemini conversation)
 *   Tab 3: Coming Soon
 */

// ─────────────────────────────────────────────────────────────────
// TAB SWITCHING
// ─────────────────────────────────────────────────────────────────

window.switchBizAILabTab = function (tabName) {
    // Update tab button active states
    document.querySelectorAll('#biz-ai-lab-tabs .ai-lab-tab').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    // Strip the "biz-" prefix to get the panel suffix
    const panelSuffix = tabName.replace(/^biz-/, '');

    // Show/hide panels
    document.querySelectorAll('.ai-lab-panel[id^="biz-ai-lab-panel-"]').forEach(panel => {
        const isActive = panel.id === `biz-ai-lab-panel-${panelSuffix}`;
        panel.style.display = isActive ? 'block' : 'none';
        panel.classList.toggle('active', isActive);
    });
};

// Wire up event delegation as a belt-and-suspenders approach
document.addEventListener('DOMContentLoaded', function () {
    const tabGrid = document.getElementById('biz-ai-lab-tabs');
    if (tabGrid) {
        tabGrid.addEventListener('click', function (e) {
            const btn = e.target.closest('button[data-tab]');
            if (btn) {
                e.preventDefault();
                switchBizAILabTab(btn.dataset.tab);
            }
        });
    }
});


// ─────────────────────────────────────────────────────────────────
// TAB 1: AI FINANCIAL ANALYST
// ─────────────────────────────────────────────────────────────────

window.runBizFinancialAnalysis = async function () {
    const outputEl = document.getElementById('biz-financial-analysis-output');
    if (!outputEl) return;

    const period = document.getElementById('bizAnalysisPeriod')?.value || '6';
    const focus  = document.getElementById('bizFocusArea')?.value   || 'overall';

    const focusLabels = {
        overall: 'Overall Portfolio',
        revenue: 'Revenue Growth',
        profitability: 'Profitability',
        cashflow: 'Cash Flow',
        risk: 'Risk Assessment',
    };

    // Show a loading spinner
    outputEl.innerHTML = `
        <div class="glass-card p-5 text-center" style="min-height:200px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;">
            <div class="spinner-border text-primary" role="status" style="width:2rem;height:2rem;"></div>
            <div class="text-white-50 small">Gemini is analysing your business data…</div>
        </div>`;

    try {
        const token = localStorage.getItem('access_token');
        const res = await fetch(
            `${API_BASE_URL}/business/ai/financial-analysis?period=${period}&focus=${focus}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
        );

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        renderFinancialAnalysis(data, focusLabels[focus] || focus, period);
    } catch (err) {
        outputEl.innerHTML = `
            <div class="glass-card p-4">
                <div class="text-danger small text-center">Failed to load analysis: ${err.message}</div>
            </div>`;
    }
};

function renderFinancialAnalysis(data, focusLabel, period) {
    const outputEl = document.getElementById('biz-financial-analysis-output');
    if (!outputEl) return;

    const severityBorder = {
        high:   'rgba(239,68,68,0.3)',
        medium: 'rgba(99,102,241,0.25)',
        low:    'rgba(34,197,94,0.2)',
        info:   'rgba(59,130,246,0.2)',
    };
    const severityBg = {
        high:   'rgba(239,68,68,0.05)',
        medium: 'rgba(99,102,241,0.05)',
        low:    'rgba(34,197,94,0.04)',
        info:   'rgba(59,130,246,0.04)',
    };
    const categoryColor = {
        revenue:       '#86efac',
        profitability: '#c4b5fd',
        cash_flow:     '#93c5fd',
        risk:          '#fca5a5',
        opportunity:   '#fde68a',
        overview:      '#e2e8f0',
    };

    // ── Metric snapshot bar ──────────────────────────────────────
    let snapshotHTML = '';
    if (data.snapshot) {
        const s = data.snapshot;
        snapshotHTML = `
            <div class="d-flex gap-3 flex-wrap mb-4">
                ${s.total_revenue != null ? `
                <div class="glass-card p-2 px-3 flex-fill text-center" style="min-width:110px">
                    <div class="text-white-50 small" style="font-size:0.65rem;text-transform:uppercase;letter-spacing:.05em">Total Revenue</div>
                    <div class="text-white fw-semibold">₹${fmtCr(s.total_revenue)}</div>
                </div>` : ''}
                ${s.net_profit != null ? `
                <div class="glass-card p-2 px-3 flex-fill text-center" style="min-width:110px">
                    <div class="text-white-50 small" style="font-size:0.65rem;text-transform:uppercase;letter-spacing:.05em">Net Profit</div>
                    <div class="${s.net_profit >= 0 ? 'text-success' : 'text-danger'} fw-semibold">₹${fmtCr(s.net_profit)}</div>
                </div>` : ''}
                ${s.profit_margin_pct != null ? `
                <div class="glass-card p-2 px-3 flex-fill text-center" style="min-width:110px">
                    <div class="text-white-50 small" style="font-size:0.65rem;text-transform:uppercase;letter-spacing:.05em">Profit Margin</div>
                    <div class="${s.profit_margin_pct >= 0 ? 'text-success' : 'text-danger'} fw-semibold">${s.profit_margin_pct.toFixed(1)}%</div>
                </div>` : ''}
                ${s.total_ventures != null ? `
                <div class="glass-card p-2 px-3 flex-fill text-center" style="min-width:110px">
                    <div class="text-white-50 small" style="font-size:0.65rem;text-transform:uppercase;letter-spacing:.05em">Active Ventures</div>
                    <div class="text-white fw-semibold">${s.total_ventures}</div>
                </div>` : ''}
            </div>`;
    }

    // ── Insight cards ────────────────────────────────────────────
    const insightsHTML = (data.insights || []).map(ins => {
        const border = severityBorder[ins.severity] || severityBorder.medium;
        const bg     = severityBg[ins.severity]     || severityBg.medium;
        const color  = categoryColor[ins.category]  || '#fff';
        return `
        <div class="insight-card p-3 rounded-3" style="background:${bg};border:1px solid ${border};">
            <div class="d-flex align-items-start gap-3">
                <div style="font-size:1.1rem;line-height:1;padding-top:2px;color:${color};">${ins.icon || '◈'}</div>
                <div class="flex-grow-1">
                    <div class="fw-medium text-white small mb-1">${ins.title}</div>
                    <div class="text-white-50" style="font-size:0.78rem;line-height:1.5;">${ins.content}</div>
                    <span class="badge mt-2" style="font-size:0.6rem;background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.5);">${(ins.category || '').toUpperCase().replace('_', ' ')}</span>
                </div>
            </div>
        </div>`;
    }).join('');

    // ── Timestamp ────────────────────────────────────────────────
    const ts = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    outputEl.innerHTML = `
        ${snapshotHTML}
        <div class="d-flex justify-content-between align-items-center mb-3">
            <div class="text-white small fw-medium">AI Insights — ${focusLabel}</div>
            <div class="text-white-40 small">Updated ${ts}</div>
        </div>
        <div class="d-flex flex-column gap-3">
            ${insightsHTML || '<div class="text-white-50 text-center py-3 small">No insights available for this period.</div>'}
        </div>`;
}

/** Format a number (in INR) to Cr with 2 decimal places */
function fmtCr(val) {
    if (val == null) return '—';
    const abs = Math.abs(val);
    const sign = val < 0 ? '-' : '';
    if (abs >= 1e7) return `${sign}${(abs / 1e7).toFixed(2)} Cr`;
    if (abs >= 1e5) return `${sign}${(abs / 1e5).toFixed(2)} L`;
    return `${sign}${abs.toLocaleString('en-IN')}`;
}


// ─────────────────────────────────────────────────────────────────
// TAB 2: AI BOARD MEMBER CHAT
// ─────────────────────────────────────────────────────────────────

// Chat history stored in memory (reset on clear)
let _bizChatHistory = [];

/** Pre-fill the input box and send */
window.bizChatAsk = function (question) {
    const input = document.getElementById('biz-chat-input');
    if (input) {
        input.value = question;
        sendBizChat();
    }
};

/** Send a user message */
window.sendBizChat = async function () {
    const input   = document.getElementById('biz-chat-input');
    const msgList = document.getElementById('biz-chat-messages');
    const suggestions = document.getElementById('biz-chat-suggestions');
    if (!input || !msgList) return;

    const text = input.value.trim();
    if (!text) return;
    input.value = '';

    // Hide suggestions after first message
    if (suggestions) suggestions.style.display = 'none';

    // Append user message
    appendBizMessage('user', text, msgList);
    _bizChatHistory.push({ role: 'user', content: text });

    // Show typing indicator
    const typingId = appendBizTyping(msgList);

    try {
        const token = localStorage.getItem('access_token');
        const res = await fetch(`${API_BASE_URL}/business/ai/chat`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: text,
                history: _bizChatHistory.slice(-10), // last 10 turns for context
            }),
        });

        // Remove typing indicator
        document.getElementById(typingId)?.remove();

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        const reply = data.reply || data.response || data.message || 'No response received.';
        appendBizMessage('ai', reply, msgList);
        _bizChatHistory.push({ role: 'assistant', content: reply });

    } catch (err) {
        document.getElementById(typingId)?.remove();
        appendBizMessage('error', `Error: ${err.message}`, msgList);
    }

    // Auto-scroll to bottom
    msgList.scrollTop = msgList.scrollHeight;
};

/** Clear the chat and restore welcome message */
window.clearBizChat = function () {
    _bizChatHistory = [];
    const msgList   = document.getElementById('biz-chat-messages');
    const suggestions = document.getElementById('biz-chat-suggestions');
    if (msgList) {
        msgList.innerHTML = `
            <div class="d-flex gap-3 align-items-start">
                <div class="rounded-circle flex-shrink-0 d-flex align-items-center justify-content-center" style="width:28px;height:28px;background:rgba(118,75,162,0.2);border:1px solid rgba(118,75,162,0.4);">
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H4a2 2 0 01-2-2V5a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2h-1"></path>
                    </svg>
                </div>
                <div class="p-3 rounded-3" style="background:rgba(118,75,162,0.1);border:1px solid rgba(118,75,162,0.2);max-width:85%;">
                    <div class="text-white small" style="line-height:1.5;">Chat cleared. I'm ready to assist with any questions about your business portfolio!</div>
                </div>
            </div>`;
    }
    if (suggestions) suggestions.style.display = '';
};

/** Append a chat bubble */
function appendBizMessage(role, text, container) {
    const isUser  = role === 'user';
    const isError = role === 'error';

    const bubble = document.createElement('div');
    bubble.className = `d-flex gap-3 align-items-start${isUser ? ' flex-row-reverse' : ''}`;

    // Format AI text — respect line breaks and basic markdown bold
    const formattedText = isUser ? escapeHtml(text) : formatBizAIText(text);

    if (isUser) {
        bubble.innerHTML = `
            <div class="rounded-circle flex-shrink-0 d-flex align-items-center justify-content-center" style="width:28px;height:28px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);">
                <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
            </div>
            <div class="p-3 rounded-3" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);max-width:80%;">
                <div class="text-white small" style="line-height:1.5;">${formattedText}</div>
            </div>`;
    } else {
        bubble.innerHTML = `
            <div class="rounded-circle flex-shrink-0 d-flex align-items-center justify-content-center" style="width:28px;height:28px;background:rgba(118,75,162,0.2);border:1px solid rgba(118,75,162,0.4);">
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H4a2 2 0 01-2-2V5a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2h-1"></path>
                </svg>
            </div>
            <div class="p-3 rounded-3" style="background:${isError ? 'rgba(239,68,68,0.08)' : 'rgba(118,75,162,0.1)'};border:1px solid ${isError ? 'rgba(239,68,68,0.3)' : 'rgba(118,75,162,0.2)'};max-width:85%;">
                <div class="${isError ? 'text-danger' : 'text-white'} small" style="line-height:1.6;">${formattedText}</div>
            </div>`;
    }

    container.appendChild(bubble);
    container.scrollTop = container.scrollHeight;
}

/** Show a pulsing typing indicator; returns its element ID */
function appendBizTyping(container) {
    const id = `biz-typing-${Date.now()}`;
    const el = document.createElement('div');
    el.id = id;
    el.className = 'd-flex gap-3 align-items-start';
    el.innerHTML = `
        <div class="rounded-circle flex-shrink-0 d-flex align-items-center justify-content-center" style="width:28px;height:28px;background:rgba(118,75,162,0.2);border:1px solid rgba(118,75,162,0.4);">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H4a2 2 0 01-2-2V5a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2h-1"></path>
            </svg>
        </div>
        <div class="p-3 rounded-3" style="background:rgba(118,75,162,0.08);border:1px solid rgba(118,75,162,0.15);">
            <div class="d-flex gap-1 align-items-center" style="height:16px;">
                <div style="width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,0.4);animation:typingDot 1.2s infinite 0s;"></div>
                <div style="width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,0.4);animation:typingDot 1.2s infinite 0.2s;"></div>
                <div style="width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,0.4);animation:typingDot 1.2s infinite 0.4s;"></div>
            </div>
        </div>`;
    container.appendChild(el);
    container.scrollTop = container.scrollHeight;

    // Inject typing dot animation CSS once
    if (!document.getElementById('biz-typing-style')) {
        const style = document.createElement('style');
        style.id = 'biz-typing-style';
        style.textContent = `
            @keyframes typingDot {
                0%,60%,100% { opacity:0.3;transform:translateY(0); }
                30% { opacity:1;transform:translateY(-3px); }
            }`;
        document.head.appendChild(style);
    }

    return id;
}

/** Basic HTML escape */
function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

/**
 * Light markdown formatting for AI responses:
 *  - **bold** → <strong>
 *  - newlines → <br>
 *  - bullet lines starting with - or • → formatted list items
 */
function formatBizAIText(text) {
    let safe = escapeHtml(text);
    // Bold
    safe = safe.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Bullet points
    safe = safe.replace(/^[-•]\s+(.+)$/gm, '<div style="padding-left:12px;margin-bottom:4px;">◦ $1</div>');
    // Line breaks but preserve paragraph spacing
    safe = safe.replace(/\n\n+/g, '<br><br>').replace(/\n/g, '<br>');
    return safe;
}
