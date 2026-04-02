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
            <div class="text-white-50 small">Groq is analysing your business data…</div>
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
// TAB 1: BREAK-EVEN ANALYSIS
// ─────────────────────────────────────────────────────────────────

async function loadBreakEvenAnalysis() {
    const section = document.getElementById('biz-breakeven-section');
    const output  = document.getElementById('biz-breakeven-output');
    if (!section || !output) return;

    try {
        const token = localStorage.getItem('access_token');
        const res = await fetch(`${API_BASE_URL}/business/ai/break-even`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        if (!data.ventures || data.ventures.length === 0) {
            section.style.display = 'none';
            return;
        }

        section.style.display = 'block';

        const statusLabel = { broken_even: '✓ Recovered', in_progress: 'In Progress', not_profitable: '✗ No Profit', no_investment: '—' };
        const statusColor = { broken_even: '#86efac', in_progress: '#fcd34d', not_profitable: '#fca5a5', no_investment: '#e2e8f0' };

        function fmtVal(v) {
            if (!v && v !== 0) return '—';
            const abs = Math.abs(v);
            if (abs >= 1e7) return `₹${(abs/1e7).toFixed(2)} Cr`;
            if (abs >= 1e5) return `₹${(abs/1e5).toFixed(2)} L`;
            return `₹${abs.toLocaleString('en-IN')}`;
        }

        output.innerHTML = data.ventures.map(v => {
            const color = statusColor[v.status] || '#e2e8f0';
            const label = statusLabel[v.status] || v.status;
            const pct = Math.min(Math.max(v.progress_pct || 0, 0), 100);
            const monthsText = v.months_to_breakeven != null ? `${v.months_to_breakeven} months total` : '—';

            return `
            <div class="mb-3 p-3 rounded-3" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);">
                <div class="d-flex justify-content-between align-items-center mb-1">
                    <span class="text-white small fw-medium">${v.name}</span>
                    <span class="badge" style="background:rgba(255,255,255,0.05);color:${color};font-size:0.65rem;">${label}</span>
                </div>
                <div class="d-flex justify-content-between align-items-center mb-1">
                    <span class="text-white-50" style="font-size:0.72rem;">Investment: ${fmtVal(v.valuation)} · Monthly profit: ${fmtVal(v.monthly_profit)}</span>
                    <span class="small fw-medium" style="color:${color};">${pct.toFixed(1)}%</span>
                </div>
                <div style="background:rgba(255,255,255,0.06);border-radius:99px;height:6px;overflow:hidden;">
                    <div style="width:${pct}%;height:100%;background:${color};border-radius:99px;transition:width 0.8s ease;"></div>
                </div>
                <div class="text-white-50 mt-1" style="font-size:0.68rem;">Break-even in: ${monthsText}</div>
            </div>`;
        }).join('');
    } catch (err) {
        if (section) section.style.display = 'none';
    }
}


// ─────────────────────────────────────────────────────────────────
// TAB 1: EXPENSE HEATMAP
// ─────────────────────────────────────────────────────────────────

async function loadExpenseHeatmap() {
    const section = document.getElementById('biz-heatmap-section');
    const output  = document.getElementById('biz-heatmap-output');
    if (!section || !output) return;

    try {
        const token = localStorage.getItem('access_token');
        const res = await fetch(`${API_BASE_URL}/business/ai/expense-heatmap`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        if (!data.months || data.months.length === 0) {
            section.style.display = 'none';
            return;
        }

        section.style.display = 'block';

        const { months, categories, matrix } = data;

        // Find max value for colour intensity scaling
        let maxVal = 0;
        months.forEach(m => categories.forEach(c => {
            const v = (matrix[m] || {})[c] || 0;
            if (v > maxVal) maxVal = v;
        }));

        function cellColor(val) {
            if (!val || maxVal === 0) return 'rgba(255,255,255,0.02)';
            const intensity = Math.min(val / maxVal, 1);
            // Red-based gradient for expenses
            const r = Math.round(239 * intensity + 30 * (1 - intensity));
            const g = Math.round(68 * intensity + 30 * (1 - intensity));
            const b = Math.round(68 * intensity + 50 * (1 - intensity));
            return `rgba(${r},${g},${b},${0.1 + intensity * 0.5})`;
        }

        function fmtShort(v) {
            if (!v) return '—';
            if (v >= 1e5) return `${(v/1e5).toFixed(1)}L`;
            if (v >= 1e3) return `${(v/1e3).toFixed(1)}K`;
            return v.toFixed(0);
        }

        // Month labels: "Jan '26" etc
        const monthLabels = months.map(m => {
            const [y, mo] = m.split('-');
            const names = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            return `${names[parseInt(mo)-1]} '${y.slice(2)}`;
        });

        const cols = months.length + 1;

        let html = `<div style="display:grid;grid-template-columns:120px repeat(${months.length}, 1fr);gap:2px;font-size:0.7rem;">`;

        // Header row
        html += `<div style="padding:6px 4px;color:rgba(255,255,255,0.3);"></div>`;
        monthLabels.forEach(l => {
            html += `<div style="padding:6px 4px;text-align:center;color:rgba(255,255,255,0.4);">${l}</div>`;
        });

        // Data rows
        categories.forEach(cat => {
            html += `<div style="padding:6px 4px;color:rgba(255,255,255,0.6);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${cat}">${cat}</div>`;
            months.forEach(m => {
                const val = (matrix[m] || {})[cat] || 0;
                html += `<div style="padding:6px 4px;text-align:center;color:rgba(255,255,255,0.7);background:${cellColor(val)};border-radius:4px;" title="₹${val.toLocaleString('en-IN')}">${val ? fmtShort(val) : '—'}</div>`;
            });
        });

        html += '</div>';
        output.innerHTML = html;
    } catch (err) {
        if (section) section.style.display = 'none';
    }
}

// Auto-load break-even and heatmap when Financial Analyst tab is opened
document.addEventListener('DOMContentLoaded', function() {
    // Load on initial page if tab is active
    setTimeout(() => {
        loadBreakEvenAnalysis();
        loadExpenseHeatmap();
    }, 1000);
});


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


// ─────────────────────────────────────────────────────────────────
// TAB 3: SCENARIO PLANNER
// ─────────────────────────────────────────────────────────────────

/** Fill scenario textarea from an example chip */
window.bizScenarioChip = function (btn, text) {
    const input = document.getElementById('biz-scenario-input');
    if (input) input.value = text;
    // Highlight active chip
    document.querySelectorAll('#scenario-chips button').forEach(b => {
        b.style.background = 'rgba(255,255,255,0.06)';
        b.style.color = 'rgba(255,255,255,0.65)';
    });
    btn.style.background = 'rgba(245,158,11,0.15)';
    btn.style.color = '#fcd34d';
};

window.runBizScenario = async function () {
    const input  = document.getElementById('biz-scenario-input');
    const output = document.getElementById('biz-scenario-output');
    const btn    = document.getElementById('biz-scenario-btn');
    if (!input || !output) return;

    const scenario = input.value.trim();
    if (!scenario) { input.focus(); return; }

    btn.disabled = true;
    output.innerHTML = `
        <div class="d-flex align-items-center gap-2 py-3 text-white-50 small">
            <div class="spinner-border spinner-border-sm" style="width:14px;height:14px;"></div>
            Groq is modelling the financial impact…
        </div>`;

    try {
        const token = localStorage.getItem('access_token');
        const res = await fetch(`${API_BASE_URL}/business/ai/scenario`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ scenario }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        renderScenarioResult(data);
    } catch (err) {
        output.innerHTML = `<div class="text-danger small py-2">Error: ${err.message}</div>`;
    } finally {
        btn.disabled = false;
    }
};

function renderScenarioResult(d) {
    const output = document.getElementById('biz-scenario-output');
    if (!output) return;

    const impactColor = { positive: '#86efac', negative: '#fca5a5', neutral: '#e2e8f0', unknown: '#e2e8f0' };
    const severityBg  = { low: 'rgba(34,197,94,0.08)', medium: 'rgba(99,102,241,0.08)', high: 'rgba(239,68,68,0.08)' };
    const severityBorder = { low: 'rgba(34,197,94,0.25)', medium: 'rgba(99,102,241,0.2)', high: 'rgba(239,68,68,0.25)' };
    const sev = d.impact_severity || 'medium';
    const imp = d.overall_impact || 'neutral';

    const revSign  = d.projected_revenue_change_pct >= 0 ? '+' : '';
    const prfSign  = d.projected_profit_change_pct  >= 0 ? '+' : '';
    const revColor = d.projected_revenue_change_pct >= 0 ? '#86efac' : '#fca5a5';
    const prfColor = d.projected_profit_change_pct  >= 0 ? '#86efac' : '#fca5a5';

    // Venture impact rows
    const ventureRows = (d.affected_ventures || []).map(v => {
        const rdSign = (v.revenue_delta || 0) >= 0 ? '+' : '';
        const pdSign = (v.profit_delta  || 0) >= 0 ? '+' : '';
        const rc = (v.revenue_delta || 0) >= 0 ? '#86efac' : '#fca5a5';
        const pc = (v.profit_delta  || 0) >= 0 ? '#86efac' : '#fca5a5';
        return `
        <div class="d-flex align-items-start gap-3 py-2" style="border-bottom:1px solid rgba(255,255,255,0.05);">
            <div class="text-white small fw-medium flex-grow-1">${escapeHtml(v.name || '?')}</div>
            <div class="small" style="color:${rc};white-space:nowrap;">${rdSign}₹${Math.abs(v.revenue_delta||0).toLocaleString('en-IN')} rev</div>
            <div class="small" style="color:${pc};white-space:nowrap;">${pdSign}₹${Math.abs(v.profit_delta||0).toLocaleString('en-IN')} profit</div>
        </div>
        <div class="text-white-50" style="font-size:0.75rem;padding-left:0;padding-bottom:4px;">${escapeHtml(v.impact || '')}</div>`;
    }).join('');

    // Risks
    const risks = (d.key_risks || []).map(r =>
        `<div style="padding-left:8px;border-left:2px solid rgba(239,68,68,0.4);margin-bottom:6px;font-size:0.78rem;color:rgba(255,255,255,0.6);">${escapeHtml(r)}</div>`
    ).join('');

    // Recommendations
    const recs = (d.recommendations || []).map(r =>
        `<div style="padding-left:8px;border-left:2px solid rgba(34,197,94,0.4);margin-bottom:6px;font-size:0.78rem;color:rgba(255,255,255,0.7);">${escapeHtml(r)}</div>`
    ).join('');

    output.innerHTML = `
    <div class="p-3 rounded-3" style="background:${severityBg[sev]};border:1px solid ${severityBorder[sev]};">
        <!-- Header -->
        <div class="d-flex align-items-center justify-content-between mb-3">
            <div class="text-white small fw-medium">${escapeHtml(d.scenario_summary || d.scenario || '')}</div>
            <span class="badge" style="background:${severityBg[sev]};border:1px solid ${severityBorder[sev]};color:${impactColor[imp]};font-size:0.65rem;text-transform:uppercase;">
                ${imp} impact · ${sev} severity
            </span>
        </div>
        <!-- Projected totals -->
        <div class="d-flex gap-3 mb-3">
            <div class="glass-card p-2 px-3 flex-fill text-center">
                <div class="text-white-50" style="font-size:0.65rem;text-transform:uppercase;letter-spacing:.05em;">Revenue Change</div>
                <div class="fw-semibold" style="color:${revColor};">${revSign}${(d.projected_revenue_change_pct||0).toFixed(1)}%</div>
            </div>
            <div class="glass-card p-2 px-3 flex-fill text-center">
                <div class="text-white-50" style="font-size:0.65rem;text-transform:uppercase;letter-spacing:.05em;">Profit Change</div>
                <div class="fw-semibold" style="color:${prfColor};">${prfSign}${(d.projected_profit_change_pct||0).toFixed(1)}%</div>
            </div>
        </div>
        <!-- Venture breakdown -->
        ${ventureRows ? `<div class="mb-3"><div class="text-white-50 mb-1" style="font-size:0.65rem;text-transform:uppercase;letter-spacing:.05em;">Venture Impact</div>${ventureRows}</div>` : ''}
        <!-- Risks -->
        ${risks ? `<div class="mb-3"><div class="text-white-50 mb-2" style="font-size:0.65rem;text-transform:uppercase;letter-spacing:.05em;">⚠ Key Risks</div>${risks}</div>` : ''}
        <!-- Recommendations -->
        ${recs ? `<div><div class="text-white-50 mb-2" style="font-size:0.65rem;text-transform:uppercase;letter-spacing:.05em;">✓ Recommendations</div>${recs}</div>` : ''}
    </div>`;
}


// ─────────────────────────────────────────────────────────────────
// TAB 3: GOAL TRACKER
// ─────────────────────────────────────────────────────────────────

const GOAL_STORAGE_KEY = 'aether_biz_goals';

/** Restore saved goals from localStorage on tab open */
function loadSavedGoals() {
    try {
        const saved = JSON.parse(localStorage.getItem(GOAL_STORAGE_KEY) || '{}');
        if (saved.revenue) document.getElementById('biz-goal-revenue').value = saved.revenue;
        if (saved.profit)  document.getElementById('biz-goal-profit').value  = saved.profit;
        if (saved.months)  document.getElementById('biz-goal-months').value  = saved.months;
    } catch (_) {}
}

// Load goals whenever the predictive engine tab is activated
const _origSwitch = window.switchBizAILabTab;
window.switchBizAILabTab = function (tabName) {
    _origSwitch(tabName);
    if (tabName === 'biz-coming-soon') {
        setTimeout(loadSavedGoals, 50);
    }
};

window.runBizGoalAnalysis = async function () {
    const revEl    = document.getElementById('biz-goal-revenue');
    const prfEl    = document.getElementById('biz-goal-profit');
    const mthEl    = document.getElementById('biz-goal-months');
    const output   = document.getElementById('biz-goal-output');
    const btn      = document.getElementById('biz-goal-btn');

    const revGoal = parseFloat(revEl?.value || 0);
    const prfGoal = parseFloat(prfEl?.value || 0);
    const months  = parseInt(mthEl?.value  || 12);

    if (!revGoal && !prfGoal) {
        output.innerHTML = `<div class="text-warning small py-2">Please enter at least one goal (revenue or profit).</div>`;
        return;
    }

    // Persist goals
    localStorage.setItem(GOAL_STORAGE_KEY, JSON.stringify({ revenue: revGoal, profit: prfGoal, months }));

    btn.disabled = true;
    output.innerHTML = `
        <div class="d-flex align-items-center gap-2 py-3 text-white-50 small">
            <div class="spinner-border spinner-border-sm" style="width:14px;height:14px;"></div>
            Groq is analysing your goal progress…
        </div>`;

    try {
        const token = localStorage.getItem('access_token');
        const res = await fetch(`${API_BASE_URL}/business/ai/goals`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ revenue_goal: revGoal, profit_goal: prfGoal, months }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        renderGoalResult(data);
    } catch (err) {
        output.innerHTML = `<div class="text-danger small py-2">Error: ${err.message}</div>`;
    } finally {
        btn.disabled = false;
    }
};

function renderGoalResult(d) {
    const output = document.getElementById('biz-goal-output');
    if (!output) return;

    const statusColor = { on_track: '#86efac', at_risk: '#fcd34d', off_track: '#fca5a5' };
    const statusBg    = { on_track: 'rgba(34,197,94,0.08)', at_risk: 'rgba(245,158,11,0.08)', off_track: 'rgba(239,68,68,0.08)' };
    const statusLabel = { on_track: '✓ On Track', at_risk: '⚠ At Risk', off_track: '✗ Off Track' };
    const ost = d.overall_status || 'at_risk';

    function progressBar(pct, status) {
        const clampedPct = Math.min(Math.max(pct || 0, 0), 100);
        const color = statusColor[status] || '#fcd34d';
        return `
        <div style="background:rgba(255,255,255,0.06);border-radius:99px;height:6px;overflow:hidden;margin-top:6px;">
            <div style="width:${clampedPct}%;height:100%;background:${color};border-radius:99px;transition:width 0.8s ease;"></div>
        </div>`;
    }

    function fmtRs(v) {
        if (!v && v !== 0) return '—';
        const abs = Math.abs(v);
        const sign = v < 0 ? '-' : '';
        if (abs >= 1e7) return `${sign}₹${(abs/1e7).toFixed(2)} Cr`;
        if (abs >= 1e5) return `${sign}₹${(abs/1e5).toFixed(2)} L`;
        return `${sign}₹${abs.toLocaleString('en-IN')}`;
    }

    const actions = (d.top_actions || []).map((a, i) =>
        `<div class="d-flex gap-2 align-items-start mb-2">
            <span style="min-width:18px;height:18px;border-radius:50%;background:rgba(255,255,255,0.1);font-size:0.65rem;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.6);flex-shrink:0;margin-top:1px;">${i+1}</span>
            <span class="small" style="color:rgba(255,255,255,0.7);line-height:1.4;">${escapeHtml(a)}</span>
        </div>`
    ).join('');

    const etaText = d.months_to_goal_at_current_rate != null
        ? `${Math.round(d.months_to_goal_at_current_rate)} months at current rate`
        : 'Not achievable at current rate';

    output.innerHTML = `
    <div class="p-3 rounded-3" style="background:${statusBg[ost]};border:1px solid ${statusColor[ost]}33;">
        <!-- Overall badge -->
        <div class="d-flex align-items-center justify-content-between mb-3">
            <div class="text-white small fw-medium">Goal Progress Analysis</div>
            <span class="badge" style="background:${statusBg[ost]};border:1px solid ${statusColor[ost]}55;color:${statusColor[ost]};font-size:0.65rem;">${statusLabel[ost]}</span>
        </div>

        <!-- Revenue progress -->
        ${d.revenue_goal ? `
        <div class="mb-3">
            <div class="d-flex justify-content-between align-items-center">
                <span class="text-white-50 small" style="font-size:0.72rem;">Revenue — ${fmtRs(d.current_revenue)} of ${fmtRs(d.revenue_goal)}</span>
                <span class="small fw-medium" style="color:${statusColor[d.revenue_status||ost]};">${(d.revenue_progress_pct||0).toFixed(1)}%</span>
            </div>
            ${progressBar(d.revenue_progress_pct, d.revenue_status || ost)}
            ${d.revenue_gap > 0 ? `<div class="text-white-50 mt-1" style="font-size:0.7rem;">Gap: ${fmtRs(d.revenue_gap)} to go</div>` : ''}
        </div>` : ''}

        <!-- Profit progress -->
        ${d.profit_goal ? `
        <div class="mb-3">
            <div class="d-flex justify-content-between align-items-center">
                <span class="text-white-50 small" style="font-size:0.72rem;">Profit — ${fmtRs(d.current_profit)} of ${fmtRs(d.profit_goal)}</span>
                <span class="small fw-medium" style="color:${statusColor[d.profit_status||ost]};">${(d.profit_progress_pct||0).toFixed(1)}%</span>
            </div>
            ${progressBar(d.profit_progress_pct, d.profit_status || ost)}
            ${d.profit_gap > 0 ? `<div class="text-white-50 mt-1" style="font-size:0.7rem;">Gap: ${fmtRs(d.profit_gap)} to go</div>` : ''}
        </div>` : ''}

        <!-- AI Summary -->
        <div class="p-2 rounded-2 mb-3" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);">
            <div class="text-white-50 small" style="font-size:0.78rem;line-height:1.5;">${escapeHtml(d.summary || '')}</div>
        </div>

        <!-- ETA -->
        <div class="text-white-50 small mb-3" style="font-size:0.72rem;">⏱ Estimated time to goal: <span style="color:rgba(255,255,255,0.7);">${etaText}</span></div>

        <!-- Actions -->
        ${actions ? `<div><div class="text-white-50 mb-2" style="font-size:0.65rem;text-transform:uppercase;letter-spacing:.05em;">Top Actions</div>${actions}</div>` : ''}
    </div>`;
}

