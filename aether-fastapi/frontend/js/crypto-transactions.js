/**
 * Crypto Transaction History Module
 * Tracks and displays buy/sell cryptocurrency transactions
 */

// Get transactions from localStorage
function getCryptoTransactions() {
    const stored = localStorage.getItem('aether_crypto_transactions');
    if (!stored) return [];

    let transactions = JSON.parse(stored);

    // Auto-cleanup: Fix empty network fields to prevent white badges
    let needsCleanup = false;
    transactions = transactions.map(txn => {
        // If network is null, undefined, or empty string, ensure it's properly empty
        if (!txn.network || (typeof txn.network === 'string' && txn.network.trim() === '')) {
            needsCleanup = true;
            return { ...txn, network: '' };
        }
        return txn;
    });

    if (needsCleanup) {
        console.log('✨ Auto-cleaned empty network badges');
        saveCryptoTransactions(transactions);
    }

    return transactions;
}

// Save transactions to localStorage
function saveCryptoTransactions(transactions) {
    localStorage.setItem('aether_crypto_transactions', JSON.stringify(transactions));
}

// Log a new transaction
function logCryptoTransaction(type, cryptoName, symbol, quantity, pricePerUnit, network = '', purchasePrice = 0) {
    const transactions = getCryptoTransactions();

    // Calculate profit/loss for sell transactions
    let profitLoss = 0;
    let profitLossPercent = 0;
    if (type === 'sell' && purchasePrice > 0) {
        profitLoss = (pricePerUnit - purchasePrice) * quantity;
        profitLossPercent = ((pricePerUnit - purchasePrice) / purchasePrice) * 100;
    }

    const newTransaction = {
        id: 'txn-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
        type: type, // 'buy' or 'sell'
        crypto_name: cryptoName,
        symbol: symbol,
        quantity: quantity,
        price_per_unit: pricePerUnit,
        purchase_price: purchasePrice, // For sells, this is avg buy price
        total_value: quantity * pricePerUnit,
        profit_loss: profitLoss,
        profit_loss_percent: profitLossPercent,
        network: network || '', // Ensure it's never undefined
        timestamp: new Date().toISOString(),
        date_display: new Date().toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }),
        time_display: new Date().toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit'
        })
    };

    transactions.unshift(newTransaction); // Add to beginning (most recent first)

    // Keep only last 100 transactions
    if (transactions.length > 100) {
        transactions.length = 100;
    }

    saveCryptoTransactions(transactions);
    renderCryptoTransactions();

    console.log(`✅ Logged ${type} transaction:`, newTransaction);
}

// Render transaction timeline
function renderCryptoTransactions() {
    const container = document.getElementById('crypto-transactions-list');
    if (!container) return;

    const transactions = getCryptoTransactions();

    console.log('📊 Rendering', transactions.length, 'transactions:', transactions);

    if (transactions.length === 0) {
        container.innerHTML = `
            <div class="glass-card glass-empty-state">
                <div class="glass-empty-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-white-50">
                        <line x1="12" y1="1" x2="12" y2="23"></line>
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                    </svg>
                </div>
                <h3 class="h4 fw-light text-white-90 mb-2">No transaction history yet</h3>
                <p class="text-white-50 fw-light">Your buy and sell activities will appear here</p>
            </div>
        `;
        return;
    }

    // Group transactions by date
    const groupedByDate = transactions.reduce((groups, txn) => {
        const date = txn.date_display;
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(txn);
        return groups;
    }, {});

    let html = '';

    Object.keys(groupedByDate).forEach(date => {
        const txns = groupedByDate[date];

        html += `
        <div class="mb-4">
            <div class="text-white-50 small fw-medium mb-3 px-3" style="letter-spacing: 0.5px;">
                ${date}
            </div>
            <div class="glass-card overflow-hidden p-0">
                <!-- Table Header -->
                <div class="row g-0 p-3 border-bottom border-white border-opacity-10 text-white-50 small text-uppercase fw-medium" style="background: rgba(255,255,255,0.02);">
                    <div class="col-1 text-center">Type</div>
                    <div class="col-2">Cryptocurrency</div>
                    <div class="col-2">Network</div>
                    <div class="col-2">Amount</div>
                    <div class="col-2">Price</div>
                    <div class="col-2">Profit/Loss</div>
                    <div class="col-1 text-end">Time</div>
                </div>
        `;

        txns.forEach((txn, index) => {
            const isLast = index === txns.length - 1;
            const borderClass = isLast ? '' : 'border-bottom border-white border-opacity-5';

            // Icon and color based on type
            let icon, iconBg, textColor, sign;
            if (txn.type === 'buy') {
                icon = '↓';
                iconBg = 'rgba(74, 222, 128, 0.15)'; // Green
                textColor = 'text-success';
                sign = '+';
            } else {
                icon = '↑';
                iconBg = 'rgba(239, 68, 68, 0.15)'; // Red
                textColor = 'text-danger';
                sign = '-';
            }

            // Profit/Loss cell content
            let profitLossCell = '-';
            if (txn.type === 'sell' && txn.profit_loss !== undefined && txn.profit_loss !== 0) {
                const isProfitable = txn.profit_loss > 0;
                const plColor = isProfitable ? 'text-success' : 'text-danger';
                const plSign = isProfitable ? '+' : '';
                profitLossCell = `
                    <div class="${plColor} fw-medium">
                        ${plSign}₹${formatNumber(Math.abs(txn.profit_loss))}
                    </div>
                    <div class="${plColor} small" style="opacity: 0.8;">
                        ${plSign}${txn.profit_loss_percent.toFixed(2)}%
                    </div>
                `;
            } else if (txn.type === 'buy') {
                profitLossCell = '<span class="text-white-30">-</span>';
            }

            html += `
                <div class="row g-0 p-3 ${borderClass} align-items-center hover-bg-light" style="transition: background 0.15s ease;">
                    <!-- Type (Icon) -->
                    <div class="col-1 text-center">
                        <div class="d-inline-flex align-items-center justify-content-center rounded-circle" 
                             style="width: 32px; height: 32px; background: ${iconBg};">
                            <span style="font-size: 1rem; font-weight: 600;" class="${textColor}">${icon}</span>
                        </div>
                    </div>
                    
                    <!-- Cryptocurrency -->
                    <div class="col-2">
                        <div class="text-white fw-medium small">${txn.crypto_name}</div>
                        <div class="text-white-50" style="font-size: 0.75rem;">${txn.symbol.toUpperCase()}</div>
                    </div>
                    
                    <!-- Network -->
                    <div class="col-2">
                        ${(txn.network && typeof txn.network === 'string' && txn.network.trim().length > 0)
                    ? `<span class="badge bg-white bg-opacity-10 text-white-70 small">${txn.network}</span>`
                    : '<span class="text-white-30 small">-</span>'}
                    </div>
                    
                    <!-- Amount -->
                    <div class="col-2">
                        <div class="text-white small">${sign}${txn.quantity} ${txn.symbol.toUpperCase()}</div>
                    </div>
                    
                    <!-- Price -->
                    <div class="col-2">
                        <div class="${textColor} fw-medium small">₹${formatNumber(txn.price_per_unit)}</div>
                        ${txn.type === 'sell' && txn.purchase_price > 0 ?
                    `<div class="text-white-30" style="font-size: 0.75rem;">Buy: ₹${formatNumber(txn.purchase_price)}</div>` :
                    ''}
                    </div>
                    
                    <!-- Profit/Loss -->
                    <div class="col-2">
                        ${profitLossCell}
                    </div>
                    
                    <!-- Time -->
                    <div class="col-1 text-end">
                        <div class="text-white-50 small">${txn.time_display}</div>
                    </div>
                </div>
            `;
        });

        html += `
            </div>
        </div>
        `;
    });

    container.innerHTML = html;
}

// Helper function to format numbers
function formatNumber(num) {
    if (num >= 10000000) { // 1 Crore
        return (num / 10000000).toFixed(2) + 'Cr';
    } else if (num >= 100000) { // 1 Lakh
        return (num / 100000).toFixed(2) + 'L';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(2) + 'K';
    }
    return num.toFixed(2);
}
