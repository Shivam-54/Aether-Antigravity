/**
 * Shares Performance Module
 * Handles the rendering of AI-grade performance analytics,
 * including Behavioral Insights, Strategic Panels, and Smart Asset Cards.
 */

function renderPerformanceAnalytics() {
    const container = document.getElementById('shares-section-performance');
    if (!container) return;

    if (typeof SHARES_DATA === 'undefined' || typeof AnalyticsUtils === 'undefined') {
        console.warn('SHARES_DATA or AnalyticsUtils not loaded');
        return;
    }

    const holdings = SHARES_DATA.holdings.filter(s => s.status === 'active');

    // --- 1. Compute Analytics Data ---

    // Enhance holdings with analytics data
    const analyzedHoldings = holdings.map(h => {
        const momentum = AnalyticsUtils.calculateMomentumScore(h.day_change_percent || 0, h.gain_loss_percent);
        const grade = AnalyticsUtils.calculatePerformanceGrade(h.gain_loss_percent);
        const trend = AnalyticsUtils.calculateTrendDirection(h.day_change_percent || 0);
        const volatility = AnalyticsUtils.getVolatilityLevel(h.symbol);

        return { ...h, analytics: { momentum, grade, trend, volatility } };
    });

    // Sort by Gain % for Winners/Losers
    const sortedByPerf = [...analyzedHoldings].sort((a, b) => b.gain_loss_percent - a.gain_loss_percent);
    const topGainers = sortedByPerf.slice(0, 3);
    const topLosers = sortedByPerf.slice(-3).reverse(); // Worst first

    // Risk Analysis
    const concentrationRisks = AnalyticsUtils.getConcentrationRisks(analyzedHoldings);
    const diversificationScore = AnalyticsUtils.calculateDiversificationScore(analyzedHoldings);

    // --- 2. Build UI ---

    let html = `
        <div class="d-flex flex-column gap-4 animate-fade-in">
            <!-- Header -->
            <div class="glass-header mb-2 d-flex justify-content-between align-items-center">
                <div>
                    <h2 class="h4 fw-light text-white-90 mb-1">Portfolio Intelligence</h2>
                    <p class="small fw-light text-white-50">Behavioral insights and strategic risk analysis</p>
                </div>
            </div>

            <!-- STRATEGIC PANELS ROW -->
            <div class="row g-4">
                <!-- Winners vs Losers -->
                <!-- Winners vs Losers -->
                <!-- Winners vs Losers -->
                <div class="col-lg-8">
                    <div class="glass-panel p-4 h-100 rounded-4" style="background: linear-gradient(145deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);">
                        <div class="d-flex justify-content-between align-items-center mb-4">
                            <h3 class="h5 fw-light text-white-90 mb-0">Winners & Laggards</h3>
                            <span class="badge text-white-50 fw-normal rounded-pill px-3" style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.05);">Top Movers</span>
                        </div>
                        <div class="row g-0">
                            <!-- Winners -->
                            <div class="col-md-6 pe-md-4 border-end border-white border-opacity-10">
                                <h4 class="text-xs text-uppercase text-white-40 spacing-1 mb-3">Top Performers</h4>
                                <div class="d-flex flex-column gap-3">
                                    ${topGainers.map(asset => `
                                        <div class="d-flex align-items-center justify-content-between p-3 rounded-4 transition-all hover-glass-highlight">
                                            <div class="d-flex align-items-center gap-2">
                                                <div class="rounded-circle text-success d-flex align-items-center justify-content-center" style="width: 32px; height: 32px; font-size: 12px; background: rgba(16, 185, 129, 0.1);">▲</div>
                                                <div>
                                                    <div class="text-white-90 small fw-medium">${asset.symbol}</div>
                                                    <div class="text-white-40 text-xs">${asset.company_name.substring(0, 15)}...</div>
                                                </div>
                                            </div>
                                            <div class="text-end">
                                                <div class="text-success small fw-medium">+${asset.gain_loss_percent.toFixed(2)}%</div>
                                                <div class="text-white-30 text-xs">₹${asset.current_price.toLocaleString()}</div>
                                            </div>
                                        </div>
                                    `).join('')}
                                    ${topGainers.length === 0 ? '<div class="text-white-30 small fst-italic">No active holdings</div>' : ''}
                                </div>
                            </div>
                            <!-- Losers -->
                            <div class="col-md-6 ps-md-4 pt-4 pt-md-0">
                                <h4 class="text-xs text-uppercase text-white-40 spacing-1 mb-3">Underperformers</h4>
                                <div class="d-flex flex-column gap-3">
                                    ${topLosers.map(asset => `
                                        <div class="d-flex align-items-center justify-content-between p-3 rounded-4 transition-all hover-glass-highlight">
                                            <div class="d-flex align-items-center gap-2">
                                                <div class="rounded-circle text-danger d-flex align-items-center justify-content-center" style="width: 32px; height: 32px; font-size: 12px; background: rgba(239, 68, 68, 0.1);">▼</div>
                                                <div>
                                                    <div class="text-white-90 small fw-medium">${asset.symbol}</div>
                                                    <div class="text-white-40 text-xs">${asset.company_name.substring(0, 15)}...</div>
                                                </div>
                                            </div>
                                            <div class="text-end">
                                                <div class="text-danger small fw-medium">${asset.gain_loss_percent.toFixed(2)}%</div>
                                                <div class="text-white-30 text-xs">₹${asset.current_price.toLocaleString()}</div>
                                            </div>
                                        </div>
                                    `).join('')}
                                    ${topLosers.length === 0 ? '<div class="text-white-30 small fst-italic">No underperformers</div>' : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Risk Intelligence -->
                <!-- Risk Intelligence -->
                <div class="col-lg-4">
                    <div class="glass-panel p-4 h-100 position-relative overflow-hidden rounded-4" style="background: linear-gradient(145deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);">
                        <!-- Background Glow for Risk (Subtler) -->
                        <div class="position-absolute top-0 end-0 p-5 bg-danger bg-opacity-10 rounded-circle blur-xl" style="transform: translate(30%, -30%); filter: blur(80px); opacity: 0.3; pointer-events: none;"></div>

                        <h3 class="h5 fw-light text-white-90 mb-4">Risk Exposure</h3>
                        
                        <!-- Diversification Score -->
                        <div class="mb-4">
                            <div class="d-flex justify-content-between align-items-end mb-2">
                                <span class="text-white-50 small">Diversification Score</span>
                                <span class="h4 text-white mb-0">${diversificationScore}/100</span>
                            </div>
                            <div class="progress rounded-pill" style="height: 6px; background: rgba(255, 255, 255, 0.05);">
                                <div class="progress-bar rounded-pill ${diversificationScore > 70 ? 'bg-success' : diversificationScore > 40 ? 'bg-warning' : 'bg-danger'}" 
                                     role="progressbar" style="width: ${diversificationScore}%"></div>
                            </div>
                            <div class="text-end mt-1">
                                <span class="text-xs text-white-30">${diversificationScore > 70 ? 'Well Balanced' : 'Concentrated'}</span>
                            </div>
                        </div>

                        <!-- Concentration Warnings -->
                        <div>
                            <h4 class="text-xs text-uppercase text-white-40 spacing-1 mb-2">Concentration Alerts</h4>
                            ${concentrationRisks.length > 0 ?
            concentrationRisks.map(risk => `
                                    <div class="d-flex align-items-start gap-2 mb-2 p-2 rounded-3" style="background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.1);">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-danger mt-1">
                                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                            <line x1="12" y1="9" x2="12" y2="13"></line>
                                            <line x1="12" y1="17" x2="12.01" y2="17"></line>
                                        </svg>
                                        <div>
                                            <div class="text-danger small fw-medium">High Exposure: ${risk.symbol}</div>
                                            <div class="text-white-50 text-xs">${risk.weight}% of portfolio capital.</div>
                                        </div>
                                    </div>
                                `).join('')
            :
            '<div class="text-white-50 small d-flex align-items-center gap-2"><div class="text-success">✓</div> No major concentration risks detected.</div>'
        }
                        </div>
                    </div>
                </div>
            </div>

            <!-- SMART ASSET CARDS GRID -->
            <div>
                <h3 class="h5 fw-light text-white-90 mb-3">Behavioral Asset Analysis</h3>
                <div class="row g-4">
                    ${analyzedHoldings.map(h => renderSmartAssetCard(h)).join('')}
                </div>
            </div>
            
            <!-- Time-Based Growth Intelligence -->
            <div id="growth-chart-container"></div>

            <!-- Future: Simulator Panel Placeholder -->
            <div id="simulation-panel-container"></div>
        </div>
    `;

    container.innerHTML = html;

    // Initialize Sub-components
    renderGrowthChart(analyzedHoldings);
    renderSimulatorPanel(analyzedHoldings);
}

/**
 * Renders the Time-Based Growth Chart
 */
function renderGrowthChart(holdings) {
    const container = document.getElementById('growth-chart-container');
    if (!container) return;

    const currentTotalValue = holdings.reduce((sum, h) => sum + h.total_value, 0);

    const html = `
        <div class="glass-panel p-4 position-relative rounded-4" style="background: linear-gradient(145deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <div>
                     <h3 class="h5 fw-light text-white-90 mb-1">Portfolio Evolution</h3>
                    <p class="small text-white-50">Historical performance vs Market Benchmark</p>
                </div>
                <!-- Glass Time Toggle -->
                <div class="d-flex gap-1 p-1 rounded-pill" style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.05);">
                    ${['1D', '1W', '1M', '6M', '1Y'].map(t =>
        `<button class="btn btn-sm text-xs rounded-pill px-3 py-1 transition-all ${t === '1M' ? 'bg-white bg-opacity-10 text-white shadow-sm border border-white border-opacity-10' : 'text-white-50 hover-text-white'}" 
                          onclick="updateGrowthChart('${t}', this)">${t}</button>`
    ).join('')}
                </div>
            </div>

            <div style="height: 300px; width: 100%;">
                <canvas id="portfolioGrowthChart"></canvas>
            </div>
            
            <div class="d-flex justify-content-center gap-4 mt-3">
                <div class="d-flex align-items-center gap-2">
                    <div style="width: 12px; height: 12px; border-radius: 2px; background: rgba(16, 185, 129, 0.2); border: 2px solid #10b981;"></div>
                    <span class="text-white-70 text-xs">Your Portfolio</span>
                </div>
                <div class="d-flex align-items-center gap-2">
                     <div style="width: 12px; height: 12px; border-radius: 2px; background: rgba(255, 255, 255, 0.05); border: 2px solid rgba(255, 255, 255, 0.2);"></div>
                    <span class="text-white-50 text-xs">Market Benchmark (Nifty 50)</span>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = html;

    // Initial Chart Render (1M default)
    updateGrowthChart('1M', null, currentTotalValue);
}

let growthChartInstance = null;

// Window function to handle timeframe updates
window.updateGrowthChart = (timeframe, btn, totalValueOverride = null) => {
    // UI Updates
    if (btn) {
        const buttons = btn.parentElement.querySelectorAll('button');
        buttons.forEach(b => {
            b.className = 'btn btn-sm text-xs rounded-pill px-3 py-1 text-white-50 hover-text-white';
        });
        btn.className = 'btn btn-sm text-xs rounded-pill px-3 py-1 bg-white bg-opacity-10 text-white shadow-sm';
    }

    const ctx = document.getElementById('portfolioGrowthChart');
    if (!ctx) return;

    // Get current total value from DOM if not passed (hacky but works for toggle)
    // Actually better to store it or re-calculate. 
    // For now, let's assume totalValue is effectively constant for the session or re-passed.
    // Simplification: We'll generate data relative to a "100" base index to avoid complexity, 
    // OR we pass the value. Let's start with a mock base if valid isn't found.

    // Generate Mock Data based on timeframe
    const dataPoints = getMockGrowthData(timeframe);

    if (growthChartInstance) {
        growthChartInstance.destroy();
    }

    growthChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dataPoints.labels,
            datasets: [
                {
                    label: 'Portfolio',
                    data: dataPoints.portfolio,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 0,
                    pointHoverRadius: 6
                },
                {
                    label: 'Benchmark',
                    data: dataPoints.benchmark,
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    borderWidth: 2,
                    borderDash: [5, 5],
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
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1,
                    callbacks: {
                        label: function (context) {
                            return context.dataset.label + ': ' + context.parsed.y.toFixed(2) + '%';
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        color: 'rgba(255,255,255,0.3)',
                        font: { size: 10, family: 'Inter' },
                        maxTicksLimit: 6
                    }
                },
                y: {
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: {
                        color: 'rgba(255,255,255,0.3)',
                        font: { size: 10, family: 'Inter' },
                        callback: function (val) { return val + '%' }
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });
};

function getMockGrowthData(timeframe) {
    let count = 30;
    let labelGen = (i) => `Day ${i}`;
    let volatility = 0.5;

    if (timeframe === '1D') { count = 24; labelGen = (i) => `${i}:00`; volatility = 0.2; }
    if (timeframe === '1W') { count = 7; labelGen = (i) => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i % 7]; volatility = 1; }
    if (timeframe === '1M') { count = 30; labelGen = (i) => `Day ${i}`; volatility = 1.5; }
    if (timeframe === '6M') { count = 6; labelGen = (i) => `Month ${i}`; volatility = 5; }
    if (timeframe === '1Y') { count = 12; labelGen = (i) => `Month ${i}`; volatility = 8; }

    const portfolio = [0]; // Start at 0%
    const benchmark = [0];
    const labels = [labelGen(0)];

    for (let i = 1; i < count; i++) {
        // Random walk
        const pChange = (Math.random() - 0.45) * volatility; // Slight upward bias
        const bChange = (Math.random() - 0.48) * volatility; // Smaller upward bias

        portfolio.push(portfolio[i - 1] + pChange);
        benchmark.push(benchmark[i - 1] + bChange);
        labels.push(labelGen(i));
    }

    return { portfolio, benchmark, labels };
}

/**
 * Renders the "What If?" Simulator Panel
 */
function renderSimulatorPanel(holdings) {
    const container = document.getElementById('simulation-panel-container');
    if (!container) return;

    const totalValue = holdings.reduce((sum, h) => sum + h.total_value, 0);
    const totalInvested = holdings.reduce((sum, h) => sum + (h.avg_buy_price * h.quantity), 0);

    const html = `
        <div class="glass-panel p-4 rounded-4" style="background: linear-gradient(145deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 class="h5 fw-light text-white-90 mb-1">Scenario Simulator</h3>
                    <p class="small text-white-50">"What If?" analysis for forward-looking decisions</p>
                </div>
                <div class="d-flex gap-2">
                    <button class="glass-button px-3 py-1 text-xs selected rounded-pill" onclick="updateSimulation('market_crash', this)">Market Crash</button>
                    <button class="glass-button px-3 py-1 text-xs rounded-pill" onclick="updateSimulation('custom_growth', this)">Bull Run</button>
                </div>
            </div>

            <div class="row g-4 align-items-center">
                <!-- Inputs / Controls -->
                <div class="col-md-5">
                    <div class="p-4 rounded-4 border border-white border-opacity-10 position-relative overflow-hidden" 
                         style="background: linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);">
                        
                        <label class="text-white-40 text-xs text-uppercase mb-4 d-block spacing-1 fw-medium">Simulation Control</label>
                        
                        <div class="mb-5">
                            <label class="d-flex justify-content-between text-white-80 small mb-3">
                                <span>Market Adjustment</span>
                                <span id="sim-slider-val" class="text-white fw-bold font-monospace bg-white bg-opacity-10 px-2 py-1 rounded-pill">-20%</span>
                            </label>
                            
                            <!-- Custom Range Slider Container -->
                            <div class="range-container position-relative mb-2">
                                <input type="range" class="form-range" min="-50" max="50" value="-20" id="sim-slider" oninput="updateSliderVal(this.value)"
                                       style="height: 4px; border-radius: 2px;">
                            </div>
                            
                            <div class="d-flex justify-content-between text-white-30 text-xs mt-2 font-monospace">
                                <span>-50%</span>
                                <span>0%</span>
                                <span>+50%</span>
                            </div>
                        </div>

                        <div class="d-flex align-items-center gap-2 text-white-40 text-xs">
                            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            <span class="fst-italic">Simulates uniform price change across portfolio.</span>
                        </div>
                    </div>
                </div>

                <!-- Results Display -->
                <div class="col-md-7">
                    <div class="row g-3">
                        <!-- Projected Value -->
                        <div class="col-6">
                            <div class="p-4 rounded-4 border border-white border-opacity-10 h-100 d-flex flex-column justify-content-center" 
                                 style="background: rgba(255, 255, 255, 0.03);">
                                <span class="text-white-40 text-xs text-uppercase d-block mb-2 spacing-1">Projected Value</span>
                                <div class="d-flex flex-column">
                                    <h4 class="h3 text-white mb-1 fw-light" id="sim-projected-value">--</h4>
                                    <span class="small" id="sim-diff-value">--</span>
                                </div>
                            </div>
                        </div>
                        <!-- Projected ROI -->
                        <div class="col-6">
                             <div class="p-4 rounded-4 border border-white border-opacity-10 h-100 d-flex flex-column justify-content-center"
                                  style="background: rgba(255, 255, 255, 0.03);">
                                <span class="text-white-40 text-xs text-uppercase d-block mb-2 spacing-1">Projected ROI</span>
                                <h4 class="h3 text-white mb-0 fw-light" id="sim-projected-roi">--</h4>
                            </div>
                        </div>
                        <!-- Insight -->
                        <div class="col-12">
                             <div class="p-3 rounded-4 d-flex gap-3 align-items-center" 
                                  style="background: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.1);">
                                <div class="text-success text-lg opacity-75">💡</div>
                                <div>
                                    <div class="text-success small fw-medium mb-1">AI Insight</div>
                                    <div class="text-white-70 text-xs" id="sim-insight">Adjust the slider to see how your portfolio withstands volatility.</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = html;

    // Attach logic to slider (manual, not inline to avoid scope issues)
    const slider = document.getElementById('sim-slider');
    if (slider) {
        slider.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            runSimulation(val, totalValue, totalInvested);
        });
        // Run initial
        runSimulation(-20, totalValue, totalInvested);
    }
}

/**
 * Updates simulation UI
 */
function updateSliderVal(val) {
    const el = document.getElementById('sim-slider-val');
    if (el) el.innerText = (val > 0 ? '+' : '') + val + '%';
}

function runSimulation(percentage, currentVal, investedVal) {
    const factor = 1 + (percentage / 100);
    const newVal = currentVal * factor;
    const newRoi = ((newVal - investedVal) / investedVal) * 100;
    const diff = newVal - currentVal;

    document.getElementById('sim-projected-value').innerText = '₹' + newVal.toLocaleString('en-IN', { maximumFractionDigits: 0 });
    document.getElementById('sim-projected-roi').innerText = (newRoi > 0 ? '+' : '') + newRoi.toFixed(2) + '%';
    document.getElementById('sim-projected-roi').className = `h4 mb-0 ${newRoi >= 0 ? 'text-success' : 'text-danger'}`;

    const diffEl = document.getElementById('sim-diff-value');
    diffEl.innerText = (diff >= 0 ? '+' : '') + '₹' + Math.abs(diff).toLocaleString('en-IN', { maximumFractionDigits: 0 });
    diffEl.className = `small ${diff >= 0 ? 'text-success' : 'text-danger'}`;

    const insightEl = document.getElementById('sim-insight');
    if (percentage < -15) insightEl.innerText = "Heavy drawdown simulated. Ensure you have cash reserves to buy the dip.";
    else if (percentage < 0) insightEl.innerText = "Moderate correction. Check if your high-beta assets are dragging you down.";
    else if (percentage > 0) insightEl.innerText = "Growth scenario. Your high-momentum assets would likely outperform.";
    else insightEl.innerText = "Neutral baseline.";
}

// Window functions for button clicks
window.updateSimulation = (type, btn) => {
    // Reset buttons
    const buttons = btn.parentElement.querySelectorAll('button');
    buttons.forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');

    const slider = document.getElementById('sim-slider');
    if (!slider) return;

    if (type === 'market_crash') {
        slider.value = -20;
    } else if (type === 'custom_growth') {
        slider.value = 15;
    }

    // Trigger input event manually
    slider.dispatchEvent(new Event('input'));
    updateSliderVal(slider.value);
};

/**
 * Renders a single "Smart Asset Card"
 */
function renderSmartAssetCard(asset) {
    const { momentum, grade, trend, volatility } = asset.analytics;

    // Style mappings
    const gradeColor = grade.startsWith('A') ? 'text-success' : grade.startsWith('B') ? 'text-info' : grade === 'C' ? 'text-warning' : 'text-danger';
    const momColor = momentum === 'Strong' ? 'success' : momentum === 'Reversing' ? 'warning' : 'secondary';

    return `
    <div class="col-md-6 col-xl-4">
        <!-- True Glass Card -->
        <div class="p-0 h-100 overflow-hidden hover-scale-sm transition-all shadow-sm rounded-4" 
             style="background: linear-gradient(145deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);">
            
            <!-- Card Header -->
            <div class="p-4 border-bottom border-white border-opacity-10" style="background: rgba(255, 255, 255, 0.01);">
                <div class="d-flex justify-content-between align-items-start">
                    <div class="d-flex align-items-center gap-3">
                        <div class="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm" 
                             style="width: 42px; height: 42px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255,255,255,0.1);">
                            ${asset.symbol.substring(0, 2)}
                        </div>
                        <div>
                            <h4 class="h6 text-white mb-0 text-shadow-sm">${asset.symbol}</h4>
                            <div class="text-white-50 text-xs">${asset.company_name}</div>
                        </div>
                    </div>
                    <div class="d-flex flex-column align-items-end">
                        <div class="h5 mb-0 fw-bold ${gradeColor}">${grade}</div>
                        <div class="text-white-30 text-xs text-uppercase spacing-1">Grade</div>
                    </div>
                </div>
            </div>

            <!-- Behavioral Metrics Grid -->
            <div class="p-4">
                <div class="row g-3 mb-4">
                    <!-- Momentum -->
                    <div class="col-6">
                        <div class="p-2 rounded-3 border border-white border-opacity-10" style="background: rgba(255, 255, 255, 0.03);">
                            <span class="text-white-40 text-xs text-uppercase d-block mb-1">Momentum</span>
                            <div class="d-flex align-items-center gap-2">
                                <span class="badge bg-${momColor} bg-opacity-25 text-${momColor} border border-${momColor} border-opacity-25 rounded-pill px-2 py-0 text-xs fw-normal">
                                    ${momentum}
                                </span>
                            </div>
                        </div>
                    </div>
                    <!-- Trend -->
                    <div class="col-6">
                         <div class="p-2 rounded-3 border border-white border-opacity-10" style="background: rgba(255, 255, 255, 0.03);">
                            <span class="text-white-40 text-xs text-uppercase d-block mb-1">Trend</span>
                            <div class="text-white-90 small fw-medium">
                                ${trend === 'Uptrend' ? '↗ Uptrend' : trend === 'Downtrend' ? '↘ Downtrend' : '→ Sideways'}
                            </div>
                        </div>
                    </div>
                    <!-- Volatility -->
                    <div class="col-6">
                        <div class="p-2 rounded-3 border border-white border-opacity-10" style="background: rgba(255, 255, 255, 0.03);">
                            <span class="text-white-40 text-xs text-uppercase d-block mb-1">Volatility</span>
                            <div class="${AnalyticsUtils.getRiskColor(volatility)} small fw-medium">
                                ${volatility}
                            </div>
                        </div>
                    </div>
                    <!-- ROI -->
                    <div class="col-6">
                         <div class="p-2 rounded-3 border border-white border-opacity-10" style="background: rgba(255, 255, 255, 0.03);">
                            <span class="text-white-40 text-xs text-uppercase d-block mb-1">Total Return</span>
                            <div class="${asset.gain_loss_percent >= 0 ? 'text-success' : 'text-danger'} small fw-medium">
                                ${asset.gain_loss_percent >= 0 ? '+' : ''}${asset.gain_loss_percent.toFixed(2)}%
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Footer: Holdings & Value -->
                <div class="d-flex justify-content-between align-items-center pt-3 border-top border-white border-opacity-10">
                    <div>
                        <div class="text-white-30 text-xs text-uppercase">Holdings</div>
                        <div class="text-white-70 small">${asset.quantity.toLocaleString()} Shares</div>
                    </div>
                    <div class="text-end">
                         <div class="text-white-30 text-xs text-uppercase">Current Value</div>
                        <div class="text-white-90 fw-medium">₹${asset.total_value.toLocaleString()}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
}

// Expose globally
window.renderPerformanceAnalytics = renderPerformanceAnalytics;
