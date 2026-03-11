/**
 * Shares Performance Module — Redesigned
 * Premium analytics dashboard with KPI bar, asset breakdown table,
 * portfolio growth chart, and scenario simulator.
 */

function renderPerformanceAnalytics() {
    const container = document.getElementById('shares-section-performance');
    if (!container) return;

    if (typeof SHARES_DATA === 'undefined' || typeof AnalyticsUtils === 'undefined') {
        console.warn('SHARES_DATA or AnalyticsUtils not loaded');
        return;
    }

    const holdings = SHARES_DATA.holdings.filter(s => s.status === 'active');

    // ── Empty State ────────────────────────────────────────────────────────────
    if (holdings.length === 0) {
        container.innerHTML = `
            <div class="d-flex flex-column gap-4">
                <div class="glass-header mb-2">
                    <h2 class="h4 fw-light text-white-90 mb-1">Performance Analytics</h2>
                    <p class="small fw-light text-white-50">Deep-dive into your portfolio's behaviour and risk profile</p>
                </div>
                <div class="p-5 text-center rounded-4" style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08);">
                    <div class="d-inline-flex align-items-center justify-content-center rounded-circle mb-4"
                         style="width: 72px; height: 72px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.10);">
                        <svg width="32" height="32" fill="none" stroke="rgba(255,255,255,0.35)" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                        </svg>
                    </div>
                    <h3 class="h5 fw-light text-white-70 mb-2">No holdings to analyse</h3>
                    <p class="small text-white-40 mb-4">Add shares from the Holdings tab to unlock<br>behavioral analytics, growth charts and scenario simulations.</p>
                    <button onclick="navigateToSection('holdings', 'Holdings', null)"
                            class="btn px-4 py-2 rounded-pill"
                            style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: rgba(255,255,255,0.8);">
                        + Add Your First Share
                    </button>
                </div>
            </div>`;
        return;
    }

    // ── Compute Analytics ──────────────────────────────────────────────────────
    const analyzedHoldings = holdings.map(h => {
        const momentum = AnalyticsUtils.calculateMomentumScore(h.day_change_percent || 0, h.gain_loss_percent);
        const grade = AnalyticsUtils.calculatePerformanceGrade(h.gain_loss_percent);
        const trend = AnalyticsUtils.calculateTrendDirection(h.day_change_percent || 0);
        const volatility = AnalyticsUtils.getVolatilityLevel(h.symbol);
        return { ...h, analytics: { momentum, grade, trend, volatility } };
    });

    const totalValue = analyzedHoldings.reduce((s, h) => s + h.total_value, 0);
    const totalInvested = analyzedHoldings.reduce((s, h) => s + (h.avg_buy_price * h.quantity), 0);
    const totalGainLoss = totalValue - totalInvested;
    const totalGainPct = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;

    const sortedByPerf = [...analyzedHoldings].sort((a, b) => b.gain_loss_percent - a.gain_loss_percent);
    const topGainer = sortedByPerf[0];
    const topLoser = sortedByPerf[sortedByPerf.length - 1];

    const concentrationRisks = AnalyticsUtils.getConcentrationRisks(analyzedHoldings);
    const diversificationScore = AnalyticsUtils.calculateDiversificationScore(analyzedHoldings);
    const divLabel = diversificationScore >= 70 ? 'Well Balanced' : diversificationScore >= 40 ? 'Moderate' : 'Concentrated';
    const divColor = diversificationScore >= 70 ? '#10b981' : diversificationScore >= 40 ? '#f59e0b' : '#ef4444';

    // Best overall grade
    const gradeOrder = ['A+', 'A', 'B+', 'B', 'C', 'D'];
    const bestGrade = analyzedHoldings.map(h => h.analytics.grade).sort((a, b) => gradeOrder.indexOf(a) - gradeOrder.indexOf(b))[0] || '—';

    // ── Build HTML ─────────────────────────────────────────────────────────────
    const html = `
    <div class="d-flex flex-column gap-4 animate-fade-in">

        <!-- ① PAGE HEADER -->
        <div class="d-flex justify-content-between align-items-start">
            <div>
                <h2 class="h4 fw-light text-white-90 mb-1">Performance Analytics</h2>
                <p class="small fw-light text-white-50 mb-0">Deep-dive into your portfolio's behaviour and risk profile</p>
            </div>
            <div class="badge rounded-pill px-3 py-2 fw-normal small"
                 style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.6);">
                ${analyzedHoldings.length} Active Holdings
            </div>
        </div>

        <!-- ② KPI SUMMARY BAR -->
        <div class="row g-3">
            ${[
            {
                label: 'Total Invested',
                value: '₹' + totalInvested.toLocaleString('en-IN', { maximumFractionDigits: 0 }),
                sub: 'Cost basis',
                icon: `<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
                color: 'rgba(99,102,241,0.15)', border: 'rgba(99,102,241,0.3)', iconColor: '#818cf8'
            },
            {
                label: 'Current Value',
                value: '₹' + totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 }),
                sub: 'Market value',
                icon: `<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>`,
                color: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', iconColor: '#10b981'
            },
            {
                label: 'Total P&L',
                value: (totalGainLoss >= 0 ? '+' : '') + '₹' + Math.abs(totalGainLoss).toLocaleString('en-IN', { maximumFractionDigits: 0 }),
                sub: (totalGainPct >= 0 ? '+' : '') + totalGainPct.toFixed(2) + '% all-time',
                icon: `<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>`,
                color: totalGainLoss >= 0 ? 'rgba(16,185,129,0.10)' : 'rgba(239,68,68,0.10)',
                border: totalGainLoss >= 0 ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)',
                iconColor: totalGainLoss >= 0 ? '#10b981' : '#ef4444',
                valueColor: totalGainLoss >= 0 ? '#10b981' : '#ef4444'
            },
            {
                label: 'Diversification',
                value: diversificationScore + '/100',
                sub: divLabel,
                icon: `<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-width="1.5"/><path stroke-linecap="round" stroke-width="1.5" d="M12 2a15.3 15.3 0 010 20M2 12h20"/></svg>`,
                color: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.25)', iconColor: divColor,
                valueColor: divColor
            },
            {
                label: 'Best Performer',
                value: topGainer ? topGainer.symbol.replace('.NS', '') : '—',
                sub: topGainer ? (topGainer.gain_loss_percent >= 0 ? '+' : '') + topGainer.gain_loss_percent.toFixed(2) + '%' : '—',
                icon: `<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 3l14 9-14 9V3z"/></svg>`,
                color: 'rgba(16,185,129,0.10)', border: 'rgba(16,185,129,0.25)', iconColor: '#10b981'
            }
        ].map(kpi => `
            <div class="col-6 col-md-4 col-xl">
                <div class="p-3 rounded-4 h-100 d-flex flex-column gap-2" style="background: ${kpi.color}; border: 1px solid ${kpi.border};">
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="small fw-light text-white-50" style="font-size:0.7rem; letter-spacing: 0.06em; text-transform: uppercase;">${kpi.label}</span>
                        <span style="color: ${kpi.iconColor}; opacity: 0.8;">${kpi.icon}</span>
                    </div>
                    <div class="fw-semibold" style="font-size: 1.1rem; color: ${kpi.valueColor || 'rgba(255,255,255,0.95)'}; letter-spacing: -0.02em;">${kpi.value}</div>
                    <div style="font-size: 0.68rem; color: rgba(255,255,255,0.4);">${kpi.sub}</div>
                </div>
            </div>`).join('')}
        </div>

        <!-- ③ WINNERS / RISK ROW -->
        <div class="row g-4">
            <!-- Winners & Losers (wider) -->
            <div class="col-lg-8">
                <div class="p-4 rounded-4 h-100" style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); backdrop-filter: blur(10px);">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h3 class="h6 fw-normal text-white-90 mb-0" style="letter-spacing: 0.04em; text-transform: uppercase; font-size: 0.75rem; opacity: 0.6;">Top Movers</h3>
                        <div class="d-flex gap-3">
                            <span class="small" style="color: #10b981; font-size: 0.72rem;">▲ Gainers</span>
                            <span class="small" style="color: #ef4444; font-size: 0.72rem;">▼ Losers</span>
                        </div>
                    </div>

                    <!-- Table Header -->
                    <div class="row g-0 mb-2 px-2" style="font-size: 0.65rem; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 0.08em;">
                        <div class="col-5">Asset</div>
                        <div class="col-2 text-center">Grade</div>
                        <div class="col-3 text-end">Current Price</div>
                        <div class="col-2 text-end">Return</div>
                    </div>

                    <div class="d-flex flex-column gap-1">
                        ${sortedByPerf.map((asset, idx) => {
            const isGainer = asset.gain_loss_percent >= 0;
            const grade = asset.analytics.grade;
            const gradeCol = grade.startsWith('A') ? '#10b981' : grade.startsWith('B') ? '#60a5fa' : grade === 'C' ? '#f59e0b' : '#ef4444';
            const rowBg = idx === 0 ? 'rgba(16,185,129,0.04)' : (idx === sortedByPerf.length - 1 ? 'rgba(239,68,68,0.04)' : 'transparent');
            return `
                            <div class="row g-0 align-items-center px-3 py-2 rounded-3 transition-all hover-glass-highlight" style="background: ${rowBg}; cursor: default;">
                                <div class="col-5 d-flex align-items-center gap-3">
                                    <div class="rounded-circle d-flex align-items-center justify-content-center fw-semibold"
                                         style="width: 32px; height: 32px; min-width: 32px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.10); font-size: 0.65rem; color: rgba(255,255,255,0.7);">
                                        ${asset.symbol.substring(0, 2)}
                                    </div>
                                    <div>
                                        <div class="text-white fw-medium" style="font-size: 0.82rem;">${asset.symbol.replace('.NS', '')}</div>
                                        <div style="font-size: 0.65rem; color: rgba(255,255,255,0.35); max-width: 120px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">${asset.company_name}</div>
                                    </div>
                                </div>
                                <div class="col-2 text-center">
                                    <span class="fw-bold" style="font-size: 0.78rem; color: ${gradeCol};">${grade}</span>
                                </div>
                                <div class="col-3 text-end">
                                    <div class="text-white-80" style="font-size: 0.82rem;">₹${asset.current_price.toLocaleString('en-IN')}</div>
                                    <div style="font-size: 0.65rem; color: rgba(255,255,255,0.35);">${asset.quantity.toLocaleString()} shares</div>
                                </div>
                                <div class="col-2 text-end">
                                    <span style="font-size: 0.82rem; font-weight: 600; color: ${isGainer ? '#10b981' : '#ef4444'};">
                                        ${isGainer ? '+' : ''}${asset.gain_loss_percent.toFixed(2)}%
                                    </span>
                                </div>
                            </div>`;
        }).join('')}
                    </div>
                </div>
            </div>

            <!-- Risk Intelligence -->
            <div class="col-lg-4">
                <div class="p-4 rounded-4 h-100 position-relative overflow-hidden" style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); backdrop-filter: blur(10px);">
                    <!-- Glow blob -->
                    <div class="position-absolute" style="top: -40px; right: -40px; width: 120px; height: 120px; background: radial-gradient(circle, rgba(239,68,68,0.15) 0%, transparent 70%); pointer-events: none;"></div>

                    <h3 class="h6 fw-normal text-white-90 mb-4" style="letter-spacing: 0.04em; text-transform: uppercase; font-size: 0.75rem; opacity: 0.6;">Risk Profile</h3>

                    <!-- Diversification Score Donut -->
                    <div class="d-flex align-items-center gap-4 mb-4 p-3 rounded-3" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);">
                        <div class="position-relative d-flex align-items-center justify-content-center" style="width: 60px; height: 60px; min-width: 60px;">
                            <svg viewBox="0 0 36 36" width="60" height="60" style="transform: rotate(-90deg);">
                                <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="3"/>
                                <circle cx="18" cy="18" r="15.9" fill="none"
                                    stroke="${divColor}" stroke-width="3"
                                    stroke-dasharray="${diversificationScore} ${100 - diversificationScore}"
                                    stroke-linecap="round"/>
                            </svg>
                            <span class="position-absolute fw-semibold" style="font-size: 0.65rem; color: ${divColor};">${diversificationScore}</span>
                        </div>
                        <div>
                            <div class="text-white fw-semibold" style="font-size: 0.9rem;">${divLabel}</div>
                            <div style="font-size: 0.68rem; color: rgba(255,255,255,0.35);">Diversification Score</div>
                            <div class="mt-1">
                                <div class="progress rounded-pill" style="height: 3px; background: rgba(255,255,255,0.06);">
                                    <div class="progress-bar rounded-pill" role="progressbar" style="width: ${diversificationScore}%; background: ${divColor};"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Concentration Alerts -->
                    <div style="font-size: 0.65rem; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 0.08em;" class="mb-2">Concentration Alerts</div>
                    <div class="d-flex flex-column gap-2">
                        ${concentrationRisks.length > 0
            ? concentrationRisks.map(risk => `
                                <div class="d-flex align-items-center gap-2 px-3 py-2 rounded-3" style="background: rgba(239,68,68,0.07); border: 1px solid rgba(239,68,68,0.15);">
                                    <span style="color: #ef4444; font-size: 0.9rem;">⚠</span>
                                    <div>
                                        <div style="font-size: 0.75rem; color: #ef4444; font-weight: 500;">${risk.symbol.replace('.NS', '')}</div>
                                        <div style="font-size: 0.65rem; color: rgba(255,255,255,0.4);">${risk.weight}% of capital</div>
                                    </div>
                                </div>`).join('')
            : `<div class="d-flex align-items-center gap-2 px-3 py-2 rounded-3" style="background: rgba(16,185,129,0.07); border: 1px solid rgba(16,185,129,0.15);">
                                    <span style="color: #10b981;">✓</span>
                                    <div style="font-size: 0.75rem; color: rgba(255,255,255,0.6);">No concentration risks detected</div>
                               </div>`
        }
                    </div>
                </div>
            </div>
        </div>

        <!-- ④ ASSET BREAKDOWN TABLE -->
        <div class="p-4 rounded-4" style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); backdrop-filter: blur(10px);">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h3 class="h6 fw-normal text-white-90 mb-0" style="letter-spacing: 0.04em; text-transform: uppercase; font-size: 0.75rem; opacity: 0.6;">Asset Breakdown</h3>
                <span style="font-size: 0.7rem; color: rgba(255,255,255,0.3);">Momentum · Trend · Volatility · Return</span>
            </div>

            <div class="d-flex flex-column gap-2">
                ${analyzedHoldings.map(h => {
            const { momentum, grade, trend, volatility } = h.analytics;
            const gradeCol = grade.startsWith('A') ? '#10b981' : grade.startsWith('B') ? '#60a5fa' : grade === 'C' ? '#f59e0b' : '#ef4444';
            const momCol = momentum === 'Strong' ? '#10b981' : momentum === 'Reversing' ? '#f59e0b' : 'rgba(255,255,255,0.4)';
            const volCol = AnalyticsUtils.getRiskColor(volatility).includes('success') ? '#10b981' : AnalyticsUtils.getRiskColor(volatility).includes('warning') ? '#f59e0b' : '#ef4444';
            const trendArrow = trend === 'Uptrend' ? '↗' : trend === 'Downtrend' ? '↘' : '→';
            const trendCol = trend === 'Uptrend' ? '#10b981' : trend === 'Downtrend' ? '#ef4444' : 'rgba(255,255,255,0.5)';
            const returnPct = h.gain_loss_percent;
            const isPos = returnPct >= 0;
            // Portfolio weight bar
            const totalValAll = analyzedHoldings.reduce((s, x) => s + x.total_value, 0);
            const weight = totalValAll > 0 ? (h.total_value / totalValAll) * 100 : 0;
            return `
                    <div class="px-3 py-3 rounded-3 hover-glass-highlight" style="border: 1px solid rgba(255,255,255,0.05); transition: background 0.2s;">
                        <div class="row g-0 align-items-center">
                            <!-- Symbol -->
                            <div class="col-md-3 d-flex align-items-center gap-3 mb-2 mb-md-0">
                                <div class="rounded-circle d-flex align-items-center justify-content-center fw-semibold"
                                     style="width: 36px; height: 36px; min-width: 36px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); font-size: 0.65rem; color: rgba(255,255,255,0.7);">
                                    ${h.symbol.substring(0, 2)}
                                </div>
                                <div>
                                    <div class="d-flex align-items-center gap-2">
                                        <span class="fw-semibold text-white" style="font-size: 0.85rem;">${h.symbol.replace('.NS', '')}</span>
                                        <span class="fw-bold" style="font-size: 0.75rem; color: ${gradeCol};">${grade}</span>
                                    </div>
                                    <div style="font-size: 0.65rem; color: rgba(255,255,255,0.35); max-width: 140px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">${h.company_name}</div>
                                </div>
                            </div>
                            <!-- Momentum pill -->
                            <div class="col-6 col-md-2 d-flex align-items-center gap-2">
                                <span style="display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: 0.68rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); color: ${momCol}; white-space: nowrap;">
                                    ${momentum}
                                </span>
                            </div>
                            <!-- Trend -->
                            <div class="col-6 col-md-2 d-flex align-items-center gap-1">
                                <span style="font-size: 1rem; color: ${trendCol};">${trendArrow}</span>
                                <span style="font-size: 0.75rem; color: rgba(255,255,255,0.55);">${trend}</span>
                            </div>
                            <!-- Volatility + weight bar -->
                            <div class="col-md-3 mt-2 mt-md-0">
                                <div class="d-flex justify-content-between mb-1">
                                    <span style="font-size: 0.68rem; color: ${volCol};">${volatility} Vol.</span>
                                    <span style="font-size: 0.68rem; color: rgba(255,255,255,0.3);">${weight.toFixed(1)}% weight</span>
                                </div>
                                <div class="rounded-pill" style="height: 3px; background: rgba(255,255,255,0.06);">
                                    <div class="rounded-pill" style="width: ${weight}%; height: 3px; background: rgba(255,255,255,0.25);"></div>
                                </div>
                            </div>
                            <!-- Return -->
                            <div class="col-md-2 text-md-end mt-2 mt-md-0">
                                <div class="fw-semibold" style="font-size: 0.9rem; color: ${isPos ? '#10b981' : '#ef4444'};">
                                    ${isPos ? '+' : ''}${returnPct.toFixed(2)}%
                                </div>
                                <div style="font-size: 0.65rem; color: rgba(255,255,255,0.35);">₹${h.total_value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                            </div>
                        </div>
                    </div>`;
        }).join('')}
            </div>
        </div>

        <!-- ⑤ PORTFOLIO EVOLUTION CHART -->
        <div id="growth-chart-container"></div>

        <!-- ⑥ SCENARIO SIMULATOR -->
        <div id="simulation-panel-container"></div>

    </div>`;

    container.innerHTML = html;

    // Init sub-components
    renderGrowthChart(analyzedHoldings);
    renderSimulatorPanel(analyzedHoldings);
}

// ── GROWTH CHART ────────────────────────────────────────────────────────────

function renderGrowthChart(holdings) {
    const container = document.getElementById('growth-chart-container');
    if (!container) return;

    const currentTotalValue = holdings.reduce((sum, h) => sum + h.total_value, 0);

    container.innerHTML = `
        <div class="p-4 rounded-4" style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); backdrop-filter: blur(10px);">
            <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                <div>
                    <h3 class="h6 fw-normal text-white-90 mb-1" style="letter-spacing: 0.04em; text-transform: uppercase; font-size: 0.75rem; opacity: 0.6;">Portfolio Evolution</h3>
                    <div style="font-size: 0.7rem; color: rgba(255,255,255,0.35);">Simulated growth vs Nifty 50 benchmark</div>
                </div>
                <div class="d-flex gap-1 p-1 rounded-pill" style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06);">
                    ${['1D', '1W', '1M', '6M', '1Y'].map(t =>
        `<button class="btn btn-sm rounded-pill px-3 py-1 ${t === '1M' ? '' : ''}"
                                 style="font-size: 0.72rem; padding: 4px 14px; ${t === '1M' ? 'background: rgba(255,255,255,0.12); color: white;' : 'background: transparent; color: rgba(255,255,255,0.4);'} border: none; transition: all 0.2s;"
                                 onclick="updateGrowthChart('${t}', this)">${t}</button>`
    ).join('')}
                </div>
            </div>
            <div style="height: 280px; width: 100%;">
                <canvas id="portfolioGrowthChart"></canvas>
            </div>
            <div class="d-flex justify-content-center gap-5 mt-3">
                <div class="d-flex align-items-center gap-2">
                    <div style="width: 24px; height: 2px; background: #10b981; border-radius: 2px;"></div>
                    <span style="font-size: 0.72rem; color: rgba(255,255,255,0.6);">Your Portfolio</span>
                </div>
                <div class="d-flex align-items-center gap-2">
                    <div style="width: 24px; height: 2px; background: rgba(255,255,255,0.2); border-radius: 2px; border-style: dashed;"></div>
                    <span style="font-size: 0.72rem; color: rgba(255,255,255,0.4);">Nifty 50 Benchmark</span>
                </div>
            </div>
        </div>`;

    updateGrowthChart('1M', null, currentTotalValue);
}

let growthChartInstance = null;

window.updateGrowthChart = (timeframe, btn, totalValueOverride = null) => {
    if (btn) {
        btn.parentElement.querySelectorAll('button').forEach(b => {
            b.style.background = 'transparent';
            b.style.color = 'rgba(255,255,255,0.4)';
        });
        btn.style.background = 'rgba(255,255,255,0.12)';
        btn.style.color = 'white';
    }

    const ctx = document.getElementById('portfolioGrowthChart');
    if (!ctx) return;

    const dataPoints = getMockGrowthData(timeframe);

    if (growthChartInstance) growthChartInstance.destroy();

    growthChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dataPoints.labels,
            datasets: [
                {
                    label: 'Portfolio',
                    data: dataPoints.portfolio,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16,185,129,0.08)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 0,
                    pointHoverRadius: 5
                },
                {
                    label: 'Benchmark',
                    data: dataPoints.benchmark,
                    borderColor: 'rgba(255,255,255,0.18)',
                    borderWidth: 1.5,
                    borderDash: [6, 4],
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(10,10,15,0.95)',
                    titleColor: '#fff',
                    bodyColor: 'rgba(255,255,255,0.7)',
                    borderColor: 'rgba(255,255,255,0.08)',
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: function (context) {
                            return context.dataset.label + ': ' + (context.parsed.y >= 0 ? '+' : '') + context.parsed.y.toFixed(2) + '%';
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: 'rgba(255,255,255,0.25)', font: { size: 10, family: 'Inter' }, maxTicksLimit: 7 }
                },
                y: {
                    grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
                    ticks: { color: 'rgba(255,255,255,0.28)', font: { size: 10, family: 'Inter' }, callback: v => v + '%' }
                }
            },
            interaction: { mode: 'nearest', axis: 'x', intersect: false }
        }
    });
};

function getMockGrowthData(timeframe) {
    let count = 30, volatility = 1.5;
    let labelGen = i => `Day ${i}`;

    if (timeframe === '1D') { count = 24; labelGen = i => `${i}:00`; volatility = 0.2; }
    if (timeframe === '1W') { count = 7; labelGen = i => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i % 7]; volatility = 1; }
    if (timeframe === '1M') { count = 30; labelGen = i => `Day ${i}`; volatility = 1.5; }
    if (timeframe === '6M') { count = 6; labelGen = i => `Month ${i}`; volatility = 5; }
    if (timeframe === '1Y') { count = 12; labelGen = i => `Month ${i}`; volatility = 8; }

    const portfolio = [0], benchmark = [0], labels = [labelGen(0)];
    for (let i = 1; i < count; i++) {
        portfolio.push(portfolio[i - 1] + (Math.random() - 0.44) * volatility);
        benchmark.push(benchmark[i - 1] + (Math.random() - 0.48) * volatility);
        labels.push(labelGen(i));
    }
    return { portfolio, benchmark, labels };
}

// ── SCENARIO SIMULATOR ───────────────────────────────────────────────────────

function renderSimulatorPanel(holdings) {
    const container = document.getElementById('simulation-panel-container');
    if (!container) return;

    const totalValue = holdings.reduce((sum, h) => sum + h.total_value, 0);
    const totalInvested = holdings.reduce((sum, h) => sum + (h.avg_buy_price * h.quantity), 0);

    container.innerHTML = `
        <div class="p-4 rounded-4" style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); backdrop-filter: blur(10px);">
            <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                <div>
                    <h3 class="h6 fw-normal text-white-90 mb-1" style="letter-spacing: 0.04em; text-transform: uppercase; font-size: 0.75rem; opacity: 0.6;">Scenario Simulator</h3>
                    <div style="font-size: 0.7rem; color: rgba(255,255,255,0.35);">"What if?" analysis for forward-looking decisions</div>
                </div>
                <div class="d-flex gap-2">
                    <button class="rounded-pill px-3 py-1 sim-preset-btn selected-sim"
                            style="font-size: 0.72rem; background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.25); color: #ef4444; cursor: pointer;"
                            onclick="updateSimulation('market_crash', this)">📉 Market Crash</button>
                    <button class="rounded-pill px-3 py-1 sim-preset-btn"
                            style="font-size: 0.72rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.5); cursor: pointer;"
                            onclick="updateSimulation('custom_growth', this)">📈 Bull Run</button>
                </div>
            </div>

            <div class="row g-4 align-items-start">
                <!-- Slider Control -->
                <div class="col-md-5">
                    <div class="p-4 rounded-4" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <span style="font-size: 0.72rem; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.07em;">Market Adjustment</span>
                            <span id="sim-slider-val" class="fw-bold font-monospace px-3 py-1 rounded-pill" style="font-size: 0.82rem; background: rgba(239,68,68,0.12); color: #ef4444; border: 1px solid rgba(239,68,68,0.2);">-20%</span>
                        </div>
                        <input type="range" class="form-range mb-2" min="-50" max="50" value="-20" id="sim-slider" oninput="updateSliderVal(this.value)">
                        <div class="d-flex justify-content-between" style="font-size: 0.65rem; color: rgba(255,255,255,0.25); font-family: monospace;">
                            <span>-50%</span><span>0%</span><span>+50%</span>
                        </div>
                    </div>
                </div>

                <!-- Results -->
                <div class="col-md-7">
                    <div class="row g-3">
                        <div class="col-6">
                            <div class="p-3 rounded-4 h-100" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);">
                                <div style="font-size: 0.65rem; color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px;">Projected Value</div>
                                <div class="fw-semibold text-white" id="sim-projected-value" style="font-size: 1.1rem;">--</div>
                                <div id="sim-diff-value" class="mt-1" style="font-size: 0.72rem;">--</div>
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="p-3 rounded-4 h-100" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);">
                                <div style="font-size: 0.65rem; color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px;">Projected ROI</div>
                                <div class="fw-semibold" id="sim-projected-roi" style="font-size: 1.1rem;">--</div>
                            </div>
                        </div>
                        <div class="col-12">
                            <div class="p-3 rounded-4 d-flex gap-3 align-items-center" style="background: rgba(16,185,129,0.05); border: 1px solid rgba(16,185,129,0.12);">
                                <span style="font-size: 1.1rem;">💡</span>
                                <div>
                                    <div style="font-size: 0.72rem; color: #10b981; font-weight: 500; margin-bottom: 2px;">AI Insight</div>
                                    <div style="font-size: 0.72rem; color: rgba(255,255,255,0.6);" id="sim-insight">Adjust the slider to see how your portfolio responds to market volatility.</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;

    const slider = document.getElementById('sim-slider');
    if (slider) {
        slider.addEventListener('input', e => runSimulation(parseFloat(e.target.value), totalValue, totalInvested));
        runSimulation(-20, totalValue, totalInvested);
    }
}

function updateSliderVal(val) {
    const el = document.getElementById('sim-slider-val');
    if (!el) return;
    const n = parseFloat(val);
    el.innerText = (n > 0 ? '+' : '') + n + '%';
    el.style.background = n < 0 ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.12)';
    el.style.color = n < 0 ? '#ef4444' : '#10b981';
    el.style.borderColor = n < 0 ? 'rgba(239,68,68,0.25)' : 'rgba(16,185,129,0.25)';
}

function runSimulation(percentage, currentVal, investedVal) {
    const factor = 1 + (percentage / 100);
    const newVal = currentVal * factor;
    const newRoi = ((newVal - investedVal) / investedVal) * 100;
    const diff = newVal - currentVal;

    document.getElementById('sim-projected-value').innerText = '₹' + newVal.toLocaleString('en-IN', { maximumFractionDigits: 0 });
    const roiEl = document.getElementById('sim-projected-roi');
    roiEl.innerText = (newRoi > 0 ? '+' : '') + newRoi.toFixed(2) + '%';
    roiEl.style.color = newRoi >= 0 ? '#10b981' : '#ef4444';

    const diffEl = document.getElementById('sim-diff-value');
    diffEl.innerText = (diff >= 0 ? '+' : '-') + '₹' + Math.abs(diff).toLocaleString('en-IN', { maximumFractionDigits: 0 });
    diffEl.style.color = diff >= 0 ? '#10b981' : '#ef4444';

    const insightEl = document.getElementById('sim-insight');
    if (percentage < -25) insightEl.innerText = 'Severe crash scenario. Consider hedging via bonds or cash reserves.';
    else if (percentage < -10) insightEl.innerText = 'Moderate drawdown. High-beta stocks are most exposed in this scenario.';
    else if (percentage < 0) insightEl.innerText = 'Minor correction. Diversified portfolios typically recover within weeks.';
    else if (percentage > 20) insightEl.innerText = 'Strong bull run. Your momentum stocks would likely outperform significantly.';
    else insightEl.innerText = 'Growth scenario. Balanced exposure helps capture upside across sectors.';
}

window.updateSimulation = (type, btn) => {
    btn.closest('.d-flex').querySelectorAll('.sim-preset-btn').forEach(b => {
        b.style.background = 'rgba(255,255,255,0.05)';
        b.style.color = 'rgba(255,255,255,0.5)';
        b.style.borderColor = 'rgba(255,255,255,0.1)';
    });
    if (type === 'market_crash') {
        btn.style.background = 'rgba(239,68,68,0.12)';
        btn.style.color = '#ef4444';
        btn.style.borderColor = 'rgba(239,68,68,0.25)';
    } else {
        btn.style.background = 'rgba(16,185,129,0.12)';
        btn.style.color = '#10b981';
        btn.style.borderColor = 'rgba(16,185,129,0.25)';
    }

    const slider = document.getElementById('sim-slider');
    if (!slider) return;
    slider.value = type === 'market_crash' ? -20 : 20;
    slider.dispatchEvent(new Event('input'));
    updateSliderVal(slider.value);
};

// Expose globally
window.renderPerformanceAnalytics = renderPerformanceAnalytics;
