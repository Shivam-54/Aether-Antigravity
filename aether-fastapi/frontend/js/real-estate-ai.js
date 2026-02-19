/**
 * Real Estate AI Insights Logic
 * Handles fetching and rendering of analytics data.
 */

// ==================== TAB SWITCHING ====================

/**
 * Switch between Real Estate AI Lab sub-tabs.
 * Tab IDs: re-predictions-risk | re-insights-sentiment | re-anomaly-correlation
 */
window.switchREAILabTab = function (tabName) {
    // Update tab buttons
    document.querySelectorAll('#re-ai-lab-tabs .ai-lab-tab').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    // Panel IDs use the name without the 're-' prefix, e.g. "re-ai-lab-panel-predictions-risk"
    const panelName = tabName.replace(/^re-/, '');

    // Update panels
    document.querySelectorAll('.ai-lab-panel[id^="re-ai-lab-panel-"]').forEach(panel => {
        const isActive = panel.id === `re-ai-lab-panel-${panelName}`;
        panel.style.display = isActive ? 'block' : 'none';
        panel.classList.toggle('active', isActive);
    });

    // Lazy-load content for the activated tab
    if (tabName === 're-predictions-risk') {
        fetchAndRenderAccuracyChart();
        fetchAndRenderHealthScore();
        fetchAndRenderRisks();
        fetchAndRenderPricePredictions();
    } else if (tabName === 're-insights-sentiment') {
        fetchAndRenderPortfolioSummary();
        fetchAndRenderDiversificationScore();
        fetchAndRenderRebalancingAdvisor();
        fetchAndRenderRentalYield();
    }
    // re-anomaly-correlation: Coming Soon — no fetch needed yet
};

// Also wire up via event delegation (belt-and-suspenders — works even when onclick="" is blocked)
document.addEventListener('DOMContentLoaded', function () {
    const tabGrid = document.getElementById('re-ai-lab-tabs');
    if (tabGrid) {
        tabGrid.addEventListener('click', function (e) {
            const btn = e.target.closest('button[data-tab]');
            if (btn) {
                e.preventDefault();
                switchREAILabTab(btn.dataset.tab);
            }
        });
    }
});


// ==================== INSIGHTS & DIVERSIFICATION TAB ====================

/**
 * Fetch Gemini AI portfolio summary and render insight cards
 */
async function fetchAndRenderPortfolioSummary() {
    const feed = document.getElementById('re-ai-insights-feed');
    const snapshot = document.getElementById('re-ai-portfolio-snapshot');
    const timestamp = document.getElementById('re-ai-summary-timestamp');
    if (!feed) return;

    // Show loading
    feed.innerHTML = `
        <div class="text-center text-white-50 py-4 small">
            <div class="spinner-border spinner-border-sm text-primary mb-2" role="status"></div>
            <div>Gemini is analysing your portfolio...</div>
        </div>`;

    try {
        const token = localStorage.getItem('access_token');
        const res = await fetch('/api/realestate/ai/summary', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        // Portfolio snapshot bar
        if (data.portfolio_snapshot && snapshot) {
            const s = data.portfolio_snapshot;
            const roi = s.portfolio_roi_pct >= 0
                ? `<span class="text-success">+${s.portfolio_roi_pct.toFixed(1)}%</span>`
                : `<span class="text-danger">${s.portfolio_roi_pct.toFixed(1)}%</span>`;
            snapshot.innerHTML = `
                <div class="glass-card p-2 px-3 flex-fill text-center" style="min-width:100px">
                    <div class="text-white-50 small" style="font-size:0.65rem;text-transform:uppercase;letter-spacing:.05em">Properties</div>
                    <div class="text-white fw-semibold">${s.total_properties}</div>
                </div>
                <div class="glass-card p-2 px-3 flex-fill text-center" style="min-width:100px">
                    <div class="text-white-50 small" style="font-size:0.65rem;text-transform:uppercase;letter-spacing:.05em">Total Value</div>
                    <div class="text-white fw-semibold">₹${(s.total_current_value_inr / 1e7).toFixed(2)} Cr</div>
                </div>
                <div class="glass-card p-2 px-3 flex-fill text-center" style="min-width:100px">
                    <div class="text-white-50 small" style="font-size:0.65rem;text-transform:uppercase;letter-spacing:.05em">Portfolio ROI</div>
                    <div class="fw-semibold">${roi}</div>
                </div>
                <div class="glass-card p-2 px-3 flex-fill text-center" style="min-width:100px">
                    <div class="text-white-50 small" style="font-size:0.65rem;text-transform:uppercase;letter-spacing:.05em">Rented</div>
                    <div class="text-white fw-semibold">${s.rented_count} / ${s.total_properties}</div>
                </div>`;
            snapshot.style.display = '';
        }

        // Insight cards
        if (!data.insights || data.insights.length === 0) {
            feed.innerHTML = `<div class="text-white-50 text-center py-3 small">No insights available.</div>`;
            return;
        }

        const severityBorder = { high: 'rgba(239,68,68,0.3)', medium: 'rgba(99,102,241,0.25)', low: 'rgba(34,197,94,0.2)' };
        const severityBg = { high: 'rgba(239,68,68,0.05)', medium: 'rgba(99,102,241,0.05)', low: 'rgba(34,197,94,0.04)' };
        const categoryColor = { risk: '#fca5a5', opportunity: '#86efac', action: '#fde68a', overview: '#c4b5fd', property: '#93c5fd' };

        feed.innerHTML = data.insights.map(ins => {
            const border = severityBorder[ins.severity] || severityBorder.medium;
            const bg = severityBg[ins.severity] || severityBg.medium;
            const color = categoryColor[ins.category] || '#fff';
            return `
            <div class="insight-card p-3 rounded-3" style="background:${bg}; border:1px solid ${border};">
                <div class="d-flex align-items-start gap-3">
                    <div style="font-size:1.1rem;line-height:1;padding-top:2px;color:${color};">${ins.icon || '◈'}</div>
                    <div>
                        <div class="fw-medium text-white small mb-1">${ins.title}</div>
                        <div class="text-white-50" style="font-size:0.78rem;line-height:1.4;">${ins.content}</div>
                        <span class="badge mt-2" style="font-size:0.6rem;background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.5);">${ins.category.toUpperCase()}</span>
                    </div>
                </div>
            </div>`;
        }).join('');

        if (timestamp) timestamp.textContent = 'Updated ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    } catch (err) {
        feed.innerHTML = `<div class="text-danger small text-center py-3">Failed to load AI summary. ${err.message}</div>`;
    }
}
window.fetchAndRenderPortfolioSummary = fetchAndRenderPortfolioSummary;


/**
 * Fetch diversification score and render gauge + breakdown bars
 */
async function fetchAndRenderDiversificationScore() {
    const container = document.getElementById('re-diversification-content');
    if (!container) return;

    container.innerHTML = `
        <div class="text-center text-white-50 py-4 small">
            <div class="spinner-border spinner-border-sm text-primary mb-2" role="status"></div>
            <div>Analysing portfolio concentration...</div>
        </div>`;

    try {
        const token = localStorage.getItem('access_token');
        const res = await fetch('/api/realestate/ai/diversification', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        const gradeColor = { A: '#22c55e', B: '#86efac', C: '#fde68a', D: '#f87171', 'N/A': '#6b7280' };
        const color = gradeColor[data.grade] || '#fff';

        // Build breakdown bars
        const breakdownHTML = (data.breakdown || []).map(dim => {
            const conc = Math.min(dim.concentration_pct, 100);
            const barColor = conc > 70 ? '#f87171' : conc > 40 ? '#fde68a' : '#86efac';
            const entriesHTML = (dim.entries || []).slice(0, 4).map(e =>
                `<div class="d-flex justify-content-between align-items-center mb-1">
                    <span class="text-white-50" style="font-size:0.72rem;">${e.label}</span>
                    <div class="d-flex align-items-center gap-2">
                        <div style="width:80px;height:4px;background:rgba(255,255,255,0.08);border-radius:4px;overflow:hidden;">
                            <div style="width:${e.value_pct}%;height:100%;background:${barColor};border-radius:4px;"></div>
                        </div>
                        <span class="text-white-50" style="font-size:0.68rem;width:34px;text-align:right;">${e.value_pct}%</span>
                    </div>
                </div>`
            ).join('');

            return `
            <div class="mb-3">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="text-white small">${dim.icon || ''} ${dim.dimension}</span>
                    <span class="small" style="color:${barColor};">${dim.concentration_pct.toFixed(0)}% concentration</span>
                </div>
                ${entriesHTML}
            </div>`;
        }).join('');

        // Recommendations
        const recsHTML = (data.recommendations || []).map(r =>
            `<div class="d-flex align-items-start gap-2 mb-2">
                <span style="color:#fde68a;font-size:.85rem;">◇</span>
                <span class="text-white-50" style="font-size:0.78rem;">${r}</span>
            </div>`
        ).join('');

        container.innerHTML = `
            <div class="row g-4 align-items-start">
                <!-- Score gauge -->
                <div class="col-md-3 text-center">
                    <div style="display:inline-flex;flex-direction:column;align-items:center;justify-content:center;
                                width:120px;height:120px;border-radius:50%;
                                border:3px solid ${color};
                                box-shadow:0 0 30px ${color}22;
                                background:rgba(255,255,255,0.03);">
                        <div style="font-size:2rem;font-weight:300;color:${color};line-height:1;">${data.score}</div>
                        <div style="font-size:0.65rem;color:rgba(255,255,255,0.4);letter-spacing:0.1em;text-transform:uppercase;">/ 100</div>
                    </div>
                    <div class="mt-3">
                        <div class="fw-semibold" style="color:${color};font-size:1.3rem;">Grade ${data.grade}</div>
                        <div class="text-white-50 small">Diversification</div>
                    </div>
                </div>
                <!-- Breakdown -->
                <div class="col-md-9">
                    ${breakdownHTML}
                    ${recsHTML ? `<div class="mt-3 pt-3" style="border-top:1px solid rgba(255,255,255,0.07);">
                        <div class="text-white-50 mb-2" style="font-size:0.7rem;text-transform:uppercase;letter-spacing:.06em;">Recommendations</div>
                        ${recsHTML}
                    </div>` : ''}
                </div>
            </div>`;

    } catch (err) {
        container.innerHTML = `<div class="text-danger small text-center py-3">Failed to load diversification score. ${err.message}</div>`;
    }
}
window.fetchAndRenderDiversificationScore = fetchAndRenderDiversificationScore;


// ==================== REBALANCING ADVISOR ====================

async function fetchAndRenderRebalancingAdvisor() {
    const container = document.getElementById('re-rebalancing-content');
    if (!container) return;

    container.innerHTML = `
        <div class="text-center text-white-50 py-4 small">
            <div class="spinner-border spinner-border-sm text-primary mb-2" role="status"></div>
            <div>Gemini is analysing portfolio gaps...</div>
        </div>`;

    try {
        const token = localStorage.getItem('access_token');
        const res = await fetch('/api/realestate/ai/rebalancing', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        const priorityColor = { high: '#f87171', medium: '#fde68a', low: '#86efac' };
        const priorityBorder = { high: 'rgba(239,68,68,0.25)', medium: 'rgba(250,204,21,0.2)', low: 'rgba(34,197,94,0.15)' };
        const priorityBg = { high: 'rgba(239,68,68,0.05)', medium: 'rgba(250,204,21,0.04)', low: 'rgba(34,197,94,0.04)' };

        // Gaps row
        const gapsHTML = (data.gaps || []).length > 0
            ? `<div class="mb-3">
                <div class="text-white-50 mb-2" style="font-size:0.7rem;text-transform:uppercase;letter-spacing:.06em;">Identified Gaps</div>
                <div class="d-flex flex-column gap-2">
                    ${(data.gaps || []).slice(0, 4).map(g => `
                        <div class="p-2 px-3 rounded-3 d-flex align-items-center gap-3"
                             style="background:${priorityBg[g.severity] || priorityBg.medium};border:1px solid ${priorityBorder[g.severity] || priorityBorder.medium};">
                            <div style="width:6px;height:6px;border-radius:50%;background:${priorityColor[g.severity] || priorityColor.medium};flex-shrink:0;"></div>
                            <div>
                                <div class="text-white small fw-medium">${g.label}</div>
                                <div class="text-white-50" style="font-size:0.73rem;">${g.detail}</div>
                            </div>
                        </div>`).join('')}
                </div>
               </div>` : '';

        // Gemini suggestions
        const suggestionsHTML = (data.suggestions || []).map(s => {
            const c = priorityColor[s.priority] || '#c4b5fd';
            const bg = priorityBg[s.priority] || 'rgba(99,102,241,0.05)';
            const border = priorityBorder[s.priority] || 'rgba(99,102,241,0.2)';
            return `
            <div class="p-3 rounded-3" style="background:${bg};border:1px solid ${border};">
                <div class="d-flex align-items-start gap-3">
                    <div style="color:${c};font-size:1rem;padding-top:2px;">${s.icon || '◈'}</div>
                    <div>
                        <div class="fw-medium text-white small mb-1">${s.title}</div>
                        <div class="text-white-50" style="font-size:0.77rem;line-height:1.45;">${s.detail}</div>
                        <span class="badge mt-1" style="font-size:0.58rem;background:rgba(255,255,255,0.07);color:${c};">${(s.priority || '').toUpperCase()} PRIORITY</span>
                    </div>
                </div>
            </div>`;
        }).join('');

        container.innerHTML = `
            ${gapsHTML}
            <div class="text-white-50 mb-2" style="font-size:0.7rem;text-transform:uppercase;letter-spacing:.06em;">AI Suggestions</div>
            <div class="d-flex flex-column gap-2">${suggestionsHTML || '<div class="text-white-50 small">Portfolio is well balanced.</div>'}</div>`;

    } catch (err) {
        container.innerHTML = `<div class="text-danger small text-center py-3">Failed to load rebalancing advice. ${err.message}</div>`;
    }
}
window.fetchAndRenderRebalancingAdvisor = fetchAndRenderRebalancingAdvisor;


// ==================== RENTAL YIELD OPTIMIZER ====================

async function fetchAndRenderRentalYield() {
    const container = document.getElementById('re-rental-yield-content');
    if (!container) return;

    container.innerHTML = `
        <div class="text-center text-white-50 py-4 small">
            <div class="spinner-border spinner-border-sm text-primary mb-2" role="status"></div>
            <div>Fetching rental market benchmarks...</div>
        </div>`;

    try {
        const token = localStorage.getItem('access_token');
        const res = await fetch('/api/realestate/ai/rental-yield', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        const s = data.summary || {};
        const statusConfig = {
            vacant: { color: '#f87171', bg: 'rgba(239,68,68,0.12)', label: 'Vacant' },
            under_priced: { color: '#fde68a', bg: 'rgba(250,204,21,0.1)', label: 'Under-priced' },
            at_market: { color: '#86efac', bg: 'rgba(34,197,94,0.1)', label: 'At Market' },
            above_market: { color: '#5eead4', bg: 'rgba(45,212,191,0.1)', label: 'Above Market' },
        };

        // Summary bar
        const incomeGapColor = s.income_gap_monthly > 0 ? '#fde68a' : '#86efac';
        const summaryHTML = `
            <div class="d-flex gap-3 flex-wrap mb-4">
                <div class="glass-card p-2 px-3 flex-fill text-center" style="min-width:110px">
                    <div class="text-white-50 small" style="font-size:0.65rem;text-transform:uppercase;letter-spacing:.05em">Actual / Mo</div>
                    <div class="text-white fw-semibold">₹${(s.actual_monthly || 0).toLocaleString('en-IN')}</div>
                </div>
                <div class="glass-card p-2 px-3 flex-fill text-center" style="min-width:110px">
                    <div class="text-white-50 small" style="font-size:0.65rem;text-transform:uppercase;letter-spacing:.05em">Market Rate / Mo</div>
                    <div class="text-white fw-semibold">₹${(s.potential_monthly || 0).toLocaleString('en-IN')}</div>
                </div>
                <div class="glass-card p-2 px-3 flex-fill text-center" style="min-width:110px">
                    <div class="text-white-50 small" style="font-size:0.65rem;text-transform:uppercase;letter-spacing:.05em">Income Gap / Mo</div>
                    <div class="fw-semibold" style="color:${incomeGapColor};">₹${(s.income_gap_monthly || 0).toLocaleString('en-IN')}</div>
                </div>
                <div class="glass-card p-2 px-3 flex-fill text-center" style="min-width:110px">
                    <div class="text-white-50 small" style="font-size:0.65rem;text-transform:uppercase;letter-spacing:.05em">Annual Gap</div>
                    <div class="fw-semibold" style="color:${incomeGapColor};">₹${(s.income_gap_annual || 0).toLocaleString('en-IN')}</div>
                </div>
            </div>`;

        // Per-property rows
        const rowsHTML = (data.properties || []).map(p => {
            const cfg = statusConfig[p.status] || statusConfig.at_market;
            const actualDisplay = p.actual_monthly > 0 ? `₹${p.actual_monthly.toLocaleString('en-IN')}/mo` : '—';
            const yieldDisplay = p.actual_yield_pct > 0 ? `${p.actual_yield_pct}%` : '—';
            return `
            <div class="p-3 rounded-3 mb-2" style="background:rgba(255,255,255,0.025);border:1px solid rgba(255,255,255,0.07);">
                <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
                    <div>
                        <div class="text-white small fw-medium">${p.name}</div>
                        <div class="text-white-50" style="font-size:0.7rem;">${p.type} · ${(p.location || '').split(',')[0]}</div>
                    </div>
                    <span class="badge px-2 py-1" style="background:${cfg.bg};color:${cfg.color};font-size:0.65rem;">${cfg.label}</span>
                </div>
                <div class="d-flex gap-4 mt-2 flex-wrap">
                    <div>
                        <div class="text-white-50" style="font-size:0.63rem;text-transform:uppercase;letter-spacing:.05em;">Actual Rent</div>
                        <div class="text-white small">${actualDisplay}</div>
                    </div>
                    <div>
                        <div class="text-white-50" style="font-size:0.63rem;text-transform:uppercase;letter-spacing:.05em;">Market Range</div>
                        <div class="text-white small">₹${p.market_monthly_lo.toLocaleString('en-IN')}–₹${p.market_monthly_hi.toLocaleString('en-IN')}/mo</div>
                    </div>
                    <div>
                        <div class="text-white-50" style="font-size:0.63rem;text-transform:uppercase;letter-spacing:.05em;">Yield (actual)</div>
                        <div class="text-white small">${yieldDisplay} <span class="text-white-50">(mkt: ${p.market_yield_range})</span></div>
                    </div>
                </div>
                <div class="mt-2 text-white-50" style="font-size:0.72rem;line-height:1.4;">◇ ${p.recommendation}</div>
            </div>`;
        }).join('');

        container.innerHTML = summaryHTML + rowsHTML;

    } catch (err) {
        container.innerHTML = `<div class="text-danger small text-center py-3">Failed to load rental yield data. ${err.message}</div>`;
    }
}
window.fetchAndRenderRentalYield = fetchAndRenderRentalYield;



window.renderRealEstateAIInsights = async function () {
    console.log('Rendering Real Estate AI Insights...');

    // Trigger load for the currently active tab only
    try {
        await Promise.all([
            fetchAndRenderAccuracyChart(),
            fetchAndRenderAIInsights(),
            fetchAndRenderHealthScore(),
            fetchAndRenderRanking(),
            fetchAndRenderRisks(),
            fetchAndRenderPricePredictions()
        ]);
    } catch (error) {
        console.error("Error loading AI insights:", error);
    }
};


// Global function to update predictions when model/timeframe changes
window.updateAIPredictions = async function () {
    console.log('Updating predictions with new parameters...');
    await fetchAndRenderPricePredictions();
    await fetchAndRenderAccuracyChart();
};

// Global function to compare model performance
window.compareModelPerformance = function () {
    // Show the comparison modal
    const modal = new bootstrap.Modal(document.getElementById('modelComparisonModal'));
    modal.show();
};

async function fetchAndRenderAccuracyChart() {
    const canvas = document.getElementById('accuracyChart');
    const metricsContainer = document.getElementById('accuracyMetrics');
    if (!canvas || !metricsContainer) return;

    try {
        const token = localStorage.getItem('access_token');
        const model = document.getElementById('mlModelSelector')?.value || 'prophet';

        // Fetch real accuracy data from API
        const response = await fetch(`${API_BASE_URL}/realestate/ml/accuracy-history?model=${model}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to fetch accuracy data');
        const data = await response.json();

        // Render Chart
        const ctx = canvas.getContext('2d');

        // Destroy existing chart if it exists
        if (window.accuracyChartInstance) {
            window.accuracyChartInstance.destroy();
        }

        window.accuracyChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.dates,
                datasets: [
                    {
                        label: 'Predicted Price',
                        data: data.predicted,
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: false,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    },
                    {
                        label: 'Actual Price',
                        data: data.actual,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: false,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    },
                    {
                        label: 'Confidence Range',
                        data: data.confidence_upper,
                        borderColor: 'rgba(59, 130, 246, 0.2)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderWidth: 0,
                        tension: 0.4,
                        fill: '+1',
                        pointRadius: 0
                    },
                    {
                        label: 'Confidence Lower',
                        data: data.confidence_lower,
                        borderColor: 'rgba(59, 130, 246, 0.2)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderWidth: 0,
                        tension: 0.4,
                        fill: false,
                        pointRadius: 0
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: 'rgba(255,255,255,0.7)',
                            font: { family: 'Inter', size: 11 },
                            filter: (item) => item.text !== 'Confidence Lower' // Hide from legend
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(10,10,12,0.95)',
                        titleColor: '#fff',
                        bodyColor: 'rgba(255,255,255,0.8)',
                        borderColor: 'rgba(255,255,255,0.1)',
                        borderWidth: 1,
                        padding: 12,
                        cornerRadius: 8,
                        callbacks: {
                            label: function (context) {
                                const label = context.dataset.label || '';
                                const value = context.parsed.y;
                                return `${label}: ₹${(value / 100000).toFixed(2)}L`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        grid: { color: 'rgba(255,255,255,0.05)', drawBorder: false },
                        ticks: {
                            color: 'rgba(255,255,255,0.4)',
                            font: { size: 10 },
                            callback: (value) => `₹${(value / 100000).toFixed(1)}L`
                        }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: 'rgba(255,255,255,0.6)', font: { size: 10 } }
                    }
                }
            }
        });

        // Render Metrics using real data
        const rmse = data.metrics.rmse;
        const mae = data.metrics.mae;
        const r2 = data.metrics.r2;

        metricsContainer.innerHTML = `
            <div class="col-md-3">
                <div class="text-center p-3 rounded" style="background: rgba(255,255,255,0.03);">
                    <div class="text-white-50 small mb-1">RMSE</div>
                    <div class="h5 text-white mb-0">₹${(rmse / 1000).toFixed(1)}k</div>
                    <div class="text-white-50" style="font-size: 0.7rem;">Root Mean Sq Error</div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="text-center p-3 rounded" style="background: rgba(255,255,255,0.03);">
                    <div class="text-white-50 small mb-1">MAE</div>
                    <div class="h5 text-white mb-0">₹${(mae / 1000).toFixed(1)}k</div>
                    <div class="text-white-50" style="font-size: 0.7rem;">Mean Absolute Error</div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="text-center p-3 rounded" style="background: rgba(255,255,255,0.03);">
                    <div class="text-white-50 small mb-1">R² Score</div>
                    <div class="h5 text-white mb-0">${r2.toFixed(3)}</div>
                    <div class="text-white-50" style="font-size: 0.7rem;">Model Fit Quality</div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="text-center p-3 rounded" style="background: rgba(255,255,255,0.03);">
                    <div class="text-white-50 small mb-1">Training Data</div>
                    <div class="h5 text-white mb-0">${data.metrics.training_samples}</div>
                    <div class="text-white-50" style="font-size: 0.7rem;">Data Points Used</div>
                </div>
            </div>
        `;

    } catch (e) {
        console.error('Accuracy chart error:', e);
        if (metricsContainer) {
            metricsContainer.innerHTML = '<div class="col-12 text-center text-white-50 py-3 small">Unable to load accuracy data</div>';
        }
    }
}


async function fetchAndRenderHealthScore() {
    const container = document.getElementById('ai-health-score-container');
    if (!container) return;

    try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${API_BASE_URL}/realestate/analytics/health-score`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to fetch health score');
        const data = await response.json();

        // Render
        const score = data.overall_score;
        const offset = 565.48 - (score / 100) * 565.48;
        const colorClass = score > 80 ? 'text-success' : (score > 60 ? 'text-info' : (score > 40 ? 'text-warning' : 'text-danger'));
        const strokeColor = score > 80 ? '#10b981' : (score > 60 ? '#06b6d4' : (score > 40 ? '#f59e0b' : '#ef4444'));

        let breakdownHtml = Object.entries(data.breakdown).map(([key, val]) => {
            return `
                <div class="d-flex align-items-center justify-content-between mb-2 small">
                    <span class="text-white-50 text-capitalize">${key}</span>
                    <div class="d-flex align-items-center gap-2" style="width: 60%">
                        <div class="progress flex-grow-1" style="height: 4px; background: rgba(255,255,255,0.1);">
                            <div class="progress-bar" role="progressbar" style="width: ${val}%; background-color: ${strokeColor};"></div>
                        </div>
                        <span class="text-white fw-light" style="width: 25px; text-align: right;">${val}</span>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = `
            <div class="row align-items-center">
                <div class="col-md-5 text-center">
                    <div class="position-relative d-inline-block">
                        <svg width="160" height="160" viewBox="0 0 200 200" style="transform: rotate(-90deg);">
                            <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="12"/>
                            <circle cx="100" cy="100" r="90" fill="none" stroke="${strokeColor}" stroke-width="12"
                                    stroke-dasharray="565.48" stroke-dashoffset="${offset}"
                                    stroke-linecap="round"
                                    style="transition: stroke-dashoffset 1.5s ease-out;"/>
                        </svg>
                        <div class="position-absolute top-50 start-50 translate-middle text-center">
                            <div class="h2 mb-0 fw-light text-white">${score}</div>
                            <div class="msg small text-white-50">${data.grade}</div>
                        </div>
                    </div>
                </div>
                <div class="col-md-7">
                    <h3 class="h5 fw-light text-white mb-3">Portfolio Health</h3>
                    <div class="mb-3">
                        ${breakdownHtml}
                    </div>
                    <div class="d-flex gap-2">
                        ${data.recommendations.slice(0, 1).map(rec =>
            `<div class="p-2 rounded text-white-80 small d-flex gap-2" style="background: rgba(255,255,255,0.05);">
                                <span>💡</span> ${rec}
                             </div>`
        ).join('')}
                    </div>
                </div>
            </div>
        `;

    } catch (e) {
        console.error(e);
        container.innerHTML = '<div class="text-white-50 text-center py-4">Failed to load health score</div>';
    }
}

async function fetchAndRenderRanking() {
    const container = document.getElementById('ai-performance-ranking');
    if (!container) return;

    try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${API_BASE_URL}/realestate/analytics/ranking`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to fetch ranking');
        const data = await response.json();

        if (data.rankings.length === 0) {
            container.innerHTML = '<div class="col-12 text-center text-white-50 py-3">No properties to rank</div>';
            return;
        }

        // Top 3 cards
        container.innerHTML = data.rankings.slice(0, 3).map((prop, index) => {
            const medal = index === 0 ? '🥇' : (index === 1 ? '🥈' : '🥉');
            const bgStyle = index === 0
                ? 'background: linear-gradient(135deg, rgba(255,215,0,0.1), rgba(255,215,0,0.05)); border: 1px solid rgba(255,215,0,0.3);'
                : 'background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05);';

            return `
                <div class="col-md-4">
                    <div class="glass-card p-3 h-100 d-flex flex-column align-items-center text-center position-relative" style="${bgStyle}">
                        <div class="fs-1 mb-2">${medal}</div>
                        <h4 class="h6 text-white text-truncate w-100 mb-1" title="${prop.name}">${prop.name}</h4>
                        <div class="text-success small fw-medium mb-2">+${prop.roi_percent}% ROI</div>
                        
                        <div class="mt-auto w-100 pt-2 border-top border-white-10 d-flex justify-content-between text-white-50 small">
                            <span>Yield</span>
                            <span>${prop.rental_yield}%</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

    } catch (e) {
        console.error(e);
    }
}

async function fetchAndRenderRisks() {
    const section = document.getElementById('ai-risk-section');
    const container = document.getElementById('ai-risk-container');
    if (!section || !container) return;

    try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${API_BASE_URL}/realestate/analytics/risks`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to fetch risks');
        const result = await response.json(); // Array of PropertyRisk

        if (result.length === 0) {
            section.style.display = 'none';
            return;
        }

        section.style.display = 'block';

        // Flatten risks for display
        let allRisks = [];
        result.forEach(p => {
            p.risks.forEach(r => {
                allRisks.push({ ...r, property_name: p.property_name });
            });
        });

        if (allRisks.length === 0) {
            section.style.display = 'none';
            return;
        }

        container.innerHTML = allRisks.map(risk => {
            const borderClass = risk.severity === 'high' ? 'border-danger' : (risk.severity === 'medium' ? 'border-warning' : 'border-success');
            const icon = risk.severity === 'high' ? '⚠️' : '🛡️';

            return `
                <div class="glass-card p-3 d-flex gap-3 align-items-start" style="border-left: 3px solid ${risk.severity === 'high' ? '#ef4444' : '#f59e0b'};">
                    <div class="fs-4">${icon}</div>
                    <div>
                        <div class="d-flex align-items-center gap-2 mb-1">
                            <span class="text-white fw-light">${risk.property_name}</span>
                            <span class="badge bg-white bg-opacity-10 text-white-50 fw-light rounded-pill px-2" style="font-size: 0.7em;">${risk.type.replace('_', ' ')}</span>
                        </div>
                        <p class="text-white-80 small mb-0 fw-light">${risk.message}</p>
                    </div>
                </div>
            `;
        }).join('');

    } catch (e) {
        console.error(e);
        section.style.display = 'none';
    }
}

async function fetchAndRenderPricePredictions() {
    const container = document.getElementById('ai-price-predictions');
    if (!container) return;

    try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${API_BASE_URL}/realestate/ml/predict-all?days_ahead=90`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to fetch predictions');
        const data = await response.json();

        if (!data.predictions || data.predictions.length === 0) {
            container.innerHTML = '<div class="col-12 text-center text-white-50 py-3 small">No predictions available</div>';
            return;
        }

        // Show top 3 predictions with minimal dark glass design
        container.innerHTML = data.predictions.slice(0, 3).map((pred, idx) => {
            const isPositive = pred.percent_change >= 0;
            const trendColor = isPositive ? '#10b981' : '#ef4444';
            const trendIcon = isPositive ? '📈' : '📉';
            const formatCurrency = (val) => `₹${(val / 100000).toFixed(2)}L`;

            // Rank badges
            const rankEmoji = idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉';

            return `
                <div class="col-lg-4 col-md-6 mb-3">
                    <div class="glass-card h-100" 
                         style="
                             background: rgba(0, 0, 0, 0.4);
                             backdrop-filter: blur(10px);
                             border: 1px solid rgba(255, 255, 255, 0.08);
                             border-left: 3px solid ${trendColor};
                             border-radius: 12px;
                             padding: 1.5rem;
                             transition: all 0.3s ease;
                         "
                         onmouseover="this.style.transform='translateY(-2px)'; this.style.borderColor='${trendColor}40';"
                         onmouseout="this.style.transform='translateY(0)'; this.style.borderColor='rgba(255, 255, 255, 0.08)';">
                        
                        <!-- Header with Rank -->
                        <div class="d-flex align-items-start justify-content-between mb-3">
                            <div class="d-flex align-items-center gap-2">
                                <span style="font-size: 1.5rem;">${trendIcon}</span>
                                <div>
                                    <h6 class="text-white mb-0" style="font-size: 0.95rem; font-weight: 600;" title="${pred.property_name}">
                                        ${pred.property_name.length > 20 ? pred.property_name.substring(0, 20) + '...' : pred.property_name}
                                    </h6>
                                    <div class="d-flex align-items-center gap-2 mt-1">
                                        <span class="badge" style="background: rgba(99, 102, 241, 0.2); color: #818cf8; font-size: 0.65rem;">
                                            ${getModelBadge()}
                                        </span>
                                        <span class="text-white-50" style="font-size: 0.6rem; text-transform: uppercase; letter-spacing: 0.5px;">
                                            ${getDaysBadge()} Forecast
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <span style="font-size: 1.3rem;">${rankEmoji}</span>
                        </div>

                        <!-- Limited Data Warning -->
                        <div class="mb-2 px-2 py-1" style="background: rgba(255, 193, 7, 0.1); border-left: 2px solid #FFC107; border-radius: 4px;">
                            <small class="text-warning" style="font-size: 0.65rem;">
                                ⚠️ Estimate based on 2 data points
                            </small>
                        </div>

                        <!-- Values -->
                        <div class="row g-2 mb-3">
                            <div class="col-6">
                                <div class="text-white-50 mb-1" style="font-size: 0.65rem; text-transform: uppercase;">Current</div>
                                <div class="text-white" style="font-size: 1rem; font-weight: 600;">${formatCurrency(pred.current_value)}</div>
                            </div>
                            <div class="col-6">
                                <div class="text-white-50 mb-1" style="font-size: 0.65rem; text-transform: uppercase;">Predicted</div>
                                <div style="font-size: 1rem; font-weight: 700; color: ${trendColor};">
                                    ${formatCurrency(pred.predicted_value)}
                                </div>
                            </div>
                        </div>

                        <!-- Expected Change -->
                        <div class="text-center py-2 mb-3" style="background: rgba(0, 0, 0, 0.3); border-radius: 8px;">
                            <div class="text-white-50 mb-1" style="font-size: 0.65rem; text-transform: uppercase;">Expected Change</div>
                            <div style="font-size: 1.8rem; font-weight: 800; color: ${trendColor};">
                                ${isPositive ? '+' : ''}${pred.percent_change.toFixed(2)}%
                            </div>
                            <div class="text-white-50" style="font-size: 0.7rem;">
                                ${formatCurrency(Math.abs(pred.predicted_value - pred.current_value))}
                            </div>
                        </div>

                        <!-- Confidence Range -->
                        <div style="border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 0.75rem;">
                            <div class="d-flex justify-content-between align-items-center mb-1">
                                <span class="text-white-50" style="font-size: 0.65rem;">Confidence Range</span>
                                <span class="text-white-50" style="font-size: 0.65rem;">80%</span>
                            </div>
                            <div style="font-size: 0.7rem; color: rgba(255, 255, 255, 0.5);">
                                ${pred.confidence_lower ? formatCurrency(pred.confidence_lower) : '—'} 
                                <span style="color: ${trendColor};">→</span> 
                                ${pred.confidence_upper ? formatCurrency(pred.confidence_upper) : '—'}
                            </div>
                        </div>

                    </div>
                </div>
            `;
        }).join('');

    } catch (e) {
        console.error('Price prediction error:', e);
        container.innerHTML = '<div class="col-12 text-center text-white-50 py-3 small">Unable to load predictions</div>';
    }
}

// Helper function to get model badge text
function getModelBadge() {
    const modelSelect = document.getElementById('mlModelSelector');
    if (!modelSelect) return 'Prophet';

    const model = modelSelect.value;
    const modelNames = {
        'prophet': 'Prophet',
        'lstm': 'LSTM',
        'ensemble': 'Ensemble'
    };
    return modelNames[model] || 'Prophet';
}

// Helper function to get forecast period
function getDaysBadge() {
    const periodSelect = document.getElementById('forecastPeriodSelector');
    if (!periodSelect) return '90-Day';

    const days = periodSelect.value;
    const periods = {
        '30': '30-Day',
        '90': '90-Day',
        '180': '180-Day',
        '365': '1-Year'
    };
    return periods[days] || '90-Day';
}

// ==================== AI INSIGHTS FEED ====================

async function fetchAndRenderAIInsights() {
    const feedContainer = document.getElementById('aiInsightsFeed');
    const lastUpdateEl = document.getElementById('insightsLastUpdate');
    if (!feedContainer) return;

    try {
        const token = localStorage.getItem('access_token');

        // Fetch real AI insights from API
        const response = await fetch(`${API_BASE_URL}/realestate/ml/insights`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to fetch insights');
        const data = await response.json();
        const insights = data.insights || [];

        if (insights.length === 0) {
            feedContainer.innerHTML = '<div class="text-center text-white-50 py-3 small">No insights available. Add properties to unlock AI-powered recommendations.</div>';
            return;
        }

        // Render insights
        feedContainer.innerHTML = insights.map((insight, idx) => `
            <div class="p-3 rounded" style="background: rgba(255,255,255,0.03); border-left: 3px solid ${insight.color}; animation: slideIn 0.3s ease-out ${idx * 0.1}s both;">
                <div class="d-flex align-items-start gap-2">
                    <span style="font-size: 1.2rem;">${insight.icon}</span>
                    <div class="flex-grow-1">
                        <div class="text-white-90 small mb-1"><strong>${insight.title}</strong></div>
                        <div class="text-white-60" style="font-size: 0.85rem;">${insight.description}</div>
                        <div class="d-flex align-items-center gap-2 mt-2">
                            <span class="badge px-2 py-1" style="background: rgba(${insight.confidence > 80 ? '16, 185, 129' : '251, 191, 36'}, 0.2); color: ${insight.confidence > 80 ? '#10b981' : '#fbbf24'}; font-size: 0.7rem;">
                                ${insight.confidence}% Confidence
                            </span>
                            <span class="text-white-50" style="font-size: 0.7rem;">${insight.timestamp}</span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        // Update timestamp
        if (lastUpdateEl) {
            lastUpdateEl.textContent = `Last updated: ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
        }

    } catch (e) {
        console.error('AI Insights error:', e);
        feedContainer.innerHTML = '<div class="text-center text-white-50 py-3 small">Unable to load AI insights</div>';
    }
}

// Make function globally accessible
window.fetchAndRenderAIInsights = fetchAndRenderAIInsights;

// ==================== SCENARIO SIMULATOR ====================

// Global function to update scenario as slider moves
window.updateScenario = function () {
    const slider = document.getElementById('marketGrowthSlider');
    const growthValueEl = document.getElementById('growthValue');
    const scenarioValueEl = document.getElementById('scenarioValue');
    const scenarioChangeEl = document.getElementById('scenarioChange');

    if (!slider || !growthValueEl || !scenarioValueEl || !scenarioChangeEl) return;

    const growthPercent = parseInt(slider.value);
    const baseValue = 5.0; // Base portfolio value in Cr

    // Calculate new value
    const newValue = baseValue * (1 + growthPercent / 100);
    const absoluteChange = newValue - baseValue;
    const percentChange = ((newValue - baseValue) / baseValue) * 100;

    // Update display
    growthValueEl.textContent = `${growthPercent >= 0 ? '+' : ''}${growthPercent}%`;
    growthValueEl.style.background = growthPercent >= 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)';
    growthValueEl.style.color = growthPercent >= 0 ? '#10b981' : '#ef4444';

    scenarioValueEl.textContent = `₹${newValue.toFixed(1)} Cr`;
    scenarioChangeEl.innerHTML = `
        <span class="${percentChange >= 0 ? 'text-success' : 'text-danger'}">
            ${percentChange >= 0 ? '+' : ''}${percentChange.toFixed(1)}% ${percentChange >= 0 ? '📈' : '📉'}
        </span>
        <span class="text-white-50 ms-2" style="font-size: 0.75rem;">
            (${absoluteChange >= 0 ? '+' : ''}₹${Math.abs(absoluteChange).toFixed(2)} Cr)
        </span>
    `;
};

// Global function to run detailed scenario analysis
window.runDetailedScenario = async function () {
    const slider = document.getElementById('marketGrowthSlider');
    if (!slider) return;

    const growthPercent = parseInt(slider.value);

    // Show modal with detailed analysis
    alert(`Detailed Scenario Analysis:\n\nMarket Growth: ${growthPercent}%\n\nThis feature will show:\n• Property-by-property impact\n• Risk exposure changes\n• Recommended actions\n• Timeline projections\n\nComing soon!`);

    // TODO: Implement detailed modal with:
    // - Property breakdown
    // - Risk analysis
    // - Recommended actions
    // - Timeline visualization
};

