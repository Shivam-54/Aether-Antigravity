/**
 * Share Transaction History Module
 * Tracks and displays buy/sell share transactions
 */

// Get transactions from localStorage
function getShareTransactions() {
    const stored = localStorage.getItem('aether_share_transactions');
    if (!stored) return [];

    let transactions = JSON.parse(stored);

    // Auto-cleanup: Fix empty sector fields
    let needsCleanup = false;
    transactions = transactions.map(txn => {
        if (!txn.sector || (typeof txn.sector === 'string' && txn.sector.trim() === '')) {
            needsCleanup = true;
            return { ...txn, sector: '' };
        }
        return txn;
    });

    if (needsCleanup) {
        console.log('✨ Auto-cleaned empty sector fields');
        saveShareTransactions(transactions);
    }

    return transactions;
}

// Save transactions to localStorage
function saveShareTransactions(transactions) {
    localStorage.setItem('aether_share_transactions', JSON.stringify(transactions));
}

// Log a new transaction
function logShareTransaction(type, companyName, symbol, quantity, pricePerUnit, sector = '', purchasePrice = 0, acquisitionDate = null) {
    const transactions = getShareTransactions();

    // Calculate profit/loss for sell transactions
    let profitLoss = 0;
    let profitLossPercent = 0;
    if (type === 'sell' && purchasePrice > 0) {
        profitLoss = (pricePerUnit - purchasePrice) * quantity;
        profitLossPercent = ((pricePerUnit - purchasePrice) / purchasePrice) * 100;
    }

    // Use provided acquisition date or default to current date
    const transactionDate = acquisitionDate ? new Date(acquisitionDate) : new Date();

    const newTransaction = {
        id: 'txn-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
        type: type, // 'buy' or 'sell'
        company_name: companyName,
        symbol: symbol,
        quantity: quantity,
        price_per_unit: pricePerUnit,
        purchase_price: purchasePrice, // For sells, this is avg buy price
        total_value: quantity * pricePerUnit,
        profit_loss: profitLoss,
        profit_loss_percent: profitLossPercent,
        sector: sector || '',
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

    saveShareTransactions(transactions);
    renderShareTransactions();

    console.log(`✅ Logged ${type} transaction:`, newTransaction);
}

// Render transaction timeline
function renderShareTransactions() {
    const container = document.getElementById('share-transactions-list');
    if (!container) return;

    const transactions = getShareTransactions();

    console.log('📊 Rendering', transactions.length, 'share transactions:', transactions);

    if (transactions.length === 0) {
        container.innerHTML = `
            <div class="glass-panel overflow-hidden p-0">
                <!-- Table Header -->
                <div class="d-flex w-100 p-3 border-bottom border-white border-opacity-10 text-white-50 small text-uppercase fw-medium" style="background: rgba(255,255,255,0.02);">
                    <div class="text-center" style="width: 8%">Type</div>
                    <div style="width: 20%">Company</div>
                    <div style="width: 15%">Sector</div>
                    <div style="width: 10%">Quantity</div>
                    <div style="width: 12%">Buy Price</div>
                    <div style="width: 12%">Sell Price</div>
                    <div style="width: 15%">Profit/Loss</div>
                    <div class="text-end" style="width: 8%">Date/Time</div>
                </div>
                
                <!-- Empty State Message -->
                <div class="p-5 text-center">
                    <div class="mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-white-50" style="opacity: 0.4;">
                            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                        </svg>
                    </div>
                    <h4 class="h5 fw-light text-white-70 mb-2">No transaction history yet</h4>
                    <p class="small text-white-50 mb-0" style="opacity: 0.7;">Transactions will appear here when you buy or sell shares</p>
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
                    <div style="width: 20%">Company</div>
                    <div style="width: 15%">Sector</div>
                    <div style="width: 10%">Quantity</div>
                    <div style="width: 12%">Buy Price</div>
                    <div style="width: 12%">Sell Price</div>
                    <div style="width: 15%">Profit/Loss</div>
                    <div class="text-end" style="width: 8%">Date/Time</div>
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
                        ${plSign}₹${txn.profit_loss.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div style="color: ${plColor}; opacity: 0.8;" class="small">
                        ${plSign}${txn.profit_loss_percent.toFixed(2)}%
                    </div>
                `;
            } else if (txn.type === 'buy') {
                profitLossCell = '<span class="text-white-30">-</span>';
            }

            // Buy/Sell Price Logic
            let buyPriceDisplay = '-';
            let sellPriceDisplay = '-';

            if (txn.type === 'buy') {
                buyPriceDisplay = `<div class="text-white fw-medium small">₹${txn.price_per_unit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>`;
                sellPriceDisplay = '<span class="text-white-30">-</span>';
            } else {
                // Sell transaction
                if (txn.purchase_price > 0) {
                    buyPriceDisplay = `<div class="text-white-50 small">₹${txn.purchase_price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>`;
                } else {
                    buyPriceDisplay = '<span class="text-white-30">-</span>';
                }
                sellPriceDisplay = `<div class="text-white fw-medium small">₹${txn.price_per_unit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>`;
            }

            html += `
                <div class="d-flex w-100 p-3 align-items-center hover-bg-light holding-row" 
                     style="cursor: pointer; ${borderStyle} transition: background 0.15s ease;"
                     onclick="openEditTransactionModal('${txn.id}')">
                    <!-- Type (Icon) -->
                    <div class="text-center" style="width: 8%">
                        <div class="d-inline-flex align-items-center justify-content-center rounded-circle" 
                             style="width: 32px; height: 32px; background: ${iconBg};">
                            <span style="font-size: 1rem; font-weight: 600; color: ${iconColor}">${icon}</span>
                        </div>
                    </div>
                    
                    <!-- Company -->
                    <div style="width: 20%">
                        <div class="text-white fw-medium small">${txn.company_name.length > 25 ? txn.company_name.substring(0, 25) + '...' : txn.company_name}</div>
                        <div class="text-white-50" style="font-size: 0.75rem;">${txn.symbol.toUpperCase()}</div>
                    </div>
                    
                    <!-- Sector -->
                    <div style="width: 15%">
                        ${(txn.sector && typeof txn.sector === 'string' && txn.sector.trim().length > 0)
                    ? `<span class="badge bg-white bg-opacity-10 text-white-70 small fw-normal">${txn.sector}</span>`
                    : '<span class="text-white-30 small">-</span>'}
                    </div>
                    
                    <!-- Quantity -->
                    <div style="width: 10%">
                        <div class="text-white-90 small">${txn.quantity.toLocaleString('en-IN')}</div>
                    </div>
                    
                    <!-- Buy Price -->
                    <div style="width: 12%">
                        ${buyPriceDisplay}
                    </div>

                    <!-- Sell Price -->
                    <div style="width: 12%">
                        ${sellPriceDisplay}
                    </div>
                    
                    <!-- Profit/Loss -->
                    <div style="width: 15%">
                        ${profitLossCell}
                    </div>
                    
                    <!-- Date/Time -->
                    <div class="text-end" style="width: 8%">
                        <div class="text-white-50" style="font-size: 0.7rem;">${txn.date_display}</div>
                        <div class="text-white-50" style="font-size: 0.7rem;">${txn.time_display.toLowerCase()}</div>
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
function formatShareNumber(num) {
    if (num >= 10000000) { // 1 Crore
        return (num / 10000000).toFixed(2) + 'Cr';
    } else if (num >= 100000) { // 1 Lakh
        return (num / 100000).toFixed(2) + 'L';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(2) + 'K';
    }
    return num.toFixed(2);
}

// Remove all transactions for a specific symbol (when share is deleted)
function removeTransactionsBySymbol(symbol) {
    const transactions = getShareTransactions();
    const normalizedSymbol = symbol.toUpperCase();

    const filteredTransactions = transactions.filter(txn =>
        txn.symbol.toUpperCase() !== normalizedSymbol
    );

    const removedCount = transactions.length - filteredTransactions.length;

    if (removedCount > 0) {
        saveShareTransactions(filteredTransactions);
        renderShareTransactions();
        console.log(`🗑️ Removed ${removedCount} transaction(s) for ${symbol}`);
    }

    return removedCount;
}

// Open modal to edit or delete a transaction
function openEditTransactionModal(transactionId) {
    const transactions = getShareTransactions();
    const txn = transactions.find(t => t.id === transactionId);

    if (!txn) {
        console.error('Transaction not found:', transactionId);
        return;
    }

    // Store current transaction ID
    window.currentEditTransactionId = transactionId;

    // Convert ISO timestamp to date input format (YYYY-MM-DD)
    const txnDate = new Date(txn.timestamp);
    const dateStr = txnDate.toISOString().split('T')[0];

    // Create modal HTML
    const modalHtml = `
        <div id="edit-transaction-modal" class="modal-overlay" style="display: flex; position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 9999; align-items: center; justify-content: center;">
            <div class="glass-panel p-4" style="max-width: 500px; width: 90%;">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h5 class="text-white fw-light mb-0">Edit Transaction</h5>
                    <button onclick="closeEditTransactionModal()" class="btn-close btn-close-white" aria-label="Close"></button>
                </div>
                
                <div class="mb-3">
                    <div class="text-white-70 mb-2">
                        <strong>${txn.company_name}</strong> (${txn.symbol})
                    </div>
                    <div class="text-white-50 small">
                        ${txn.type === 'buy' ? 'Buy' : 'Sell'} ${txn.quantity.toLocaleString('en-IN')} shares @ ₹${txn.price_per_unit.toFixed(2)}
                    </div>
                </div>
                
                <div class="mb-4">
                    <label class="form-label text-white-70 small">Transaction Date</label>
                    <input type="date" id="edit-transaction-date" class="form-control glass-input" value="${dateStr}">
                </div>
                
                <div class="d-flex gap-2">
                    <button onclick="saveTransactionDate()" class="btn glass-button flex-grow-1">
                        Save Date
                    </button>
                    <button onclick="deleteTransaction()" class="btn glass-button-danger">
                        Delete
                    </button>
                    <button onclick="closeEditTransactionModal()" class="btn glass-button-outline">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    `;

    // Remove existing modal if any
    const existingModal = document.getElementById('edit-transaction-modal');
    if (existingModal) existingModal.remove();

    // Add to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

// Close edit transaction modal
function closeEditTransactionModal() {
    const modal = document.getElementById('edit-transaction-modal');
    if (modal) modal.remove();
    window.currentEditTransactionId = null;
}

// Save updated transaction date
function saveTransactionDate() {
    const transactionId = window.currentEditTransactionId;
    if (!transactionId) return;

    const newDate = document.getElementById('edit-transaction-date').value;
    if (!newDate) {
        alert('Please select a date');
        return;
    }

    const transactions = getShareTransactions();
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

    saveShareTransactions(transactions);
    renderShareTransactions();
    closeEditTransactionModal();

    console.log('✅ Transaction date updated');
}

// Delete a transaction
function deleteTransaction() {
    const transactionId = window.currentEditTransactionId;
    if (!transactionId) return;

    if (!confirm('Are you sure you want to delete this transaction?')) {
        return;
    }

    const transactions = getShareTransactions();
    const filtered = transactions.filter(t => t.id !== transactionId);

    saveShareTransactions(filtered);
    renderShareTransactions();
    closeEditTransactionModal();

    console.log('🗑️ Transaction deleted');
}

// Make globally accessible
window.renderShareTransactions = renderShareTransactions;
window.logShareTransaction = logShareTransaction;
window.removeTransactionsBySymbol = removeTransactionsBySymbol;
window.openEditTransactionModal = openEditTransactionModal;
window.closeEditTransactionModal = closeEditTransactionModal;
window.saveTransactionDate = saveTransactionDate;
window.deleteTransaction = deleteTransaction;
