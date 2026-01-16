// Dashboard JavaScript - Aether Portfolio Management
// EXACT REPLICA OF OLD WEBSITE STRUCTURE

// Sidebar configurations per source (from browser inspection)
const SIDEBAR_CONFIG = {
    realestate: [
        { icon: 'home', text: 'Dashboard', id: 'dashboard', active: true },
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
        { icon: 'home', text: 'Dashboard', id: 'dashboard', active: true },
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
        { icon: 'home', text: 'Dashboard', id: 'dashboard', active: true },
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
        { icon: 'home', text: 'Dashboard', id: 'dashboard', active: true },
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
        { icon: 'home', text: 'Dashboard', id: 'dashboard', active: true },
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
let currentSource = 'realestate';
let currentSection = 'Dashboard';

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
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_email');
    window.location.href = 'index.html';
}

// Switch source
function switchSource(source) {
    currentSource = source;
    currentSection = 'Dashboard'; // Reset to dashboard when switching source

    // Update top nav active state
    document.querySelectorAll('[data-source]').forEach(btn => {
        if (btn.dataset.source === source) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Update breadcrumb
    updateBreadcrumb();

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
        // Show dashboard by default
        const dashboardSection = document.getElementById('realestate-section-dashboard');
        if (dashboardSection) dashboardSection.style.display = 'block';
    }

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
        } else {
            console.warn(`Section realestate-section-${sectionId} not found`);
            // Fallback to dashboard if known section fails finding
            const dashboard = document.getElementById('realestate-section-dashboard');
            if (dashboard) dashboard.style.display = 'block';
        }
    }

    console.log(`Navigated to ${currentSource} - ${currentSection}`);
}

// Update breadcrumb
function updateBreadcrumb() {
    document.getElementById('breadcrumb').innerHTML = `Home / ${SOURCE_NAMES[currentSource]} / ${currentSection}`;
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

// Real Estate Mock Data
const REAL_ESTATE_DATA = {
    properties: [
        {
            id: 1,
            name: 'Empire States',
            location: 'Noida, Delhi',
            fullAddress: 'Noida, Delhi - 000000',
            type: 'Residential',
            status: 'Owned', // Owned, Rented
            purchasePrice: 15000000,
            currentValue: 21000000,
            coordinates: { lat: '0.0000', lng: '0.0000' },
            landArea: 2400,
            landUnit: 'sq ft',
            acquisitionDate: '2022-01-15',
            holdingDuration: '2 years',
            ownershipStructure: 'Individual',
            loanToValue: 0
        },
        {
            id: 2,
            name: 'Garden of Eve',
            location: 'Frankfurt, Germany',
            fullAddress: 'Frankfurt, Germany - 000000',
            type: 'Land',
            status: 'Owned',
            purchasePrice: 75000000,
            currentValue: 78500000,
            coordinates: { lat: '0.0000', lng: '0.0000' },
            landArea: 5000,
            landUnit: 'sq ft',
            acquisitionDate: '2023-06-01',
            holdingDuration: '7 months',
            ownershipStructure: 'Individual',
            loanToValue: 10
        },
        {
            id: 3,
            name: 'Sunrise Apartment',
            location: 'Mumbai, Maharashtra',
            fullAddress: 'Mumbai, Maharashtra - 000000',
            type: 'Commercial',
            status: 'Owned',
            purchasePrice: 10000000, // example fix: was 0 in screenshot, using realistic
            currentValue: 12500000,
            coordinates: { lat: '20.0000', lng: '72.9000' },
            landArea: 1200,
            landUnit: 'sq ft',
            acquisitionDate: '2021-03-10',
            holdingDuration: '3 years',
            ownershipStructure: 'Corporate',
            loanToValue: 40
        },
        {
            id: 4,
            name: 'Ananya Apartment',
            location: 'Bangalore, Karnataka',
            fullAddress: 'Bangalore, Karnataka - 560001',
            type: 'Residential',
            status: 'Rented',
            purchasePrice: 8000000,
            currentValue: 9500000,
            coordinates: { lat: '12.9716', lng: '77.5946' },
            tenant: 'John Doe',
            rentAmount: 45000,
            rentFrequency: 'Monthly'
        },
        {
            id: 5,
            name: 'Noon Villa',
            location: 'Goa',
            fullAddress: 'Panjim, Goa - 403001',
            type: 'Residential',
            status: 'Rented',
            purchasePrice: 25000000,
            currentValue: 32000000,
            coordinates: { lat: '15.2993', lng: '74.1240' },
            tenant: 'Jane Smith',
            rentAmount: 120000,
            rentFrequency: 'Monthly'
        }
    ],
    transactions: [
        { type: 'Rent', property: 'Ananya Apartment', value: 150000, payment: 'Cash', date: '13 Jan 2026', duration: '-', gainLoss: '-' },
        { type: 'Rent', property: 'Noon Villa', value: 1000000, payment: 'Cash', date: '13 Jan 2026', duration: '-', gainLoss: '-' },
        { type: 'Sell', property: 'Sunset Villa', value: 6500000, payment: 'Cash', date: '9 Jan 2026', duration: '0 months', gainLoss: '+₹15.0L' }
    ],
    // Mock Performance Data for Chart
    performance: [
        { month: 'Jan', value: 15000000 },
        { month: 'Feb', value: 15500000 },
        { month: 'Mar', value: 16200000 },
        { month: 'Apr', value: 17500000 },
        { month: 'May', value: 17200000 },
        { month: 'Jun', value: 18500000 },
        { month: 'Jul', value: 19500000 }
    ]
};

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
    const totalValuation = activeProperties.reduce((sum, p) => sum + p.currentValue, 0);
    const totalEquity = activeProperties.reduce((sum, p) => sum + p.currentValue, 0); // Assuming 100% equity for now

    // Appreciation Calculation
    const totalPurchase = activeProperties.reduce((sum, p) => sum + p.purchasePrice, 0);
    const avgAppreciation = totalPurchase > 0
        ? ((totalValuation - totalPurchase) / totalPurchase) * 100
        : 0;

    const monthlyRentalIncome = activeProperties.reduce((sum, p) => sum + (p.rentAmount || 0), 0);

    return { totalProperties, totalValuation, totalEquity, avgAppreciation, monthlyRentalIncome };
}

// Render Functions
function renderRealEstateDashboard() {
    const metrics = calculateRealEstateMetrics();

    // Noise Texture SVG Data URL
    const noiseTexture = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`;

    const dashboardHtml = `
        <div class="d-flex flex-column gap-4">
             <div class="glass-header mb-2 container-fluid px-0">
                <h2 class="h4 fw-light text-white-90 mb-1">Portfolio Value Trend</h2>
                 <p class="small fw-light text-white-50">Value movement across owned real estate assets over time</p>
            </div>
            
            <!-- Graph Placeholder (Using Chart.js container) -->
            <div class="glass-card mb-4 rounded-4 overflow-hidden position-relative" style="height: 300px; padding: 2rem;">
                 <canvas id="realEstateChart"></canvas>
            </div>

            <!-- Metrics Grid (5 Columns) -->
            <div class="row row-cols-1 row-cols-md-2 row-cols-lg-5 g-3">
                <!-- Total Properties -->
                <div class="col">
                    <div class="position-relative p-4 rounded-4 overflow-hidden group transition-all glass-card h-100 d-flex flex-column justify-content-center">
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
                    <div class="position-relative p-4 rounded-4 overflow-hidden group transition-all glass-card h-100 d-flex flex-column justify-content-center">
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
                    <div class="position-relative p-4 rounded-4 overflow-hidden group transition-all glass-card h-100 d-flex flex-column justify-content-center">
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
                    <div class="position-relative p-4 rounded-4 overflow-hidden group transition-all glass-card h-100 d-flex flex-column justify-content-center">
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
                    <div class="position-relative p-4 rounded-4 overflow-hidden group transition-all glass-card h-100 d-flex flex-column justify-content-center">
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
        </div>
    `;

    const dashboardContainer = document.getElementById('realestate-section-dashboard');
    if (dashboardContainer) {
        dashboardContainer.innerHTML = dashboardHtml;

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
    }
}

function renderRealEstateProperties() {
    const container = document.getElementById('properties-grid');
    if (!container) return;

    // Noise Texture SVG Data URL
    const noiseTexture = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`;

    container.innerHTML = REAL_ESTATE_DATA.properties.map(property => {
        const appreciation = calculateAppreciation(property.currentValue, property.purchasePrice);

        return `
        <div class="col">
            <div class="position-relative p-4 rounded-4 overflow-hidden group transition-all glass-card h-100" style="transition: transform 0.3s ease;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                <!-- Hover Texture -->
                <div class="position-absolute top-0 start-0 w-100 h-100 pointer-events-none opacity-0 group-hover-opacity-100 transition-opacity z-0" style="background-image: ${noiseTexture}; opacity: 0.06; mix-blend-mode: overlay;"></div>

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
                                    <div class="text-white-70">${property.fullAddress.split(',')[0]}</div>
                                    <div>${property.fullAddress.split(',')[1] || ''}</div>
                                </div>
                            </div>

                            <!-- Coordinates -->
                            <div class="d-flex align-items-center gap-3 small fw-light text-white-50 ms-4 mt-1" style="font-family: monospace; font-size: 0.75rem;">
                                <span>Lat: ${property.coordinates.lat}°</span>
                                <span>•</span>
                                <span>Long: ${property.coordinates.lng}°</span>
                            </div>
                        </div>
                    </div>

                    <!-- Financial Details -->
                    <div class="row g-3">
                        <div class="col-6">
                            <p class="small text-uppercase text-white-50 mb-1" style="font-size: 0.65rem; letter-spacing: 0.1em;">Purchase Value</p>
                            <p class="small fw-light text-white-70 mb-0">${formatCurrency(property.purchasePrice)}</p>
                        </div>
                        <div class="col-6">
                            <p class="small text-uppercase text-white-50 mb-1" style="font-size: 0.65rem; letter-spacing: 0.1em;">Current Value</p>
                            <p class="small fw-light text-white-90 mb-0">${formatCurrency(property.currentValue)}</p>
                        </div>
                    </div>

                    <!-- Appreciation Badge -->
                    <div class="d-flex align-items-center justify-content-between pt-3 border-top border-white border-opacity-10 mt-auto">
                        <div class="d-flex align-items-center gap-2">
                            <div class="text-success">${ICONS.trending}</div>
                            <span class="small fw-light text-success">+${appreciation.toFixed(1)}%</span>
                            <span class="small fw-light text-white-50">appreciation</span>
                        </div>

                        <!-- View Details Button -->
                        <button onclick="openPropertyModal(${property.id})" class="glass-button rounded-pill px-3 py-1 small">
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

function renderRealEstateTransactions() {
    const container = document.getElementById('transaction-list');
    if (!container) return;

    container.innerHTML = REAL_ESTATE_DATA.transactions.map(tx => `
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
            <div class="col-4 text-white">${tx.property}</div>
            <div class="col-2">${typeof tx.value === 'number' ? formatCurrency(tx.value) : tx.value}</div>
            <div class="col-2">${tx.date}</div>
            <div class="col-2 ${tx.gainLoss.startsWith('+') ? 'text-success' : 'text-white-50'}">${tx.gainLoss}</div>
        </div>
    `).join('');
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
                <button class="glass-button w-100 p-3 rounded-4 border border-white border-opacity-10 hover-bg-light transition-colors d-flex align-items-center justify-content-center gap-2 text-white-90">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11.542 16M15 7a6 6 0 01-1.461-2.45M21 12c-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7 0-.402.036-.796.105-1.182m-2.833-.118C5.064 3.02 2.768 7.057 4 12c1.274 4.057 5.064 7 9.542 7 1.579 0 3.064-.366 4.39-1.02m-4.39 1.02V11"></path></svg>
                    Rent Property
                </button>
            </div>
            <div class="col-6">
                <button class="btn btn-light w-100 p-3 rounded-4 hover-bg-light transition-colors d-flex align-items-center justify-content-center gap-2 fw-medium border-0">
                    Sell Property 
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                </button>
            </div>
        </div>

        <div class="d-flex flex-column gap-5">
            <!-- Property Specifications -->
            <div>
                <h3 class="small text-uppercase text-white-50 mb-3" style="letter-spacing: 0.1em;">Property Specifications</h3>
                <div class="row row-cols-2 row-cols-md-4 g-3">
                     <div class="col">
                        <div class="p-4 rounded-4 h-100" style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05);">
                            <div class="text-white-50 mb-2">${ICONS.home}</div>
                            <p class="small fw-light text-white-50 mb-1" style="letter-spacing: 0.05em;">Land Area</p>
                            <p class="small fw-light text-white-90 mb-0">${property.landArea || 0} ${property.landUnit || 'sq ft'}</p>
                        </div>
                    </div>
                     <div class="col">
                        <div class="p-4 rounded-4 h-100" style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05);">
                            <div class="text-white-50 mb-2">${ICONS.home}</div>
                            <p class="small fw-light text-white-50 mb-1" style="letter-spacing: 0.05em;">Type</p>
                            <p class="small fw-light text-white-90 mb-0">${property.type}</p>
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
                        <div class="p-4 rounded-4 h-100" style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08);">
                            <div class="text-white-50 mb-3">${ICONS.wallet}</div>
                            <p class="small fw-light text-white-50 mb-2" style="letter-spacing: 0.05em;">Current Market Value</p>
                            <p class="h5 fw-light text-white-90 mb-1">${formatCurrency(property.currentValue)}</p>
                            <p class="small fw-light text-white-50 mb-0">Current valuation</p>
                        </div>
                    </div>
                    <div class="col">
                         <div class="p-4 rounded-4 h-100" style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08);">
                            <div class="text-white-50 mb-3">${ICONS.wallet}</div>
                            <p class="small fw-light text-white-50 mb-2" style="letter-spacing: 0.05em;">Outstanding Mortgage</p>
                            <p class="h5 fw-light text-white-90 mb-1">₹0.00 Cr</p>
                            <p class="small fw-light text-white-50 mb-0">Fully owned</p>
                        </div>
                    </div>
                     <div class="col">
                         <div class="p-4 rounded-4 h-100" style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08);">
                            <div class="text-white-50 mb-3">${ICONS.trending}</div>
                            <p class="small fw-light text-white-50 mb-2" style="letter-spacing: 0.05em;">Equity</p>
                            <p class="h5 fw-light text-white-90 mb-1">${formatCurrency(property.currentValue)}</p>
                            <p class="small fw-light text-white-50 mb-0">Your ownership value</p>
                        </div>
                    </div>
                    <div class="col">
                        <div class="p-4 rounded-4 h-100" style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08);">
                             <div class="text-white-50 mb-3"><svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"></path></svg></div>
                            <p class="small fw-light text-white-50 mb-2" style="letter-spacing: 0.05em;">Loan-to-Value Ratio</p>
                            <p class="h5 fw-light text-white-90 mb-1">${(property.loanToValue || 0).toFixed(1)}%</p>
                            <p class="small fw-light text-white-50 mb-0">Low risk</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Ownership Metadata -->
            <div>
                <h3 class="small text-uppercase text-white-50 mb-3" style="letter-spacing: 0.1em;">Ownership Metadata</h3>
                <div class="row row-cols-1 row-cols-md-3 g-3">
                    <div class="col">
                         <div class="p-4 rounded-4 h-100" style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05);">
                             <div class="text-white-50 mb-3"><svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>
                            <p class="small fw-light text-white-50 mb-2" style="letter-spacing: 0.05em;">Acquisition Date</p>
                            <p class="small fw-light text-white-90 mb-0">${property.acquisitionDate || 'N/A'}</p>
                        </div>
                    </div>
                    <div class="col">
                         <div class="p-4 rounded-4 h-100" style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05);">
                             <div class="text-white-50 mb-3"><svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>
                            <p class="small fw-light text-white-50 mb-2" style="letter-spacing: 0.05em;">Holding Duration</p>
                            <p class="small fw-light text-white-90 mb-0">${property.holdingDuration || '0 months'}</p>
                        </div>
                    </div>
                     <div class="col">
                         <div class="p-4 rounded-4 h-100" style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05);">
                             <div class="text-white-50 mb-3"><svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg></div>
                            <p class="small fw-light text-white-50 mb-2" style="letter-spacing: 0.05em;">Ownership Structure</p>
                            <p class="small fw-light text-white-90 mb-0">${property.ownershipStructure || 'Individual'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function closePropertyModal() {
    document.getElementById('property-modal').classList.add('hidden');
}

// Action Functions
function handleAddProperty() {
    // Simple prompt-based flow for prototype
    const name = prompt("Enter Property Name:");
    if (!name) return;

    const location = prompt("Enter Location (City, State):");
    if (!location) return;

    const priceInput = prompt("Enter Purchase Price (in numbers):");
    const price = parseFloat(priceInput);
    if (isNaN(price)) {
        alert("Invalid price entered.");
        return;
    }

    const newProperty = {
        id: REAL_ESTATE_DATA.properties.length + 1,
        name: name,
        location: location,
        fullAddress: `${location} - 000000`,
        type: 'Residential', // Default
        status: 'Owned',
        purchasePrice: price,
        currentValue: price, // Starts at purchase price
        coordinates: { lat: '0.0000', lng: '0.0000' }
    };

    REAL_ESTATE_DATA.properties.push(newProperty);

    // Refresh UI
    renderRealEstateDashboard();
    renderRealEstateProperties();

    alert("Property added successfully!");
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

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    requireAuth();

    // Set user email
    const userEmail = localStorage.getItem('user_email') || 'user@example.com';
    document.getElementById('userEmail').textContent = userEmail;

    // Initialize with Real Estate
    updateSidebar();
    updateBreadcrumb();

    // Initial Render
    renderRealEstateDashboard();
    renderRealEstateProperties();
    renderRealEstateTransactions();

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
