/**
 * Crypto Overview Module
 * Handles centralized data fetching and overview visualization
 */

// Central Crypto State
window.CRYPTO_DATA = {
    holdings: [],
    transactions: [],
    wallets: [],
    metrics: {
        total_value: 0,
        change_24h_value: 0,
        change_24h_percent: 0,
        total_assets_count: 0,
        avg_portfolio_return: 0
    }
};

async function fetchCryptoData() {
    try {
        console.log('Fetching Crypto Data...');

        // Fetch holdings
        const holdingsResponse = await withTimeout(fetch(`${API_BASE_URL}/crypto/holdings`, {
            headers: getAuthHeaders()
        }));

        if (holdingsResponse.ok) {
            CRYPTO_DATA.holdings = await holdingsResponse.json();
        } else if (holdingsResponse.status === 401) {
            console.warn('Unauthorized - logging out');
            logout();
            return;
        }

        // Fetch metrics
        const metricsResponse = await withTimeout(fetch(`${API_BASE_URL}/crypto/metrics`, {
            headers: getAuthHeaders()
        }));

        if (metricsResponse.ok) {
            CRYPTO_DATA.metrics = await metricsResponse.json();
        }

        // MOCK TRANSACTIONS (Since backend endpoint might not exist yet for history)
        // In a real app, we would fetch this: const txResponse = await fetch(...)
        CRYPTO_DATA.transactions = [
            { date: '2023-11-15', type: 'Buy', symbol: 'BTC', name: 'Bitcoin', quantity: 0.05, price: 34000, total: 1700 },
            { date: '2023-11-12', type: 'Buy', symbol: 'ETH', name: 'Ethereum', quantity: 1.5, price: 2100, total: 3150 },
            { date: '2023-10-28', type: 'Sell', symbol: 'SOL', name: 'Solana', quantity: 10, price: 45, total: 450 },
            { date: '2023-09-10', type: 'Buy', symbol: 'BTC', name: 'Bitcoin', quantity: 0.02, price: 28000, total: 560 }
        ];

        // enrich holdings with mock days_held for AI insights demo
        CRYPTO_DATA.holdings = CRYPTO_DATA.holdings.map(h => ({
            ...h,
            days_held: Math.floor(Math.random() * 400) // Random hold time between 0-400 days
        }));

        // Render All Crypto Sub-Modules
        renderCryptoOverview();
        renderCryptoHoldings();

        // Safe calling of other modules
        if (typeof renderCryptoTransactions === 'function') {
            renderCryptoTransactions();
        } else {
            console.warn('renderCryptoTransactions not loaded');
        }

        if (typeof renderAIInsights === 'function') {
            renderAIInsights();
        }

    } catch (error) {
        console.error('Error fetching crypto data:', error);
        // In DEV_MODE, still render UI even on network error
        if (typeof DEV_MODE !== 'undefined' && DEV_MODE) {
            console.log('DEV_MODE: Rendering crypto overview despite error');
            renderCryptoOverview();
        }
    }
}

async function refreshCryptoPrices() {
    const btn = document.getElementById('cryptoRefreshBtn');
    const icon = document.getElementById('cryptoRefreshIcon');

    if (btn) btn.disabled = true;
    if (icon) icon.classList.add('spin-animation');

    try {
        console.log('Refreshing live crypto prices via CoinMarketCap...');
        const response = await withTimeout(fetch(`${API_BASE_URL}/crypto/holdings/refresh`, {
            method: 'POST',
            headers: getAuthHeaders()
        }));

        if (response.ok) {
            CRYPTO_DATA.holdings = await response.json();

            // Re-render the holdings and overview without fetching everything again
            renderCryptoOverview();
            renderCryptoHoldings();

            if (typeof showToast === 'function') {
                showToast('Prices updated successfully', 'success');
            }
        } else {
            throw new Error('Failed to refresh prices');
        }
    } catch (error) {
        console.error('Error refreshing crypto prices:', error);
        if (typeof showToast === 'function') {
            showToast('Failed to refresh live prices', 'error');
        }
    } finally {
        if (btn) btn.disabled = false;
        if (icon) icon.classList.remove('spin-animation');
    }
}

function calculateCryptoMetrics() {
    const { holdings } = CRYPTO_DATA;

    const totalValue = holdings.reduce((sum, h) => sum + (h.quantity * h.current_price), 0);
    const totalInvested = holdings.reduce((sum, h) => sum + (h.quantity * h.purchase_price_avg), 0);

    const avgReturn = totalInvested > 0 ? ((totalValue - totalInvested) / totalInvested) * 100 : 0;

    return {
        total_value: totalValue,
        change_24h_value: CRYPTO_DATA.metrics.change_24h_value || 0,
        change_24h_percent: CRYPTO_DATA.metrics.change_24h_percent || 0,
        total_assets_count: holdings.length,
        avg_portfolio_return: avgReturn
    };
}

function renderCryptoOverview() {
    // Reset cache so each fresh render fetches up-to-date history
    window._cryptoPortfolioHistory = null;

    const metrics = calculateCryptoMetrics();

    // NOTE: This large HTML block is migrated from dashboard.js
    // I am keeping the exact same structure to ensure visual consistency

    const overviewHtml = `
        <div class="d-flex flex-column gap-4">
            <div class="glass-header mb-2 d-flex justify-content-between align-items-center">
                <div>
                    <h2 class="h4 fw-light text-gradient-accent mb-1">Crypto Overview</h2>
                    <p class="small fw-light text-white-50">Real-time market exposure and network activity.</p>
                </div>
            </div>
            
            <!-- TOP ROW: Graph (65%) + Network Correlation (35%) - PRIMARY -->
            <div class="row g-4">
                <!-- Portfolio Performance Graph -->
                <div class="col-lg-8">
                    <div class="rounded-4 overflow-hidden position-relative h-100 d-flex flex-column" 
                         style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 0 50px 0 rgba(255, 255, 255, 0.05), inset 0 0 20px 0 rgba(255, 255, 255, 0.02); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); min-height: 320px; padding: 1.5rem;">
                        <div class="d-flex align-items-center justify-content-between mb-3">
                            <h2 class="h4 fw-light text-white-90 mb-1">Portfolio Performance</h2>
                            <div class="d-flex gap-2" id="perfRangeBtns">
                                ${['1D', '1W', '1M', '1Y', 'ALL'].map((range, i) => `
                                    <button
                                        data-range="${range}"
                                        class="px-3 py-1 rounded-pill small perf-range-btn"
                                        style="background: ${i === 4 ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)'}; color: ${i === 4 ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)'}; border: none; cursor: pointer; transition: all 0.2s;">
                                        ${range}
                                    </button>
                                `).join('')}
                            </div>
                        </div>
                        <div class="flex-grow-1 position-relative" style="min-height: 220px;">
                            <canvas id="cryptoPerformanceChart"></canvas>
                            <div id="cryptoPerformanceEmpty" class="d-none position-absolute top-50 start-50 translate-middle text-center">
                                <p class="small text-white-30 mb-0">No holdings data yet</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Network Correlation Panel (Animated Canvas) -->
                <div class="col-lg-4">
                    <div class="rounded-4 overflow-hidden position-relative h-100 d-flex flex-column" 
                         style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 0 50px 0 rgba(255, 255, 255, 0.05), inset 0 0 20px 0 rgba(255, 255, 255, 0.02); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); min-height: 320px; padding: 1.5rem;">
                        <h4 class="h6 fw-light text-white-70 mb-3 text-uppercase small" style="letter-spacing: 0.1em;">Network Correlation</h4>
                        <div class="flex-grow-1 d-flex align-items-center justify-content-center position-relative" id="network-correlation-container">
                            <!-- Ambient vignette overlay -->
                            <div style="position: absolute; inset: 0; background: radial-gradient(ellipse 70% 60% at 50% 50%, transparent 30%, rgba(0,0,0,0.4) 100%); pointer-events: none; z-index: 1;"></div>
                            <!-- Canvas for animated constellation -->
                            <canvas id="networkCorrelationCanvas" style="width: 100%; max-width: 280px; height: 220px; position: relative; z-index: 2;"></canvas>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Crypto Allocation Charts -->
            <div class="row g-4">
                <!-- Crypto Allocation by Network (Left) -->
                <div class="col-lg-6">
                    <div class="rounded-4 overflow-hidden position-relative p-4 h-100" 
                        style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px);">
                        <h4 class="h6 fw-light text-white-70 mb-3 text-uppercase small" style="letter-spacing: 0.1em;">Allocation by Network</h4>
                        <div style="height: 250px; width: 100%;">
                            <canvas id="cryptoNetworkChart"></canvas>
                        </div>
                    </div>
                </div>
                <!-- Top Crypto Assets (Right) -->
                <div class="col-lg-6">
                    <div class="rounded-4 overflow-hidden position-relative p-4 h-100" 
                        style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px);">
                        <h4 class="h6 fw-light text-white-70 mb-3 text-uppercase small" style="letter-spacing: 0.1em;">Top Assets (by Value)</h4>
                        <div style="height: 250px; width: 100%;">
                            <canvas id="cryptoTopAssetsChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>

            <!-- BOTTOM ROW: 4 Stat Cards - SECONDARY -->
            <div class="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-3">
                <!-- Total Crypto Value -->
                <div class="col">
                    <div class="glass-card p-3 h-100 d-flex flex-column justify-content-between position-relative overflow-hidden group hover-lift transition-colors"
                         style="transition: background 0.3s ease; border: 1px solid rgba(255,255,255,0.08);"
                         onmouseover="this.style.background='rgba(255,255,255,0.04)'"
                         onmouseout="this.style.background='rgba(255,255,255,0.03)'">
                         
                         <div class="d-flex justify-content-between align-items-start mb-3">
                             <div class="text-white-50">${ICONS.wallet}</div>
                             <span class="badge rounded-pill ${metrics.change_24h_percent >= 0 ? 'text-success' : 'text-danger'}" style="font-size: 0.6rem; font-weight: 300; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.05);">${metrics.change_24h_percent >= 0 ? '+' : ''}${metrics.change_24h_percent.toFixed(2)}% (24h)</span>
                         </div>
                         <div>
                             <div class="h4 mb-0 fw-light text-white">${formatCurrency(metrics.total_value)}</div>
                             <div class="small text-white-30 text-uppercase tracking-wider mt-1" style="font-size: 0.65rem;">Total Crypto Value</div>
                         </div>
                    </div>
                </div>

                <!-- Portfolio Return -->
                <div class="col">
                    <div class="glass-card p-3 h-100 d-flex flex-column justify-content-between position-relative overflow-hidden group hover-lift transition-colors"
                         style="transition: background 0.3s ease; border: 1px solid rgba(255,255,255,0.08);"
                         onmouseover="this.style.background='rgba(255,255,255,0.04)'"
                         onmouseout="this.style.background='rgba(255,255,255,0.03)'">
                         
                         <div class="d-flex justify-content-between align-items-start mb-3">
                             <div class="text-white-50">${ICONS.trending}</div>
                             <span class="badge rounded-pill text-white-30" style="font-size: 0.6rem; font-weight: 300; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.05);">Weighted</span>
                         </div>
                         <div>
                             <div class="h4 mb-0 fw-light" style="color: ${metrics.avg_portfolio_return >= 0 ? '#10b981' : '#ef4444'}">${metrics.avg_portfolio_return >= 0 ? '+' : ''}${metrics.avg_portfolio_return.toFixed(1)}%</div>
                             <div class="small text-white-30 text-uppercase tracking-wider mt-1" style="font-size: 0.65rem;">Portfolio Return</div>
                         </div>
                    </div>
                </div>

                <!-- Active Assets -->
                <div class="col">
                    <div class="glass-card p-3 h-100 d-flex flex-column justify-content-between position-relative overflow-hidden group hover-lift transition-colors"
                         style="transition: background 0.3s ease; border: 1px solid rgba(255,255,255,0.08);"
                         onmouseover="this.style.background='rgba(255,255,255,0.04)'"
                         onmouseout="this.style.background='rgba(255,255,255,0.03)'">
                         
                         <div class="d-flex justify-content-between align-items-start mb-3">
                             <div class="text-white-50">${ICONS.chart}</div>
                             <span class="badge rounded-pill text-white-30" style="font-size: 0.6rem; font-weight: 300; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.05);">Active</span>
                         </div>
                         <div>
                             <div class="h4 mb-0 fw-light text-white">${metrics.total_assets_count}</div>
                             <div class="small text-white-30 text-uppercase tracking-wider mt-1" style="font-size: 0.65rem;">Active Assets</div>
                         </div>
                    </div>
                </div>

                <!-- Network Status -->
                <div class="col">
                    <div class="glass-card p-3 h-100 d-flex flex-column justify-content-between position-relative overflow-hidden group hover-lift transition-colors"
                         style="transition: background 0.3s ease; border: 1px solid rgba(255,255,255,0.08);"
                         onmouseover="this.style.background='rgba(255,255,255,0.04)'"
                         onmouseout="this.style.background='rgba(255,255,255,0.03)'">
                         
                         <div class="d-flex justify-content-between align-items-start mb-3">
                             <div class="text-white-50">${ICONS.activity}</div>
                             <span class="badge rounded-pill text-white-30" style="font-size: 0.6rem; font-weight: 300; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.05);">Synced</span>
                         </div>
                         <div>
                             <div class="h4 mb-0 fw-light text-success">Online</div>
                             <div class="small text-white-30 text-uppercase tracking-wider mt-1" style="font-size: 0.65rem;">Network Status</div>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    const container = document.getElementById('crypto-section-overview');
    if (container) {
        container.innerHTML = overviewHtml;
        initCryptoCharts(metrics);
        initNetworkAnimation();
        // Render the real performance chart after DOM is ready
        renderPortfolioPerformanceChart('ALL');
    }
}

// ── Portfolio Performance Chart ─────────────────────────────────────────────

const CRYPTO_PERIOD_MAP = {
    '1D': '1d',
    '1W': '5d',
    '1M': '1mo',
    '1Y': '1y',
    'ALL': '5y'
};

async function renderPortfolioPerformanceChart(activeRange) {
    const canvas = document.getElementById('cryptoPerformanceChart');
    const emptyEl = document.getElementById('cryptoPerformanceEmpty');
    if (!canvas) return;

    // Map frontend range to backend parameter
    const apiPeriod = CRYPTO_PERIOD_MAP[activeRange] || '1mo';
    let chartData = [];

    try {
        const res = await withTimeout(fetch(`${API_BASE_URL}/crypto/portfolio-history?period=${apiPeriod}`, {
            headers: getAuthHeaders()
        }));
        if (res.ok) {
            chartData = await res.json();
        }
    } catch (e) {
        console.warn('Could not fetch portfolio history:', e);
    }

    // Wire up range buttons (re-render on click)
    const btnContainer = document.getElementById('perfRangeBtns');
    if (btnContainer) {
        btnContainer.querySelectorAll('.perf-range-btn').forEach(btn => {
            btn.onclick = () => {
                renderPortfolioPerformanceChart(btn.dataset.range);
            };
            const isActive = btn.dataset.range === activeRange;
            btn.style.background = isActive ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)';
            btn.style.color    = isActive ? 'rgba(255,255,255,0.9)'  : 'rgba(255,255,255,0.4)';
        });
    }

    // Filter data by selected range (backend now handles 1d granularity)
    // Backend now handles all filtering and intraday generation based on the period parameter
    const filtered = chartData;

    // Show empty state if no data
    if (filtered.length === 0) {
        if (emptyEl) emptyEl.classList.remove('d-none');
        canvas.style.display = 'none';
        return;
    }
    if (emptyEl) emptyEl.classList.add('d-none');
    canvas.style.display = '';

    const labels = filtered.map(p => p.date);
    const values = filtered.map(p => p.value);

    const firstVal = values.length > 0 ? values[0] : 0;
    const lastVal = values.length > 0 ? values[values.length - 1] : 0;
    const isPositive = (lastVal - firstVal) >= 0;
    const lineColor = isPositive ? '#22d399' : '#ef4444';
    const fillColorStart = isPositive ? 'rgba(34, 211, 153, 0.15)' : 'rgba(239, 68, 68, 0.15)';
    const fillColorEnd = 'rgba(0, 0, 0, 0)';

    // Destroy previous instance if any
    if (window.cryptoPerformanceChartInstance) {
        window.cryptoPerformanceChartInstance.destroy();
        window.cryptoPerformanceChartInstance = null;
    }

    window.cryptoPerformanceChartInstance = new Chart(canvas, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                data: values,
                fill: true,
                backgroundColor: function(context) {
                    const chart = context.chart;
                    const {ctx, chartArea} = chart;
                    if (!chartArea) return fillColorStart;
                    const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                    gradient.addColorStop(0, fillColorStart);
                    gradient.addColorStop(1, fillColorEnd);
                    return gradient;
                },
                borderColor: lineColor,
                borderWidth: 1.5,
                pointRadius: 0,
                pointHoverRadius: 4,
                pointHoverBackgroundColor: lineColor,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { intersect: false, mode: 'index' },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.85)',
                    titleColor: 'rgba(255,255,255,0.5)',
                    bodyColor: '#fff',
                    padding: 12,
                    cornerRadius: 8,
                    titleFont: { family: 'Inter', size: 10 },
                    bodyFont: { family: 'Inter', size: 13, weight: '300' },
                    callbacks: {
                        title: (items) => items[0].label,
                        label: (item) => '₹' + Number(item.raw).toLocaleString('en-IN', { maximumFractionDigits: 0 })
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    border: { display: false },
                    ticks: {
                        color: 'rgba(255,255,255,0.3)',
                        font: { family: 'Inter', size: 9 },
                        maxTicksLimit: 6,
                        maxRotation: 0
                    }
                },
                y: {
                    position: 'right',
                    grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
                    border: { display: false },
                    ticks: {
                        color: 'rgba(255,255,255,0.3)',
                        font: { family: 'Inter', size: 9 },
                        maxTicksLimit: 4,
                        callback: (v) => '₹' + (v >= 1000 ? (v/1000).toFixed(0)+'k' : v)
                    }
                }
            }
        }
    });
}

// ─────────────────────────────────────────────────────────────────────────────

function initNetworkAnimation() {
    if (document.getElementById('networkCorrelationCanvas')) {
        if (window.networkCorrelationInstance) {
            // Stop previous animation loop if method exists
            if (window.networkCorrelationInstance.animationId) {
                cancelAnimationFrame(window.networkCorrelationInstance.animationId);
            }
        }
        // Small delay to ensure DOM paint
        setTimeout(() => {
            // Assuming NetworkCorrelationAnimation is defined safely in dashboard.js or globally
            if (typeof NetworkCorrelationAnimation !== 'undefined') {
                window.networkCorrelationInstance = new NetworkCorrelationAnimation('networkCorrelationCanvas');
            }
        }, 50);
    }
}


function initCryptoCharts(metrics) {
    // 1. Network Allocation (Pie Chart)
    const networkCounts = {};
    CRYPTO_DATA.holdings.forEach(h => {
        const network = h.network || 'Other';
        networkCounts[network] = (networkCounts[network] || 0) + 1;
    });

    const netLabels = Object.keys(networkCounts);
    const netData = Object.values(networkCounts);

    const ctxNet = document.getElementById('cryptoNetworkChart');
    if (ctxNet && netLabels.length > 0) {
        if (window.cryptoNetworkChartInstance) window.cryptoNetworkChartInstance.destroy();

        window.cryptoNetworkChartInstance = new Chart(ctxNet, {
            type: 'doughnut',
            data: {
                labels: netLabels,
                datasets: [{
                    data: netData,
                    backgroundColor: [
                        'rgba(255, 255, 255, 0.9)',
                        'rgba(255, 255, 255, 0.5)',
                        'rgba(255, 255, 255, 0.2)',
                        'rgba(255, 215, 0, 0.4)',
                        'rgba(255, 255, 255, 0.1)'
                    ],
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: 'rgba(255, 255, 255, 0.7)',
                            font: { family: 'Inter', size: 11 },
                            boxWidth: 10,
                            padding: 20
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        padding: 12,
                        cornerRadius: 8,
                        displayColors: true
                    }
                }
            }
        });
    }

    // 2. Top Assets (Bar Chart)
    const topAssets = [...CRYPTO_DATA.holdings]
        .map(h => ({
            ...h,
            totalValue: (h.quantity || 0) * (h.current_price || 0)
        }))
        .sort((a, b) => b.totalValue - a.totalValue)
        .slice(0, 5);

    const assetLabels = topAssets.map(h => h.symbol);
    const assetValues = topAssets.map(h => h.totalValue);

    const ctxAssets = document.getElementById('cryptoTopAssetsChart');
    if (ctxAssets && assetLabels.length > 0) {
        if (window.cryptoTopAssetsChartInstance) window.cryptoTopAssetsChartInstance.destroy();

        window.cryptoTopAssetsChartInstance = new Chart(ctxAssets, {
            type: 'bar',
            data: {
                labels: assetLabels,
                datasets: [{
                    label: 'Total Value (₹)',
                    data: assetValues,
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    borderRadius: 4,
                    barThickness: 20
                }]
            },
            options: {
                indexAxis: 'y', // Horizontal
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        padding: 12,
                        cornerRadius: 8,
                        callbacks: {
                            label: function (context) {
                                return '₹' + context.raw.toLocaleString('en-IN');
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.4)',
                            font: { family: 'Inter', size: 10 },
                            callback: function (value) {
                                return '₹' + (value / 1000).toFixed(0) + 'k';
                            }
                        },
                        border: { display: false }
                    },
                    y: {
                        grid: { display: false },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.8)',
                            font: { family: 'Inter', size: 11 }
                        },
                        border: { display: false }
                    }
                }
            }
        });
    }
}

function renderCryptoHoldings() {
    const container = document.getElementById('crypto-holdings-list');
    if (!container) return;

    const { holdings } = CRYPTO_DATA;

    if (!holdings || holdings.length === 0) {
        container.innerHTML = `
            <div class="p-5 text-center">
                <div class="mb-3">
                    <div class="d-inline-flex align-items-center justify-content-center rounded-circle" style="width: 64px; height: 64px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1);">
                        <svg width="32" height="32" fill="none" stroke="rgba(255,255,255,0.3)" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>
                <h3 class="h5 fw-light text-white-90 mb-2">No crypto assets yet</h3>
                <p class="small text-white-30">Use the section above to add your first asset.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = holdings.map(holding => {
        const currentPrice = holding.current_price || 0;
        const avgBuyPrice = holding.purchase_price_avg || 0;
        const quantity = holding.quantity || 0;

        const totalValue = quantity * currentPrice;
        const totalInvested = quantity * avgBuyPrice;

        // Calculate Gain/Loss
        let gainLoss = 0;
        let gainLossPercent = 0;
        if (totalInvested > 0) {
            gainLoss = totalValue - totalInvested;
            gainLossPercent = (gainLoss / totalInvested) * 100;
        }

        return `
        <div class="d-flex w-100 p-3 text-white-70 small align-items-center holding-row">
            <!--Asset (18%)-->
            <div style="width: 18%">
                <div class="d-flex align-items-center gap-3">
                    <div class="d-flex align-items-center justify-content-center rounded-circle text-white fw-bold" style="width: 32px; height: 32px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.1);">
                        ${holding.symbol[0]}
                    </div>
                    <div>
                        <div class="text-white fw-medium">${holding.name}</div>
                        <div class="text-white-50" style="font-size: 0.7rem;">${holding.symbol}</div>
                    </div>
                </div>
            </div>
            <!--Network (10%)-->
            <div style="width: 10%">
                <span class="badge fw-normal px-2 py-1 rounded-pill small" 
                      style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.05); color: rgba(255,255,255,0.5); font-weight: 300; font-size: 0.65rem;">
                    ${holding.network}
                </span>
            </div>
            <!--Quantity (10%)-->
            <div style="width: 10%">
                <span class="text-white-80">${quantity.toLocaleString()}</span>
            </div>
            <!--Avg Buy Price (13%)-->
            <div style="width: 13%">
                <span class="text-white-70">${formatCurrency(avgBuyPrice)}</span>
            </div>
            <!--Current Price (13%)-->
            <div style="width: 13%">
                <span class="text-white-80">${formatCurrency(currentPrice)}</span>
            </div>
            <!--Total Valuation (14%)-->
            <div style="width: 14%">
                <span class="text-white-90 fw-medium">${formatCurrency(totalValue)}</span>
            </div>
            <!--Gain/Loss (14%)-->
            <div style="width: 14%">
                <div class="${gainLoss >= 0 ? 'text-success' : 'text-danger'}">
                    ${gainLoss >= 0 ? '+' : ''}${formatCurrency(gainLoss)}
                </div>
                <div class="${gainLoss >= 0 ? 'text-success' : 'text-danger'} opacity-75" style="font-size: 0.7rem;">
                    ${gainLoss >= 0 ? '+' : ''}${gainLossPercent.toFixed(2)}%
                </div>
            </div>
            <!--Action (8%)-->
            <div class="text-center" style="width: 8%">
                <button class="btn btn-sm btn-icon-glass text-white-50 hover-white" onclick="safeOnClick('openCryptoActionModal', '${holding.id}', '${holding.symbol}')">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg>
                </button>
            </div>
        </div>
        `;
    }).join('');
}


// Export functions to global scope
window.fetchCryptoData = fetchCryptoData;
window.refreshCryptoPrices = refreshCryptoPrices;
window.renderCryptoOverview = renderCryptoOverview;
window.renderCryptoHoldings = renderCryptoHoldings;
