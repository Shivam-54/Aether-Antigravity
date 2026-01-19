
// ==================== SHARES MODULE ====================

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
                <button onclick="openAddShareModal()" class="btn glass-button text-white px-3 py-2 rounded-pill d-flex align-items-center gap-2">
                    <span class="fs-6 fw-light">+</span>
                    <span>Add Share</span>
                </button>
            </div>

            <!-- Metrics Grid -->
            <div class="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-3">
                <!-- Total Value -->
                <div class="col">
                    <div class="position-relative p-4 rounded-4 overflow-hidden group transition-all glass-card h-100 d-flex flex-column justify-content-center">
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
                    <div class="position-relative p-4 rounded-4 overflow-hidden group transition-all glass-card h-100 d-flex flex-column justify-content-center">
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
                    <div class="position-relative p-4 rounded-4 overflow-hidden group transition-all glass-card h-100 d-flex flex-column justify-content-center">
                        <div class="position-relative z-1 d-flex flex-column gap-2">
                            <div class="text-white-50 mb-1">${ICONS.trending}</div>
                            <div>
                                <p class="small text-uppercase text-white-50 mb-1" style="letter-spacing: 0.1em; font-size: 0.65rem;">Total Gain/Loss</p>
                                <h3 class="h4 fw-light ${metrics.total_gain_loss >= 0 ? 'text-success' : 'text-danger'} mb-1">
                                    ${metrics.total_gain_loss >= 0 ? '+' : ''}${formatCurrency(metrics.total_gain_loss)}
                                </h3>
                                <p class="small fw-light ${metrics.total_gain_loss_percent >= 0 ? 'text-success' : 'text-danger'}" style="font-size: 0.75rem;">
                                    ${metrics.total_gain_loss_percent >= 0 ? '+' : ''}${metrics.total_gain_loss_percent.toFixed(2)}%
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Active Shares -->
                <div class="col">
                    <div class="position-relative p-4 rounded-4 overflow-hidden group transition-all glass-card h-100 d-flex flex-column justify-content-center">
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

            <!-- Portfolio Chart Placeholder -->
            <div class="glass-card rounded-4 overflow-hidden position-relative" style="height: 300px; padding: 2rem;">
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
        </div>
    `;

    container.innerHTML = overviewHtml;
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

    // Build the full holdings section with card, header, and table
    let holdingsHtml = `
        <div class="glass-premium p-4">
            <!-- Card Header -->
            <div class="d-flex justify-content-between align-items-start mb-4">
                <div>
                    <h3 class="h5 fw-medium text-white mb-1">Portfolio Holdings</h3>
                    <p class="small text-white-50 mb-0">Detailed breakdown of your stock holdings</p>
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
                    
                    <!-- Refresh Button Container -->
                    <div class="d-flex flex-column align-items-center gap-1">
                        <button onclick="refreshSharePrices()" class="btn px-3 py-2 d-flex align-items-center gap-2" 
                            style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: rgba(255,255,255,0.7);">
                            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                            </svg>
                            <span class="small">Refresh</span>
                        </button>
                        <span class="text-white-30" style="font-size: 10px;">Just now</span>
                    </div>

                    <!-- Add Share Button -->
                    <button onclick="openAddShareModal()" class="btn-glass-add" 
                        style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 12px; color: white; padding: 10px 16px; display: flex; align-items: center; gap: 8px; box-shadow: 0 0 15px rgba(255,255,255,0.05);">
                        <span>+</span>
                        <span class="small">Add Share</span>
                    </button>
                </div>
            </div>
    `;

    if (filteredShares.length === 0) {
        holdingsHtml += `
            <div class="py-5 text-center">
                <div class="mb-3 text-white-50">No ${currentSharesFilter} shares found.</div>
                <p class="small text-white-30">
                    ${currentSharesFilter === 'active' ? 'Add your first share to start tracking your equity portfolio.' : 'Sold shares will appear here once you sell shares from your active holdings.'}
                </p>
            </div>
        </div>`;
        container.innerHTML = holdingsHtml;
        return;
    }

    // Table Header
    holdingsHtml += `
        <div class="table-responsive">
            <table class="table table-borderless align-middle mb-0" style="min-width: 800px; background: transparent;">
                <thead style="background: transparent;">
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.1); background: transparent;">
                        <th class="text-white-40 small fw-normal py-3" style="font-size: 0.7rem; letter-spacing: 0.05em; background: transparent;">COMPANY</th>
                        <th class="text-white-40 small fw-normal py-3" style="font-size: 0.7rem; letter-spacing: 0.05em; background: transparent;">SECTOR</th>
                        <th class="text-white-40 small fw-normal py-3" style="font-size: 0.7rem; letter-spacing: 0.05em; background: transparent;">QUANTITY</th>
                        <th class="text-white-40 small fw-normal py-3" style="font-size: 0.7rem; letter-spacing: 0.05em; background: transparent;">AVG BUY PRICE</th>
                        <th class="text-white-40 small fw-normal py-3" style="font-size: 0.7rem; letter-spacing: 0.05em; background: transparent;">${currentSharesFilter === 'sold' ? 'SALE PRICE' : 'CURRENT PRICE'}</th>
                        <th class="text-white-40 small fw-normal py-3" style="font-size: 0.7rem; letter-spacing: 0.05em; background: transparent;">TOTAL VALUE</th>
                        <th class="text-white-40 small fw-normal py-3" style="font-size: 0.7rem; letter-spacing: 0.05em; background: transparent;">GAIN/LOSS</th>
                        <th class="text-white-40 small fw-normal py-3 text-end" style="font-size: 0.7rem; letter-spacing: 0.05em; background: transparent;">ACTIONS</th>
                    </tr>
                </thead>
                <tbody style="background: transparent;">
    `;

    // Table Rows
    filteredShares.forEach(share => {
        const gainLoss = currentSharesFilter === 'sold' && share.profit_loss !== null
            ? share.profit_loss
            : share.gain_loss;
        const gainLossPercent = currentSharesFilter === 'sold' && share.profit_loss !== null
            ? (share.sale_total_value && share.total_invested ? ((share.profit_loss / share.total_invested) * 100) : 0)
            : share.gain_loss_percent;
        const currentPrice = currentSharesFilter === 'sold' && share.sale_price ? share.sale_price : share.current_price;
        const totalValue = currentSharesFilter === 'sold' && share.sale_total_value ? share.sale_total_value : share.total_value;

        holdingsHtml += `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); background: transparent;">
                <!-- Company -->
                <td class="py-3" style="background: transparent;">
                    <div class="d-flex align-items-center gap-3">
                        <div class="d-flex align-items-center justify-content-center rounded-circle" 
                            style="width: 36px; height: 36px; background: rgba(255,255,255,0.1);">
                            <span class="fw-bold text-white-70 small">${share.symbol.substring(0, 2).toUpperCase()}</span>
                        </div>
                        <div>
                            <div class="text-white fw-medium">${share.company_name.length > 25 ? share.company_name.substring(0, 25) + '...' : share.company_name}</div>
                            <div class="text-white-40 small">${share.symbol}</div>
                        </div>
                    </div>
                </td>
                <!-- Sector -->
                <td class="py-3 text-white-70" style="background: transparent;">${share.sector}</td>
                <!-- Quantity -->
                <td class="py-3 text-white-80" style="background: transparent;">${share.quantity.toLocaleString('en-IN')}</td>
                <!-- Avg Buy Price -->
                <td class="py-3 text-white-70" style="background: transparent;">₹${share.avg_buy_price.toLocaleString('en-IN')}</td>
                <!-- Current/Sale Price -->
                <td class="py-3 text-white-80" style="background: transparent;">₹${currentPrice.toLocaleString('en-IN')}</td>
                <!-- Total Value -->
                <td class="py-3 text-white-90 fw-medium" style="background: transparent;">₹${totalValue.toLocaleString('en-IN')}</td>
                <!-- Gain/Loss -->
                <td class="py-3" style="background: transparent;">
                    <div class="${gainLoss >= 0 ? 'text-success' : 'text-danger'}">
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
                </td>
                <!-- Actions -->
                <td class="py-3 text-end" style="background: transparent;">
                    ${currentSharesFilter === 'active' ? `
                        <div class="d-flex gap-2 justify-content-end">
                            <button onclick="openSellShareModal(${share.id}, '${share.symbol}', ${share.quantity}, ${share.total_invested})"
                                class="btn-icon-glass" title="Sell">
                                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                                </svg>
                            </button>                                    
                            <button onclick="openRemoveShareModal(${share.id}, '${share.symbol}')"
                                class="btn-icon-glass text-danger" title="Remove">
                                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"></path>
                                </svg>
                            </button>
                        </div>
                    ` : ''}
                </td>
            </tr>
        `;
    });

    holdingsHtml += `
                </tbody>
            </table>
        </div>
    </div>`;

    container.innerHTML = holdingsHtml;
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
    }
}

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
