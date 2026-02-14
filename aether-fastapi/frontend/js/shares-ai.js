/**
 * Shares AI Lab - Price Prediction & Risk Analysis Frontend
 */

let currentTicker = 'AAPL';
let currentHorizon = 30;
let predictionChart = null;
let riskChart = null;
let riskLoaded = false;
let insightsLoaded = false;

/**
 * Initialize Shares AI Lab when section becomes visible
 */
function initializeSharesAILab() {
    console.log('Initializing Shares AI Lab');
    loadSharesForPrediction();
    // Risk and Insights load lazily when their tabs are clicked
}

/**
 * Switch between AI Lab sub-tabs
 */
function switchAILabTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.ai-lab-tab').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    // Update tab panels
    document.querySelectorAll('.ai-lab-panel').forEach(panel => {
        panel.style.display = 'none';
    });
    const activePanel = document.getElementById(`ai-lab-panel-${tabName}`);
    if (activePanel) {
        activePanel.style.display = 'block';
    }

    // Lazy load data for tabs that haven't been loaded yet
    if (tabName === 'risk' && !riskLoaded) {
        riskLoaded = true;
        loadPortfolioRiskAnalysis();
    }
    if (tabName === 'insights' && !insightsLoaded) {
        insightsLoaded = true;
        loadAIInsights();
    }
    if (tabName === 'sentiment' && !sentimentLoaded) {
        sentimentLoaded = true;
        loadSentimentAnalysis();
    }
}

/**
 * Load user's shares to populate ticker dropdown
 */
async function loadSharesForPrediction() {
    try {
        const userId = localStorage.getItem('userId');
        if (userId) {
            const response = await fetch(`/api/shares?user_id=${userId}`);
            if (response.ok) {
                const shares = await response.json();
                if (shares && shares.length > 0) {
                    const tickers = [...new Set(shares.map(s => s.ticker))];
                    currentTicker = tickers[0];
                    updateTickerDropdown(tickers);
                }
            }
        }
    } catch (error) {
        console.error('Error loading shares:', error);
    }

    // Load prediction for current ticker
    loadPricePrediction(currentTicker, currentHorizon);
}

/**
 * Update ticker dropdown with user's stocks
 */
function updateTickerDropdown(tickers) {
    const select = document.getElementById('ticker-select');
    if (!select) return;

    // Add user tickers first
    select.innerHTML = '';
    tickers.forEach(ticker => {
        const option = document.createElement('option');
        option.value = ticker;
        option.textContent = ticker;
        select.appendChild(option);
    });
}

/**
 * Load price prediction from API
 */
async function loadPricePrediction(ticker, horizon = 30) {
    currentTicker = ticker;
    currentHorizon = horizon;

    try {
        showPredictionLoading();

        const response = await fetch(`/api/shares/ml/price-prediction?ticker=${ticker}&horizon=${horizon}`);

        if (!response.ok) {
            throw new Error(`Failed to fetch predictions: ${response.statusText}`);
        }

        const result = await response.json();

        if (result.status === 'success') {
            displayPredictionChart(result.data);
            displayPredictionMetrics(result.data);
        }

    } catch (error) {
        console.error('Error loading price predictions:', error);
        showPredictionError(error.message);
    }
}

/**
 * Display price prediction chart using Chart.js
 */
function displayPredictionChart(data) {
    const chartContainer = document.getElementById('shares-prediction-chart');
    if (!chartContainer) return;

    const dates = data.predictions.dates.map(d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    const predicted = data.predictions.predictions;
    const upper = data.predictions.confidence_upper;
    const lower = data.predictions.confidence_lower;

    // Destroy existing chart
    if (predictionChart) {
        predictionChart.destroy();
    }

    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.id = 'predictionCanvas';
    canvas.height = 300;

    chartContainer.innerHTML = '';
    chartContainer.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    predictionChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [
                {
                    label: 'Predicted Price',
                    data: predicted,
                    borderColor: 'rgba(99, 102, 241, 1)',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    borderWidth: 3,
                    fill: false,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6
                },
                {
                    label: 'Upper Confidence',
                    data: upper,
                    borderColor: 'rgba(134, 239, 172, 0.5)',
                    borderWidth: 1,
                    borderDash: [5, 5],
                    fill: '+1',
                    backgroundColor: 'rgba(134, 239, 172, 0.1)',
                    pointRadius: 0
                },
                {
                    label: 'Lower Confidence',
                    data: lower,
                    borderColor: 'rgba(134, 239, 172, 0.5)',
                    borderWidth: 1,
                    borderDash: [5, 5],
                    fill: false,
                    pointRadius: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                title: {
                    display: true,
                    text: `${currentTicker} - ${currentHorizon} Day Price Forecast`,
                    color: '#fff',
                    font: { size: 18, weight: 'normal' }
                },
                subtitle: {
                    display: true,
                    text: '💡 Click legend items to show/hide confidence intervals',
                    color: 'rgba(255, 255, 255, 0.5)',
                    font: { size: 12, style: 'italic' },
                    padding: { bottom: 10 }
                },
                legend: {
                    labels: {
                        color: '#fff',
                        padding: 15,
                        font: { size: 13 },
                        usePointStyle: true,
                        pointStyle: 'rectRounded',
                        boxWidth: 8,
                        boxHeight: 8
                    },
                    onHover: function (event, legendItem, legend) {
                        event.native.target.style.cursor = 'pointer';
                    },
                    onLeave: function (event, legendItem, legend) {
                        event.native.target.style.cursor = 'default';
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return context.dataset.label + ': $' + context.parsed.y.toFixed(2);
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: { color: '#ccc' },
                    grid: { color: 'rgba(255,255,255,0.1)' }
                },
                y: {
                    ticks: {
                        color: '#ccc',
                        callback: function (value) {
                            return '$' + value.toFixed(2);
                        }
                    },
                    grid: { color: 'rgba(255,255,255,0.1)' }
                }
            }
        }
    });
}

/**
 * Display prediction metrics
 */
function displayPredictionMetrics(data) {
    const currentPriceEl = document.getElementById('current-price-value');
    if (currentPriceEl) {
        currentPriceEl.textContent = '$' + data.current_price.toFixed(2);
    }

    const predictedPriceEl = document.getElementById('predicted-price-value');
    if (predictedPriceEl) {
        predictedPriceEl.textContent = '$' + data.predicted_price.toFixed(2);
    }

    const changePctEl = document.getElementById('change-pct-value');
    if (changePctEl) {
        const change = data.price_change_pct;
        const color = change >= 0 ? '#10b981' : '#ef4444';
        const arrow = change >= 0 ? '↑' : '↓';
        changePctEl.textContent = arrow + ' ' + Math.abs(change).toFixed(2) + '%';
        changePctEl.style.color = color;
    }

    const rmseEl = document.getElementById('rmse-value');
    if (rmseEl) {
        rmseEl.textContent = data.metrics.rmse.toFixed(2);
    }
}

/**
 * Show loading state
 */
function showPredictionLoading() {
    const chartContainer = document.getElementById('shares-prediction-chart');
    if (chartContainer) {
        chartContainer.innerHTML = `
            <div class="text-center py-5">
                <div class="spinner-border text-light" role="status" style="width: 3rem; height: 3rem;">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="text-white-50 mt-3">Generating AI predictions...</p>
            </div>
        `;
    }
}

/**
 * Show error state
 */
function showPredictionError(message) {
    const chartContainer = document.getElementById('shares-prediction-chart');
    if (chartContainer) {
        chartContainer.innerHTML = `
            <div class="text-center py-5">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-danger mb-3">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <p class="text-danger">Error: ${message}</p>
                <p class="text-white-50">Please try again or select a different ticker.</p>
            </div>
        `;
    }
}

/**
 * Event handlers
 */
function onTickerChange(newTicker) {
    loadPricePrediction(newTicker, currentHorizon);
}

function onHorizonChange(newHorizon) {
    loadPricePrediction(currentTicker, parseInt(newHorizon));
}

// ===== PORTFOLIO RISK ANALYSIS =====

/**
 * Load portfolio risk analysis
 */
async function loadPortfolioRiskAnalysis() {
    try {
        showRiskLoading();

        // Get user's shares using correct API pattern
        const response = await fetch(`${API_BASE_URL}/shares/holdings`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Failed to fetch shares');
        }

        const shares = await response.json();
        if (!shares || shares.length === 0) {
            showRiskEmptyState();
            return;
        }

        // Calculate total portfolio value and tickers
        const tickers = [...new Set(shares.map(s => s.symbol))].join(',');
        const totalValue = shares.reduce((sum, s) => sum + (s.quantity * s.avg_buy_price), 0);

        // Call risk analysis API
        const riskResponse = await fetch(
            `/api/shares/ml/risk-analysis?tickers=${tickers}&investment_amount=${totalValue}&simulations=5000`
        );

        if (!riskResponse.ok) {
            throw new Error('Risk analysis failed');
        }

        const result = await riskResponse.json();

        if (result.status === 'success') {
            displayRiskMetrics(result.data);
            displayRiskChart(result.data);
        }

    } catch (error) {
        console.error('Error loading risk analysis:', error);
        showRiskError(error.message);
    }
}

/**
 * Display risk metrics in cards
 */
function displayRiskMetrics(data) {
    // VaR 95%
    const var95El = document.getElementById('var-95-value');
    if (var95El) {
        var95El.textContent = '$' + data.risk_metrics.var_95.toLocaleString();
    }

    // CVaR 95%
    const cvar95El = document.getElementById('cvar-95-value');
    if (cvar95El) {
        cvar95El.textContent = '$' + data.risk_metrics.cvar_95.toLocaleString();
    }

    // Sharpe Ratio
    const sharpeEl = document.getElementById('sharpe-ratio-value');
    if (sharpeEl) {
        const sharpe = data.risk_metrics.sharpe_ratio;
        sharpeEl.textContent = sharpe.toFixed(3);
        // Color code: >1 good, 0-1 okay, <0 bad
        if (sharpe > 1) {
            sharpeEl.style.color = '#10b981';
        } else if (sharpe > 0) {
            sharpeEl.style.color = '#fbbf24';
        } else {
            sharpeEl.style.color = '#ef4444';
        }
    }

    // Expected Return
    const returnEl = document.getElementById('expected-return-value');
    if (returnEl) {
        const ret = data.portfolio_statistics.expected_return_pct;
        returnEl.textContent = (ret >= 0 ? '+' : '') + ret.toFixed(2) + '%';
        returnEl.style.color = ret >= 0 ? '#10b981' : '#ef4444';
    }
}

/**
 * Display risk distribution chart
 */
function displayRiskChart(data) {
    const chartContainer = document.getElementById('shares-risk-chart');
    if (!chartContainer) return;

    // Destroy existing chart
    if (riskChart) {
        riskChart.destroy();
    }

    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.id = 'riskCanvas';
    canvas.height = 300;

    chartContainer.innerHTML = '';
    chartContainer.appendChild(canvas);

    const ctx = canvas.getContext('2d');

    // Prepare data
    const bins = data.distribution.bins;
    const frequencies = data.distribution.frequencies;
    const initial = data.portfolio_info.initial_investment;

    riskChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: bins.map(b => '$' + Math.round(b).toLocaleString()),
            datasets: [{
                label: 'Frequency',
                data: frequencies,
                backgroundColor: frequencies.map((_, i) => {
                    const value = bins[i];
                    if (value < initial * 0.9) return 'rgba(239, 68, 68, 0.7)'; // Red for losses
                    if (value > initial * 1.1) return 'rgba(16, 185, 129, 0.7)'; // Green for gains
                    return 'rgba(99, 102, 241, 0.7)'; // Blue for neutral
                }),
                borderColor: 'rgba(255, 255, 255, 0.2)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: `Portfolio Value Distribution (${data.num_simulations.toLocaleString()} Simulations)`,
                    color: '#fff',
                    font: { size: 16 }
                },
                subtitle: {
                    display: true,
                    text: '💡 Click legend to toggle visibility',
                    color: 'rgba(255, 255, 255, 0.5)',
                    font: { size: 11, style: 'italic' }
                },
                legend: {
                    labels: { color: '#fff' }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return 'Occurrences: ' + context.parsed.y;
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#ccc',
                        maxRotation: 45,
                        minRotation: 45,
                        autoSkip: true,
                        maxTicksLimit: 10
                    },
                    grid: { color: 'rgba(255,255,255,0.1)' },
                    title: {
                        display: true,
                        text: 'Portfolio Value',
                        color: '#fff'
                    }
                },
                y: {
                    ticks: { color: '#ccc' },
                    grid: { color: 'rgba(255,255,255,0.1)' },
                    title: {
                        display: true,
                        text: 'Frequency',
                        color: '#fff'
                    }
                }
            }
        }
    });
}

/**
 * Show loading state for risk analysis
 */
function showRiskLoading() {
    const chartContainer = document.getElementById('shares-risk-chart');
    if (chartContainer) {
        chartContainer.innerHTML = `
            <div class="text-center py-5">
                <div class="spinner-border text-light" role="status" style="width: 3rem; height: 3rem;">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="text-white-50 mt-3">Running Monte Carlo simulation...</p>
            </div>
        `;
    }
}

/**
 * Show empty state for risk analysis
 */
function showRiskEmptyState() {
    const chartContainer = document.getElementById('shares-risk-chart');
    if (chartContainer) {
        chartContainer.innerHTML = `
            <div class="text-center py-5">
                <p class="text-white-50">Add shares to your portfolio to see risk analysis</p>
            </div>
        `;
    }
}

/**
 * Show error state for risk analysis
 */
function showRiskError(message) {
    const chartContainer = document.getElementById('shares-risk-chart');
    if (chartContainer) {
        chartContainer.innerHTML = `
            <div class="text-center py-5">
                <p class="text-danger">Error: ${message}</p>
            </div>
        `;
    }
}

// ===== AI-GENERATED INSIGHTS =====

/**
 * Load AI-generated portfolio insights
 */
async function loadAIInsights() {
    try {
        const insightsContainer = document.getElementById('ai-insights-feed');
        if (!insightsContainer) return;

        insightsContainer.innerHTML = `
            <div class="text-center py-4">
                <div class="spinner-border text-light" role="status" style="width: 2rem; height: 2rem;">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="text-white-50 mt-2 small">Generating AI insights...</p>
            </div>
        `;

        // Get user's shares
        const response = await fetch(`${API_BASE_URL}/shares/holdings`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) throw new Error('Failed to fetch shares');

        const shares = await response.json();
        if (!shares || shares.length === 0) {
            insightsContainer.innerHTML = `
                <div class="text-center py-4">
                    <p class="text-white-50 small">Add shares to get AI-powered insights</p>
                </div>
            `;
            return;
        }

        const tickers = [...new Set(shares.map(s => s.symbol))].join(',');
        const totalValue = shares.reduce((sum, s) => sum + (s.quantity * s.avg_buy_price), 0);

        const insightsResponse = await fetch(
            `/api/shares/ml/insights?tickers=${tickers}&portfolio_value=${totalValue}`
        );

        if (!insightsResponse.ok) throw new Error('Insights generation failed');

        const result = await insightsResponse.json();

        if (result.status === 'success') {
            displayInsights(result.data, insightsContainer);
        }

    } catch (error) {
        console.error('Error loading AI insights:', error);
        const container = document.getElementById('ai-insights-feed');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-4">
                    <p class="text-danger small">Error: ${error.message}</p>
                    <button class="btn btn-sm btn-outline-light mt-2" onclick="loadAIInsights()">Retry</button>
                </div>
            `;
        }
    }
}

/**
 * Display AI insights in the feed
 */
function displayInsights(data, container) {
    if (!data.insights || data.insights.length === 0) {
        container.innerHTML = '<p class="text-white-50 text-center py-3">No insights available</p>';
        return;
    }

    const severityColors = {
        'high': 'border-left: 3px solid #ef4444;',
        'medium': 'border-left: 3px solid #fbbf24;',
        'low': 'border-left: 3px solid #10b981;'
    };

    const categoryBadges = {
        'overview': '<span class="badge" style="background: rgba(99,102,241,0.3); color: #a5b4fc;">Overview</span>',
        'stock': '<span class="badge" style="background: rgba(59,130,246,0.3); color: #93c5fd;">Stock</span>',
        'risk': '<span class="badge" style="background: rgba(239,68,68,0.3); color: #fca5a5;">Risk</span>',
        'opportunity': '<span class="badge" style="background: rgba(16,185,129,0.3); color: #6ee7b7;">Opportunity</span>',
        'action': '<span class="badge" style="background: rgba(251,191,36,0.3); color: #fde68a;">Action</span>'
    };

    let html = '';

    for (const insight of data.insights) {
        const borderStyle = severityColors[insight.severity] || severityColors['medium'];
        const badge = categoryBadges[insight.category] || categoryBadges['overview'];
        const tickerTag = insight.ticker ? `<span class="badge bg-dark ms-1">${insight.ticker}</span>` : '';

        html += `
            <div class="insight-card p-3 mb-3" style="${borderStyle} background: rgba(255,255,255,0.03); border-radius: 8px;">
                <div class="d-flex align-items-center mb-2">
                    <span class="me-2" style="font-size: 1.2rem;">${insight.icon}</span>
                    <strong class="text-white small">${insight.title}</strong>
                    <div class="ms-auto">${badge}${tickerTag}</div>
                </div>
                <p class="text-white-50 small mb-0">${insight.content}</p>
            </div>
        `;
    }

    // Add timestamp
    const genTime = data.generated_at ? new Date(data.generated_at).toLocaleTimeString() : 'now';
    html += `<div class="text-end mt-2">
        <span class="text-white-50" style="font-size: 0.7rem;">Generated at ${genTime}</span>
        <button class="btn btn-sm btn-outline-light ms-2" style="font-size: 0.7rem; padding: 2px 8px;" onclick="loadAIInsights()">🔄 Refresh</button>
    </div>`;

    container.innerHTML = html;
}

// ═══════════════════════════════════════════════════════
//  SENTIMENT ANALYSIS (Feature 4)
// ═══════════════════════════════════════════════════════

let sentimentLoaded = false;
let sentimentChart = null;

/**
 * Get sentiment color based on score
 */
function sentimentColor(score) {
    if (score >= 0.5) return '#34d399';   // Very Bullish — green
    if (score >= 0.15) return '#6ee7b7';  // Bullish — light green
    if (score >= -0.15) return '#fbbf24'; // Neutral — amber
    if (score >= -0.5) return '#f87171';  // Bearish — red
    return '#ef4444';                     // Very Bearish — dark red
}

/**
 * Get trend icon
 */
function trendIcon(trend) {
    if (trend === 'Improving') return '📈 Improving';
    if (trend === 'Declining') return '📉 Declining';
    return '➡️ Stable';
}

/**
 * Load sentiment analysis for the current ticker
 */
async function loadSentimentAnalysis(ticker) {
    ticker = ticker || currentTicker || 'AAPL';

    // Update badge
    const badge = document.getElementById('sentiment-ticker-badge');
    if (badge) badge.textContent = ticker;

    // Show loading, hide content
    const loading = document.getElementById('sentiment-loading');
    const content = document.getElementById('sentiment-content');
    if (loading) loading.style.display = 'block';
    if (content) content.style.display = 'none';

    try {
        // Fetch sentiment data
        const response = await fetch(`/api/shares/ml/sentiment?ticker=${ticker}`);
        if (!response.ok) throw new Error('API error');
        const result = await response.json();
        const data = result.data;

        // Populate metric cards
        renderSentimentMetrics(data);

        // Render source breakdown bars
        renderSentimentBreakdown(data.breakdown);

        // Render headlines
        renderSentimentHeadlines(data.recent_headlines);

        // Render social buzz
        renderSocialBuzz(data.social_buzz);

        // Fetch and render history chart
        const histResp = await fetch(`/api/shares/ml/sentiment/history?ticker=${ticker}&days=30`);
        if (histResp.ok) {
            const histResult = await histResp.json();
            renderSentimentHistoryChart(histResult.data.history);
        }

        // Show content, hide loading
        if (loading) loading.style.display = 'none';
        if (content) content.style.display = 'block';

    } catch (error) {
        console.error('Sentiment analysis error:', error);
        if (loading) loading.style.display = 'none';
        if (content) {
            content.style.display = 'block';
            content.innerHTML = `<div class="glass-card p-4 text-center">
                <div style="font-size: 2rem;">⚠️</div>
                <p class="text-white-50 mt-2 small">Failed to load sentiment data. Try refreshing.</p>
            </div>`;
        }
    }
}

/**
 * Populate the 4 metric cards
 */
function renderSentimentMetrics(data) {
    const color = sentimentColor(data.sentiment_score);

    // Score
    const scoreEl = document.getElementById('sentiment-score-display');
    if (scoreEl) {
        scoreEl.textContent = data.sentiment_score.toFixed(2);
        scoreEl.style.color = color;
    }

    // Classification
    const classEl = document.getElementById('sentiment-classification');
    if (classEl) classEl.textContent = data.classification;

    // Confidence
    const confEl = document.getElementById('sentiment-confidence');
    if (confEl) confEl.textContent = data.confidence + '%';

    // Trend
    const trendEl = document.getElementById('sentiment-trend');
    if (trendEl) {
        trendEl.innerHTML = trendIcon(data.trend);
        trendEl.style.color = data.trend === 'Improving' ? '#34d399' :
            data.trend === 'Declining' ? '#f87171' : '#fbbf24';
    }

    // Social mentions
    const mentionsEl = document.getElementById('sentiment-mentions');
    if (mentionsEl && data.social_buzz) {
        const m = data.social_buzz.mentions_24h;
        mentionsEl.textContent = m >= 1000 ? (m / 1000).toFixed(1) + 'K' : m;
    }
}

/**
 * Render horizontal breakdown bars (News, Social, Technical, Market)
 */
function renderSentimentBreakdown(breakdown) {
    const container = document.getElementById('sentiment-breakdown-bars');
    if (!container) return;

    const sources = [
        { label: 'News', key: 'news', weight: '45%' },
        { label: 'Social', key: 'social', weight: '25%' },
        { label: 'Technical', key: 'technical', weight: '20%' },
        { label: 'Market', key: 'market', weight: '10%' },
    ];

    let html = '';
    sources.forEach(s => {
        const score = breakdown[s.key] || 0;
        const pct = Math.round((score + 1) * 50); // -1→0%, 0→50%, 1→100%
        const color = sentimentColor(score);
        html += `
            <div class="mb-3">
                <div class="d-flex justify-content-between mb-1">
                    <span class="text-white small">${s.label} <span class="text-white-50">(${s.weight})</span></span>
                    <span class="small" style="color: ${color};">${score >= 0 ? '+' : ''}${score.toFixed(3)}</span>
                </div>
                <div style="height: 6px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden;">
                    <div style="width: ${pct}%; height: 100%; background: ${color}; border-radius: 3px; transition: width 0.6s ease;"></div>
                </div>
            </div>`;
    });
    container.innerHTML = html;
}

/**
 * Render headline feed
 */
function renderSentimentHeadlines(headlines) {
    const container = document.getElementById('sentiment-headlines-feed');
    if (!container || !headlines) return;

    let html = '';
    headlines.forEach(h => {
        const color = sentimentColor(h.sentiment);
        html += `
            <div class="sentiment-headline-item d-flex align-items-start gap-2 mb-3 pb-3" style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                <span style="font-size: 1.2rem; flex-shrink: 0; margin-top: 2px;">${h.emoji}</span>
                <div style="min-width: 0; flex: 1;">
                    <div class="text-white small" style="line-height: 1.35; margin-bottom: 4px;">${h.title}</div>
                    <div class="d-flex align-items-center gap-2">
                        <span class="text-white-50" style="font-size: 0.65rem;">${h.source}</span>
                        <span class="text-white-50" style="font-size: 0.65rem;">•</span>
                        <span class="text-white-50" style="font-size: 0.65rem;">${h.hours_ago}h ago</span>
                        <span style="font-size: 0.6rem; color: ${color}; margin-left: auto;">${h.sentiment >= 0 ? '+' : ''}${h.sentiment.toFixed(2)}</span>
                    </div>
                </div>
            </div>`;
    });
    container.innerHTML = html;
}

/**
 * Render social buzz pills (hashtags + keywords)
 */
function renderSocialBuzz(buzz) {
    if (!buzz) return;

    const hashContainer = document.getElementById('sentiment-hashtags');
    if (hashContainer && buzz.trending_hashtags) {
        hashContainer.innerHTML = buzz.trending_hashtags.map(tag =>
            `<span class="sentiment-pill">${tag}</span>`
        ).join('');
    }

    const kwContainer = document.getElementById('sentiment-keywords');
    if (kwContainer && buzz.top_keywords) {
        kwContainer.innerHTML = buzz.top_keywords.map(kw =>
            `<span class="sentiment-pill sentiment-pill-secondary">${kw}</span>`
        ).join('');
    }
}

/**
 * Render 30-day sentiment history chart
 */
function renderSentimentHistoryChart(history) {
    if (!history || !history.length) return;

    const ctx = document.getElementById('sentiment-history-chart');
    if (!ctx) return;

    // Destroy existing chart
    if (sentimentChart) {
        sentimentChart.destroy();
        sentimentChart = null;
    }

    const labels = history.map(h => {
        const d = new Date(h.date);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    const scores = history.map(h => h.score);

    // Gradient fill
    const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 260);
    gradient.addColorStop(0, 'rgba(96, 165, 250, 0.3)');
    gradient.addColorStop(1, 'rgba(96, 165, 250, 0.0)');

    sentimentChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Sentiment',
                data: scores,
                borderColor: '#60a5fa',
                backgroundColor: gradient,
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 4,
                pointHoverBackgroundColor: '#60a5fa',
                tension: 0.4,
                fill: true,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleColor: 'rgba(255,255,255,0.7)',
                    bodyColor: '#fff',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1,
                    callbacks: {
                        label: ctx => `Score: ${ctx.parsed.y.toFixed(3)}`
                    }
                }
            },
            scales: {
                x: {
                    ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 10 }, maxTicksLimit: 8 },
                    grid: { color: 'rgba(255,255,255,0.04)' },
                    border: { color: 'rgba(255,255,255,0.06)' }
                },
                y: {
                    min: -1, max: 1,
                    ticks: {
                        color: 'rgba(255,255,255,0.3)',
                        font: { size: 10 },
                        callback: v => v.toFixed(1)
                    },
                    grid: { color: 'rgba(255,255,255,0.04)' },
                    border: { color: 'rgba(255,255,255,0.06)' }
                }
            }
        }
    });
}

// Make functions globally accessible
window.initializeSharesAILab = initializeSharesAILab;
window.loadSentimentAnalysis = loadSentimentAnalysis;
