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
    const metrics = calculateCryptoMetrics();

    // NOTE: This large HTML block is migrated from dashboard.js
    // I am keeping the exact same structure to ensure visual consistency

    const overviewHtml = `
        <div class="d-flex flex-column gap-4">
            <div class="glass-header mb-2 d-flex justify-content-between align-items-center">
                <div>
                    <h2 class="h4 fw-light text-white-90 mb-1">Crypto Overview</h2>
                    <p class="small fw-light text-white-50">Real-time market exposure and network activity.</p>
                </div>
            </div>
            
            <!-- TOP ROW: Graph (65%) + Network Correlation (35%) - PRIMARY -->
            <div class="row g-4">
                <!-- Portfolio Performance Graph -->
                <div class="col-lg-8">
                    <div class="rounded-4 overflow-hidden position-relative h-100" 
                         style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 0 50px 0 rgba(255, 255, 255, 0.05), inset 0 0 20px 0 rgba(255, 255, 255, 0.02); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); min-height: 320px; padding: 1.5rem;">
                        <div class="d-flex align-items-center justify-content-between mb-4">
                            <h3 class="small fw-medium text-white-70 mb-0">Portfolio Performance</h3>
                            <div class="d-flex gap-2">
                                ${['1D', '1W', '1M', '1Y', 'ALL'].map(range => `
                                    <button class="px-3 py-1 rounded-pill small" style="background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.4); border: none;">${range}</button>
                                `).join('')}
                            </div>
                        </div>
                        <svg class="w-100" preserveAspectRatio="none" viewBox="0 0 100 50" style="position: absolute; bottom: 0; left: 0; right: 0; height: 70%;">
                            <defs>
                                <linearGradient id="cryptoChartGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stop-color="rgba(255, 255, 255, 0.15)" />
                                    <stop offset="100%" stop-color="rgba(255, 255, 255, 0)" />
                                </linearGradient>
                            </defs>
                            <path d="M0,45 C20,40 30,20 50,25 C70,30 80,10 100,5 V50 H0 Z" fill="url(#cryptoChartGradient)"/>
                            <path d="M0,45 C20,40 30,20 50,25 C70,30 80,10 100,5" fill="none" stroke="#FFFFFF" stroke-width="0.5"/>
                        </svg>
                    </div>
                </div>

                <!-- Network Correlation Panel (Animated Canvas) -->
                <div class="col-lg-4">
                    <div class="rounded-4 overflow-hidden position-relative h-100 d-flex flex-column" 
                         style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 0 50px 0 rgba(255, 255, 255, 0.05), inset 0 0 20px 0 rgba(255, 255, 255, 0.02); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); min-height: 320px; padding: 1.5rem;">
                        <h3 class="small fw-medium text-white-70 mb-4">Network Correlation</h3>
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
                        <h3 class="small fw-medium text-white-70 mb-4">Allocation by Network</h3>
                        <div style="height: 250px; width: 100%;">
                            <canvas id="cryptoNetworkChart"></canvas>
                        </div>
                    </div>
                </div>
                <!-- Top Crypto Assets (Right) -->
                <div class="col-lg-6">
                    <div class="rounded-4 overflow-hidden position-relative p-4 h-100" 
                        style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px);">
                        <h3 class="small fw-medium text-white-70 mb-4">Top Assets (by Value)</h3>
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
                    <div class="position-relative p-4 rounded-4 overflow-hidden h-100 d-flex flex-column justify-content-center"
                         style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 0 30px 0 rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);">
                        <div class="d-flex flex-column gap-2">
                            <div class="text-white-50 mb-1">${ICONS.wallet}</div>
                            <div>
                                <p class="small text-uppercase text-white-50 mb-1" style="letter-spacing: 0.1em; font-size: 0.65rem;">Total Crypto Value</p>
                                <h3 class="h4 fw-light text-white-90 mb-1">${formatCurrency(metrics.total_value)}</h3>
                                <p class="small fw-light ${metrics.change_24h_percent >= 0 ? 'text-success' : 'text-danger'}" style="font-size: 0.75rem;">
                                    ${metrics.change_24h_percent >= 0 ? '+' : ''}${metrics.change_24h_percent.toFixed(2)}% Last 24h
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Portfolio Return -->
                <div class="col">
                    <div class="position-relative p-4 rounded-4 overflow-hidden h-100 d-flex flex-column justify-content-center"
                         style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 0 30px 0 rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);">
                        <div class="d-flex flex-column gap-2">
                            <div class="text-white-50 mb-1">${ICONS.trending}</div>
                            <div>
                                <p class="small text-uppercase text-white-50 mb-1" style="letter-spacing: 0.1em; font-size: 0.65rem;">Portfolio Return</p>
                                <h3 class="h4 fw-light mb-1" style="color: ${metrics.avg_portfolio_return >= 0 ? '#10b981' : '#ef4444'}">
                                    ${metrics.avg_portfolio_return >= 0 ? '+' : ''}${metrics.avg_portfolio_return.toFixed(1)}%
                                </h3>
                                <p class="small fw-light text-white-50" style="font-size: 0.75rem;">All-time weighted</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Active Assets -->
                <div class="col">
                    <div class="position-relative p-4 rounded-4 overflow-hidden h-100 d-flex flex-column justify-content-center"
                         style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 0 30px 0 rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);">
                        <div class="d-flex flex-column gap-2">
                            <div class="text-white-50 mb-1">${ICONS.chart}</div>
                            <div>
                                <p class="small text-uppercase text-white-50 mb-1" style="letter-spacing: 0.1em; font-size: 0.65rem;">Active Assets</p>
                                <h3 class="h4 fw-light text-white-90 mb-1">${metrics.total_assets_count}</h3>
                                <p class="small fw-light text-white-50" style="font-size: 0.75rem;">Across 3 networks</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Network Status -->
                <div class="col">
                    <div class="position-relative p-4 rounded-4 overflow-hidden h-100 d-flex flex-column justify-content-center"
                         style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 0 30px 0 rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);">
                        <div class="d-flex flex-column gap-2">
                            <div class="text-white-50 mb-1">${ICONS.activity}</div>
                            <div>
                                <p class="small text-uppercase text-white-50 mb-1" style="letter-spacing: 0.1em; font-size: 0.65rem;">Network Status</p>
                                <h3 class="h4 fw-light text-success mb-1">Online</h3>
                                <p class="small fw-light text-white-50" style="font-size: 0.75rem;">All nodes synced</p>
                            </div>
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
    }
}

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
window.renderCryptoOverview = renderCryptoOverview;
window.renderCryptoHoldings = renderCryptoHoldings;
