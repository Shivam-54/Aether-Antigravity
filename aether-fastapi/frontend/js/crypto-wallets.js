// ===========================================
// WALLET MANAGEMENT
// ===========================================

// Open Add Wallet Modal
function openAddWalletModal() {
    const modal = document.getElementById('add-wallet-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.style.display = 'block';
    }
}

// Close Add Wallet Modal
function closeAddWalletModal() {
    const modal = document.getElementById('add-wallet-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
        document.getElementById('add-wallet-form')?.reset();
        document.getElementById('walletNetwork').value = '';
        // Reset network button styling
        document.querySelectorAll('#walletNetworkOptions button').forEach(btn => {
            btn.classList.remove('selected');
        });
    }
}

// Select Wallet Network
function selectWalletNetwork(network) {
    document.getElementById('walletNetwork').value = network;

    // Update button styling
    document.querySelectorAll('#walletNetworkOptions button').forEach(btn => {
        if (btn.textContent === network) {
            btn.classList.add('selected');
        } else {
            btn.classList.remove('selected');
        }
    });
}

// Get wallets from localStorage
function getWallets() {
    const stored = localStorage.getItem('aether_crypto_wallets');
    return stored ? JSON.parse(stored) : [];
}

// Save wallets to localStorage
function saveWallets(wallets) {
    localStorage.setItem('aether_crypto_wallets', JSON.stringify(wallets));
}

// Submit Add Wallet Form
async function submitAddWallet(event) {
    event.preventDefault();

    const walletName = document.getElementById('walletName').value.trim();
    const walletAddress = document.getElementById('walletAddress').value.trim();
    const walletNetwork = document.getElementById('walletNetwork').value;

    if (!walletName || !walletAddress || !walletNetwork) {
        showToast('Please fill all required fields', 'error');
        return;
    }

    // Create wallet object
    const newWallet = {
        id: 'wallet-' + Date.now(),
        name: walletName,
        address: walletAddress,
        network: walletNetwork,
        added_date: new Date().toISOString()
    };

    // Save to localStorage
    const wallets = getWallets();
    wallets.push(newWallet);
    saveWallets(wallets);

    console.log('✅ Wallet added:', newWallet);
    showToast('Wallet added successfully!', 'success');

    // Close modal and refresh display
    closeAddWalletModal();
    renderWallets();
}

// Render Wallets
function renderWallets() {
    const wallets = getWallets();
    const container = document.getElementById('crypto-wallets-grid');
    const emptyState = document.getElementById('wallets-empty-state');

    if (!container) return;

    // Clear all wallet cards (but keep empty state element)
    const children = Array.from(container.children);
    children.forEach(child => {
        if (child.id !== 'wallets-empty-state') {
            child.remove();
        }
    });

    if (wallets.length === 0) {
        // Show empty state
        if (emptyState) emptyState.style.display = 'block';
    } else {
        // Hide empty state
        if (emptyState) emptyState.style.display = 'none';

        // Render wallet cards
        let html = '';
        wallets.forEach(wallet => {
            html += `
                <div class="col-md-6 col-lg-4">
                    <div class="glass-card h-100 p-4">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <div>
                                <h3 class="h5 text-white fw-medium mb-1">${wallet.name}</h3>
                                <span class="badge bg-white bg-opacity-10 text-white-70 small">${wallet.network}</span>
                            </div>
                            <button class="btn btn-sm text-danger" onclick="deleteWallet('${wallet.id}')" title="Remove wallet">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                            </button>
                        </div>
                        
                        <div class="mb-3">
                            <label class="text-white-50 small d-block mb-1">Address</label>
                            <div class="d-flex align-items-center gap-2">
                                <code class="text-white-70 small flex-1 text-truncate" style="background: rgba(255,255,255,0.05); padding: 0.5rem; border-radius: 0.5rem;">
                                    ${wallet.address.substring(0, 12)}...${wallet.address.substring(wallet.address.length - 8)}
                                </code>
                                <button class="btn btn-sm glass-button py-1 px-2" onclick="copyToClipboard('${wallet.address}')" title="Copy address">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                        
                        <div class="text-white-30 small">
                            Added ${new Date(wallet.added_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                    </div>
                </div>
            `;
        });

        // Append after empty state
        container.insertAdjacentHTML('beforeend', html);
    }
}

// Variable to store wallet ID for deletion
let walletToDelete = null;

// Open Delete Wallet Modal
function openDeleteWalletModal(walletId) {
    walletToDelete = walletId;
    const modal = document.getElementById('delete-wallet-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.style.display = 'block';
    }
}

// Close Delete Wallet Modal
function closeDeleteWalletModal() {
    walletToDelete = null;
    const modal = document.getElementById('delete-wallet-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
    }
}

// Confirm Delete Wallet
function confirmDeleteWallet() {
    if (!walletToDelete) return;

    const wallets = getWallets();
    const filtered = wallets.filter(w => w.id !== walletToDelete);
    saveWallets(filtered);

    showToast('Wallet removed', 'success');

    // Re-render
    renderWallets();

    // Close modal
    closeDeleteWalletModal();
}

// Delete Wallet - Now opens confirmation modal
function deleteWallet(walletId) {
    openDeleteWalletModal(walletId);
}

// Copy to Clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Address copied to clipboard!', 'success');
    }).catch(err => {
        console.error('Failed to copy:', err);
        showToast('Failed to copy address', 'error');
    });
}
// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    // Check if we are on the page with wallet grid
    if (document.getElementById('crypto-wallets-grid')) {
        renderWallets();
    }
});
