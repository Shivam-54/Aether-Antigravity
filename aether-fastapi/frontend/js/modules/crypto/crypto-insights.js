/**
 * Crypto AI Insights Module
 * ML-powered predictions and personalized recommendations
 * Connects to backend ML service for real-time analysis
 */

// Priority colors and icons
const PRIORITY_CONFIG = {
    critical: {
        bg: 'rgba(220, 53, 69, 0.1)',
        border: 'danger',
        iconColor: 'text-danger',
        badge: 'Act Now'
    },
    warning: {
        bg: 'rgba(255, 193, 7, 0.1)',
        border: 'warning',
        iconColor: 'text-warning',
        badge: 'Monitor'
    },
    opportunity: {
        bg: 'rgba(25, 135, 84, 0.1)',
        border: 'success',
        iconColor: 'text-success',
        badge: 'Opportunity'
    },
    info: {
        bg: 'rgba(13, 110, 253, 0.05)',
        border: 'light',
        iconColor: 'text-info',
        badge: 'FYI'
    }
};

// Icon SVG paths
const ICON_PATHS = {
    'trending_up': '<path d="M23 6l-9.5 9.5-5-5L1 18"/><polyline points="17 6 23 6 23 12"/>',
    'trending_down': '<path d="M23 18l-9.5-9.5-5 5L1 6"/><polyline points="17 18 23 18 23 12"/>',
    'bolt': '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
    'warning': '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    'pie_chart': '<path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>',
    'attach_money': '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
    'shopping_cart': '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>',
    'shield': '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    'check-circle': '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
    'activity': '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
    'top_performer': '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    'on_chain': '<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>'
};

/**
 * Fetch AI insights from the ML backend
 * @param {number} daysAhead - Forecast horizon
 * @returns {Promise<Object>} Insights response
 */
async function fetchAIInsights(daysAhead = 30) {
    const token = localStorage.getItem('access_token');
    if (!token) {
        console.warn('No auth token found');
        return null;
    }

    try {
        const response = await fetch(`/api/crypto/ml/insights?days_ahead=${daysAhead}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Failed to fetch AI insights:', error);
        return null;
    }
}

/**
 * Fetch price prediction for a specific symbol
 * @param {string} symbol - Crypto symbol
 * @param {number} daysAhead - Forecast horizon
 * @returns {Promise<Object>} Prediction response
 */
async function fetchPricePrediction(symbol, daysAhead = 30) {
    const token = localStorage.getItem('access_token');
    if (!token) return null;

    try {
        const response = await fetch(`/api/crypto/ml/predict/${symbol}?days_ahead=${daysAhead}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error(`Failed to fetch prediction for ${symbol}:`, error);
        return null;
    }
}

/**
 * Render a single insight card
 * @param {Object} insight - Insight object from API
 * @returns {string} HTML string
 */
function renderInsightCard(insight) {
    const config = PRIORITY_CONFIG[insight.priority] || PRIORITY_CONFIG.info;
    const iconPath = ICON_PATHS[insight.icon] || ICON_PATHS['activity'];

    return `
        <div class="col-md-6 col-lg-4">
            <div class="glass-card h-100 p-4 border-${config.border} border-opacity-25" 
                 style="background: ${config.bg};">
                <div class="d-flex align-items-start gap-3">
                    <div class="p-2 rounded-circle bg-white bg-opacity-10 ${config.iconColor}">
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                            ${iconPath}
                        </svg>
                    </div>
                    <div class="flex-grow-1">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h4 class="h6 fw-normal text-white-90 mb-0">${insight.title}</h4>
                            <span class="badge bg-${config.border} bg-opacity-25 text-${config.border === 'light' ? 'white-50' : config.border} small">
                                ${config.badge}
                            </span>
                        </div>
                        <p class="small text-white-60 mb-0 leading-relaxed">${insight.description}</p>
                        ${insight.data?.percent_change !== undefined ? `
                            <div class="mt-2 pt-2 border-top border-white border-opacity-10">
                                <span class="small ${insight.data.percent_change >= 0 ? 'text-success' : 'text-danger'}">
                                    ${insight.data.percent_change >= 0 ? '↑' : '↓'} ${Math.abs(insight.data.percent_change).toFixed(1)}% predicted
                                </span>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Render loading state
 */
function renderLoadingState() {
    return `
        <div class="row g-4">
            ${[1, 2, 3].map(() => `
                <div class="col-md-6 col-lg-4">
                    <div class="glass-card h-100 p-4">
                        <div class="d-flex align-items-start gap-3">
                            <div class="placeholder-glow">
                                <span class="placeholder rounded-circle" style="width: 40px; height: 40px;"></span>
                            </div>
                            <div class="flex-grow-1 placeholder-glow">
                                <span class="placeholder col-8 mb-2"></span>
                                <span class="placeholder col-12"></span>
                                <span class="placeholder col-6"></span>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
        <div class="text-center mt-4">
            <div class="spinner-border spinner-border-sm text-white-50" role="status">
                <span class="visually-hidden">Analyzing portfolio...</span>
            </div>
            <p class="small text-white-50 mt-2">Training ML model on your portfolio data...</p>
        </div>
    `;
}

/**
 * Render empty state when no holdings
 */
function renderEmptyState() {
    return `
        <div class="text-center py-5">
            <div class="mb-3">
                <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24" class="text-white-30">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                </svg>
            </div>
            <h4 class="text-white-60 fw-light">No Holdings to Analyze</h4>
            <p class="text-white-40 small">Add some crypto holdings to receive personalized AI insights.</p>
        </div>
    `;
}

/**
 * Render error state
 */
function renderErrorState(message) {
    return `
        <div class="text-center py-5">
            <div class="mb-3 text-warning">
                <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
            </div>
            <h4 class="text-white-60 fw-light">Unable to Generate Insights</h4>
            <p class="text-white-40 small">${message || 'Please try again later.'}</p>
            <button class="btn btn-outline-light btn-sm mt-2" onclick="renderAIInsights()">
                Retry
            </button>
        </div>
    `;
}

// Chart instance tracker
let forecastChartInstance = null;
let healthGaugeInstance = null;

// Fetch portfolio series forecast
async function fetchPortfolioForecast(daysAhead = 30) {
    const token = localStorage.getItem('access_token');
    if (!token) return null;

    try {
        const response = await fetch(`/api/crypto/ml/predict-portfolio?days_ahead=${daysAhead}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error('Failed to fetch forecast:', error);
        return null;
    }
}

function renderHealthScore(scoreData) {
    const score = scoreData?.score || 0;
    const components = scoreData?.components || { diversification: 0, safety: 0, performance: 0 };

    // Update Text
    const scoreEl = document.getElementById('health-score-value');
    if (scoreEl) scoreEl.innerText = score;

    // Render Components
    const compsEl = document.getElementById('health-components');
    if (compsEl) {
        compsEl.innerHTML = `
            <div>
                <div class="small fw-bold text-white">${components.diversification}/35</div>
                <div class="text-white-50" style="font-size: 0.7rem;">Diversity</div>
            </div>
            <div>
                <div class="small fw-bold text-white">${components.safety}/35</div>
                <div class="text-white-50" style="font-size: 0.7rem;">Safety</div>
            </div>
            <div>
                <div class="small fw-bold text-white">${components.performance}/30</div>
                <div class="text-white-50" style="font-size: 0.7rem;">Growth</div>
            </div>
        `;
    }

    // Render Gauge
    const canvas = document.getElementById('healthScoreGauge');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set Dimensions
    // Ensure canvas resolution matches display size
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const centerX = rect.width / 2;
    const centerY = rect.height - 20; // Bottom aligned
    const radius = Math.min(centerX, rect.height) - 30; // 30px padding

    // Draw Background Arc
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI, 0); // Half circle
    ctx.lineWidth = 20;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.stroke();

    // Draw Score Arc
    const startAngle = Math.PI;
    const endAngle = Math.PI + (Math.PI * (score / 100));

    // Color gradient based on score
    let strokeColor = '#dc3545'; // Red
    if (score > 40) strokeColor = '#ffc107'; // Yellow
    if (score > 70) strokeColor = '#0d6efd'; // Blue
    if (score > 85) strokeColor = '#198754'; // Green

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.lineWidth = 20;
    ctx.lineCap = 'round';
    ctx.strokeStyle = strokeColor;
    ctx.stroke();
}

function renderForecastChart(forecastData) {
    const canvas = document.getElementById('cryptoForecastChart');
    if (!canvas) return;

    if (forecastChartInstance) {
        forecastChartInstance.destroy();
    }

    if (!forecastData || !forecastData.series || forecastData.series.length === 0) {
        // Show empty state in canvas container
        const ctx = canvas.getContext('2d');
        ctx.font = '14px Inter';
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.textAlign = 'center';
        ctx.fillText('No forecast data available', canvas.width / 2, canvas.height / 2);
        return;
    }

    const series = forecastData.series;
    const labels = series.map(d => {
        const date = new Date(d.date);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    const dataPoints = series.map(d => d.predicted_value);
    const lowerBounds = series.map(d => d.confidence_lower);
    const upperBounds = series.map(d => d.confidence_upper);

    // Initial value for color comparison
    const startVal = series[0].predicted_value;
    const endVal = series[series.length - 1].predicted_value;
    const isPositive = endVal >= startVal;

    const lineColor = isPositive ? '#198754' : '#dc3545';
    const areaColor = isPositive ? 'rgba(25, 135, 84, 0.1)' : 'rgba(220, 53, 69, 0.1)';

    forecastChartInstance = new Chart(canvas, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Projected Value',
                    data: dataPoints,
                    borderColor: lineColor,
                    backgroundColor: areaColor,
                    borderWidth: 2,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    fill: false // We will fill the bounds instead
                },
                {
                    label: 'Upper Confidence',
                    data: upperBounds,
                    borderColor: 'transparent',
                    backgroundColor: areaColor,
                    pointRadius: 0,
                    fill: '+1' // Fill to next dataset (Lower)
                },
                {
                    label: 'Lower Confidence',
                    data: lowerBounds,
                    borderColor: 'transparent',
                    backgroundColor: 'transparent',
                    pointRadius: 0,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index',
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false, drawBorder: false },
                    ticks: { color: 'rgba(255,255,255,0.5)', maxTicksLimit: 6 }
                },
                y: {
                    grid: { color: 'rgba(255,255,255,0.05)', drawBorder: false },
                    ticks: { color: 'rgba(255,255,255,0.5)' }
                }
            }
        }
    });
}

/**
 * Main render function for AI Insights section
 */
async function renderAIInsights() {
    const section = document.getElementById('crypto-section-ai-insights');
    if (!section) return;

    // We assume the HTML structure is already static in dashboard.html now, 
    // OR we inject the structure if it's currently empty/loading.
    // Check if containers exist, if not, inject the full layout.
    if (!document.getElementById('healthScoreGauge')) {
        section.innerHTML = `
        <div class="d-flex flex-column gap-4">
            <div class="glass-header">
                <h2 class="h3 fw-light mb-2">AI Insights</h2>
                <p class="text-white-50 fw-light">Smart analysis and predictions for your portfolio</p>
            </div>
            
            <div class="d-flex justify-content-center py-5">
                <div class="spinner-border text-primary" role="status"></div>
            </div>
        </div>`;
    }

    // Parallel Fetch
    const [insightsRes, forecastRes] = await Promise.all([
        fetchAIInsights(30),
        fetchPortfolioForecast(30)
    ]);

    // Check for errors
    if (!insightsRes && !forecastRes) {
        // Show error
        section.innerHTML = renderErrorState('Failed to connect to AI service');
        return;
    }

    // Is Empty State? (No holdings)
    if (insightsRes?.total_holdings === 0) {
        section.innerHTML = `
            <div class="glass-header mb-4">
                <h2 class="h3 fw-light mb-2">AI Insights</h2>
            </div>
            ${renderEmptyState()}
        `;
        return;
    }

    // Re-inject structure if we showed loading
    if (!document.getElementById('healthScoreGauge')) {
        section.innerHTML = `
            <div class="d-flex flex-column gap-4">
                <div class="glass-header">
                    <h2 class="h3 fw-light mb-2">AI Insights</h2>
                    <p class="text-white-50 fw-light">Smart analysis and predictions for your portfolio</p>
                </div>

                <div class="row g-4">
                    <div class="col-lg-4">
                        <div class="glass-card p-4 h-100 d-flex flex-column justify-content-between">
                            <div><h3 class="h5 fw-light text-white-90 mb-3">Portfolio Health</h3><p class="text-white-50 small mb-4">Composite score based on diversification, volatility, and trend.</p></div>
                            <div class="d-flex align-items-center justify-content-center position-relative mb-3" style="height: 180px;">
                                <canvas id="healthScoreGauge"></canvas>
                                <div class="position-absolute top-50 start-50 translate-middle text-center" style="margin-top: 20px;">
                                    <h2 class="display-4 fw-light text-white mb-0" id="health-score-value">--</h2>
                                    <span class="text-white-50 small">/ 100</span>
                                </div>
                            </div>
                            <div id="health-components" class="d-flex justify-content-between text-center pt-3 border-top border-white border-opacity-10"></div>
                        </div>
                    </div>
                    <div class="col-lg-8">
                        <div class="glass-card p-4 h-100">
                            <div class="d-flex justify-content-between align-items-center mb-4">
                                <div><h3 class="h5 fw-light text-white-90 mb-1">30-Day Value Forecast</h3><p class="text-white-50 small mb-0">Projected total portfolio valuation</p></div>
                                <div class="d-flex align-items-center gap-2"><span class="badge bg-primary bg-opacity-10 text-primary fw-light px-3 py-1 rounded-pill">ML Confidence: 80%</span></div>
                            </div>
                            <div style="height: 250px; width: 100%;"><canvas id="cryptoForecastChart"></canvas></div>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 class="h6 text-white-50 text-uppercase fw-light mb-3" style="letter-spacing: 1px;">Recent Analysis</h3>
                    <div id="ai-insights-container" class="row g-3"></div>
                </div>
                
                 <!-- Chat Area -->
                <div class="glass-card p-4 mt-2">
                    <h3 class="h5 fw-light text-white-90 mb-3">Ask Aether AI</h3>
                    <div class="input-group glass-input-group">
                        <input type="text" class="form-control bg-transparent border-0 text-white fw-light" placeholder="Ask about your portfolio risks, tax implications, or market trends...">
                        <button class="btn text-white-50" type="button"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg></button>
                    </div>
                </div>
            </div>
        `;
    }

    // 1. Render Health Score
    if (insightsRes?.health_score) {
        renderHealthScore(insightsRes.health_score);
    }

    // 2. Initialize Simulator
    if (window.initSimulator) {
        window.initSimulator();
    }

    // 3. Render Forecast Chart
    if (forecastRes) {
        renderForecastChart(forecastRes);
    }

    // 3. Render Insights
    const container = document.getElementById('ai-insights-container');
    if (container && insightsRes?.insights) {
        if (insightsRes.insights.length > 0) {
            container.innerHTML = insightsRes.insights.map(renderInsightCard).join('');
        } else {
            container.innerHTML = `
                <div class="col-12"><div class="glass-card p-4 text-center">
                    <div class="mb-2"><svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24" class="text-success">${ICON_PATHS['check-circle']}</svg></div>
                    <h4 class="h6 text-white-80">Portfolio Looks Healthy</h4>
                    <p class="small text-white-50 mb-0">No immediate risks or opportunities detected by our ML model.</p>
                </div></div>`;
        }
    }
}

// Export for global access
window.renderAIInsights = renderAIInsights;
window.fetchPricePrediction = fetchPricePrediction;
