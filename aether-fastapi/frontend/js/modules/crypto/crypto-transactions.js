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
function logCryptoTransaction(type, cryptoName, symbol, quantity, pricePerUnit, network = '', purchasePrice = 0, purchaseDate = null) {
    const transactions = getCryptoTransactions();

    // Calculate profit/loss for sell transactions
    let profitLoss = 0;
    let profitLossPercent = 0;
    if (type === 'sell' && purchasePrice > 0) {
        profitLoss = (pricePerUnit - purchasePrice) * quantity;
        profitLossPercent = ((pricePerUnit - purchasePrice) / purchasePrice) * 100;
    }

    // Use provided purchaseDate or default to current date
    const transactionDate = purchaseDate ? new Date(purchaseDate) : new Date();

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
        timestamp: transactionDate.toISOString(),
        date_display: transactionDate.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }),
        time_display: transactionDate.toLocaleTimeString('en-IN', {
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
            <div class="glass-panel overflow-hidden p-0">
                <div class="d-flex w-100 p-3 border-bottom border-white border-opacity-10 text-white-50 small text-uppercase fw-medium" style="background: rgba(255,255,255,0.02);">
                    <div class="text-center" style="width: 8%">Type</div>
                    <div style="width: 25%">Cryptocurrency</div>
                    <div style="width: 10%">Network</div>
                    <div style="width: 15%">Amount</div>
                    <div style="width: 15%">Price</div>
                    <div style="width: 15%">Profit/Loss</div>
                    <div class="text-end" style="width: 12%">Date/Time</div>
                </div>
                <div class="p-5 text-center">
                    <div class="mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-white-50" style="opacity: 0.4;">
                            <line x1="12" y1="1" x2="12" y2="23"></line>
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                        </svg>
                    </div>
                    <h4 class="h5 fw-light text-white-70 mb-2">No transaction history yet</h4>
                    <p class="small text-white-50 mb-0" style="opacity: 0.7;">Your buy and sell activities will appear here</p>
                </div>
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
            <div class="glass-panel overflow-hidden p-0">
                <!-- Table Header -->
                <div class="d-flex w-100 p-3 border-bottom border-white border-opacity-10 text-white-50 small text-uppercase fw-medium" style="background: rgba(255,255,255,0.02);">
                    <div class="text-center" style="width: 8%">Type</div>
                    <div style="width: 25%">Cryptocurrency</div>
                    <div style="width: 10%">Network</div>
                    <div style="width: 15%">Amount</div>
                    <div style="width: 15%">Price</div>
                    <div style="width: 15%">Profit/Loss</div>
                    <div class="text-end" style="width: 12%">Date/Time</div>
                </div>
        `;

        txns.forEach((txn, index) => {
            const isLast = index === txns.length - 1;
            const borderStyle = isLast ? '' : 'border-bottom: 1px solid rgba(255,255,255,0.05);';

            // Icon and color based on type
            let icon, iconBg, iconColor, sign;
            if (txn.type === 'buy') {
                icon = '↓';
                iconBg = 'rgba(16, 185, 129, 0.15)'; // Green #10b981
                iconColor = '#10b981';
                sign = '+';
            } else {
                icon = '↑';
                iconBg = 'rgba(239, 68, 68, 0.15)'; // Red #ef4444
                iconColor = '#ef4444';
                sign = '-';
            }

            // Profit/Loss cell content
            let profitLossCell = '-';
            if (txn.type === 'sell' && txn.profit_loss !== undefined && txn.profit_loss !== 0) {
                const isProfitable = txn.profit_loss > 0;
                const plColor = isProfitable ? '#10b981' : '#ef4444';
                const plSign = isProfitable ? '+' : '';
                profitLossCell = `
                    <div style="color: ${plColor}" class="fw-medium">
                        ${plSign}₹${formatNumber(Math.abs(txn.profit_loss))}
                    </div>
                    <div style="color: ${plColor}; opacity: 0.8;" class="small">
                        ${plSign}${txn.profit_loss_percent.toFixed(2)}%
                    </div>
                `;
            } else if (txn.type === 'buy') {
                profitLossCell = '<span class="text-white-30">-</span>';
            }

            html += `
                <div class="d-flex w-100 p-3 align-items-center hover-bg-light holding-row" 
                     style="cursor: pointer; ${borderStyle} transition: background 0.15s ease;"
                     onclick="openEditCryptoTransactionModal('${txn.id}')">
                    <!-- Type (Icon) -->
                    <div class="text-center" style="width: 8%">
                        <div class="d-inline-flex align-items-center justify-content-center rounded-circle" 
                             style="width: 32px; height: 32px; background: ${iconBg};">
                            <span style="font-size: 1rem; font-weight: 600; color: ${iconColor}">${icon}</span>
                        </div>
                    </div>
                    
                    <!-- Cryptocurrency -->
                    <div style="width: 25%">
                        <div class="text-white fw-medium small">${txn.crypto_name}</div>
                        <div class="text-white-50" style="font-size: 0.75rem;">${txn.symbol.toUpperCase()}</div>
                    </div>
                    
                    <!-- Network -->
                    <div style="width: 10%">
                        ${(txn.network && typeof txn.network === 'string' && txn.network.trim().length > 0)
                    ? `<span class="badge bg-white bg-opacity-10 text-white-70 small fw-normal">${txn.network}</span>`
                    : '<span class="text-white-30 small">-</span>'}
                    </div>
                    
                    <!-- Amount -->
                    <div style="width: 15%">
                        <div class="text-white-90 small">${sign}${txn.quantity} ${txn.symbol.toUpperCase()}</div>
                    </div>
                    
                    <!-- Price -->
                    <div style="width: 15%">
                        <div style="color: ${iconColor}" class="fw-medium small">₹${formatNumber(txn.price_per_unit)}</div>
                        ${txn.type === 'sell' && txn.purchase_price > 0 ?
                    `<div class="text-white-30" style="font-size: 0.75rem;">Buy: ₹${formatNumber(txn.purchase_price)}</div>` :
                    ''}
                    </div>
                    
                    <!-- Profit/Loss -->
                    <div style="width: 15%">
                        ${profitLossCell}
                    </div>
                    
                    <!-- Date/Time -->
                    <div class="text-end" style="width: 12%">
                        <div class="text-white-90 small" style="font-size: 0.75rem;">${txn.date_display}</div>
                        <div class="text-white-50 small" style="font-size: 0.7rem;">${txn.time_display.toLowerCase()}</div>
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

// Open modal to edit or delete a crypto transaction
function openEditCryptoTransactionModal(transactionId) {
    const transactions = getCryptoTransactions();
    const txn = transactions.find(t => t.id === transactionId);

    if (!txn) {
        console.error('Crypto transaction not found:', transactionId);
        return;
    }

    // Store current transaction ID
    window.currentEditCryptoTransactionId = transactionId;

    // Convert ISO timestamp to date input format (YYYY-MM-DD)
    const txnDate = new Date(txn.timestamp);
    const dateStr = txnDate.toISOString().split('T')[0];

    // Create modal HTML
    const modalHtml = `
        <div id="edit-crypto-transaction-modal" class="modal-overlay" style="display: flex; position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 9999; align-items: center; justify-content: center;">
            <div class="glass-panel p-4" style="max-width: 500px; width: 90%;">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h5 class="text-white fw-light mb-0">Edit Crypto Transaction</h5>
                    <button onclick="closeEditCryptoTransactionModal()" class="btn-close btn-close-white" aria-label="Close"></button>
                </div>
                
                <div class="mb-3">
                    <div class="text-white-70 mb-2">
                        <strong>${txn.crypto_name}</strong> (${txn.symbol})
                    </div>
                    <div class="text-white-50 small">
                        ${txn.type === 'buy' ? 'Buy' : 'Sell'} ${txn.quantity} ${txn.symbol.toUpperCase()} @ ₹${txn.price_per_unit.toFixed(2)}
                    </div>
                </div>
                
                <div class="mb-4">
                    <label class="form-label text-white-70 small">Transaction Date</label>
                    <input type="date" id="edit-crypto-transaction-date" class="form-control glass-input" value="${dateStr}">
                </div>
                
                <div class="d-flex gap-2">
                    <button onclick="saveCryptoTransactionDate()" class="btn glass-button flex-grow-1">
                        Save Date
                    </button>
                    <button onclick="deleteCryptoTransaction()" class="btn glass-button-danger">
                        Delete
                    </button>
                    <button onclick="closeEditCryptoTransactionModal()" class="btn glass-button-outline">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    `;

    // Remove existing modal if any
    const existingModal = document.getElementById('edit-crypto-transaction-modal');
    if (existingModal) existingModal.remove();

    // Add to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

// Close edit crypto transaction modal
function closeEditCryptoTransactionModal() {
    const modal = document.getElementById('edit-crypto-transaction-modal');
    if (modal) modal.remove();
    window.currentEditCryptoTransactionId = null;
}

// Save updated crypto transaction date
function saveCryptoTransactionDate() {
    const transactionId = window.currentEditCryptoTransactionId;
    if (!transactionId) return;

    const newDate = document.getElementById('edit-crypto-transaction-date').value;
    if (!newDate) {
        alert('Please select a date');
        return;
    }

    const transactions = getCryptoTransactions();
    const txnIndex = transactions.findIndex(t => t.id === transactionId);

    if (txnIndex === -1) {
        alert('Transaction not found');
        return;
    }

    // Update transaction with new date
    const updatedDate = new Date(newDate);
    transactions[txnIndex].timestamp = updatedDate.toISOString();
    transactions[txnIndex].date_display = updatedDate.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
    transactions[txnIndex].time_display = updatedDate.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit'
    });

    saveCryptoTransactions(transactions);
    renderCryptoTransactions();
    closeEditCryptoTransactionModal();

    console.log('✅ Crypto transaction date updated');
}

// Delete a crypto transaction
function deleteCryptoTransaction() {
    const transactionId = window.currentEditCryptoTransactionId;
    if (!transactionId) return;

    if (!confirm('Are you sure you want to delete this crypto transaction?')) {
        return;
    }

    const transactions = getCryptoTransactions();
    const filtered = transactions.filter(t => t.id !== transactionId);

    saveCryptoTransactions(filtered);
    renderCryptoTransactions();
    closeEditCryptoTransactionModal();

    console.log('🗑️ Crypto transaction deleted');
}

// Make globally accessible
window.renderCryptoTransactions = renderCryptoTransactions;
window.logCryptoTransaction = logCryptoTransaction;
window.openEditCryptoTransactionModal = openEditCryptoTransactionModal;
window.closeEditCryptoTransactionModal = closeEditCryptoTransactionModal;
window.saveCryptoTransactionDate = saveCryptoTransactionDate;
window.deleteCryptoTransaction = deleteCryptoTransaction;
