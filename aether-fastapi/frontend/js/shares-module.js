
// ==================== SHARES MODULE ====================

console.log("[SHARES VERSION] 3 - BUTTON MOVED TO HOLDINGS");

let SHARES_DATA = {
    holdings: [],
    metrics: {
        total_value: 0,
        total_invested: 0,
        total_gain_loss: 0,
        total_gain_loss_percent: 0,
        active_shares_count: 0,
        sold_shares_count: 0
    }
};

let currentSharesFilter = 'active'; // 'active' or 'sold'
let shareSearchTimeout = null;
let selectedStock = null;

// Fetch Shares Data
async function fetchSharesData() {
    try {
        const [holdingsResponse, metricsResponse] = await Promise.all([
            fetch(`${API_BASE_URL}/shares/holdings`, { headers: getAuthHeaders() }),
            fetch(`${API_BASE_URL}/shares/metrics`, { headers: getAuthHeaders() })
        ]);

        if (holdingsResponse.ok) {
            SHARES_DATA.holdings = await holdingsResponse.json();
        }

        if (metricsResponse.ok) {
            SHARES_DATA.metrics = await metricsResponse.json();
        }

        renderSharesOverview();
        renderSharesHoldings();
    } catch (error) {
        console.error('Error fetching shares data:', error);
    }
}

// Render Shares Overview
function renderSharesOverview() {
    const metrics = SHARES_DATA.metrics;
    const container = document.getElementById('shares-section-overview');

    if (!container) return;

    const overviewHtml = `
        <div class="d-flex flex-column gap-4">
            <div class="glass-header mb-2 d-flex justify-content-between align-items-center">
                <div>
                    <h2 class="h4 fw-light text-white-90 mb-1">Shares Overview</h2>
                    <p class="small fw-light text-white-50">Equity portfolio performance and metrics</p>
                </div>
            </div>

            <!-- Portfolio Chart Placeholder -->
            <div class="rounded-4 overflow-hidden position-relative" 
                 style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 0 50px 0 rgba(255, 255, 255, 0.05), inset 0 0 20px 0 rgba(255, 255, 255, 0.02); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); height: 300px; padding: 2rem;">
                <div class="d-flex align-items-center justify-content-between mb-4">
                    <h3 class="small fw-medium text-white-70">Portfolio Performance</h3>
                    <div class="d-flex gap-2">
                        ${['1D', '1W', '1M', '1Y', 'ALL'].map(range => `
                            <button class="px-3 py-1 rounded-pill small" style="background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.4); border: none;">${range}</button>
                        `).join('')}
                    </div>
                </div>
                <div class="text-white-50 text-center mt-5">
                    <p>Performance chart coming soon...</p>
                </div>
            </div>

            <!-- Charts Grid -->
            <div class="row g-4">
                <!-- Sector Allocation Chart (Left) -->
                <div class="col-lg-6">
                    <div class="rounded-4 overflow-hidden position-relative p-4 h-100" 
                         style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px);">
                        <h3 class="small fw-medium text-white-70 mb-4">Sector Allocation</h3>
                        <div style="height: 250px; width: 100%;">
                            <canvas id="sharesSectorChart"></canvas>
                        </div>
                    </div>
                </div>

                <!-- Top Holdings Chart (Right) -->
                <div class="col-lg-6">
                    <div class="rounded-4 overflow-hidden position-relative p-4 h-100" 
                         style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px);">
                        <h3 class="small fw-medium text-white-70 mb-4">Top Holdings (by Value)</h3>
                        <div style="height: 250px; width: 100%;">
                            <canvas id="sharesTopHoldingsChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Metrics Grid -->
            <div class="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-3">
                <!-- Total Value -->
                <div class="col">
                    <div class="position-relative p-4 rounded-4 overflow-hidden group transition-all h-100 d-flex flex-column justify-content-center"
                         style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 0 30px 0 rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);">
                        <div class="position-relative z-1 d-flex flex-column gap-2">
                            <div class="text-white-50 mb-1">${ICONS.wallet}</div>
                            <div>
                                <p class="small text-uppercase text-white-50 mb-1" style="letter-spacing: 0.1em; font-size: 0.65rem;">Total Value</p>
                                <h3 class="h4 fw-light text-white-90 mb-1">${formatCurrency(metrics.total_value)}</h3>
                                <p class="small fw-light text-white-50" style="font-size: 0.75rem;">Current holdings</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Total Invested -->
                <div class="col">
                    <div class="position-relative p-4 rounded-4 overflow-hidden group transition-all h-100 d-flex flex-column justify-content-center"
                         style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 0 30px 0 rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);">
                        <div class="position-relative z-1 d-flex flex-column gap-2">
                            <div class="text-white-50 mb-1">${ICONS.dollar}</div>
                            <div>
                                <p class="small text-uppercase text-white-50 mb-1" style="letter-spacing: 0.1em; font-size: 0.65rem;">Total Invested</p>
                                <h3 class="h4 fw-light text-white-90 mb-1">${formatCurrency(metrics.total_invested)}</h3>
                                <p class="small fw-light text-white-50" style="font-size: 0.75rem;">Capital deployed</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Gain/Loss -->
                <div class="col">
                    <div class="position-relative p-4 rounded-4 overflow-hidden group transition-all h-100 d-flex flex-column justify-content-center"
                         style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 0 30px 0 rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);">
                        <div class="position-relative z-1 d-flex flex-column gap-2">
                            <div class="text-white-50 mb-1">${ICONS.trending}</div>
                            <div>
                                <p class="small text-uppercase text-white-50 mb-1" style="letter-spacing: 0.1em; font-size: 0.65rem;">Total Gain/Loss</p>
                                <h3 class="h4 fw-light mb-1" style="color: ${metrics.total_gain_loss >= 0 ? '#10b981' : '#ef4444'}">
                                    ${metrics.total_gain_loss >= 0 ? '+' : ''}${formatCurrency(metrics.total_gain_loss)}
                                </h3>
                                <p class="small fw-light" style="font-size: 0.75rem; color: ${metrics.total_gain_loss_percent >= 0 ? '#10b981' : '#ef4444'}">
                                    ${metrics.total_gain_loss_percent >= 0 ? '+' : ''}${metrics.total_gain_loss_percent.toFixed(2)}%
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Active Shares -->
                <div class="col">
                    <div class="position-relative p-4 rounded-4 overflow-hidden group transition-all h-100 d-flex flex-column justify-content-center"
                         style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 0 30px 0 rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);">
                        <div class="position-relative z-1 d-flex flex-column gap-2">
                            <div class="text-white-50 mb-1">${ICONS.chart}</div>
                            <div>
                                <p class="small text-uppercase text-white-50 mb-1" style="letter-spacing: 0.1em; font-size: 0.65rem;">Active Shares</p>
                                <h3 class="h4 fw-light text-white-90 mb-1">${metrics.active_shares_count}</h3>
                                <p class="small fw-light text-white-50" style="font-size: 0.75rem;">${metrics.sold_shares_count} sold</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = overviewHtml;

    // --- RENDER SECTOR CHART ---
    // 1. Calculate Sector Counts
    const sectorCounts = {};
    SHARES_DATA.holdings.filter(s => s.status === 'active').forEach(share => {
        const sector = share.sector || 'Unclassified';
        sectorCounts[sector] = (sectorCounts[sector] || 0) + 1;
    });

    const labels = Object.keys(sectorCounts);
    const data = Object.values(sectorCounts);

    // 2. Render Sector Chart if data exists
    const ctx = document.getElementById('sharesSectorChart');
    if (ctx && labels.length > 0) {
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: [
                        'rgba(255, 255, 255, 0.9)',
                        'rgba(255, 255, 255, 0.5)',
                        'rgba(255, 255, 255, 0.2)',
                        'rgba(255, 215, 0, 0.4)', // Gold-ish
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

    // --- RENDER TOP HOLDINGS CHART ---
    const topHoldings = SHARES_DATA.holdings
        .filter(s => s.status === 'active')
        .sort((a, b) => b.total_value - a.total_value)
        .slice(0, 5);

    const holdingLabels = topHoldings.map(s => s.symbol);
    const holdingValues = topHoldings.map(s => s.total_value);

    const ctxHoldings = document.getElementById('sharesTopHoldingsChart');
    if (ctxHoldings && holdingLabels.length > 0) {
        new Chart(ctxHoldings, {
            type: 'bar',
            data: {
                labels: holdingLabels,
                datasets: [{
                    label: 'Total Value (₹)',
                    data: holdingValues,
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    borderRadius: 4,
                    barThickness: 20
                }]
            },
            options: {
                indexAxis: 'y', // Horizontal Bar Chart
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

// Render Shares Holdings
function renderSharesHoldings() {
    const container = document.getElementById('shares-holdings-list');
    if (!container) return;

    const activeCount = SHARES_DATA.holdings.filter(s => s.status === 'active').length;
    const soldCount = SHARES_DATA.holdings.filter(s => s.status === 'sold').length;

    const filteredShares = SHARES_DATA.holdings.filter(share =>
        share.status === currentSharesFilter
    );

    // 1. Header Section (Title + Controls)
    let headerHtml = `
        <div class="d-flex justify-content-between align-items-end mb-3">
            <div>
                <h3 class="h5 fw-light text-white-90 mb-1">Portfolio Holdings</h3>
            </div>
            <div class="d-flex align-items-center gap-3">
                <!-- Active/Sold Filter -->
                <div class="module-tabs">
                    <button id="filter-active-shares" 
                        class="module-tab ${currentSharesFilter === 'active' ? 'active' : ''}"
                        onclick="filterShares('active')">Active (${activeCount})</button>
                    <button id="filter-sold-shares" 
                        class="module-tab ${currentSharesFilter === 'sold' ? 'active' : ''}"
                        onclick="filterShares('sold')">Sold (${soldCount})</button>
                </div>
                
                <!-- Refresh Button -->
                <button onclick="refreshSharePrices()" class="btn px-3 py-2 d-flex align-items-center gap-2" 
                    style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: rgba(255,255,255,0.7);">
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                    <span class="small">Refresh</span>
                </button>

                <!-- Add Share Button -->
                <button onclick="openAddShareModal()" class="btn px-3 py-2 rounded-pill d-flex align-items-center gap-2 transition-all hover-scale-105"
                    style="background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); color: white;">
                    <span class="fs-6 fw-light">+</span>
                    <span>Add Share</span>
                </button>
            </div>
        </div>
    `;

    // 2. Table Section
    let tableHtml = `<div class="glass-panel overflow-hidden p-0">`;

    if (filteredShares.length === 0) {
        tableHtml += `
            <div class="py-5 text-center">
                <div class="mb-3">
                    <div class="d-inline-flex align-items-center justify-content-center bg-white bg-opacity-5 rounded-circle" style="width: 64px; height: 64px;">
                        <svg width="32" height="32" fill="none" stroke="rgba(255,255,255,0.3)" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                    </div>
                </div>
                <div class="mb-1 text-white-50">No ${currentSharesFilter} shares found</div>
                <p class="small text-white-30">
                    ${currentSharesFilter === 'active' ? 'Add your first share to track performance.' : 'Sold shares will appear here.'}
                </p>
            </div>`;
    } else {
        // List Header
        tableHtml += `
            <div class="d-flex w-100 p-3 border-bottom border-white border-opacity-10 text-white-50 small text-uppercase">
                <div style="width: 22%">Company</div>
                <div style="width: 10%">Sector</div>
                <div style="width: 8%">Quantity</div>
                <div style="width: 11%">Avg Buy Price</div>
                <div style="width: 11%">${currentSharesFilter === 'sold' ? 'Sale Price' : 'Current Price'}</div>
                <div style="width: 12%">Total Value</div>
                <div style="width: 14%">Gain/Loss</div>
                <div class="text-end" style="width: 8%">Actions</div>
            </div>
        `;

        // List Rows
        filteredShares.forEach(share => {
            const gainLoss = currentSharesFilter === 'sold' && share.profit_loss !== null
                ? share.profit_loss
                : share.gain_loss;
            const gainLossPercent = currentSharesFilter === 'sold' && share.sale_total_value && share.total_invested
                ? ((share.profit_loss / share.total_invested) * 100)
                : share.gain_loss_percent;
            const currentPrice = currentSharesFilter === 'sold' && share.sale_price ? share.sale_price : share.current_price;
            const totalValue = currentSharesFilter === 'sold' && share.sale_total_value ? share.sale_total_value : share.total_value;

            tableHtml += `
            <div class="d-flex w-100 p-3 text-white-70 small align-items-center holding-row" style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                <!-- Company (25%) -->
                <div style="width: 25%">
                    <div class="d-flex align-items-center gap-3">
                        <div class="d-flex align-items-center justify-content-center rounded-circle" 
                            style="width: 36px; height: 36px; background: rgba(255,255,255,0.1); flex-shrink: 0;">
                            <span class="fw-bold text-white-70 small">${share.symbol.substring(0, 2).toUpperCase()}</span>
                        </div>
                        <div class="overflow-hidden">
                            <div class="text-white fw-medium" title="${share.company_name}">
                                ${share.company_name.length > 20 ? share.company_name.substring(0, 20) + '...' : share.company_name}
                            </div>
                            <div class="text-white-40 small">${share.symbol}</div>
                        </div>
                    </div>
                </div>
                <!-- Sector (10%) -->
                <div style="width: 10%" class="text-white-70 text-truncate" title="${share.sector}">${share.sector}</div>
                <!-- Quantity (8%) -->
                <div style="width: 8%" class="text-white-80">${share.quantity.toLocaleString('en-IN')}</div>
                <!-- Avg Buy Price (11%) -->
                <div style="width: 11%" class="text-white-70">₹${share.avg_buy_price.toLocaleString('en-IN')}</div>
                <!-- Current/Sale Price (11%) -->
                <div style="width: 11%" class="text-white-80">₹${currentPrice.toLocaleString('en-IN')}</div>
                <!-- Total Value (12%) -->
                <div style="width: 12%" class="text-white-90 fw-medium">₹${totalValue.toLocaleString('en-IN')}</div>
                <!-- Gain/Loss (14%) -->
                <div style="width: 14%">
                    <div style="color: ${gainLoss >= 0 ? '#10b981' : '#ef4444'}">
                        <span class="d-flex align-items-center gap-1">
                            <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                                ${gainLoss >= 0
                    ? '<path d="M5 15l7-7 7 7"></path>'
                    : '<path d="M19 9l-7 7-7-7"></path>'}
                            </svg>
                            ₹${Math.abs(gainLoss).toLocaleString('en-IN')}
                        </span>
                        <span class="small">${gainLossPercent >= 0 ? '+' : ''}${gainLossPercent.toFixed(2)}%</span>
                    </div>
                </div>
                <!-- Actions (8%) -->
                <div class="text-end" style="width: 8%">
                    <div class="holding-actions d-flex gap-2 justify-content-end">
                    ${currentSharesFilter === 'active' ? `
                            <button onclick="${safeOnClick('openSellShareModal', share.id, share.symbol, share.quantity, share.total_invested)}"
                                class="btn-icon-glass" title="Sell">
                                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                                </svg>
                            </button>                                    
                            <button onclick="${safeOnClick('openRemoveShareModal', share.id, share.symbol)}"
                                class="btn-icon-glass text-danger" title="Remove">
                                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"></path>
                                </svg>
                            </button>
                    ` : `
                        <button onclick="${safeOnClick('openRemoveShareModal', share.id, share.symbol)}"
                            class="btn-icon-glass text-danger" title="Delete Record">
                            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"></path>
                            </svg>
                        </button>
                    `}
                    </div>
                </div>
            </div>
            `;
        });
    }

    tableHtml += `</div>`;
    container.innerHTML = headerHtml + tableHtml;

}


// Refresh share prices from API
async function refreshSharePrices() {
    // Re-fetch all shares data to get updated prices
    await fetchSharesData();
}

// Filter Shares (Active/Sold)
function filterShares(filter) {
    currentSharesFilter = filter;
    // Re-render - buttons are now inside the rendered content so they'll update automatically
    renderSharesHoldings();
}

// ========== Add Share Modal Functions ==========

let selectedSector = '';

function openAddShareModal() {
    const modal = document.getElementById('add-share-modal');
    modal.classList.remove('hidden');
    modal.style.display = 'block';
    document.getElementById('add-share-form').reset();
    selectedStock = null;
    document.getElementById('share-search-results').classList.add('hidden');
    document.getElementById('share-search-input').disabled = true;
    document.getElementById('share-search-input').placeholder = 'Select a sector first';
    document.getElementById('sector-hint').textContent = '(Select sector first)';
    document.getElementById('share-current-price').value = '';

    // Reset calculation display
    if (document.getElementById('shareTotalInvestment')) {
        document.getElementById('shareTotalInvestment').textContent = '₹0.00';
        document.getElementById('shareCurrentValue').textContent = '₹0.00';
        document.getElementById('shareProfitLoss').textContent = '₹0.00';
        document.getElementById('shareProfitLoss').className = 'h5 fw-light mb-0';
        document.getElementById('shareProfitLossPercent').textContent = '0.00%';
        document.getElementById('shareProfitLossPercent').className = 'h5 fw-light mb-0';
    }
}

function closeAddShareModal() {
    const modal = document.getElementById('add-share-modal');
    modal.classList.add('hidden');
    modal.style.display = 'none';
}

// Step 1: Sector Selection
function onSectorChange() {
    const sectorSelect = document.getElementById('share-sector-select');
    selectedSector = sectorSelect.value;

    const searchInput = document.getElementById('share-search-input');
    const sectorHint = document.getElementById('sector-hint');

    if (selectedSector) {
        // Enable search input
        searchInput.disabled = false;
        searchInput.placeholder = `Search ${selectedSector} stocks...`;
        sectorHint.textContent = `(${selectedSector})`;

        // Update hidden sector input
        document.getElementById('selected-share-sector').value = selectedSector;

        // Clear previous selection
        clearSelectedStock();
    } else {
        // Disable search input
        searchInput.disabled = true;
        searchInput.placeholder = 'Select a sector first';
        sectorHint.textContent = '(Select sector first)';
    }
}

// Step 2: Stock Search (filtered by sector)
let searchTimeout;
async function handleShareSearch(event) {
    const query = event.target.value.trim();

    // If user is typing, clear previous selection
    selectedStock = null;
    document.getElementById('selected-share-symbol').value = '';
    document.getElementById('selected-share-name').value = '';

    if (!query) {
        document.getElementById('share-search-results').classList.add('hidden');
        return;
    }

    if (!selectedSector) {
        return;
    }

    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
        try {
            // Search with sector filter
            const response = await fetch(`${API_BASE_URL}/shares/stock-search?q=${encodeURIComponent(query)}&sector=${encodeURIComponent(selectedSector)}`, {
                headers: getAuthHeaders()
            });

            if (response.ok) {
                const results = await response.json();
                displayShareSearchResults(results);
            }
        } catch (error) {
            console.error('Error searching stocks:', error);
        }
    }, 500);
}

function displayShareSearchResults(results) {
    const container = document.getElementById('share-search-results');

    if (results.length === 0) {
        container.innerHTML = `
            <div class="p-3 text-white-50 small text-center">
                <div>No stocks found in ${selectedSector} sector</div>
                <div class="text-white-30 mt-1">Try a different search term</div>
            </div>`;
        container.classList.remove('hidden');
        return;
    }

    const resultsHtml = results.map(stock => `
        <div class="p-3 cursor-pointer border-bottom border-white border-opacity-10"
            style="cursor: pointer; transition: background 0.2s;"
            onmouseover="this.style.background='rgba(255,255,255,0.05)'"
            onmouseout="this.style.background='transparent'"
            onclick='selectStock(${JSON.stringify(stock).replace(/'/g, "&#39;")})'>
            <div class="d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center gap-2">
                    <div class="d-flex align-items-center justify-content-center rounded-circle"
                        style="width: 28px; height: 28px; background: rgba(255,255,255,0.1);">
                        <span class="text-white-70" style="font-size: 0.65rem;">${stock.symbol.substring(0, 2)}</span>
                    </div>
                    <div>
                        <div class="text-white fw-medium small">${stock.symbol}</div>
                        <div class="text-white-50" style="font-size: 0.7rem;">${stock.name.length > 30 ? stock.name.substring(0, 30) + '...' : stock.name}</div>
                    </div>
                </div>
                <div class="text-white-40 small">${stock.exchange}</div>
            </div>
        </div>
    `).join('');

    container.innerHTML = resultsHtml;
    container.classList.remove('hidden');
}

function selectStock(stock) {
    selectedStock = stock;

    // Update hidden inputs
    document.getElementById('selected-share-symbol').value = stock.symbol;
    document.getElementById('selected-share-name').value = stock.name;

    // Update search input to show selection
    const searchInput = document.getElementById('share-search-input');
    searchInput.value = `${stock.symbol} - ${stock.name}`;

    document.getElementById('share-search-results').classList.add('hidden');

    // Fetch current price automatically
    refreshSharePrice();
}

function clearSelectedStock() {
    selectedStock = null;
    document.getElementById('selected-share-symbol').value = '';
    document.getElementById('selected-share-name').value = '';
    document.getElementById('selected-share-display').classList.add('hidden');
    document.getElementById('share-current-price').value = '';

    // Re-enable search if sector is selected
    if (selectedSector) {
        document.getElementById('share-search-input').disabled = false;
        document.getElementById('share-search-input').value = '';
        document.getElementById('share-search-input').focus();
    }
}

async function refreshSharePrice() {
    if (!selectedStock) return;

    const priceInput = document.getElementById('share-current-price');
    const loadingIndicator = document.getElementById('price-loading');

    // Show loading
    if (loadingIndicator) loadingIndicator.classList.remove('hidden');

    try {
        const response = await fetch(`${API_BASE_URL}/shares/stock-price/${encodeURIComponent(selectedStock.symbol)}`, {
            headers: getAuthHeaders()
        });

        if (response.ok) {
            const data = await response.json();
            priceInput.value = data.price;

            // Auto-populate avg buy price if empty
            const avgPriceInput = document.getElementById('share-avg-price');
            if (!avgPriceInput.value) {
                avgPriceInput.value = data.price;
            }
        }
    } catch (error) {
        console.error('Error fetching price:', error);
        priceInput.value = '';
        priceInput.placeholder = 'Error fetching price';
    } finally {
        // Hide loading
        if (loadingIndicator) loadingIndicator.classList.add('hidden');
        // Trigger calculation update
        updateShareCalculations();
    }
}

// Update Share Calculations (Total Invested, Current Value, P/L)
// Update Share Calculations (Total Invested, Current Value, P/L)
function updateShareCalculations() {
    console.log('updateShareCalculations triggered');
    const quantity = parseFloat(document.getElementById('share-quantity').value) || 0;
    const avgPrice = parseFloat(document.getElementById('share-avg-price').value) || 0;
    const currentPrice = parseFloat(document.getElementById('share-current-price').value) || 0;

    const totalInvested = quantity * avgPrice;
    const currentValue = quantity * currentPrice;
    const profitLoss = currentValue - totalInvested;
    const profitLossPercent = totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;

    // Update UI
    document.getElementById('shareTotalInvestment').textContent = `₹${totalInvested.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    document.getElementById('shareCurrentValue').textContent = `₹${currentValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    // Profit/Loss Styling
    const plElement = document.getElementById('shareProfitLoss');
    plElement.textContent = `${profitLoss >= 0 ? '+' : ''}₹${Math.abs(profitLoss).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    plElement.className = `h5 fw-light mb-0 ${profitLoss >= 0 ? 'text-success' : 'text-danger'}`;

    // Percent Styling
    const plPercentElement = document.getElementById('shareProfitLossPercent');
    plPercentElement.textContent = `${profitLossPercent >= 0 ? '+' : ''}${profitLossPercent.toFixed(2)}%`;
    plPercentElement.className = `h5 fw-light mb-0 ${profitLossPercent >= 0 ? 'text-success' : 'text-danger'}`;
}

// Make globally accessible
window.updateShareCalculations = updateShareCalculations;

async function submitAddShare(event) {
    event.preventDefault();

    // Validate that a stock is selected
    if (!selectedStock) {
        alert('Please search and select a stock first');
        return;
    }

    if (!selectedSector) {
        alert('Please select a sector first');
        return;
    }

    const shareData = {
        symbol: document.getElementById('selected-share-symbol').value,
        company_name: document.getElementById('selected-share-name').value,
        sector: selectedSector,
        quantity: parseFloat(document.getElementById('share-quantity').value),
        avg_buy_price: parseFloat(document.getElementById('share-avg-price').value),
        current_price: parseFloat(document.getElementById('share-current-price').value)
    };

    try {
        const response = await fetch(`${API_BASE_URL}/shares/holdings`, {
            method: 'POST',
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(shareData)
        });

        if (response.ok) {
            closeAddShareModal();
            await fetchSharesData();
        } else {
            const error = await response.json();
            alert('Error adding share: ' + (error.detail || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error adding share:', error);
        alert('Error adding share');
    }
}

// Refresh Share Prices
async function refreshSharePrices() {
    const refreshBtn = document.querySelector('button[onclick="refreshSharePrices()"]');
    const originalContent = refreshBtn ? refreshBtn.innerHTML : '';

    if (refreshBtn) {
        refreshBtn.disabled = true;
        refreshBtn.innerHTML = `
            <div class="spinner-border spinner-border-sm text-white-50" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <span class="small ms-2">Refreshing...</span>
        `;
    }

    try {
        console.log('Refreshing share prices...');
        let updatedCount = 0;

        // 1. Fetch latest prices for all active holdings
        const activeHoldings = SHARES_DATA.holdings.filter(s => s.status === 'active');

        await Promise.all(activeHoldings.map(async (share) => {
            try {
                const response = await fetch(`${API_BASE_URL}/shares/stock-price/${encodeURIComponent(share.symbol)}`, {
                    headers: getAuthHeaders()
                });

                if (response.ok) {
                    const data = await response.json();
                    const newPrice = data.price;

                    // Update share data locally
                    share.current_price = newPrice;
                    share.total_value = share.quantity * newPrice;
                    share.gain_loss = share.total_value - share.total_invested;
                    share.gain_loss_percent = (share.gain_loss / share.total_invested) * 100;

                    updatedCount++;
                }
            } catch (err) {
                console.error(`Error refreshing price for ${share.symbol}:`, err);
            }
        }));

        // 2. Recalculate Portfolio Metrics
        if (updatedCount > 0) {
            // Recalculate based on current holdings data
            const activeShares = SHARES_DATA.holdings.filter(s => s.status === 'active');

            SHARES_DATA.metrics.total_value = activeShares.reduce((sum, s) => sum + s.total_value, 0);
            SHARES_DATA.metrics.total_invested = activeShares.reduce((sum, s) => sum + s.total_invested, 0);
            SHARES_DATA.metrics.total_gain_loss = SHARES_DATA.metrics.total_value - SHARES_DATA.metrics.total_invested;

            SHARES_DATA.metrics.total_gain_loss_percent = SHARES_DATA.metrics.total_invested > 0
                ? (SHARES_DATA.metrics.total_gain_loss / SHARES_DATA.metrics.total_invested) * 100
                : 0;

            console.log('Metrics updated:', SHARES_DATA.metrics);
        }

        // 3. Update UI
        renderSharesOverview();
        renderSharesHoldings();

    } catch (error) {
        console.error('Error refreshing shares:', error);
    } finally {
        if (refreshBtn) {
            refreshBtn.disabled = false;
            refreshBtn.innerHTML = originalContent;
            // Update timestamp text
            const timeSpan = refreshBtn.nextElementSibling;
            if (timeSpan) timeSpan.textContent = 'Just now';
        }
    }
}

// Expose to window
window.refreshSharePrices = refreshSharePrices;

// ========== Sell Share Modal Functions ==========

let currentSellShare = null;

function openSellShareModal(id, symbol, quantity, totalInvested) {
    currentSellShare = { id, symbol, quantity, totalInvested };

    document.getElementById('sell-share-id').value = id;
    document.getElementById('sell-share-name').textContent = symbol;
    document.getElementById('sell-quantity').textContent = quantity;

    // Set today's date
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('sell-share-date').value = today;

    const modal = document.getElementById('sell-share-modal');
    modal.classList.remove('hidden');
    modal.style.display = 'block';

    // Add event listener for price changes
    document.getElementById('sell-share-price').addEventListener('input', updateSellPreview);
}

function closeSellShareModal() {
    const modal = document.getElementById('sell-share-modal');
    modal.classList.add('hidden');
    modal.style.display = 'none';
    currentSellShare = null;
}

function updateSellPreview() {
    if (!currentSellShare) return;

    const salePrice = parseFloat(document.getElementById('sell-share-price').value) || 0;
    const totalValue = currentSellShare.quantity * salePrice;
    const profitLoss = totalValue - currentSellShare.totalInvested;

    document.getElementById('sell-total-value').textContent = `₹${totalValue.toLocaleString('en-IN')}`;
    document.getElementById('sell-profit-loss').textContent = `${profitLoss >= 0 ? '+' : ''}₹${Math.abs(profitLoss).toLocaleString('en-IN')}`;
    document.getElementById('sell-profit-loss').className = `fw-medium ${profitLoss >= 0 ? 'text-success' : 'text-danger'}`;
}

async function submitSellShare(event) {
    event.preventDefault();

    const id = document.getElementById('sell-share-id').value;
    const sellData = {
        sale_price: parseFloat(document.getElementById('sell-share-price').value),
        sale_date: document.getElementById('sell-share-date').value
    };

    try {
        const response = await fetch(`${API_BASE_URL}/shares/holdings/${id}/sell`, {
            method: 'POST',
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(sellData)
        });

        if (response.ok) {
            closeSellShareModal();
            await fetchSharesData();
        } else {
            alert('Error selling share');
        }
    } catch (error) {
        console.error('Error selling share:', error);
        alert('Error selling share');
    }
}

// ========== Remove Share Modal Functions ==========

function openRemoveShareModal(id, symbol) {
    document.getElementById('remove-share-id').value = id;
    document.getElementById('remove-share-name').textContent = symbol;
    const modal = document.getElementById('remove-share-modal');
    modal.classList.remove('hidden');
    modal.style.display = 'block';
}

function closeRemoveShareModal() {
    const modal = document.getElementById('remove-share-modal');
    modal.classList.add('hidden');
    modal.style.display = 'none';
}

async function confirmRemoveShare() {
    const id = document.getElementById('remove-share-id').value;

    try {
        const response = await fetch(`${API_BASE_URL}/shares/holdings/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (response.ok) {
            closeRemoveShareModal();
            await fetchSharesData();
        } else {
            alert('Error removing share');
        }
    } catch (error) {
        console.error('Error removing share:', error);
        alert('Error removing share');
    }
}
