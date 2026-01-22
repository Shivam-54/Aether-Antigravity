// Dashboard JavaScript - Aether Portfolio Management
// EXACT REPLICA OF OLD WEBSITE STRUCTURE

// ==================== SAFE EVENT HANDLER UTILITIES ====================
/**
 * Safely generate onclick handler with quoted parameters
 * 
 * Automatically quotes string values and UUIDs to prevent JavaScript syntax errors.
 * Use this when dynamically generating event handlers in template literals.
 * 
 * @param {string} fnName - Function name to call
 * @param {...any} args - Arguments (strings/UUIDs will be auto-quoted)
 * @returns {string} Safe onclick attribute value
 * 
 * @example
 * // Instead of: onclick="sellProperty(${property.id})"  // WRONG
 * // Use: onclick="${safeOnClick('sellProperty', property.id)}"  // CORRECT
 */
function safeOnClick(fnName, ...args) {
    const quotedArgs = args.map(arg => {
        // Quote strings and UUIDs (format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
        if (typeof arg === 'string' || /^[a-f0-9-]{36}$/i.test(String(arg))) {
            return `'${arg}'`;
        }
        return arg;
    });
    return `${fnName}(${quotedArgs.join(', ')})`;
}

/**
 * Safely generate onchange handler with quoted parameters
 * Same logic as safeOnClick
 */
function safeOnChange(fnName, ...args) {
    return safeOnClick(fnName, ...args);
}

// Expose to window for global access
window.safeOnClick = safeOnClick;
window.safeOnChange = safeOnChange;
// ======================================================================

// Sidebar configurations per source (from browser inspection)
const SIDEBAR_CONFIG = {
    realestate: [
        { icon: 'home', text: 'Overview', id: 'overview', active: true },
        { icon: 'building', text: 'Properties', id: 'properties' },
        { icon: 'receipt', text: 'Rental / S...', id: 'rental-sale' },
        { icon: 'document', text: 'Valuation...', id: 'valuation' },
        { icon: 'bulb', text: 'AI Insights', id: 'ai-insights' },
        { divider: true },
        { icon: 'arrow-up', text: 'Upgrade', id: 'upgrade' },
        { icon: 'help', text: 'Help', id: 'help' },
        { icon: 'settings', text: 'Settings', id: 'settings' }
    ],
    crypto: [
        { icon: 'home', text: 'Overview', id: 'overview', active: true },
        { icon: 'wallet', text: 'Holdings', id: 'holdings' },
        { icon: 'activity', text: 'On-Chain...', id: 'on-chain' },
        { icon: 'wallet-2', text: 'Wallets', id: 'wallets' },
        { icon: 'bulb', text: 'AI Insights', id: 'ai-insights' },
        { divider: true },
        { icon: 'arrow-up', text: 'Upgrade', id: 'upgrade' },
        { icon: 'help', text: 'Help', id: 'help' },
        { icon: 'settings', text: 'Settings', id: 'settings' }
    ],
    shares: [
        { icon: 'home', text: 'Overview', id: 'overview', active: true },
        { icon: 'wallet', text: 'Holdings', id: 'holdings' },
        { icon: 'trending', text: 'Market Act...', id: 'market-activity' },
        { icon: 'chart', text: 'Performan...', id: 'performance' },
        { icon: 'bulb', text: 'AI Insights', id: 'ai-insights' },
        { divider: true },
        { icon: 'arrow-up', text: 'Upgrade', id: 'upgrade' },
        { icon: 'help', text: 'Help', id: 'help' },
        { icon: 'settings', text: 'Settings', id: 'settings' }
    ],
    bonds: [
        { icon: 'home', text: 'Overview', id: 'overview', active: true },
        { icon: 'wallet', text: 'Holdings', id: 'holdings' },
        { icon: 'calendar', text: 'Maturity S...', id: 'maturity' },
        { icon: 'chart', text: 'Bond Alloc...', id: 'bond-allocation' },
        { icon: 'bulb', text: 'AI Insights', id: 'ai-insights' },
        { divider: true },
        { icon: 'arrow-up', text: 'Upgrade', id: 'upgrade' },
        { icon: 'help', text: 'Help', id: 'help' },
        { icon: 'settings', text: 'Settings', id: 'settings' }
    ],
    business: [
        { icon: 'home', text: 'Overview', id: 'overview', active: true },
        { icon: 'briefcase', text: 'Ventures', id: 'ventures' },
        { icon: 'trending', text: 'Cash Flow', id: 'cash-flow' },
        { icon: 'document', text: 'Statements', id: 'statements' },
        { icon: 'bulb', text: 'AI Insights', id: 'ai-insights' },
        { divider: true },
        { icon: 'arrow-up', text: 'Upgrade', id: 'upgrade' },
        { icon: 'help', text: 'Help', id: 'help' },
        { icon: 'settings', text: 'Settings', id: 'settings' }
    ]
};

// Icon SVG map (Lucide-style icons)
const ICONS = {
    home: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    building: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>',
    receipt: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17V7"/></svg>',
    document: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>',
    bulb: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>',
    wallet: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>',
    activity: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>',
    'wallet-2': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>',
    trending: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>',
    chart: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/></svg>',
    calendar: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>',
    briefcase: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
    'arrow-up': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>',
    help: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>',
    settings: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>',
    logout: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>'
};

// Current state
let currentSource = 'home'; // Start at home, not a specific source
let currentSection = null; // No section when on home

// API Configuration
const API_BASE_URL = 'http://localhost:8000/api';

function getAuthHeaders() {
    const token = localStorage.getItem('access_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// Source names mapping
const SOURCE_NAMES = {
    realestate: 'Real Estate',
    crypto: 'Crypto',
    shares: 'Shares',
    bonds: 'Bonds',
    business: 'Business'
};

// Auth check
function requireAuth() {
    const token = localStorage.getItem('access_token');
    if (!token) {
        window.location.href = 'index.html';
    }
}

// Logout
function logout() {
    alert("Session expired. Please log in again.");
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_email');
    window.location.href = 'index.html';
}

// Switch source
function switchSource(source) {
    currentSource = source;

    if (source === 'home') {
        currentSection = null;

        // Hide all module content
        document.querySelectorAll('.module-content').forEach(el => el.classList.remove('active'));

        // Show home module
        const homeModule = document.getElementById('module-home');
        if (homeModule) {
            homeModule.classList.add('active');
        }

        // Deactivate all nav tabs
        document.querySelectorAll('.module-tab').forEach(el => el.classList.remove('active'));

        // Clear sidebar (no sidebar for home)
        document.getElementById('sidebarMenu').innerHTML = '';

    } else {
        // Set to Overview when switching to a source
        currentSection = 'Overview';

        // Update top nav active state
        document.querySelectorAll('[data-source]').forEach(btn => {
            if (btn.dataset.source === source) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Update sidebar
        updateSidebar();

        // Show the correct module
        document.querySelectorAll('.module-content').forEach(el => el.classList.remove('active'));
        const moduleEl = document.getElementById(`module-${source}`);
        if (moduleEl) {
            moduleEl.classList.add('active');
        }

        // Special handling for Real Estate sub-sections
        if (source === 'realestate') {
            // Hide all subsections first
            document.querySelectorAll('.realestate-section').forEach(el => el.style.display = 'none');
            // Show overview (was dashboard) by default
            const overviewSection = document.getElementById('realestate-section-overview');
            if (overviewSection) overviewSection.style.display = 'block';

            // Load Real Estate data and render
            fetchRealEstateData();
            renderRealEstateDashboard();
            renderRealEstateProperties();
            renderRealEstateTransactions();
        }

        // Special handling for Crypto sub-sections
        if (source === 'crypto') {
            // Hide all subsections first
            document.querySelectorAll('.crypto-section').forEach(el => el.style.display = 'none');
            // Show overview by default
            const overviewSection = document.getElementById('crypto-section-overview');
            if (overviewSection) overviewSection.style.display = 'block';

            // Load Crypto data and render
            fetchCryptoData();
        }

        // Special handling for Shares sub-sections
        if (source === 'shares') {
            // Hide all subsections first
            document.querySelectorAll('.shares-section').forEach(el => el.style.display = 'none');
            // Show overview by default
            const overviewSection = document.getElementById('shares-section-overview');
            if (overviewSection) overviewSection.style.display = 'block';

            // Load Shares data and render
            fetchSharesData();
        }

        // Special handling for Bonds
        if (source === 'bonds') {
            fetchBondsData();
        }

        // Special handling for Business
        if (source === 'business') {
            fetchBusinessData();
        }
    }

    // Update breadcrumb
    updateBreadcrumb();

    console.log(`Switched to ${source}`);
}

// Navigate to section within source
function navigateToSection(sectionId, sectionName, btn) {
    currentSection = sectionName;

    // Update sidebar active state
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.classList.remove('active');
    });
    btn.classList.add('active');

    // Update breadcrumb
    updateBreadcrumb();

    // Handle Real Estate Sub-navigation
    if (currentSource === 'realestate') {
        document.querySelectorAll('.realestate-section').forEach(el => el.style.display = 'none');
        const targetSection = document.getElementById(`realestate-section-${sectionId}`);
        if (targetSection) {
            targetSection.style.display = 'block';

            // If navigating to Valuation section, fetch documents
            if (sectionId === 'valuation') {
                fetchDocuments();
            }

            // If navigating to AI Insights, generate insights
            if (sectionId === 'ai-insights') {
                generateYieldInsights();
            }
        } else {
            console.warn(`Section realestate-section-${sectionId} not found`);
            // Fallback to overview if known section fails finding
            const overview = document.getElementById('realestate-section-overview');
            if (overview) overview.style.display = 'block';
        }
    }

    // Handle Crypto Sub-navigation
    if (currentSource === 'crypto') {
        document.querySelectorAll('.crypto-section').forEach(el => el.style.display = 'none');
        const targetSection = document.getElementById(`crypto-section-${sectionId}`);
        if (targetSection) {
            targetSection.style.display = 'block';

            // If navigating to Holdings section, render holdings
            if (sectionId === 'holdings') {
                renderCryptoHoldings();
            }
        } else {
            console.warn(`Section crypto-section-${sectionId} not found`);
            // Fallback to overview
            const overview = document.getElementById('crypto-section-overview');
            if (overview) overview.style.display = 'block';
        }
    }

    // Handle Shares Sub-navigation
    if (currentSource === 'shares') {
        document.querySelectorAll('.shares-section').forEach(el => el.style.display = 'none');
        const targetSection = document.getElementById(`shares-section-${sectionId}`);
        if (targetSection) {
            targetSection.style.display = 'block';

            // If navigating to Holdings section, render holdings
            if (sectionId === 'holdings') {
                renderSharesHoldings();
            }
        } else {
            console.warn(`Section shares-section-${sectionId} not found`);
            // Fallback to overview
            const overview = document.getElementById('shares-section-overview');
            if (overview) overview.style.display = 'block';
        }
    }

    console.log(`Navigated to ${currentSource} - ${currentSection}`);
}

// Update breadcrumb
// Update breadcrumb
function updateBreadcrumb() {
    const breadcrumbEl = document.getElementById('breadcrumb');
    if (currentSource === 'home') {
        breadcrumbEl.innerHTML = 'Home';
    } else {
        const sourceName = SOURCE_NAMES[currentSource];
        const separator = ' <span style="opacity:0.5; margin:0 4px;">&gt;</span> ';

        let html = `Home${separator}${sourceName}`;

        // Only show section if it's not the default Overview
        if (currentSection && currentSection !== 'Overview') {
            html += `${separator}${currentSection}`;
        }

        breadcrumbEl.innerHTML = html;
    }
}

// Update sidebar
function updateSidebar() {
    const sidebar = document.getElementById('sidebarMenu');
    const config = SIDEBAR_CONFIG[currentSource];

    sidebar.innerHTML = '';

    config.forEach(item => {
        if (item.divider) {
            const divider = document.createElement('div');
            divider.className = 'sidebar-divider';
            sidebar.appendChild(divider);
        } else {
            const menuItem = document.createElement('div');
            menuItem.className = 'sidebar-item' + (item.active ? ' active' : '');
            menuItem.innerHTML = ICONS[item.icon] + `<span>${item.text}</span>`;
            menuItem.onclick = (e) => navigateToSection(item.id, item.text, e.currentTarget);
            sidebar.appendChild(menuItem);
        }
    });
}

// Real Estate Data State
let REAL_ESTATE_DATA = {
    properties: [],
    transactions: [], // To be implemented in backend later
    performance: []   // To be implemented in backend later
};

async function fetchRealEstateData() {
    try {
        const response = await fetch(`${API_BASE_URL}/realestate/`, {
            headers: getAuthHeaders()
        });

        if (response.ok) {
            const properties = await response.json();
            REAL_ESTATE_DATA.properties = properties;

            // Refresh UI
            renderRealEstateDashboard();
            updatePropertyCounts(); // Update dynamic counts
            renderRealEstateProperties();
            renderRealEstateTransactions(); // Populate transaction history
        } else {
            if (response.status === 401) {
                console.warn('Unauthorized - logging out');
                logout();
                return;
            }
            console.error('Failed to fetch properties');
        }
    } catch (error) {
        console.error('Error fetching real estate data:', error);
    }
}

// Additional Icons
Object.assign(ICONS, {
    eye: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>',
    plus: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>',
    piggyBank: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 5c-1.5 0-2.8.6-3.8 1.5l-2.5 2.5c-.3.3-.7.5-1.1.6a3 3 0 0 0-1.9 2.8c0 .9.5 1.7 1.2 2.2l.4.3c.3.5.1 1.1-.3 1.5L9 18c-.4.4-1 .6-1.5.6H5a2 2 0 0 1-2-2v-1.1c0-.4.2-.8.6-1.1l2.6-2.6c.3-.4.5-1 .5-1.5 0-.9-.6-1.7-1.4-2.2l-1.1-.9C3 6 4 5 5 5h14z"/><path d="M16 8l-2.3 2.3a3 3 0 0 0 0 4.2l3.6 3.6c.4.4.6 1 .6 1.5V21h1a2 2 0 0 0 2-2V9a4 4 0 0 0-4-1z"/><path d="M19 5v4"/><path d="M7 16h8"/></svg>',
    mapPin: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>'
});

// Formatting Utilities
const formatCurrency = (value) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
    return `₹${value.toLocaleString()}`;
};

const calculateAppreciation = (current, purchase) => {
    if (purchase === 0) return 0;
    return ((current - purchase) / purchase) * 100;
};

// Calculate metrics exactly like old website
function calculateRealEstateMetrics() {
    const { properties } = REAL_ESTATE_DATA;
    // Filter active properties (not sold) - assuming all in currrent list are active/owned/rented
    const activeProperties = properties.filter(p => p.status !== 'Sold');

    // Derived from PortfolioOverview.tsx
    const totalProperties = activeProperties.length;
    const totalValuation = activeProperties.reduce((sum, p) => sum + p.current_value, 0);
    const totalEquity = activeProperties.reduce((sum, p) => sum + p.current_value, 0); // Assuming 100% equity for now

    // Appreciation Calculation
    const totalPurchase = activeProperties.reduce((sum, p) => sum + p.purchase_price, 0);
    const avgAppreciation = totalPurchase > 0
        ? ((totalValuation - totalPurchase) / totalPurchase) * 100
        : 0;

    const monthlyRentalIncome = activeProperties.reduce((sum, p) => sum + (p.rent_amount || 0), 0);

    return { totalProperties, totalValuation, totalEquity, avgAppreciation, monthlyRentalIncome };
}

// Render Functions
function renderRealEstateDashboard() {
    const metrics = calculateRealEstateMetrics();

    // Noise Texture SVG Data URL
    const noiseTexture = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`;

    const dashboardHtml = `
        <div class="d-flex flex-column gap-4">
            <!-- Graph Container -->
            <div class="mb-4 rounded-4 overflow-hidden position-relative" 
                 style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 0 50px 0 rgba(255, 255, 255, 0.05), inset 0 0 20px 0 rgba(255, 255, 255, 0.02); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); padding: 2rem;">
                 <div class="mb-4">
                    <h2 class="h4 fw-light text-white-90 mb-1">Portfolio Value Trend</h2>
                    <p class="small fw-light text-white-50">Value movement across owned real estate assets over time</p>
                 </div>
                 <div style="height: 300px; position: relative; width: 100%;">
                     <canvas id="realEstateChart"></canvas>
                 </div>
            </div>

            <!-- Metrics Grid (5 Columns) -->
            <div class="row row-cols-1 row-cols-md-2 row-cols-lg-5 g-3">
                <!-- Total Properties -->
                <div class="col">
                    <div class="position-relative p-4 rounded-4 overflow-hidden group transition-all h-100 d-flex flex-column justify-content-center"
                         style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 0 30px 0 rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);">
                        <div class="position-absolute top-0 start-0 w-100 h-100 pointer-events-none opacity-0 group-hover-opacity-100 transition-opacity z-0" style="background-image: ${noiseTexture}; opacity: 0.06; mix-blend-mode: overlay;"></div>
                        <div class="position-relative z-1 d-flex flex-column gap-2">
                            <div class="text-white-50 mb-1">${ICONS.home}</div>
                            <div>
                                <p class="small text-uppercase text-white-50 mb-1" style="letter-spacing: 0.1em; font-size: 0.65rem;">Total Properties</p>
                                <h3 class="h4 fw-light text-white-90 mb-1">${metrics.totalProperties}</h3>
                                <p class="small fw-light text-white-50" style="font-size: 0.75rem;">Actively held assets</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Total Valuation -->
                 <div class="col">
                    <div class="position-relative p-4 rounded-4 overflow-hidden group transition-all h-100 d-flex flex-column justify-content-center"
                         style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 0 30px 0 rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);">
                        <div class="position-absolute top-0 start-0 w-100 h-100 pointer-events-none opacity-0 group-hover-opacity-100 transition-opacity z-0" style="background-image: ${noiseTexture}; opacity: 0.06; mix-blend-mode: overlay;"></div>
                        <div class="position-relative z-1 d-flex flex-column gap-2">
                            <div class="text-white-50 mb-1">${ICONS.trending}</div>
                            <div>
                                <p class="small text-uppercase text-white-50 mb-1" style="letter-spacing: 0.1em; font-size: 0.65rem;">Total Valuation</p>
                                <h3 class="h4 fw-light text-white-90 mb-1">${formatCurrency(metrics.totalValuation)}</h3>
                                <p class="small fw-light text-white-50" style="font-size: 0.75rem;">Current market value</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Total Equity -->
                 <div class="col">
                    <div class="position-relative p-4 rounded-4 overflow-hidden group transition-all h-100 d-flex flex-column justify-content-center"
                         style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 0 30px 0 rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);">
                         <div class="position-absolute top-0 start-0 w-100 h-100 pointer-events-none opacity-0 group-hover-opacity-100 transition-opacity z-0" style="background-image: ${noiseTexture}; opacity: 0.06; mix-blend-mode: overlay;"></div>
                        <div class="position-relative z-1 d-flex flex-column gap-2">
                            <div class="text-white-50 mb-1">${ICONS.wallet}</div>
                            <div>
                                <p class="small text-uppercase text-white-50 mb-1" style="letter-spacing: 0.1em; font-size: 0.65rem;">Total Equity</p>
                                <h3 class="h4 fw-light text-white-90 mb-1">${formatCurrency(metrics.totalEquity)}</h3>
                                <p class="small fw-light text-white-50" style="font-size: 0.75rem;">Owned capital</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Appreciation -->
                 <div class="col">
                    <div class="position-relative p-4 rounded-4 overflow-hidden group transition-all h-100 d-flex flex-column justify-content-center"
                         style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 0 30px 0 rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);">
                         <div class="position-absolute top-0 start-0 w-100 h-100 pointer-events-none opacity-0 group-hover-opacity-100 transition-opacity z-0" style="background-image: ${noiseTexture}; opacity: 0.06; mix-blend-mode: overlay;"></div>
                        <div class="position-relative z-1 d-flex flex-column gap-2">
                            <div class="text-white-50 mb-1">${ICONS.piggyBank}</div>
                            <div>
                                <p class="small text-uppercase text-white-50 mb-1" style="letter-spacing: 0.1em; font-size: 0.65rem;">Appreciation</p>
                                <h3 class="h4 fw-light text-white-90 mb-1">${metrics.avgAppreciation.toFixed(1)}%</h3>
                                <p class="small fw-light text-white-50" style="font-size: 0.75rem;">Since acquisition</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Monthly Rent -->
                 <div class="col">
                    <div class="position-relative p-4 rounded-4 overflow-hidden group transition-all h-100 d-flex flex-column justify-content-center"
                         style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 0 30px 0 rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);">
                         <div class="position-absolute top-0 start-0 w-100 h-100 pointer-events-none opacity-0 group-hover-opacity-100 transition-opacity z-0" style="background-image: ${noiseTexture}; opacity: 0.06; mix-blend-mode: overlay;"></div>
                        <div class="position-relative z-1 d-flex flex-column gap-2">
                            <div class="text-white-50 mb-1">${ICONS.wallet}</div>
                            <div>
                                <p class="small text-uppercase text-white-50 mb-1" style="letter-spacing: 0.1em; font-size: 0.65rem;">Monthly Rent</p>
                                <h3 class="h4 fw-light text-white-90 mb-1">${formatCurrency(metrics.monthlyRentalIncome)}</h3>
                                <p class="small fw-light text-white-50" style="font-size: 0.75rem;">Recurring income</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Asset Allocation Breakdown Charts -->
            <div class="row g-4 mt-1">
                <!-- Asset Type Distribution -->
                <div class="col-md-4">
                    <div class="p-4 h-100 rounded-4" style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 0 30px 0 rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);">
                        <h4 class="h6 fw-light text-white-90 mb-3 text-uppercase small" style="letter-spacing: 0.1em;">Asset Allocation</h4>
                        <div style="height: 200px; position: relative;">
                            <canvas id="chartAssetType"></canvas>
                        </div>
                    </div>
                </div>
                
                <!-- Location Distribution -->
                <div class="col-md-4">
                    <div class="p-4 h-100 rounded-4" style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 0 30px 0 rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);">
                        <h4 class="h6 fw-light text-white-90 mb-3 text-uppercase small" style="letter-spacing: 0.1em;">Geographic Exposure</h4>
                        <div style="height: 200px; position: relative;">
                            <canvas id="chartLocation"></canvas>
                        </div>
                    </div>
                </div>

                <!-- Occupancy Rate -->
                <div class="col-md-4">
                    <div class="p-4 h-100 d-flex flex-column align-items-center justify-content-center text-center rounded-4" style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 0 30px 0 rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);">
                         <h4 class="h6 fw-light text-white-90 mb-3 align-self-start text-uppercase small" style="letter-spacing: 0.1em;">Occupancy Rate</h4>
                        <div style="height: 140px; width: 140px; position: relative;" class="mb-3">
                           <canvas id="chartOccupancy"></canvas>
                           <div class="position-absolute top-50 start-50 translate-middle">
                               <span id="occupancyText" class="h3 fw-light text-white">--%</span>
                           </div>
                        </div>
                        <div class="small text-white-50">Properties currently generating income</div>
                    </div>
                </div>
            </div>
        </div>
    `;

    const overviewContainer = document.getElementById('realestate-section-overview');
    if (overviewContainer) {
        overviewContainer.innerHTML = dashboardHtml;

        // Initialize Asset Allocation Charts
        loadAssetAllocationCharts(REAL_ESTATE_DATA.properties);

        // Initialize Chart
        const ctx = document.getElementById('realEstateChart');
        if (ctx && typeof Chart !== 'undefined') {
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: REAL_ESTATE_DATA.performance.map(d => d.month),
                    datasets: [{
                        label: 'Portfolio Value',
                        data: REAL_ESTATE_DATA.performance.map(d => d.value),
                        borderColor: 'rgba(255, 255, 255, 0.8)',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 0,
                        pointHoverRadius: 6,
                        pointHoverBackgroundColor: 'rgba(255, 255, 255, 1)',
                        pointHoverBorderColor: 'rgba(255, 255, 255, 0.2)',
                        pointHoverBorderWidth: 8
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            titleColor: 'rgba(255, 255, 255, 0.9)',
                            bodyColor: 'rgba(255, 255, 255, 0.7)',
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                            borderWidth: 1,
                            padding: 12,
                            displayColors: false,
                            callbacks: {
                                label: function (context) {
                                    return formatCurrency(context.parsed.y);
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            grid: { display: false },
                            ticks: { color: 'rgba(255, 255, 255, 0.4)', font: { size: 11 } }
                        },
                        y: {
                            grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false },
                            ticks: {
                                color: 'rgba(255, 255, 255, 0.4)',
                                font: { size: 11 },
                                callback: function (value) { return '₹' + (value / 10000000).toFixed(0) + 'Cr'; }
                            }
                        }
                    },
                    interaction: { intersect: false, mode: 'index' }
                }
            });
        }

        // Initialize Asset Allocation Charts
        loadAssetAllocationCharts(REAL_ESTATE_DATA.properties);
    }
}
// --- Filtering Utilities ---
let currentPropertyFilter = 'Owned';

function filterProperties(status) {
    currentPropertyFilter = status;

    // Update Button Styles
    const ownedBtn = document.getElementById('filter-owned');
    const rentedBtn = document.getElementById('filter-rented');

    if (status === 'Owned') {
        ownedBtn.className = "px-3 py-1 rounded-pill bg-white bg-opacity-10 text-white small";
        rentedBtn.className = "px-3 py-1 rounded-pill text-white-50 small";
    } else {
        ownedBtn.className = "px-3 py-1 rounded-pill text-white-50 small";
        rentedBtn.className = "px-3 py-1 rounded-pill bg-white bg-opacity-10 text-white small";
    }

    renderRealEstateProperties();
}

function updatePropertyCounts() {
    const ownedCount = REAL_ESTATE_DATA.properties.filter(p => p.status === 'Owned').length;
    const rentedCount = REAL_ESTATE_DATA.properties.filter(p => p.status === 'Rented').length;

    const ownedBtn = document.getElementById('filter-owned');
    const rentedBtn = document.getElementById('filter-rented');

    if (ownedBtn) ownedBtn.textContent = `Owned (${ownedCount})`;
    if (rentedBtn) rentedBtn.textContent = `Rented (${rentedCount})`;
}
function renderRealEstateProperties() {
    const container = document.getElementById('properties-grid');
    if (!container) return;

    // Noise Texture SVG Data URL
    const noiseTexture = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`;

    container.className = 'row row-cols-1 row-cols-md-2 g-4';
    container.className = 'row row-cols-1 row-cols-md-2 g-4';

    // Filter properties based on current selection
    const activeProperties = REAL_ESTATE_DATA.properties.filter(p => {
        if (p.status === 'Sold') return false;
        return p.status === currentPropertyFilter;
    });
    container.innerHTML = activeProperties.map(property => {
        const appreciation = calculateAppreciation(property.current_value, property.purchase_price);

        return `
        <div class="col">
            <div class="position-relative p-4 rounded-4 overflow-hidden group transition-all glass-card h-100" style="transition: transform 0.3s ease;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                <!-- Hover Texture -->
                <div class="position-absolute top-0 start-0 w-100 h-100 opacity-0 group-hover-opacity-100 transition-opacity z-0" style="background-image: ${noiseTexture}; opacity: 0.06; mix-blend-mode: overlay; pointer-events: none;"></div>

                <div class="position-relative z-1 d-flex flex-column gap-3">
                    <!-- Header -->
                    <div>
                        <div class="d-flex align-items-start justify-content-between mb-2">
                            <h3 class="h5 fw-light text-white-90 mb-0">${property.name}</h3>
                            <div class="d-flex gap-2">
                                ${property.status === 'Rented' ? `<span class="badge rounded-pill bg-success bg-opacity-10 text-success fw-light border border-success border-opacity-25 px-2 py-1">Rented</span>` : ''}
                                <span class="badge rounded-pill bg-white bg-opacity-10 text-white-50 fw-light border border-white border-opacity-10 px-2 py-1">${property.type}</span>
                            </div>
                        </div>

                        <!-- Full Address -->
                        <div class="mb-3">
                            <div class="d-flex align-items-start gap-2 text-white-50">
                                 <div class="mt-1">${ICONS.mapPin}</div>
                                <div class="small fw-light">
                                    <div class="text-white-70">${property.address || property.location || 'N/A'}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Financial Details -->
                    <div class="row g-3">
                        <div class="col-6">
                            <p class="small text-uppercase text-white-50 mb-1" style="font-size: 0.65rem; letter-spacing: 0.1em;">Purchase Value</p>
                            <p class="small fw-light text-white-70 mb-0">${formatCurrency(property.purchase_price)}</p>
                        </div>
                        <div class="col-6">
                            <p class="small text-uppercase text-white-50 mb-1" style="font-size: 0.65rem; letter-spacing: 0.1em;">Current Value</p>
                            <p class="small fw-light text-white-90 mb-0">${formatCurrency(property.current_value)}</p>
                        </div>
                    </div>

                    <!-- Appreciation Badge -->
                    <div class="d-flex align-items-center justify-content-between pt-3 border-top border-white border-opacity-10 mt-auto">
                        <div class="d-flex align-items-center gap-2">
                            <div class="${appreciation >= 0 ? 'text-success' : 'text-danger'}">
                                ${appreciation >= 0 ? ICONS.trending : `<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path></svg>`}
                            </div>
                            <span class="small fw-light ${appreciation >= 0 ? 'text-success' : 'text-danger'}">
                                ${appreciation > 0 ? '+' : ''}${appreciation.toFixed(1)}%
                            </span>
                            <span class="small fw-light text-white-50">appreciation</span>
                        </div>

                        <!-- View Details Button -->
                        <button onclick="${safeOnClick('openPropertyModal', property.id)}" class="glass-button rounded-pill px-3 py-1 small">
                            ${ICONS.eye}
                            View Details
                        </button>
                    </div>
                </div>
            </div>
        </div>
        `;
    }).join('');
}

// Render Functions
function renderRealEstateTransactions() {
    const container = document.getElementById('transaction-list');
    if (!container) return;

    // Derive transactions from properties status
    const transactions = [];

    // Process properties to create transaction records
    REAL_ESTATE_DATA.properties.forEach(p => {
        if (p.status === 'Sold') {
            transactions.push({
                type: 'Sale',
                property: p.name,
                value: p.current_value, // Proxy for sale price
                rentAmount: null,
                date: p.updated_at ? new Date(p.updated_at).toLocaleDateString() : 'Recently',
                gainLoss: p.purchase_price > 0 ? (p.current_value - p.purchase_price) : 0,
                color: 'text-info', // Sale blue
                bg: 'bg-info bg-opacity-20'
            });
        }
        if (p.status === 'Rented' || p.rent_status === 'Rented') {
            transactions.push({
                type: 'Rent',
                property: p.name,
                value: p.current_value,
                rentAmount: p.rent_amount,
                date: p.rent_start_date ? new Date(p.rent_start_date).toLocaleDateString() : 'Active',
                gainLoss: null,
                color: 'text-success',
                bg: 'bg-success bg-opacity-20'
            });
        }
    });

    if (transactions.length === 0) {
        container.innerHTML = '<div class="p-4 text-center text-white-50">No recent transactions</div>';
        return;
    }

    container.innerHTML = transactions.map(tx => {
        const rentAmountHtml = tx.rentAmount
            ? `<span class="text-white-90">${formatCurrency(tx.rentAmount)}</span>`
            : '<span class="text-white-50">-</span>';

        return `
        <div class="row g-0 p-3 border-bottom border-white border-opacity-10 text-white-70 small align-items-center hover-bg-light transition-colors" style="transition: background 0.2s;">
            <div class="col-2">
                <div class="d-flex align-items-center gap-2">
                    <div class="d-flex align-items-center justify-content-center rounded-circle ${tx.type === 'Rent' ? 'bg-indigo-500 bg-opacity-20 text-info' : 'bg-success bg-opacity-20 text-success'}" style="width: 24px; height: 24px;">
                        <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            ${tx.type === 'Rent'
                ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>'
                : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>'
            }
                        </svg>
                    </div>
                    ${tx.type}
                </div>
            </div>
            <div class="col-2 text-white text-truncate pe-2" title="${tx.property}">${tx.property}</div>
            <div class="col-2">${typeof tx.value === 'number' ? formatCurrency(tx.value) : tx.value}</div>
            <div class="col-2">${rentAmountHtml}</div>
            <div class="col-2">${tx.date}</div>
            <div class="col-2 ${tx.gainLoss !== null && tx.gainLoss >= 0 ? 'text-success' : (tx.gainLoss !== null ? 'text-danger' : 'text-white-50')}">
                ${tx.gainLoss !== null ? ((tx.gainLoss >= 0 ? '+' : '') + formatCurrency(tx.gainLoss)) : '-'}
            </div>
        </div>
    `}).join('');
}

// Modal Functions
function openPropertyModal(propertyId) {
    const property = REAL_ESTATE_DATA.properties.find(p => p.id === propertyId);
    if (!property) return;

    const modal = document.getElementById('property-modal');
    const content = document.getElementById('modal-content');

    // Apply exact modal overlay style from old website
    const modalContainer = modal.querySelector('#modal-content-container');
    if (modalContainer) {
        modalContainer.style.background = 'rgba(10, 10, 10, 0.95)';
        modalContainer.style.border = '1px solid rgba(255, 255, 255, 0.1)';
        modalContainer.style.boxShadow = '0 0 80px 0 rgba(255, 255, 255, 0.1), inset 0 0 20px 0 rgba(255, 255, 255, 0.02)';
        modalContainer.style.backdropFilter = 'blur(20px)';
        modalContainer.style.borderRadius = '1.5rem';
    }

    modal.classList.remove('hidden');
    modal.style.display = 'block';

    content.innerHTML = `
        <div class="mb-4">
            <div class="d-flex align-items-center gap-3 mb-2">
                <h2 class="display-6 fw-light text-white mb-0" style="letter-spacing: 0.05em;">${property.name}</h2>
                 <span class="badge rounded-pill bg-white bg-opacity-10 text-white-70 fw-light border border-white border-opacity-10 px-2 py-1">${property.type}</span>
            </div>
            <div class="d-flex align-items-center gap-2 small text-white-50 fw-light">
                ${ICONS.mapPin}
                <span style="letter-spacing: 0.05em;">${property.location}</span>
            </div>
        </div>

        <div class="row g-3 mb-5">
             <div class="col-6">
                <button onclick="closePropertyModal(); openRentModal('${property.id}', ${property.status === 'Rented' || property.rent_status === 'Rented'});" class="glass-button w-100 p-3 rounded-4 border border-white border-opacity-10 hover-bg-light transition-colors d-flex align-items-center justify-content-center gap-2 text-white-90">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11.542 16M15 7a6 6 0 01-1.461-2.45M21 12c-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7 0-.402.036-.796.105-1.182m-2.833-.118C5.064 3.02 2.768 7.057 4 12c1.274 4.057 5.064 7 9.542 7 1.579 0 3.064-.366 4.39-1.02m-4.39 1.02V11"></path></svg>
                    ${(property.status === 'Rented' || property.rent_status === 'Rented') ? 'Edit Rent' : 'Rent Property'}
                </button>
            </div>
            <div class="col-6">
                <button onclick="sellProperty('${property.id}')" class="btn btn-light w-100 p-3 rounded-4 hover-bg-light transition-colors d-flex align-items-center justify-content-center gap-2 fw-medium border-0">
                    Sell Property 
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                </button>
            </div>
        </div>

        <div class="d-flex flex-column gap-5">
            <!-- Property Specifications -->
            <div>
                <h3 class="small text-uppercase text-white-50 mb-3" style="letter-spacing: 0.1em;">Property Specifications</h3>
                <div class="row row-cols-1 row-cols-md-2 g-3">
                     <div class="col">
                        <div class="p-2 rounded-4 h-100 d-flex align-items-center gap-3" style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05);">
                            <div class="text-white-50 p-2 rounded-3" style="background: rgba(255,255,255,0.05)">${ICONS.home}</div>
                            <div class="w-100">
                                <p class="small fw-light text-white-50 mb-1" style="letter-spacing: 0.05em;">Land Area</p>
                                <div class="d-flex align-items-center gap-2 px-2 py-1 rounded-3" style="background: rgba(0, 0, 0, 0.2); border: 1px solid rgba(255, 255, 255, 0.05);">
                                    <input type="number" 
                                           class="form-control form-control-sm bg-transparent border-0 text-white p-0 fw-medium shadow-none" 
                                           style="min-width: 0;"
                                           value="${property.land_area || 0}" 
                                           onchange="updatePropertyField('${property.id}', 'land_area', this.value)">
                                    <div style="width: 1px; height: 16px; background: rgba(255,255,255,0.1);"></div>
                                    <select class="form-select form-select-sm bg-transparent border-0 text-white-50 p-0 fw-light shadow-none w-auto" 
                                            style="cursor: pointer;"
                                            onchange="updatePropertyField('${property.id}', 'land_unit', this.value)">
                                        <option value="sq ft" ${property.land_unit === 'sq ft' ? 'selected' : ''} class="bg-dark">sq ft</option>
                                        <option value="sq m" ${property.land_unit === 'sq m' ? 'selected' : ''} class="bg-dark">sq m</option>
                                        <option value="acres" ${property.land_unit === 'acres' ? 'selected' : ''} class="bg-dark">acres</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                     <div class="col">
                        <div class="p-2 rounded-4 h-100 d-flex align-items-center gap-3" style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05);">
                            <div class="text-white-50 p-2 rounded-3" style="background: rgba(255,255,255,0.05)">${ICONS.home}</div>
                            <div class="w-100">
                                <p class="small fw-light text-white-50 mb-1" style="letter-spacing: 0.05em;">Type</p>
                                <div class="px-2 py-1 rounded-3" style="background: rgba(0, 0, 0, 0.2); border: 1px solid rgba(255, 255, 255, 0.05);">
                                    <select class="form-select form-select-sm bg-transparent border-0 text-white p-0 fw-medium shadow-none w-100" 
                                            style="cursor: pointer;"
                                            onchange="updatePropertyField('${property.id}', 'type', this.value)">
                                        <option value="Residential" ${property.type === 'Residential' ? 'selected' : ''} class="bg-dark">Residential</option>
                                        <option value="Commercial" ${property.type === 'Commercial' ? 'selected' : ''} class="bg-dark">Commercial</option>
                                        <option value="Land" ${property.type === 'Land' ? 'selected' : ''} class="bg-dark">Land</option>
                                        <option value="Industrial" ${property.type === 'Industrial' ? 'selected' : ''} class="bg-dark">Industrial</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                     <!-- Add more specs if available -->
                </div>
            </div>

            <!-- Financial Breakdown -->
             <div>
                <h3 class="small text-uppercase text-white-50 mb-3" style="letter-spacing: 0.1em;">Financial Breakdown</h3>
                <div class="row row-cols-1 row-cols-md-2 g-3">
                     <div class="col">
                        <div class="p-3 rounded-4 h-100 d-flex align-items-center gap-3" style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08);">
                            <div class="text-white-50 p-2 rounded-3" style="background: rgba(255,255,255,0.05)">${ICONS.wallet}</div>
                            <div>
                                <p class="small fw-light text-white-50 mb-0" style="letter-spacing: 0.05em;">Current Market Value</p>
                                <p class="h5 fw-light text-white-90 mb-0">${formatCurrency(property.current_value)}</p>
                            </div>
                        </div>
                    </div>
                    <div class="col">
                         <div class="p-3 rounded-4 h-100 d-flex align-items-center gap-3" style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08);">
                            <div class="text-white-50 p-2 rounded-3" style="background: rgba(255,255,255,0.05)">${ICONS.wallet}</div>
                            <div>
                                <p class="small fw-light text-white-50 mb-0" style="letter-spacing: 0.05em;">Outstanding Mortgage</p>
                                <p class="h5 fw-light text-white-90 mb-0">₹0.00 Cr</p>
                            </div>
                        </div>
                    </div>
                     <div class="col">
                         <div class="p-3 rounded-4 h-100 d-flex align-items-center gap-3" style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08);">
                            <div class="text-white-50 p-2 rounded-3" style="background: rgba(255,255,255,0.05)">${ICONS.trending}</div>
                            <div>
                                <p class="small fw-light text-white-50 mb-0" style="letter-spacing: 0.05em;">Equity</p>
                                <p class="h5 fw-light text-white-90 mb-0">${formatCurrency(property.current_value)}</p>
                            </div>
                        </div>
                    </div>
                    <div class="col">
                        <div class="p-3 rounded-4 h-100 d-flex align-items-center gap-3" style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08);">
                             <div class="text-white-50 p-2 rounded-3" style="background: rgba(255,255,255,0.05)"><svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"></path></svg></div>
                            <div>
                                <p class="small fw-light text-white-50 mb-0" style="letter-spacing: 0.05em;">Loan-to-Value Ratio</p>
                                <p class="h5 fw-light text-white-90 mb-0">${(property.loan_to_value || 0).toFixed(1)}%</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Ownership Metadata -->
            <div>
                <h3 class="small text-uppercase text-white-50 mb-3" style="letter-spacing: 0.1em;">Ownership Metadata</h3>
                <div class="row row-cols-1 row-cols-md-2 g-3">
                    <div class="col">
                         <div class="p-3 rounded-4 h-100 d-flex align-items-center gap-3" style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05);">
                             <div class="text-white-50 p-2 rounded-3" style="background: rgba(255,255,255,0.05)"><svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>
                            <div>
                                <p class="small fw-light text-white-50 mb-0" style="letter-spacing: 0.05em;">Acquisition Date</p>
                                <p class="fw-medium text-white-90 mb-0">${property.acquisition_date || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                    <div class="col">
                         <div class="p-3 rounded-4 h-100 d-flex align-items-center gap-3" style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05);">
                             <div class="text-white-50 p-2 rounded-3" style="background: rgba(255,255,255,0.05)"><svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>
                             <div>
                                <p class="small fw-light text-white-50 mb-0" style="letter-spacing: 0.05em;">Holding Duration</p>
                                <p class="fw-medium text-white-90 mb-0">${property.holding_duration || '0 months'}</p>
                            </div>
                        </div>
                    </div>
                     <div class="col">
                         <div class="p-3 rounded-4 h-100 d-flex align-items-center gap-3" style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05);">
                             <div class="text-white-50 p-2 rounded-3" style="background: rgba(255,255,255,0.05)"><svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg></div>
                            <div>
                                <p class="small fw-light text-white-50 mb-0" style="letter-spacing: 0.05em;">Ownership Structure</p>
                                <p class="fw-medium text-white-90 mb-0">${property.ownership_structure || 'Individual'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
            
            <!-- Remove Property Option -->
            <div class="mt-4 pt-3 border-top border-white border-opacity-10 text-center">
                 <button onclick="${safeOnClick('openRemovePropertyModal', property.id)}" class="btn btn-link text-danger text-opacity-50 text-decoration-none small hover-text-danger transition-colors" style="font-size: 0.8rem;">
                    Remove Property from Portfolio
                </button>
            </div>
        </div>
    `;
}

function closePropertyModal() {
    const modal = document.getElementById('property-modal');
    modal.classList.add('hidden');
    modal.style.display = 'none';
}

// Action Functions
// Action Functions
function handleAddProperty() {
    const modal = document.getElementById('add-property-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.style.display = 'block';
    }
}

function closeAddPropertyModal() {
    const modal = document.getElementById('add-property-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
    }
}

async function submitAddProperty(event) {
    event.preventDefault();

    const name = document.getElementById('propName').value;
    const type = document.getElementById('propType').value;
    const address = document.getElementById('propAddress').value;
    const purchasePrice = parseFloat(document.getElementById('propPurchasePrice').value);
    const currentPrice = parseFloat(document.getElementById('propCurrentPrice').value);
    const lng = parseFloat(document.getElementById('propLng').value) || 0;
    const lat = parseFloat(document.getElementById('propLat').value) || 0;

    const payload = {
        name: name,
        location: address.split(',')[0] || address,
        address: address,
        purchase_price: purchasePrice,
        current_value: currentPrice,
        type: type,
        status: 'Owned',
        ownership_structure: 'Individual'
        // Lat/Lng not in basic PropertyCreate schema yet? 
        // Note: The Property model has location/address but might not have lat/lng columns in my previous write.
        // Let's check model.py. I wrote: location, address.
        // I didn't add lat/lng columns explicitly? 
        // Step 1655: location, address, acquisition_date, description...
        // No lat/lng columns.
        // I should probably add them to the model if I want to save them.
        // For now, I will omit them or store in description/json if needed.
        // Wait, the Mock Data had coordinates.
        // I should update the Model? The user just asked to copy the form.
        // If I send extra fields, Pydantic might ignore them or Error unless `extra="ignore"`.
        // My Pydantic schema `PropertyBase` didn't have lat/lng?
        // Step 1656: name, type, status, purchase_price, current_value, location, address...
        // No lat/lng.
        // I will add them to schema/model later if needed. For now I'll just send what I have.
    };

    try {
        const response = await fetch(`${API_BASE_URL}/realestate/`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert("Property added successfully!");
            closeAddPropertyModal();
            document.getElementById('addPropertyForm').reset();
            fetchRealEstateData(); // Reload data
        } else {
            if (response.status === 401) {
                alert("Session expired. Please login again.");
                logout();
                return;
            }
            const error = await response.json();
            alert(`Error adding property: ${error.detail || 'Unknown error'}`);
        }
    } catch (err) {
        console.error(err);
        alert("Failed to connect to server.");
    }
}

function handleUploadDocument() {
    // Create hidden file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.jpg,.png';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Simulate upload
            setTimeout(() => {
                const container = document.getElementById('documents-list');
                const docId = new Date().getTime();
                const docHtml = `
    < div class="glass-card p-4 group relative" >
                        <div class="d-flex align-items-start justify-content-between mb-4">
                            <div class="p-3 rounded-lg bg-indigo-500 bg-opacity-10 text-indigo-400">
                                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                            </div>
                            <button class="text-white-50 hover-text-white transition-colors">
                                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg>
                            </button>
                        </div>
                        <h3 class="small fw-medium text-white mb-1 text-truncate">${file.name}</h3>
                        <p class="small text-white-50 mb-4">Uploaded just now</p>
                        <button class="w-100 py-2 small rounded bg-white bg-opacity-10 hover-bg-white hover-bg-opacity-20 text-white-50 transition-colors">View Document</button>
                    </div >
    `;
                container.insertAdjacentHTML('afterbegin', docHtml);
                alert(`Document "${file.name}" uploaded successfully associated with your portfolio.`);
            }, 500);
        }
    };
    input.click();
}

// ===== RENT PROPERTY MODAL FUNCTIONS =====
let currentRentPropertyId = null;
let currentRentPropertyData = null;

function openRentModal(propertyId, isEdit = false) {
    const property = REAL_ESTATE_DATA.properties.find(p => p.id === propertyId);
    if (!property) return;

    currentRentPropertyId = propertyId;
    currentRentPropertyData = property;

    // Form elements
    const form = document.getElementById('rentPropertyForm');
    const titleElement = document.querySelector('#rent-property-modal h2');
    const propertyNameElement = document.getElementById('rent-modal-property-name');
    const cancelBtn = document.getElementById('cancelRentBtn');
    const submitText = document.getElementById('rentSubmitText');

    // Reset form
    form.reset();
    propertyNameElement.textContent = property.name;

    // Set Edit Mode vs New Mode
    if (isEdit) {
        titleElement.textContent = 'Edit Rent Details';
        if (cancelBtn) cancelBtn.classList.remove('d-none');
        if (submitText) submitText.textContent = 'Save Changes';

        // Populate fields
        document.getElementById('rentType').value = property.rent_type || 'Monthly';
        document.getElementById('rentAmount').value = property.rent_amount || '';
        if (property.rent_start_date) {
            document.getElementById('rentStartDate').value = property.rent_start_date;
        }
        document.getElementById('securityDeposit').value = property.security_deposit || '';
        document.getElementById('tenantType').value = property.tenant_type || 'Individual';

        // Set active type button
        setRentType(property.rent_type || 'Monthly');
    } else {
        titleElement.textContent = 'Rent Property';
        if (cancelBtn) cancelBtn.classList.add('d-none');
        if (submitText) submitText.textContent = 'Analyze Impact'; // Default text

        // Default values
        document.getElementById('rentType').value = 'Monthly';
        document.getElementById('rentStartDate').value = new Date().toISOString().split('T')[0];
        document.getElementById('tenantType').value = 'Individual';
        setRentType('Monthly');
    }

    // Reset to step 1
    document.getElementById('rent-step-1').style.display = 'block';
    document.getElementById('rent-step-2').style.display = 'none';

    // Show modal
    const modal = document.getElementById('rent-property-modal');
    modal.classList.remove('hidden');
    modal.style.display = 'block';
}

// Open Cancel Rent Confirmation Modal (now directly cancels rent without confirmation)
function cancelRentProperty() {
    // Directly cancel rent without showing confirmation modal
    confirmCancelRent();
}

// Close Cancel Rent Modal
function closeCancelRentModal() {
    const modal = document.getElementById('cancel-rent-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
    }
}

// Confirm Cancel Rent (performs the actual cancellation)
async function confirmCancelRent() {
    try {
        const payload = {
            rent_status: "Not Rented",
            status: "Owned",
            rent_amount: null,
            rent_start_date: null,
            rent_type: null,
            security_deposit: null,
            tenant_type: null
        };

        const response = await fetch(`${API_BASE_URL}/realestate/${currentRentPropertyId}`, {
            method: 'PUT',
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error('Failed to cancel rent');

        // Close modals and refresh
        closeCancelRentModal();
        closeRentModal();
        closePropertyModal();
        await fetchRealEstateData();

        console.log('✓ Rent cancelled successfully');

    } catch (error) {
        console.error('Error cancelling rent:', error);
        alert('Failed to cancel rent. Please try again.');
    }
}

function closeRentModal() {
    const modal = document.getElementById('rent-property-modal');
    modal.classList.add('hidden');
    modal.style.display = 'none';
    currentRentPropertyId = null;
    currentRentPropertyData = null;
}

function setRentType(type) {
    document.getElementById('rentType').value = type;

    // Update button styles
    document.querySelectorAll('.rent-type-btn').forEach(btn => {
        if (btn.dataset.type === type) {
            btn.classList.add('active');
            btn.style.background = 'rgba(255,255,255,0.1)';
            btn.style.color = 'white';
            btn.style.boxShadow = '0 0 15px rgba(255,255,255,0.1)';
        } else {
            btn.classList.remove('active');
            btn.style.background = '';
            btn.style.color = 'rgba(255,255,255,0.5)';
            btn.style.boxShadow = '';
        }
    });
}

function handleRentStep1(event) {
    event.preventDefault();

    const rentType = document.getElementById('rentType').value;
    const rentAmount = parseFloat(document.getElementById('rentAmount').value);
    const rentStartDate = document.getElementById('rentStartDate').value;
    const securityDeposit = parseFloat(document.getElementById('securityDeposit').value) || 0;
    const tenantType = document.getElementById('tenantType').value;

    if (!rentAmount || rentAmount <= 0) {
        alert('Please enter a valid rent amount');
        return;
    }

    // Calculate metrics
    const currentValue = currentRentPropertyData.current_value;
    const annualRent = rentType === 'Monthly' ? rentAmount * 12 : rentAmount;
    const rentalYield = ((annualRent / currentValue) * 100).toFixed(2);
    const monthlyIncome = rentType === 'Monthly' ? rentAmount : (rentAmount / 12);

    // Update impact analysis
    document.getElementById('impact-description').textContent =
        `This rent increases annual cash flow by ₹${(annualRent / 100000).toFixed(2)}L and improves real estate yield.`;
    document.getElementById('rental-yield').textContent = `${rentalYield}%`;
    document.getElementById('annual-income').textContent = `₹${(annualRent / 100000).toFixed(2)}L`;
    document.getElementById('monthly-cashflow').textContent = `₹${monthlyIncome.toLocaleString()}`;

    // Show step 2
    document.getElementById('rent-step-1').style.display = 'none';
    document.getElementById('rent-step-2').style.display = 'block';
}

function backToRentStep1() {
    document.getElementById('rent-step-1').style.display = 'block';
    document.getElementById('rent-step-2').style.display = 'none';
}

async function confirmRentProperty() {
    const rentType = document.getElementById('rentType').value;
    const rentAmount = parseFloat(document.getElementById('rentAmount').value);
    const rentStartDate = document.getElementById('rentStartDate').value;
    const securityDeposit = parseFloat(document.getElementById('securityDeposit').value) || 0;
    const tenantType = document.getElementById('tenantType').value;

    const payload = {
        rent_type: rentType,
        rent_amount: rentAmount,
        rent_start_date: rentStartDate,
        security_deposit: securityDeposit,
        tenant_type: tenantType
    };

    try {
        const response = await fetch(`${API_BASE_URL}/realestate/${currentRentPropertyId}/rent`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert('Property rented successfully!');
            closeRentModal();
            fetchRealEstateData(); // Reload data
        } else {
            if (response.status === 401) {
                alert('Session expired. Please login again.');
                logout();
                return;
            }
            const error = await response.json();
            alert(`Error renting property: ${error.detail || 'Unknown error'}`);
        }
    } catch (err) {
        console.error(err);
        alert('Failed to connect to server.');
    }
}



let currentSellPropertyId = null;

function sellProperty(propertyId) {
    currentSellPropertyId = propertyId;
    const modal = document.getElementById('sell-property-modal');
    // Hide details modal if open
    document.getElementById('property-modal').style.display = 'none';

    modal.classList.remove('hidden');
    modal.style.display = 'block';
}

function closeSellPropertyModal() {
    const modal = document.getElementById('sell-property-modal');
    modal.classList.add('hidden');
    modal.style.display = 'none';
    currentSellPropertyId = null;

    // Re-open details modal? Or just close all? Best to just close all.
    // If user cancels, maybe re-open details modal?
    // Let's just keep details modal closed for simplicity or re-open it.
    // Actually, closing 'sell' acts as cancel, so re-opening details modal is nice.
    const detailsModal = document.getElementById('property-modal');
    // detailsModal.style.display = 'block'; // Uncomment if we want to return to details
}

async function confirmSellProperty() {
    if (!currentSellPropertyId) return;

    try {
        const response = await fetch(`${API_BASE_URL}/realestate/${currentSellPropertyId}/sell`, {
            method: 'PUT',
            headers: getAuthHeaders()
        });

        if (response.ok) {
            closeSellPropertyModal();
            closePropertyModal(); // Ensure parent is closed
            fetchRealEstateData(); // Reload data
        } else {
            if (response.status === 401) {
                alert('Session expired. Please login again.');
                logout();
                return;
            }
            const error = await response.json();
            alert(`Error selling property: ${error.detail || 'Unknown error'}`);
        }
    } catch (err) {
        console.error(err);
        alert('Failed to connect to server.');
    }
}

// ===== PROPERTY FIELD SCHEMA =====
// Define all property fields with their types and validation rules
// This ensures automatic type conversion and validation for all current and future fields
const PROPERTY_FIELD_SCHEMA = {
    // Text/String fields
    'name': { type: 'string', required: true },
    'location': { type: 'string', required: false },
    'address': { type: 'string', required: false },
    'type': { type: 'string', enum: ['Residential', 'Commercial', 'Land', 'Industrial'], required: true },
    'status': { type: 'string', enum: ['Owned', 'Rented', 'Sold'], required: true },
    'ownership_structure': { type: 'string', required: false },
    'description': { type: 'string', required: false },
    'land_unit': { type: 'string', enum: ['sq ft', 'sq m', 'acres'], required: false },
    'rent_type': { type: 'string', enum: ['Monthly', 'Yearly'], required: false },
    'tenant_type': { type: 'string', enum: ['Individual', 'Corporate'], required: false },

    // Numeric fields
    'purchase_price': { type: 'number', min: 0, required: true },
    'current_value': { type: 'number', min: 0, required: true },
    'land_area': { type: 'number', min: 0, required: false },
    'loan_to_value': { type: 'number', min: 0, max: 100, required: false },
    'rent_amount': { type: 'number', min: 0, required: false },
    'security_deposit': { type: 'number', min: 0, required: false },

    // Date fields
    'acquisition_date': { type: 'date', required: false },
    'rent_start_date': { type: 'date', required: false },

    // Boolean fields
    'is_primary_residence': { type: 'boolean', required: false }
};

/**
 * Validates and converts a value based on the property field schema
 * @param {string} field - The field name
 * @param {*} value - The raw value to validate and convert
 * @returns {Object} { valid: boolean, value: any, error: string }
 */
function validatePropertyField(field, value) {
    const schema = PROPERTY_FIELD_SCHEMA[field];

    // If field not in schema, pass through as string (for future extensibility)
    if (!schema) {
        console.warn(`Field "${field}" not found in schema. Passing through as string.`);
        return { valid: true, value: String(value), error: null };
    }

    // Handle null/undefined/empty values
    if (value === null || value === undefined || value === '') {
        if (schema.required) {
            return { valid: false, value: null, error: `${field} is required` };
        }
        return { valid: true, value: null, error: null };
    }

    // Type conversion and validation
    switch (schema.type) {
        case 'number':
            const numValue = parseFloat(value);
            if (isNaN(numValue)) {
                return { valid: false, value: null, error: `${field} must be a valid number` };
            }
            if (schema.min !== undefined && numValue < schema.min) {
                return { valid: false, value: null, error: `${field} must be at least ${schema.min}` };
            }
            if (schema.max !== undefined && numValue > schema.max) {
                return { valid: false, value: null, error: `${field} must be at most ${schema.max}` };
            }
            return { valid: true, value: numValue, error: null };

        case 'string':
            const strValue = String(value).trim();
            if (schema.enum && !schema.enum.includes(strValue)) {
                return { valid: false, value: null, error: `${field} must be one of: ${schema.enum.join(', ')}` };
            }
            return { valid: true, value: strValue, error: null };

        case 'boolean':
            const boolValue = value === true || value === 'true' || value === 1 || value === '1';
            return { valid: true, value: boolValue, error: null };

        case 'date':
            const dateValue = value instanceof Date ? value : new Date(value);
            if (isNaN(dateValue.getTime())) {
                return { valid: false, value: null, error: `${field} must be a valid date` };
            }
            // Return ISO string format for API compatibility
            return { valid: true, value: dateValue.toISOString().split('T')[0], error: null };

        default:
            return { valid: true, value: value, error: null };
    }
}

async function updatePropertyField(propertyId, field, value) {
    // Validate and convert the value using the schema
    const validation = validatePropertyField(field, value);

    if (!validation.valid) {
        console.error(`Validation failed for ${field}:`, validation.error);
        alert(`Validation Error: ${validation.error}`);
        return;
    }

    const payloadValue = validation.value;

    console.log(`Updating property ${propertyId}: ${field} = ${payloadValue} (type: ${typeof payloadValue})`);

    try {
        const payload = { [field]: payloadValue };

        const response = await fetch(`${API_BASE_URL}/realestate/${propertyId}`, {
            method: 'PUT',
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            // Success - update local data model or fetch fresh data
            // Since we're in a modal, fetching fresh data might be overkill and cause redraws,
            // but we should at least update REAL_ESTATE_DATA.properties locally 
            // so if they close and reopen it persists instantly before fetch.
            const prop = REAL_ESTATE_DATA.properties.find(p => p.id === propertyId);
            if (prop) {
                prop[field] = payloadValue;
            }
            // Optionally fetch in background
            fetchRealEstateData();

            console.log(`✓ Successfully updated ${field} to ${payloadValue}`);
            // Visual feedback could be added here (e.g. green flash)
        } else {
            const error = await response.json();
            console.error('Update failed:', error);
            alert(`Failed to update ${field}: ${error.detail || 'Unknown error'}`);
        }
    } catch (err) {
        console.error('Network error:', err);
        alert("Failed to connect to server. Please check your connection.");
    }
}



// ===== REMOVE PROPERTY FUNCTIONS =====
let currentRemovePropertyId = null;

function openRemovePropertyModal(propertyId) {
    currentRemovePropertyId = propertyId;
    const modal = document.getElementById('remove-property-modal');
    // Hide details modal if open
    document.getElementById('property-modal').style.display = 'none';

    modal.classList.remove('hidden');
    modal.style.display = 'block';
}

function closeRemovePropertyModal() {
    const modal = document.getElementById('remove-property-modal');
    modal.classList.add('hidden');
    modal.style.display = 'none';
    currentRemovePropertyId = null;

    // Re-open details modal on cancel so user doesn't lose context
    const detailsModal = document.getElementById('property-modal');
    if (detailsModal) detailsModal.style.display = 'block';
}

async function confirmRemoveProperty() {
    if (!currentRemovePropertyId) return;

    try {
        const response = await fetch(`${API_BASE_URL}/realestate/${currentRemovePropertyId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (response.ok) {
            closeRemovePropertyModal();
            closePropertyModal(); // Ensure parent is closed
            fetchRealEstateData(); // Reload data
        } else {
            if (response.status === 401) {
                alert('Session expired. Please login again.');
                logout();
                return;
            }
            const error = await response.json();
            alert(`Error removing property: ${error.detail || 'Unknown error'}`);
        }
    } catch (err) {
        console.error(err);
        alert('Failed to connect to server.');
    }
}


// Initialize
document.addEventListener('DOMContentLoaded', () => {
    requireAuth();

    // Set user email
    const userEmail = localStorage.getItem('user_email') || 'user@example.com';
    document.getElementById('userEmail').textContent = userEmail;

    // Initialize with Home Dashboard (not Real Estate)
    switchSource('home'); // This will update breadcrumb, sidebar, and show home module

    // Hook up buttons
    // Note: We need to use event delegation or direct onclicks in HTML. 
    // Since I added the HTML as strings in previous steps, I should update the onclick handlers in those strings or use valid selectors here. 
    // The previous HTML edit had hardcoded onclicks? No, some didn't.
    // Let's attach safely based on selectors for the MAIN buttons in the containers

    const addPropBtn = document.querySelector('#realestate-section-properties button.glass-button');
    if (addPropBtn) addPropBtn.onclick = handleAddProperty;

    const uploadDocBtn = document.querySelector('#realestate-section-valuation button.glass-button');
    if (uploadDocBtn) uploadDocBtn.onclick = handleUploadDocument;
});

// ============================================
// DOCUMENT MANAGEMENT FUNCTIONS
// ============================================

// Open Upload Document Modal
function openUploadDocumentModal() {
    const modal = document.getElementById('upload-document-modal');
    if (modal) {
        // Populate property dropdown
        populatePropertyDropdown();
        modal.classList.remove('hidden');
        modal.style.display = 'block';
    }
}

// Close Upload Document Modal
function closeUploadDocumentModal() {
    const modal = document.getElementById('upload-document-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
        // Reset form
        document.getElementById('uploadDocumentForm').reset();
        document.getElementById('fileName').textContent = '';
    }
}

// Populate property dropdown with user's properties
function populatePropertyDropdown() {
    const dropdown = document.getElementById('docProperty');
    if (!dropdown) return;

    // Clear existing options except the first one
    dropdown.innerHTML = '<option value="" class="text-dark">Select a property...</option>';

    // Add properties from REAL_ESTATE_DATA
    REAL_ESTATE_DATA.properties.forEach(property => {
        const option = document.createElement('option');
        option.value = property.id;
        option.textContent = property.name;
        option.className = 'text-dark';
        dropdown.appendChild(option);
    });
}

// Update filename display when file is selected
function updateFileName(input) {
    const fileNameDisplay = document.getElementById('fileName');
    if (input.files && input.files[0]) {
        const file = input.files[0];
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
        fileNameDisplay.textContent = `${file.name} (${fileSizeMB} MB)`;
    } else {
        fileNameDisplay.textContent = '';
    }
}

// Submit Upload Document Form
async function submitUploadDocument(event) {
    event.preventDefault();

    const propertyId = document.getElementById('docProperty').value;
    const docType = document.getElementById('docType').value;
    const fileInput = document.getElementById('docFile');
    const file = fileInput.files[0];

    if (!file) {
        alert('Please select a file to upload');
        return;
    }

    // Check file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
    }

    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('property_id', propertyId);
        formData.append('document_type', docType);

        const token = localStorage.getItem('access_token');
        const response = await fetch(`${API_BASE_URL}/realestate/documents/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
                // Don't set Content-Type - let browser set it automatically for FormData
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error('Failed to upload document');
        }

        const result = await response.json();
        console.log('✓ Document uploaded successfully', result);

        // Close modal and refresh documents list
        closeUploadDocumentModal();
        await fetchDocuments();

    } catch (error) {
        console.error('Error uploading document:', error);
        alert('Failed to upload document. Please try again.');
    }
}

// Fetch documents from backend
async function fetchDocuments() {
    try {
        const response = await fetch(`${API_BASE_URL}/realestate/documents/`, {
            headers: getAuthHeaders()
        });

        if (response.ok) {
            const documents = await response.json();
            renderDocuments(documents);
        } else {
            console.error('Failed to fetch documents');
            renderDocuments([]);
        }
    } catch (error) {
        console.error('Error fetching documents:', error);
        renderDocuments([]);
    }
}

// Render documents list
function renderDocuments(documents) {
    const container = document.getElementById('documents-list');
    if (!container) return;

    if (documents.length === 0) {
        container.innerHTML = `
            <div class="col-12">
                <div class="glass-card text-center py-5">
                    <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24" class="mx-auto mb-3" style="opacity: 0.3;">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                    </svg>
                    <p class="text-white-50 mb-0">No documents uploaded yet</p>
                    <p class="small text-white-50">Upload property documents to keep them organized</p>
                </div>
            </div>
        `;
        return;
    }

    container.innerHTML = documents.map(doc => {
        const property = REAL_ESTATE_DATA.properties.find(p => p.id === doc.property_id);
        const propertyName = property ? property.name : 'Unknown Property';
        const uploadDate = doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : 'N/A';

        // Get file icon based on type
        const fileIcon = getFileIcon(doc.file_name);
        const fileSize = doc.file_size ? formatFileSize(doc.file_size) : '';

        return `
            <div class="col-md-6 col-lg-4">
                <div class="glass-card p-3 h-100 d-flex flex-column">
                    <div class="d-flex align-items-start gap-3 mb-3">
                        <div class="p-2 rounded-3" style="background: rgba(255,255,255,0.05);">
                            ${fileIcon}
                        </div>
                        <div class="flex-1">
                            <h5 class="small fw-medium text-white-90 mb-1">${doc.document_type}</h5>
                            <p class="small text-white-50 mb-0" style="font-size: 0.75rem;">${propertyName}</p>
                        </div>
                        <button onclick="${safeOnClick('deleteDocument', doc.id)}" class="btn btn-sm p-1 text-white-50 hover-text-danger" title="Delete">
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                        </button>
                    </div>
                    
                    <div class="mb-3">
                        <p class="small text-white-70 mb-1 text-truncate" title="${doc.file_name}">${doc.file_name}</p>
                        <p class="small text-white-50 mb-0" style="font-size: 0.7rem;">${fileSize} • ${uploadDate}</p>
                    </div>

                    <div class="mt-auto">
                        <button onclick="${safeOnClick('viewDocument', doc.file_url)}" class="glass-button w-100 py-2 rounded-3 small d-flex align-items-center justify-content-center gap-2 border-0">
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                            </svg>
                            View Document
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Get file icon based on file extension
function getFileIcon(fileName) {
    const ext = fileName.split('.').pop().toLowerCase();
    const color = 'rgba(255,255,255,0.7)';

    if (ext === 'pdf') {
        return `<svg width="24" height="24" fill="${color}" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"></path>
            <path d="M14 2v6h6M9 13h6M9 17h6M9 9h1"></path>
        </svg>`;
    } else if (['png', 'jpg', 'jpeg'].includes(ext)) {
        return `<svg width="24" height="24" fill="none" stroke="${color}" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>`;
    } else {
        return `<svg width="24" height="24" fill="none" stroke="${color}" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
        </svg>`;
    }
}

// Format file size
function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// Delete document
async function deleteDocument(docId) {
    try {
        const response = await fetch(`${API_BASE_URL}/realestate/documents/${docId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Failed to delete document');
        }

        console.log('✓ Document deleted successfully');
        await fetchDocuments();

    } catch (error) {
        console.error('Error deleting document:', error);
        alert('Failed to delete document. Please try again.');
    }
}

// Current document being previewed
let currentPreviewDocument = null;

// View document with preview modal
async function viewDocument(fileUrl) {
    try {
        // Show the preview modal
        const modal = document.getElementById('document-preview-modal');
        modal.classList.remove('hidden');
        modal.style.display = 'block';

        // Show loading state
        const contentArea = document.getElementById('preview-content');
        contentArea.innerHTML = `
            <div class="h-100 d-flex align-items-center justify-content-center">
                <div class="spinner-border text-white-50" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
        `;

        // Fetch the document with auth
        const response = await fetch(fileUrl, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Failed to fetch document');
        }

        // Get file info from the URL
        const filename = fileUrl.split('/').pop();
        const ext = filename.split('.').pop().toLowerCase();

        // Get the blob
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);

        // Store for download
        currentPreviewDocument = {
            url: blobUrl,
            filename: filename,
            originalUrl: fileUrl
        };

        // Update header with filename
        document.getElementById('preview-doc-name').textContent = filename;

        // Render based on file type
        if (ext === 'pdf') {
            // PDF - use iframe
            contentArea.innerHTML = `
                <iframe src="${blobUrl}" 
                    style="width: 100%; height: 100%; border: none; border-radius: 0.5rem; background: white;"
                    title="PDF Preview">
                </iframe>
            `;
        } else if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) {
            // Images - display directly
            contentArea.innerHTML = `
                <div class="h-100 d-flex align-items-center justify-content-center">
                    <img src="${blobUrl}" 
                        style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 0.5rem;"
                        alt="${filename}">
                </div>
            `;
        } else if (['txt', 'csv', 'json', 'md'].includes(ext)) {
            // Text files - show content
            const text = await blob.text();
            contentArea.innerHTML = `
                <pre class="p-3 rounded-3 h-100 overflow-auto mb-0" 
                    style="background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.9); white-space: pre-wrap; word-wrap: break-word;">
${escapeHtml(text)}
                </pre>
            `;
        } else {
            // Unsupported format (DOCX, DOC, etc.) - show download option
            contentArea.innerHTML = `
                <div class="h-100 d-flex flex-column align-items-center justify-content-center text-center p-4">
                    <svg width="80" height="80" fill="none" stroke="currentColor" viewBox="0 0 24 24" class="mb-4" style="opacity: 0.5;">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                    </svg>
                    <h5 class="text-white-90 mb-2">${filename}</h5>
                    <p class="text-white-50 mb-4">This file type (.${ext}) cannot be previewed in the browser.</p>
                    <button onclick="downloadCurrentDocument()" 
                        class="glass-button px-4 py-2 rounded-pill d-flex align-items-center gap-2">
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                        </svg>
                        Download File
                    </button>
                </div>
            `;
        }

    } catch (error) {
        console.error('Error viewing document:', error);
        const contentArea = document.getElementById('preview-content');
        contentArea.innerHTML = `
            <div class="h-100 d-flex flex-column align-items-center justify-content-center text-center p-4">
                <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24" class="mb-3" style="opacity: 0.5; color: #ef4444;">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
                <h5 class="text-white-90 mb-2">Failed to load document</h5>
                <p class="text-white-50 mb-0">Please try again or download the file directly.</p>
            </div>
        `;
    }
}

// Close document preview modal
function closeDocumentPreview() {
    const modal = document.getElementById('document-preview-modal');
    modal.classList.add('hidden');
    modal.style.display = 'none';

    // Clean up blob URL
    if (currentPreviewDocument && currentPreviewDocument.url) {
        window.URL.revokeObjectURL(currentPreviewDocument.url);
    }
    currentPreviewDocument = null;
}

// Download current document
function downloadCurrentDocument() {
    if (!currentPreviewDocument) return;

    const a = document.createElement('a');
    a.href = currentPreviewDocument.url;
    a.download = currentPreviewDocument.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// Escape HTML for safe text display
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Alias for consistency with other modals
function handleUploadDocument() {
    openUploadDocumentModal();
}

// ============================================
// AI INSIGHTS FUNCTIONS (Rental Yield Optimizer)
// ============================================

// Generate Rental Yield Insights
async function generateYieldInsights() {
    // Check if legacy UI exists (Table Body). If not, we are in the new layout, so skip this legacy logic.
    const tableBody = document.getElementById('insight-yield-table-body');
    if (!tableBody) return;

    try {
        // Show loading state
        tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-5 text-white-50">
                        <div class="spinner-border spinner-border-sm text-primary mb-2" role="status"></div>
                        <div class="small">Analyzing portfolio performance...</div>
                    </td>
                </tr>
            `;

        // Fetch user properties
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${API_BASE_URL}/realestate/properties`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Failed to fetch properties');

        const properties = await response.json();
        const analysis = calculateRentalYields(properties);
        renderYieldInsights(analysis);

    } catch (error) {
        console.error('Error generating AI insights:', error);
        alert('Failed to generate insights. Please try again.');
    }
}

// Calculate yields from property data
function calculateRentalYields(properties) {
    const analysis = {
        totalYield: 0,
        rentedCount: 0,
        averageYield: 0,
        topPerformer: null,
        propertyDetails: []
    };

    // Filter for rented properties or properties with potential
    properties.forEach(prop => {
        // Safe number conversion
        const value = parseFloat(prop.current_value) || parseFloat(prop.purchase_price) || 0;
        const rent = parseFloat(prop.rent_amount) || 0;

        // Calculate yield if value exists
        let annualYield = 0;
        if (value > 0) {
            // If rented, use actual rent. 
            if (prop.status === 'Rented' && rent > 0) {
                annualYield = ((rent * 12) / value) * 100;
                analysis.totalYield += annualYield;
                analysis.rentedCount++;
            }
        }

        // Optimization Insight Generation
        let insight = "No data available";
        let insightColor = "text-white-50";

        if (value === 0) {
            insight = "Update Property Value to see insights";
        } else if (prop.status !== 'Rented') {
            insight = "Vacant - Potential loss of revenue";
            insightColor = "text-warning";
        } else {
            if (annualYield < 2.0) {
                insight = `Low Yield (${annualYield.toFixed(1)}%). Consider rent review.`;
                insightColor = "text-danger";
            } else if (annualYield >= 2.0 && annualYield < 6.0) {
                insight = "Healthy yield. Meets market standards.";
                insightColor = "text-success";
            } else {
                insight = `Exceptional performance! (${annualYield.toFixed(1)}%)`;
                insightColor = "text-success fw-bold";
            }
        }

        const details = {
            id: prop.id,
            name: prop.name,
            value: value,
            annualRent: prop.status === 'Rented' ? rent * 12 : 0,
            yield: annualYield,
            status: prop.status,
            insight: insight,
            insightColor: insightColor
        };

        analysis.propertyDetails.push(details);

        // Check for top performer
        if (details.yield > (analysis.topPerformer?.yield || 0)) {
            analysis.topPerformer = details;
        }
    });

    // Calculate Portfolio Average
    if (analysis.rentedCount > 0) {
        analysis.averageYield = analysis.totalYield / analysis.rentedCount;
    }

    // Sort details by yield descending
    analysis.propertyDetails.sort((a, b) => b.yield - a.yield);

    return analysis;
}

// Render analysis to UI
function renderYieldInsights(analysis) {
    // 1. Update Portfolio Yield
    const avgYieldEl = document.getElementById('insight-avg-yield');
    if (avgYieldEl) avgYieldEl.textContent = `${analysis.averageYield.toFixed(1)}%`;

    // 2. Update Top Performer
    const topPropEl = document.getElementById('insight-top-prop');
    const topYieldEl = document.getElementById('insight-top-yield');

    if (topPropEl && topYieldEl) {
        if (analysis.topPerformer && analysis.topPerformer.yield > 0) {
            topPropEl.textContent = analysis.topPerformer.name;
            topYieldEl.textContent = `${analysis.topPerformer.yield.toFixed(1)}% Yield`;
        } else {
            topPropEl.textContent = "No Data";
            topYieldEl.textContent = "--% Yield";
        }
    }

    // 3. Update Table
    const tableBody = document.getElementById('insight-yield-table-body');
    if (tableBody) {
        if (analysis.propertyDetails.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-5 text-white-50">
                        No properties found. Add properties to see analysis.
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = analysis.propertyDetails.map(prop => `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                <td class="ps-4 py-3">
                    <div class="fw-normal text-white-90">${prop.name}</div>
                    <div class="small text-white-50">${prop.status}</div>
                </td>
                <td class="text-end py-3 text-white-90">${formatCurrency(prop.value)}</td>
                <td class="text-end py-3 text-white-90">${formatCurrency(prop.annualRent)}</td>
                <td class="text-end py-3 font-monospace">
                    <span class="${getImageColorForYield(prop.yield)}">${prop.yield.toFixed(1)}%</span>
                </td>
                <td class="ps-4 pe-4 py-3 text-end small">
                    <span class="${prop.insightColor}">${prop.insight}</span>
                </td>
            </tr>
        `).join('');
    }
}

function getImageColorForYield(yieldVal) {
    if (yieldVal <= 0) return 'text-white-50';
    if (yieldVal < 2.0) return 'text-danger';
    if (yieldVal < 6.0) return 'text-warning'; // Actually decent for residential
    return 'text-success';
}

// Load Asset Allocation Charts for Overview
function loadAssetAllocationCharts(properties) {
    if (typeof Chart === 'undefined') return;

    // 1. Process Data
    const typeCount = {};
    const cityCount = {};
    let rentedCount = 0;
    let totalCount = 0;

    // Check if properties exists and is array
    if (!Array.isArray(properties)) return;

    properties.filter(p => p.status !== 'Sold').forEach(p => {
        totalCount++;

        // Type
        const type = p.type || 'Other';
        typeCount[type] = (typeCount[type] || 0) + 1;

        // Location (City)
        // Extract city from address "123 St, City, State" - naive but works for now
        let city = 'Unknown';
        if (p.address && p.address.includes(',')) {
            const parts = p.address.split(',');
            // Assuming "Street, City, Zip"
            if (parts.length >= 2) {
                city = parts[parts.length - 2].trim();
            } else {
                city = parts[0].trim();
            }
        }
        cityCount[city] = (cityCount[city] || 0) + 1;

        // Occupancy
        if (p.status === 'Rented') rentedCount++;
    });

    // 2. Render Type Chart (Doughnut)
    const ctxType = document.getElementById('chartAssetType');
    if (ctxType) {
        if (ctxType.chart) ctxType.chart.destroy();

        ctxType.chart = new Chart(ctxType, {
            type: 'doughnut',
            data: {
                labels: Object.keys(typeCount),
                datasets: [{
                    data: Object.values(typeCount),
                    backgroundColor: ['rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 0.4)', 'rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.6)', 'rgba(255, 255, 255, 0.1)'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'right', labels: { color: 'white', font: { size: 10 }, boxWidth: 10 } }
                }
            }
        });
    }

    // 3. Render Location Chart (Bar)
    const ctxLoc = document.getElementById('chartLocation');
    if (ctxLoc) {
        if (ctxLoc.chart) ctxLoc.chart.destroy();

        ctxLoc.chart = new Chart(ctxLoc, {
            type: 'bar',
            data: {
                labels: Object.keys(cityCount),
                datasets: [{
                    label: 'Properties',
                    data: Object.values(cityCount),
                    backgroundColor: 'rgba(255, 255, 255, 0.6)',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.5)' } },
                    x: { grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.5)' } }
                }
            }
        });
    }

    // 4. Render Occupancy Gauge (Doughnut)
    const ctxOcc = document.getElementById('chartOccupancy');
    if (ctxOcc) {
        if (ctxOcc.chart) ctxOcc.chart.destroy();

        const occupancyRate = totalCount > 0 ? Math.round((rentedCount / totalCount) * 100) : 0;
        const textEl = document.getElementById('occupancyText');
        if (textEl) textEl.textContent = `${occupancyRate}%`;

        ctxOcc.chart = new Chart(ctxOcc, {
            type: 'doughnut',
            data: {
                labels: ['Rented', 'Vacant/Owned'],
                datasets: [{
                    data: [rentedCount, totalCount - rentedCount],
                    backgroundColor: ['#10B981', 'rgba(255, 255, 255, 0.1)'], // Green for rented
                    borderWidth: 0,
                    circumference: 360,
                    cutout: '85%'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { enabled: false } }
            }
        });
    }
}

// --- AI Chat Logic ---

let chatHistory = [];

function toggleAIChatMode() {
    const questionGrid = document.getElementById('ai-question-grid');
    const chatInterface = document.getElementById('ai-chat-interface');

    if (questionGrid && chatInterface) {
        if (chatInterface.style.display === 'none') {
            // Switch to Chat Mode
            questionGrid.style.display = 'none';
            chatInterface.style.display = 'flex';
            // Focus input
            const input = chatInterface.querySelector('input');
            if (input) input.focus();
        } else {
            // Switch back to Questions Mode
            chatInterface.style.display = 'none';
            questionGrid.style.display = 'flex';
        }
    }
}

function handleAIChat(message) {
    if (!message || message.trim() === "") return;

    // Auto-open chat interface if currently on question grid
    const chatInterface = document.getElementById('ai-chat-interface');
    const placeholder = document.getElementById('ai-chat-placeholder');

    if (chatInterface && chatInterface.style.display === 'none') {
        toggleAIChatMode();
    }

    // Hide placeholder
    if (placeholder) placeholder.style.display = 'none';

    // 1. Add User Message
    addChatMessage(message, 'user');

    // 2. Simulate AI Thinking
    const container = document.getElementById('ai-chat-messages-full');
    const thinkingId = 'thinking-' + Date.now();
    const thinkingHTML = `
        <div id="${thinkingId}" class="d-flex align-items-start gap-2 align-self-start" style="max-width: 85%;">
             <div class="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style="width: 32px; height: 32px; background: rgba(255,255,255,0.1);">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-white"><path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/><path d="M12 16a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2z"/><path d="M2 12a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2 2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z"/><path d="M16 12a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z"/></svg>
            </div>
            <div class="glass-card p-3 rounded-2 rounded-top-right-0 text-white-90 small">
                <span class="typing-dots">Thinking...</span>
            </div>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', thinkingHTML);
    container.scrollTop = container.scrollHeight;

    // 3. Generate Response (Mocked based on data)
    setTimeout(() => {
        const thinkingEl = document.getElementById(thinkingId);
        if (thinkingEl) thinkingEl.remove();

        const response = generateMockAIResponse(message);
        addChatMessage(response, 'ai');
    }, 1500);
}

function addChatMessage(text, sender) {
    const container = document.getElementById('ai-chat-messages-full');
    const isUser = sender === 'user';

    // Icon for AI
    const aiIcon = `
        <div class="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style="width: 32px; height: 32px; background: rgba(255,255,255,0.1);">
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-white"><path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/><path d="M12 16a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2z"/><path d="M2 12a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2 2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z"/><path d="M16 12a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z"/></svg>
        </div>
    `;

    const html = `
        <div class="d-flex ${isUser ? 'justify-content-end' : 'align-items-start gap-2 align-self-start'}" style="width: 100%;">
            ${!isUser ? aiIcon : ''}
            <div class="${isUser ? 'bg-primary text-white rounded-3 p-3' : 'glass-card p-3 rounded-3 text-white-90'} small" style="max-width: 85%; ${isUser ? 'background: rgba(255,255,255,0.1) !important; color: white;' : ''}">
                ${text.replace(/\n/g, '<br>')}
            </div>
        </div>
    `;

    container.insertAdjacentHTML('beforeend', html);
    container.scrollTop = container.scrollHeight;
}

function generateMockAIResponse(question) {
    const q = question.toLowerCase();
    const props = REAL_ESTATE_DATA.properties || [];

    if (q.includes('underperforming') || q.includes('worst')) {
        // Find low yield
        const worst = props.filter(p => p.status === 'Rented').sort((a, b) => {
            // rough yield calc
            const ya = ((a.rent_amount || 0) * 12) / (a.current_value || 1);
            const yb = ((b.rent_amount || 0) * 12) / (b.current_value || 1);
            return ya - yb;
        })[0];

        if (worst) return `Based on yield analysis, **${worst.name}** is currently underperforming with a yield of approx. ${(((worst.rent_amount * 12) / worst.current_value) * 100).toFixed(1)}%. Consider rent review or renovations.`;
        return "I couldn't identify any strictly underperforming assets. All rented properties seem to be performing within acceptable ranges.";
    }

    if (q.includes('hold') && q.includes('sell')) {
        return "Given current market trends, I'd recommend **holding** your core residential assets as property values are projected to rise by 4.5% this year. However, consider selling any properties with consistently low occupancy rates.";
    }

    if (q.includes('risk') || q.includes('exposure')) {
        return "Your portfolio currently has a concentration risk in **Residential** assets (80%). I'd recommend exploring Commercial Opportunities or diversifying geographically to mitigate market-specific downturns.";
    }

    if (q.includes('optimize') || q.includes('improve')) {
        return "To optimize your portfolio:\n1. Increase rent on 'Green Meadows' to match market rates.\n2. Consider refinancing 'Sunset Villa' to leverage its appreciation.\n3. Look into commercial properties for higher yield stability.";
    }

    if (q.includes('hold') || q.includes('sell')) {
        return "For **Green Meadows Apartment**, market analysis suggests a **HOLD**.\n\n- Appreciation: +30.7% (Strong)\n- Yield: 4.2% (Moderate)\n\nThe upcoming metro line nearby is projected to increase value by another 12% in the next 18 months.";
    }

    return "That's an interesting question. Based on your current portfolio data, I'm analyzing the market trends. Could you specify which property you're referring to?";
}

// ================================
// CRYPTO MODULE FUNCTIONS
// ================================

// Crypto Data State
let CRYPTO_DATA = {
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
        // Fetch holdings
        const holdingsResponse = await fetch(`${API_BASE_URL}/crypto/holdings`, {
            headers: getAuthHeaders()
        });

        if (holdingsResponse.ok) {
            CRYPTO_DATA.holdings = await holdingsResponse.json();
        } else if (holdingsResponse.status === 401) {
            console.warn('Unauthorized - logging out');
            logout();
            return;
        }

        // Fetch metrics
        const metricsResponse = await fetch(`${API_BASE_URL}/crypto/metrics`, {
            headers: getAuthHeaders()
        });

        if (metricsResponse.ok) {
            CRYPTO_DATA.metrics = await metricsResponse.json();
        }

        // Render after fetching
        renderCryptoOverview();
        renderCryptoHoldings();
    } catch (error) {
        console.error('Error fetching crypto data:', error);
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

    const noiseTexture = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`;

    const overviewHtml = `
        <div class="d-flex flex-column gap-4">
            <div class="glass-header mb-2 d-flex justify-content-between align-items-center">
                <div>
                    <h2 class="h4 fw-light text-white-90 mb-1">Crypto Overview</h2>
                    <p class="small fw-light text-white-50">Real-time market exposure and portfolio value</p>
                </div>
            </div>
            
            <!-- Metrics Grid (4 Columns) -->
            <div class="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-3">
                <!-- Total Crypto Value -->
                <div class="col">
                    <div class="position-relative p-4 rounded-4 overflow-hidden group transition-all h-100 d-flex flex-column justify-content-center"
                         style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 0 30px 0 rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);">
                        <div class="position-relative z-1 d-flex flex-column gap-2">
                            <div class="text-white-50 mb-1">${ICONS.wallet}</div>
                            <div>
                                <p class="small text-uppercase text-white-50 mb-1" style="letter-spacing: 0.1em; font-size: 0.65rem;">Total Crypto Value</p>
                                <h3 class="h4 fw-light text-white-90 mb-1">${formatCurrency(metrics.total_value)}</h3>
                                <p class="small fw-light ${metrics.change_24h_percent >= 0 ? 'text-success' : 'text-danger'}" style="font-size: 0.75rem;">
                                    ${metrics.change_24h_percent >= 0 ? '+' : ''}${metrics.change_24h_percent.toFixed(2)}% (24h)
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Portfolio Return -->
                <div class="col">
                    <div class="position-relative p-4 rounded-4 overflow-hidden group transition-all h-100 d-flex flex-column justify-content-center"
                         style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 0 30px 0 rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);">
                        <div class="position-relative z-1 d-flex flex-column gap-2">
                            <div class="text-white-50 mb-1">${ICONS.trending}</div>
                            <div>
                                <p class="small text-uppercase text-white-50 mb-1" style="letter-spacing: 0.1em; font-size: 0.65rem;">Portfolio Return</p>
                                <h3 class="h4 fw-light ${metrics.avg_portfolio_return >= 0 ? 'text-success' : 'text-danger'} mb-1">
                                    ${metrics.avg_portfolio_return >= 0 ? '+' : ''}${metrics.avg_portfolio_return.toFixed(1)}%
                                </h3>
                                <p class="small fw-light text-white-50" style="font-size: 0.75rem;">All-time weighted</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Active Assets -->
                <div class="col">
                    <div class="position-relative p-4 rounded-4 overflow-hidden group transition-all h-100 d-flex flex-column justify-content-center"
                         style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 0 30px 0 rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);">
                        <div class="position-relative z-1 d-flex flex-column gap-2">
                            <div class="text-white-50 mb-1">${ICONS.chart}</div>
                            <div>
                                <p class="small text-uppercase text-white-50 mb-1" style="letter-spacing: 0.1em; font-size: 0.65rem;">Active Assets</p>
                                <h3 class="h4 fw-light text-white-90 mb-1">${metrics.total_assets_count}</h3>
                                <p class="small fw-light text-white-50" style="font-size: 0.75rem;">Across all networks</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Network Status -->
                <div class="col">
                    <div class="position-relative p-4 rounded-4 overflow-hidden group transition-all h-100 d-flex flex-column justify-content-center"
                         style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 0 30px 0 rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);">
                        <div class="position-relative z-1 d-flex flex-column gap-2">
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

            <!-- Portfolio Chart Placeholder -->
            <div class="rounded-4 overflow-hidden position-relative" 
                 style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 0 50px 0 rgba(255, 255, 255, 0.05), inset 0 0 20px 0 rgba(255, 255, 255, 0.02); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); height: 300px; padding: 2rem;">
                <div class="d-flex align-items-center justify-between mb-4">
                    <h3 class="small fw-medium text-white-70">Portfolio Performance</h3>
                    <div class="d-flex gap-2">
                        ${['1D', '1W', '1M', '1Y', 'ALL'].map(range => `
                            <button class="px-3 py-1 rounded-pill small" style="background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.4); border: none;">${range}</button>
                        `).join('')}
                    </div>
                </div>
                <svg class="w-100 h-100" preserveAspectRatio="none" viewBox="0 0 100 50" style="position: absolute; bottom: 0; left: 0; right: 0;">
                    <defs>
                        <linearGradient id="cryptoChartGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stop-color="rgba(255, 255, 255, 0.1)" />
                            <stop offset="100%" stop-color="rgba(255, 255, 255, 0)" />
                        </linearGradient>
                    </defs>
                    <path d="M0,45 C20,40 30,20 50,25 C70,30 80,10 100,5 V50 H0 Z" fill="url(#cryptoChartGradient)"/>
                    <path d="M0,45 C20,40 30,20 50,25 C70,30 80,10 100,5" fill="none" stroke="rgba(255, 248, 220, 0.8)" stroke-width="0.5"/>
                </svg>
            </div>
        </div>
    `;

    const container = document.getElementById('crypto-section-overview');
    if (container) {
        container.innerHTML = overviewHtml;
    }
}

function renderCryptoHoldings() {
    const container = document.getElementById('crypto-holdings-list');
    if (!container) return;

    const { holdings } = CRYPTO_DATA;

    if (holdings.length === 0) {
        container.innerHTML = `
            <div class="p-5 text-center">
                <div class="mb-3 text-white-50">No crypto assets found in your portfolio.</div>
                <p class="small text-white-30">Use the section above to add your first asset.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = holdings.map(holding => {
        const totalValue = holding.quantity * holding.current_price;
        const mockChange = (Math.random() * 10 - 4).toFixed(2);
        const isPositive = parseFloat(mockChange) >= 0;

        return `
        <div class="row g-0 p-3 text-white-70 small align-items-center hover-lift transition-colors" style="border-bottom: 1px solid rgba(255,255,255,0.05);">
            <!-- Asset -->
            <div class="col-2">
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
            <!-- Price -->
            <div class="col-2">
                <div class="text-white-80">${formatCurrency(holding.current_price)}</div>
                <div class="d-flex align-items-center gap-1 ${isPositive ? 'text-success' : 'text-danger'}" style="font-size: 0.7rem;">
                    ${isPositive ? ICONS.trending : '<svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></svg>'}
                    ${Math.abs(mockChange)}%
                </div>
            </div>
            <!-- Balance -->
            <div class="col-2">
                <span class="text-white-80">${holding.quantity.toLocaleString()} ${holding.symbol}</span>
            </div>
            <!-- Value -->
            <div class="col-2">
                <span class="text-white fw-medium">${formatCurrency(totalValue)}</span>
            </div>
            <!-- Network -->
            <div class="col-2">
                <span class="badge fw-normal px-3 py-2 rounded-pill small" 
                      style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.7); font-weight: 300;">
                    ${holding.network}
                </span>
            </div>
            <!-- Actions -->
            <div class="col-2 text-end">
                <div class="d-flex justify-content-end gap-2">
                    <button onclick="${safeOnClick('sellCrypto', holding.id)}" 
                            class="btn btn-sm p-0 text-white-50 hover-text-white transition-colors"
                            title="Sell / Edit">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                           <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                           <polyline points="16 7 22 7 22 13"></polyline>
                       </svg>
                    </button>
                    <button onclick="${safeOnClick('removeCrypto', holding.id)}" 
                            class="btn btn-sm p-0 text-white-50 hover-text-danger transition-colors"
                            title="Remove">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
        `;
    }).join('');
}

// Add Crypto Modal Functions
let addCryptoModalOpen = false;

function openAddCryptoModal() {
    const modal = document.getElementById('add-crypto-modal');
    if (modal) {
        modal.style.display = 'block';
        addCryptoModalOpen = true;
    }
}

function closeAddCryptoModal() {
    const modal = document.getElementById('add-crypto-modal');
    if (modal) {
        modal.style.display = 'none';
        addCryptoModalOpen = false;
        // Reset form
        document.getElementById('addCryptoForm')?.reset();
        // Hide search results
        document.getElementById('cryptoSearchResults')?.classList.add('d-none');
        // Clear selected crypto
        selectedCryptoId = null;
    }
}

// CoinCap API Constants
const COINCAP_API_BASE = 'https://api.coincap.io/v2';
const COINCAP_API_KEY = '38af8494b535f54c74ad1932bb3026ca2c000e14df571ecad3e98f1bbbcde77a'; // Your CoinCap API key
const USD_TO_INR_RATE = 83.12;

// Search state
let cryptoSearchTimeout = null;
let selectedCryptoId = null;

/**
 * Handle crypto search input with debounce
 */
function handleCryptoSearch(query) {
    // Clear previous timeout
    if (cryptoSearchTimeout) {
        clearTimeout(cryptoSearchTimeout);
    }

    const searchInput = document.getElementById('cryptoSearch');
    const spinner = document.getElementById('cryptoSearchSpinner');
    const resultsContainer = document.getElementById('cryptoSearchResults');

    if (!query || query.trim().length < 2) {
        resultsContainer.classList.add('d-none');
        return;
    }

    // Show spinner
    spinner?.classList.remove('d-none');

    // Debounce search by 500ms
    cryptoSearchTimeout = setTimeout(async () => {
        try {
            const results = await searchCryptoAPI(query);
            renderCryptoSearchResults(results);
        } catch (error) {
            console.error('Crypto search error:', error);
            resultsContainer.innerHTML = '<div class="p-3 text-white-50 text-center">Search failed. Try manual entry.</div>';
            resultsContainer.classList.remove('d-none');
        } finally {
            spinner?.classList.add('d-none');
        }
    }, 500);
}

/**
 * Search CoinCap API for cryptocurrencies
 */
async function searchCryptoAPI(query) {
    const response = await fetch(`${COINCAP_API_BASE}/assets?limit=100`, {
        headers: {
            'Authorization': `Bearer ${COINCAP_API_KEY}`
        }
    });

    if (!response.ok) {
        throw new Error(`CoinCap API error: ${response.status}`);
    }

    const data = await response.json();
    const assets = data.data;

    // Filter by query (name or symbol)
    const normalizedQuery = query.toLowerCase();
    const filtered = assets.filter(asset => {
        const name = asset.name.toLowerCase();
        const symbol = asset.symbol.toLowerCase();
        return name.includes(normalizedQuery) || symbol.includes(normalizedQuery);
    });

    // Take top 10 results
    return filtered.slice(0, 10).map(asset => ({
        id: asset.id,
        name: asset.name,
        symbol: asset.symbol,
        priceUsd: parseFloat(asset.priceUsd),
        priceInr: parseFloat(asset.priceUsd) * USD_TO_INR_RATE,
        changePercent24Hr: parseFloat(asset.changePercent24Hr) || 0,
        rank: parseInt(asset.rank)
    }));
}

/**
 * Render crypto search results dropdown
 */
function renderCryptoSearchResults(results) {
    const container = document.getElementById('cryptoSearchResults');

    if (results.length === 0) {
        container.innerHTML = '<div class="p-3 text-white-50 text-center">No cryptocurrencies found</div>';
        container.classList.remove('d-none');
        return;
    }

    container.innerHTML = results.map(crypto => {
        const changeClass = crypto.changePercent24Hr >= 0 ? 'text-success' : 'text-danger';
        const changeSign = crypto.changePercent24Hr >= 0 ? '+' : '';

        return `
        <button type="button" onclick="${safeOnClick('selectCrypto', crypto.id, crypto.symbol, crypto.name, crypto.priceInr, crypto.changePercent24Hr)}"
            class="w-100 d-flex align-items-center justify-content-between p-3 border-bottom border-white border-opacity-5 text-start hover-bg-light transition-colors"
            style="background: transparent; border: none; cursor: pointer;">
            <div>
                <div class="text-white fw-medium">${crypto.name}</div>
                <div class="text-white-50 small">${crypto.symbol.toUpperCase()}</div>
            </div>
            <div class="text-end">
                <div class="text-white fw-medium">${formatCurrency(crypto.priceInr)}</div>
                <div class="small ${changeClass}">
                    ${changeSign}${Math.abs(crypto.changePercent24Hr).toFixed(2)}%
                </div>
            </div>
        </button>
        `;
    }).join('');

    container.classList.remove('d-none');
}

/**
 * Select a crypto from search results and populate form
 */
function selectCrypto(id, symbol, name, priceInr, changePercent) {
    selectedCryptoId = id;

    // Populate form fields
    document.getElementById('cryptoSymbol').value = symbol.toUpperCase();
    document.getElementById('cryptoName').value = name;
    document.getElementById('cryptoCurrentPrice').value = priceInr.toFixed(2);

    // Try to auto-select network based on symbol
    const networkMap = {
        'BTC': 'Bitcoin',
        'ETH': 'Ethereum',
        'SOL': 'Solana',
        'ADA': 'Cardano',
        'DOT': 'Polkadot',
        'AVAX': 'Avalanche',
        'MATIC': 'Polygon',
        'BNB': 'Binance Smart Chain',
        'ARB': 'Arbitrum',
        'OP': 'Optimism'
    };

    const network = networkMap[symbol.toUpperCase()] || '';
    if (network) {
        selectCryptoNetwork(network);
    } else {
        // Reset selection if no match
        document.getElementById('cryptoNetwork').value = '';
        document.querySelectorAll('#cryptoNetworkOptions button').forEach(btn => {
            btn.classList.remove('bg-white', 'text-black');
            btn.classList.add('glass-button');
        });
    }

    // Clear search and hide dropdown
    document.getElementById('cryptoSearch').value = '';
    document.getElementById('cryptoSearchResults').classList.add('d-none');

    // Update price timestamp
    const now = new Date().toLocaleTimeString();
    const updateTimeEl = document.getElementById('priceUpdateTime');
    if (updateTimeEl) updateTimeEl.textContent = `Updated: ${now}`;

    // Reset calculations
    calculateCryptoTotals();

    // Focus on quantity field
    document.getElementById('cryptoQuantity').focus();
}

/**
 * Calculate and update total investment, current value, and profit/loss
 */
function calculateCryptoTotals() {
    const quantity = parseFloat(document.getElementById('cryptoQuantity')?.value) || 0;
    const avgPrice = parseFloat(document.getElementById('cryptoAvgPrice')?.value) || 0;
    const currentPrice = parseFloat(document.getElementById('cryptoCurrentPrice')?.value) || 0;

    const totalInvestment = quantity * avgPrice;
    const currentValue = quantity * currentPrice;
    const profitLoss = currentValue - totalInvestment;
    const profitLossPercent = avgPrice > 0 ? ((currentPrice - avgPrice) / avgPrice) * 100 : 0;

    // Update display elements
    const totalInvestmentEl = document.getElementById('totalInvestment');
    const currentValueEl = document.getElementById('currentValue');
    const plElement = document.getElementById('profitLoss');
    const plPercentElement = document.getElementById('profitLossPercent');

    if (totalInvestmentEl) totalInvestmentEl.textContent = formatCurrency(totalInvestment);
    if (currentValueEl) currentValueEl.textContent = formatCurrency(currentValue);

    if (plElement) {
        plElement.textContent = formatCurrency(profitLoss);
        // Color coding for profit/loss
        const colorClass = profitLoss >= 0 ? 'text-success' : 'text-danger';
        plElement.className = `h5 fw-light mb-0 ${colorClass}`;
    }

    if (plPercentElement) {
        plPercentElement.textContent = `${profitLossPercent >= 0 ? '+' : ''}${profitLossPercent.toFixed(2)}%`;
        const colorClass = profitLossPercent >= 0 ? 'text-success' : 'text-danger';
        plPercentElement.className = `h5 fw-light mb-0 ${colorClass}`;
    }
}

/**
 * Refresh current crypto price from CoinCap API
 */
async function refreshCryptoPrice() {
    if (!selectedCryptoId) {
        alert('Please select a cryptocurrency first');
        return;
    }

    const priceField = document.getElementById('cryptoCurrentPrice');
    const updateTimeField = document.getElementById('priceUpdateTime');

    try {
        // Show loading state
        if (priceField) priceField.style.opacity = '0.5';

        const response = await fetch(`${COINCAP_API_BASE}/assets/${selectedCryptoId}`, {
            headers: {
                'Authorization': `Bearer ${COINCAP_API_KEY}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch price');

        const data = await response.json();
        const asset = data.data;

        const priceInr = parseFloat(asset.priceUsd) * USD_TO_INR_RATE;
        if (priceField) priceField.value = priceInr.toFixed(2);

        // Update timestamp
        const now = new Date().toLocaleTimeString();
        if (updateTimeField) {
            updateTimeField.textContent = `Updated: ${now}`;
            updateTimeField.style.color = 'rgba(74, 222, 128, 0.6)';
        }

        // Recalculate totals
        calculateCryptoTotals();

    } catch (error) {
        console.error('Error refreshing price:', error);
        alert('Failed to refresh price. Please try again.');
    } finally {
        if (priceField) priceField.style.opacity = '1';
    }
}


async function submitAddCrypto(event) {
    event.preventDefault();

    const formData = {
        symbol: document.getElementById('cryptoSymbol').value.toUpperCase(),
        name: document.getElementById('cryptoName').value,
        network: document.getElementById('cryptoNetwork').value,
        quantity: parseFloat(document.getElementById('cryptoQuantity').value) || 0,
        purchase_price_avg: parseFloat(document.getElementById('cryptoAvgPrice').value) || 0,
        current_price: parseFloat(document.getElementById('cryptoCurrentPrice').value) || 0
    };

    try {
        const response = await fetch(`${API_BASE_URL}/crypto/holdings`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            closeAddCryptoModal();
            await fetchCryptoData();
        } else {
            const error = await response.json();
            console.error('API Error Details:', error);
            const errorMessage = typeof error.detail === 'object'
                ? JSON.stringify(error.detail)
                : (error.detail || JSON.stringify(error));
            alert('Error adding crypto: ' + errorMessage);
        }
    } catch (error) {
        console.error('Error adding crypto:', error);
        alert('Error adding crypto. Please try again.');
    }
}

async function sellCrypto(holdingId) {
    const holding = CRYPTO_DATA.holdings.find(h => h.id === holdingId);
    if (!holding) return;

    const quantity = prompt(`Enter quantity to sell (max: ${holding.quantity}):`);
    if (!quantity) return;

    const sellPrice = prompt(`Enter sell price per ${holding.symbol}:`);
    if (!sellPrice) return;

    try {
        const response = await fetch(`${API_BASE_URL}/crypto/holdings/${holdingId}/sell`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                quantity: parseFloat(quantity),
                sell_price: parseFloat(sellPrice)
            })
        });

        if (response.ok) {
            await fetchCryptoData();
        } else {
            const error = await response.json();
            alert('Error selling crypto: ' + (error.detail || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error selling crypto:', error);
    }
}

async function removeCrypto(holdingId) {
    const holding = CRYPTO_DATA.holdings.find(h => h.id === holdingId);
    if (!holding) return;

    if (!confirm(`Are you sure you want to remove ${holding.quantity} ${holding.symbol} from your holdings?`)) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/crypto/holdings/${holdingId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (response.ok) {
            await fetchCryptoData();
        } else {
            alert('Error removing crypto');
        }
    } catch (error) {
        console.error('Error removing crypto:', error);
    }
}

// Initialize event listeners for crypto modal calculations
// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCryptoCalculations);
} else {
    initCryptoCalculations();
}

function initCryptoCalculations() {
    // Attach listeners to quantity and price fields for real-time calculations
    const quantityField = document.getElementById('cryptoQuantity');
    const avgPriceField = document.getElementById('cryptoAvgPrice');
    const currentPriceField = document.getElementById('cryptoCurrentPrice');

    if (quantityField) quantityField.addEventListener('input', calculateCryptoTotals);
    if (avgPriceField) avgPriceField.addEventListener('input', calculateCryptoTotals);
    if (currentPriceField) currentPriceField.addEventListener('input', calculateCryptoTotals);
}

// Bonds Data Fetcher
async function fetchBondsData() {
    try {
        const response = await fetch(`${API_BASE_URL}/bonds/`, {
            headers: getAuthHeaders()
        });

        if (response.ok) {
            console.log('Bonds data fetched successfully');
        } else {
            if (response.status === 401) {
                console.warn('Unauthorized - logging out');
                logout();
                return;
            }
            console.error('Failed to fetch bonds');
        }
    } catch (error) {
        console.error('Error fetching bonds data:', error);
    }
}

// Business Data Fetcher
async function fetchBusinessData() {
    try {
        const response = await fetch(`${API_BASE_URL}/business/`, {
            headers: getAuthHeaders()
        });

        if (response.ok) {
            console.log('Business data fetched successfully');
        } else {
            if (response.status === 401) {
                console.warn('Unauthorized - logging out');
                logout();
                return;
            }
            console.error('Failed to fetch business ventures');
        }
    } catch (error) {
        console.error('Error fetching business data:', error);
    }
}


/**
 * Handle Network Pill Selection
 */
function selectCryptoNetwork(network, btnElement) {
    const hiddenInput = document.getElementById('cryptoNetwork');
    if (hiddenInput) {
        hiddenInput.value = network;
    }

    // Visual feedback
    const container = document.getElementById('cryptoNetworkOptions');
    if (container) {
        // Reset all buttons
        container.querySelectorAll('button').forEach(btn => {
            btn.classList.remove('bg-white', 'text-black');
            btn.classList.add('glass-button');

            // Handles auto-selection case where btnElement is null
            if (!btnElement && btn.textContent.trim() === network) {
                btn.classList.remove('glass-button');
                btn.classList.add('bg-white', 'text-black');
            }
            if (!btnElement && network === 'Binance Smart Chain' && btn.textContent.trim() === 'BSC') {
                btn.classList.remove('glass-button');
                btn.classList.add('bg-white', 'text-black');
            }
        });

        // Highlight clicked button
        if (btnElement) {
            btnElement.classList.remove('glass-button');
            btnElement.classList.add('bg-white', 'text-black');
        }
    }
}

// Expose to window
window.selectCryptoNetwork = selectCryptoNetwork;
