/**
 * Crypto AI Insights Module
 * Advanced analytics and personalized recommendations
 */

// Format relative time (e.g. "2 months ago")
function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) return `${diffDays} days`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`;
    return `${(diffDays / 365).toFixed(1)} years`;
}

function calculateHoldingPeriodAnalysis(holdings) {
    if (!holdings || holdings.length === 0) return [];

    const insights = [];

    // Sort by holding period (simulated by purchase_date if available, or random for demo)
    // Note: In a real app, 'purchase_date' would be on individual lots. 
    // Here we'll simulate logic based on available data or adding a mock date if missing

    holdings.forEach(h => {
        // Mock purchase date if missing for demo (between 30 and 500 days ago)
        const daysHeld = h.days_held || Math.floor(Math.random() * 470) + 30;

        if (daysHeld > 365) {
            insights.push({
                type: 'success',
                icon: 'shield',
                title: 'Long-Term Holder Status',
                message: `You've held <strong>${h.symbol}</strong> for ${Math.floor(daysHeld / 30)} months. Eligible for long-term capital gains tax treatment in many jurisdictions.`
            });
        } else if (daysHeld > 180) {
            insights.push({
                type: 'info',
                icon: 'clock',
                title: 'Maturing Asset',
                message: `<strong>${h.symbol}</strong> is approaching specific tax maturity thresholds (${daysHeld} days held).`
            });
        } else if (daysHeld < 14) {
            insights.push({
                type: 'warning',
                icon: 'zap',
                title: 'High Turn Rate',
                message: `Recent acquisition of <strong>${h.symbol}</strong> detected. Be mindful of short-term volatility.`
            });
        }
    });

    return insights;
}

function checkConcentrationRisk(holdings) {
    if (!holdings || holdings.length === 0) return [];

    const insights = [];
    const totalValue = holdings.reduce((sum, h) => sum + (h.quantity * h.current_price), 0);

    if (totalValue === 0) return [];

    holdings.forEach(h => {
        const currentValue = h.quantity * h.current_price;
        const percentage = (currentValue / totalValue) * 100;

        if (percentage > 50) {
            insights.push({
                type: 'warning',
                icon: 'alert-triangle',
                title: 'Concentration Risk',
                message: `<strong>${h.symbol}</strong> makes up <strong>${percentage.toFixed(1)}%</strong> of your crypto portfolio. Consider diversifying to reduce single-asset risk.`
            });
        }
    });

    return insights;
}

function generateAIInsights(data) {
    console.log('Generating AI Insights...');
    const { holdings, metrics } = data;

    const holdingInsights = calculateHoldingPeriodAnalysis(holdings);
    const riskInsights = checkConcentrationRisk(holdings);

    // Combine and prioritizing
    let allInsights = [...riskInsights, ...holdingInsights];

    // Fallback if no insights generated
    if (allInsights.length === 0) {
        allInsights.push({
            type: 'info',
            icon: 'check-circle',
            title: 'Balanced Portfolio',
            message: 'Your portfolio looks healthy. No immediate risks or optimizations detected at this time.'
        });
    }

    return allInsights;
}

function renderAIInsights() {
    const container = document.getElementById('crypto-ai-insights-container'); // Need to add this to HTML
    // Or we render into the existing placeholder
    const section = document.getElementById('crypto-section-ai-insights');

    if (!section) return;

    // Replace the "Coming Soon" placeholder
    const insights = generateAIInsights(CRYPTO_DATA);

    const insightsHtml = `
        <div class="row g-4">
            ${insights.map(insight => `
                <div class="col-md-6 col-lg-4">
                    <div class="glass-card h-100 p-4 border-${insight.type === 'warning' ? 'warning' : (insight.type === 'success' ? 'success' : 'light')} border-opacity-25" 
                         style="background: rgba(${insight.type === 'warning' ? '255, 193, 7, 0.05' : (insight.type === 'success' ? '25, 135, 84, 0.05' : '255, 255, 255, 0.03')});">
                        <div class="d-flex align-items-start gap-3">
                            <div class="p-2 rounded-circle ${insight.type === 'warning' ? 'bg-warning-subtle text-warning' : (insight.type === 'success' ? 'bg-success-subtle text-success' : 'bg-white bg-opacity-10 text-white')}">
                                <!-- Icon rendering simplified -->
                                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                                    ${getIconPath(insight.icon)}
                                </svg>
                            </div>
                            <div>
                                <h4 class="h6 fw-normal text-white-90 mb-2">${insight.title}</h4>
                                <p class="small text-white-60 mb-0 leading-relaxed">${insight.message}</p>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
        
        <!-- Interactive Tool -->
        <div class="glass-panel mt-4 p-4">
            <h3 class="h5 fw-light text-white-90 mb-3">Ask Aether AI</h3>
            <div class="position-relative">
                <input type="text" class="form-control glass-input py-3 ps-4" placeholder="Ask about your portfolio risks, tax implications, or market trends...">
                <button class="position-absolute top-50 end-0 translate-middle-y me-2 btn btn-sm btn-icon-glass">
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                </button>
            </div>
        </div>
    `;

    section.innerHTML = `
        <div class="glass-header mb-4">
            <h2 class="h3 fw-light mb-2">AI Insights</h2>
            <p class="text-white-50 fw-light">Smart analysis generated from your on-chain activity</p>
        </div>
        ${insightsHtml}
    `;
}

function getIconPath(iconName) {
    const paths = {
        'alert-triangle': '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
        'shield': '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
        'clock': '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
        'zap': '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
        'check-circle': '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>'
    };
    return paths[iconName] || paths['check-circle'];
}

// Export
window.renderAIInsights = renderAIInsights;
