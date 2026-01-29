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

// Submit Add Wallet Form - NOW SAVES TO SUPABASE
async function submitAddWallet(event) {
    event.preventDefault();

    const walletName = document.getElementById('walletName').value.trim();
    const walletAddress = document.getElementById('walletAddress').value.trim();
    const walletNetwork = document.getElementById('walletNetwork').value;

    if (!walletName || !walletAddress || !walletNetwork) {
        showToast('Please fill all required fields', 'error');
        return;
    }

    try {
        // Save to Supabase via API
        const response = await fetch(`${API_BASE_URL}/crypto/wallets`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                name: walletName,
                address: walletAddress,
                network: walletNetwork
            })
        });

        if (response.ok) {
            const newWallet = await response.json();
            console.log('✅ Wallet added to Supabase:', newWallet);
            showToast('Wallet added successfully!', 'success');

            // Close modal and refresh display
            closeAddWalletModal();
            renderWallets();
        } else {
            const error = await response.json();
            showToast(error.detail || 'Failed to add wallet', 'error');
        }
    } catch (error) {
        console.error('Error adding wallet:', error);
        showToast('Failed to add wallet', 'error');
    }
}

// Render Wallets - NOW FETCHES FROM SUPABASE
async function renderWallets() {
    const container = document.getElementById('crypto-wallets-grid');
    const emptyState = document.getElementById('wallets-empty-state');

    if (!container) return;

    // Clear all existing content
    container.innerHTML = '';

    // Hide empty state
    if (emptyState) emptyState.style.display = 'none';

    // Fetch wallets from Supabase API
    let wallets = [];
    try {
        const walletsResponse = await fetch(`${API_BASE_URL}/crypto/wallets`, {
            headers: getAuthHeaders()
        });
        if (walletsResponse.ok) {
            wallets = await walletsResponse.json();
        }
    } catch (error) {
        console.error('Error fetching wallets:', error);
    }

    // Fetch holdings to calculate real wallet statistics
    let holdings = [];
    try {
        const holdingsResponse = await fetch(`${API_BASE_URL}/crypto/holdings`, {
            headers: getAuthHeaders()
        });
        if (holdingsResponse.ok) {
            holdings = await holdingsResponse.json();
        }
    } catch (error) {
        console.error('Error fetching holdings for wallet stats:', error);
    }

    let html = '';

    // Render existing wallets
    wallets.forEach(wallet => {
        // Calculate REAL wallet statistics
        // Filter holdings that belong to this wallet (using UUID now!)
        const walletHoldings = holdings.filter(h => h.wallet_id === wallet.id);
        const assetCount = walletHoldings.length;

        // Calculate total value: sum of (quantity × current_price) for all holdings
        const totalValue = walletHoldings.reduce((sum, h) => {
            return sum + ((h.quantity || 0) * (h.current_price || 0));
        }, 0);

        // Format value in crores (Cr) - 1 Crore = 10,000,000
        const totalValueCrores = (totalValue / 10000000).toFixed(2);

        // Determine icon based on name/network (simplified)
        let iconPath = '<path d="M20 7h-7L10 .5H4A2 2 0 0 0 2 2.5V20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"></path>'; // Default folder/wallet like
        if (wallet.name.toLowerCase().includes('ledger')) {
            iconPath = '<rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path>'; // USB-like
        } else if (wallet.name.toLowerCase().includes('metamask')) {
            iconPath = '<path d="m12 2 9 4-9 4-9-4 9-4Z"></path><path d="m12 10 9 4-9 4-9-4 9-4Z"></path><path d="m12 18 9 4-9 4-9-4 9-4Z"></path>'; // Stack/fox-like
        }

        html += `
            <div class="col-md-6 col-lg-4">
                <div class="glass-panel p-4 h-100 position-relative" style="background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 20px; transition: all 0.3s ease;">
                    <!-- Header -->
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <div class="d-flex align-items-center gap-3">
                            <div class="d-flex align-items-center justify-content-center rounded-circle" style="width: 42px; height: 42px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.05);">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-white-70">
                                    <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"></path>
                                    <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"></path>
                                </svg>
                            </div>
                            <div>
                                <h3 class="h6 text-white fw-medium mb-0">${wallet.name}</h3>
                                <div class="d-flex align-items-center gap-2 mt-1">
                                    <span class="text-white-30" style="font-size: 0.75rem; font-family: monospace;">${wallet.address.substring(0, 6)}....${wallet.address.substring(wallet.address.length - 4)}</span>
                                    <button class="btn btn-link p-0 text-white-30 hover-white" onclick="copyToClipboard('${wallet.address}')" style="line-height:1;">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div class="d-flex align-items-center gap-2">
                            <span class="badge rounded-pill d-flex align-items-center gap-1" style="background: rgba(16, 185, 129, 0.1); color: #10b981; font-weight: 500; font-size: 0.7rem; padding: 0.35rem 0.75rem; border: 1px solid rgba(16, 185, 129, 0.2);">
                                <span style="width: 6px; height: 6px; background: #10b981; border-radius: 50%;"></span>
                                Connected
                            </span>
                            <!-- Delete Button (Moved to prevent overlap) -->
                            <button onclick="deleteWallet('${wallet.id}')" class="delete-wallet-btn p-2 text-white-30 hover-danger rounded-circle" style="background: transparent; border: none; opacity: 0; transition: all 0.2s;">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            </button>
                        </div>
                    </div>

                    <!-- Tags -->
                    <div class="mb-4">
                        <span class="d-inline-block px-2 py-1 rounded text-uppercase" style="background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.6); font-size: 0.65rem; font-weight: 600; letter-spacing: 0.05em; border: 1px solid rgba(255,255,255,0.05);">
                            ${wallet.network}
                        </span>
                    </div>

                    <div class="border-top border-white border-opacity-10 my-3"></div>

                    <!-- Footer / Stats -->
                    <div class="d-flex justify-content-between align-items-end">
                        <div>
                            <div class="text-white-30 small text-uppercase mb-1" style="font-size: 0.65rem; letter-spacing: 0.05em;">Total Assets</div>
                            <div class="h5 text-white-90 mb-0 fw-normal">${assetCount}</div>
                        </div>
                        <div class="text-end">
                            <div class="text-white-30 small text-uppercase mb-1" style="font-size: 0.65rem; letter-spacing: 0.05em;">Value</div>
                            <div class="h5 text-white-90 mb-0 fw-normal">₹${totalValueCrores} Cr</div>
                        </div>
                    </div>

                    <!-- Show delete button on hover -->
                    <style>
                        .glass-panel:hover .delete-wallet-btn { opacity: 0.5 !important; }
                        .glass-panel .delete-wallet-btn:hover { opacity: 1 !important; color: #ef4444 !important; }
                    </style>
                </div>
            </div>
        `;
    });

    // Add "Connect Wallet" Placeholder Card
    html += `
        <div class="col-md-6 col-lg-4">
            <div onclick="openAddWalletModal()" class="h-100 d-flex flex-column align-items-center justify-content-center p-4 position-relative cursor-pointer grow-on-hover" style="min-height: 220px; border: 1px dashed rgba(255, 255, 255, 0.15); border-radius: 20px; background: transparent; transition: all 0.2s ease;">
                <div class="common-transition" style="background: rgba(255,255,255,0.05); width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 1rem;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-white-50">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="12" y1="8" x2="12" y2="16"></line>
                        <line x1="8" y1="12" x2="16" y2="12"></line>
                    </svg>
                </div>
                <h3 class="h6 text-white-70 fw-medium mb-1">Connect Wallet</h3>
                <p class="text-white-30 small mb-0 text-center">Add a new wallet to track assets</p>
                
                <style>
                    .grow-on-hover:hover {
                        background: rgba(255,255,255,0.02) !important;
                        border-color: rgba(255,255,255,0.3) !important;
                        transform: translateY(-2px);
                    }
                    .grow-on-hover:hover svg {
                        color: #fff !important;
                    }
                </style>
            </div>
        </div>
    `;

    container.innerHTML = html;
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

// Confirm Delete Wallet - NOW DELETES FROM SUPABASE
async function confirmDeleteWallet() {
    if (!walletToDelete) return;

    try {
        const response = await fetch(`${API_BASE_URL}/crypto/wallets/${walletToDelete}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (response.ok) {
            showToast('Wallet removed', 'success');
            // Re-render
            renderWallets();
        } else {
            const error = await response.json();
            showToast(error.detail || 'Failed to delete wallet', 'error');
        }
    } catch (error) {
        console.error('Error deleting wallet:', error);
        showToast('Failed to delete wallet', 'error');
    }

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
