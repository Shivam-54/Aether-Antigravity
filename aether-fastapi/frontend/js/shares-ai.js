/**
 * Shares AI Lab - Price Prediction & Risk Analysis Frontend
 */

let currentTicker = 'AAPL';
let currentHorizon = 30;
let predictionChart = null;
let riskChart = null;
let riskLoaded = false;
let insightsLoaded = false;
let sentimentLoaded = false;
let anomalyLoaded = false;
let correlationLoaded = false;

/**
 * Initialize Shares AI Lab when section becomes visible
 */
function initializeSharesAILab() {
    console.log('Initializing Shares AI Lab');
    loadSharesForPrediction();
    // Also load risk analysis since it's in the same bucket
    // No need to set riskLoaded here, it will be handled by switchAILabTab or loadPortfolioRiskAnalysis itself
    loadPortfolioRiskAnalysis();
}

/**
 * Switch between AI Lab sub-tabs (bucket mode: 2 features per tab)
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

    // Lazy load data for bucket features
    if (tabName === 'predictions-risk') {
        if (!riskLoaded) {
            loadPortfolioRiskAnalysis();
        }
    }
    if (tabName === 'insights-sentiment') {
        if (!insightsLoaded) {
            loadAIInsights();
        }
        if (!sentimentLoaded) {
            loadSentimentAnalysis();
        }
    }
    if (tabName === 'anomaly-correlation') {
        if (!anomalyLoaded) {
            loadAnomalyDetection();
        }
        if (!correlationLoaded) {
            loadCorrelationAnalysis();
        }
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

        if (response.status === 401) {
            showRiskError('Session expired. Please <a href="/login.html" style="color:#a78bfa">log in again</a>.');
            return;
        }
        if (!response.ok) {
            throw new Error('Failed to fetch shares (status ' + response.status + ')');
        }

        const shares = await response.json();
        if (!shares || shares.length === 0) {
            showRiskEmptyState();
            riskLoaded = true;
            return;
        }

        // Calculate total portfolio value and tickers
        const tickers = [...new Set(shares.map(s => s.symbol))].join(',');
        const totalValue = shares.reduce((sum, s) => sum + (s.quantity * s.avg_buy_price), 0);

        // Call risk analysis API
        const riskResponse = await fetch(
            `/api/shares/ml/risk-analysis?tickers=${tickers}&investment_amount=${totalValue}&simulations=1000`
        );

        if (!riskResponse.ok) {
            throw new Error('Risk analysis failed (status ' + riskResponse.status + ')');
        }

        const result = await riskResponse.json();

        if (result.status === 'success') {
            displayRiskMetrics(result.data);
            displayRiskChart(result.data);
            riskLoaded = true;
        }

    } catch (error) {
        console.error('Error loading risk analysis:', error);
        showRiskError(error.message + ' <button class="btn btn-sm btn-outline-light mt-2" onclick="riskLoaded=false;loadPortfolioRiskAnalysis()">Retry</button>');
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
 * Display risk distribution chart — redesigned for clarity.
 * Shows a smooth area chart with % change on x-axis,
 * a VaR annotation line, and labeled risk / profit zones.
 */
function displayRiskChart(data) {
    const chartContainer = document.getElementById('shares-risk-chart');
    if (!chartContainer) return;

    if (riskChart) riskChart.destroy();

    const canvas = document.createElement('canvas');
    canvas.id = 'riskCanvas';
    canvas.height = 300;
    chartContainer.innerHTML = '';
    chartContainer.appendChild(canvas);

    const ctx = canvas.getContext('2d');

    // Convert bins to % change from initial investment
    const initial = data.portfolio_info.initial_investment;
    const bins = data.distribution.bins;
    const frequencies = data.distribution.frequencies;

    const pctLabels = bins.map(b => (((b - initial) / initial) * 100).toFixed(0));
    const varPct = ((data.risk_metrics.var_95 / initial) * -100).toFixed(1);

    // Find the bin index closest to VaR for the annotation
    const varValue = initial - data.risk_metrics.var_95;
    let varIndex = 0;
    let minDist = Infinity;
    bins.forEach((b, i) => {
        const d = Math.abs(b - varValue);
        if (d < minDist) { minDist = d; varIndex = i; }
    });

    // Build gradient-colored bars: red (loss) → indigo (neutral) → green (profit)
    const barColors = bins.map(b => {
        const pct = ((b - initial) / initial) * 100;
        if (pct < -5) return 'rgba(248,113,113,0.65)';
        if (pct < 0) return 'rgba(251,146,60,0.55)';
        if (pct < 5) return 'rgba(129,140,248,0.55)';
        if (pct < 15) return 'rgba(52,211,153,0.5)';
        return 'rgba(16,185,129,0.6)';
    });

    // Custom plugin: draw VaR annotation line
    const varLinePlugin = {
        id: 'varLine',
        afterDraw(chart) {
            const { ctx: c, chartArea, scales } = chart;
            const xScale = scales.x;
            const meta = chart.getDatasetMeta(0);
            if (!meta.data[varIndex]) return;

            const xPos = meta.data[varIndex].x;
            const top = chartArea.top;
            const bottom = chartArea.bottom;

            // Dashed vertical line
            c.save();
            c.beginPath();
            c.setLineDash([6, 4]);
            c.strokeStyle = '#f87171';
            c.lineWidth = 2;
            c.moveTo(xPos, top);
            c.lineTo(xPos, bottom);
            c.stroke();

            // Label
            c.setLineDash([]);
            c.fillStyle = 'rgba(248,113,113,0.9)';
            c.font = 'bold 11px Inter, sans-serif';
            c.textAlign = 'center';

            // Background pill for label
            const label = `VaR 95%: -${varPct}%`;
            const textWidth = c.measureText(label).width;
            const padding = 6;
            const pillX = xPos - textWidth / 2 - padding;
            const pillY = top - 4;

            c.beginPath();
            c.roundRect(pillX, pillY - 14, textWidth + padding * 2, 18, 4);
            c.fillStyle = 'rgba(127,29,29,0.85)';
            c.fill();

            c.fillStyle = '#fca5a5';
            c.fillText(label, xPos, pillY);
            c.restore();
        }
    };

    riskChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: pctLabels.map(p => p + '%'),
            datasets: [{
                label: 'Scenarios',
                data: frequencies,
                backgroundColor: barColors,
                borderColor: 'rgba(255,255,255,0.08)',
                borderWidth: 1,
                borderRadius: 3,
                barPercentage: 1.0,
                categoryPercentage: 1.0
            }]
        },
        plugins: [varLinePlugin],
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'What could happen to your portfolio?',
                    color: 'rgba(255,255,255,0.9)',
                    font: { size: 14, weight: '400', family: 'Inter, sans-serif' },
                    padding: { bottom: 4 }
                },
                subtitle: {
                    display: true,
                    text: `Based on ${data.num_simulations.toLocaleString()} Monte Carlo simulations over 1 year`,
                    color: 'rgba(255,255,255,0.4)',
                    font: { size: 10, style: 'italic' },
                    padding: { bottom: 16 }
                },
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(15,23,42,0.9)',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1,
                    titleFont: { size: 11 },
                    bodyFont: { size: 11 },
                    callbacks: {
                        title: context => {
                            const idx = context[0].dataIndex;
                            const val = bins[idx];
                            return `Portfolio → $${Math.round(val).toLocaleString()}`;
                        },
                        label: context => {
                            const idx = context.dataIndex;
                            const pct = pctLabels[idx];
                            const count = context.parsed.y;
                            const prob = ((count / data.num_simulations) * 100).toFixed(1);
                            return [
                                `Change: ${pct >= 0 ? '+' : ''}${pct}%`,
                                `Probability: ~${prob}%`
                            ];
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: 'rgba(255,255,255,0.45)',
                        font: { size: 9 },
                        maxTicksLimit: 12,
                        autoSkip: true
                    },
                    grid: { color: 'rgba(255,255,255,0.03)' },
                    border: { color: 'rgba(255,255,255,0.06)' },
                    title: {
                        display: true,
                        text: 'Portfolio Change (%)',
                        color: 'rgba(255,255,255,0.5)',
                        font: { size: 10 }
                    }
                },
                y: {
                    ticks: {
                        color: 'rgba(255,255,255,0.35)',
                        font: { size: 9 },
                        callback: v => {
                            const prob = ((v / data.num_simulations) * 100).toFixed(0);
                            return prob + '%';
                        }
                    },
                    grid: { color: 'rgba(255,255,255,0.03)' },
                    border: { color: 'rgba(255,255,255,0.06)' },
                    title: {
                        display: true,
                        text: 'Likelihood',
                        color: 'rgba(255,255,255,0.5)',
                        font: { size: 10 }
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

        if (response.status === 401) {
            insightsContainer.innerHTML = `
                <div class="text-center py-4">
                    <p class="text-warning small">Session expired. Please <a href="/login.html" style="color:#a78bfa">log in again</a>.</p>
                </div>
            `;
            return;
        }
        if (!response.ok) throw new Error('Failed to fetch shares (status ' + response.status + ')');

        const shares = await response.json();
        if (!shares || shares.length === 0) {
            insightsContainer.innerHTML = `
                <div class="text-center py-4">
                    <p class="text-white-50 small">Add shares to get AI-powered insights</p>
                </div>
            `;
            insightsLoaded = true;
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
            insightsLoaded = true;
        }

    } catch (error) {
        console.error('Error loading AI insights:', error);
        const container = document.getElementById('ai-insights-feed');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-4">
                    <p class="text-danger small">Error: ${error.message}</p>
                    <button class="btn btn-sm btn-outline-light mt-2" onclick="insightsLoaded=false;loadAIInsights()">Retry</button>
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
        'high': 'border-left: 3px solid #fb7185;',
        'medium': 'border-left: 3px solid #fcd34d;',
        'low': 'border-left: 3px solid #2dd4bf;'
    };

    const categoryBadges = {
        'overview': '<span class="badge" style="background: rgba(99,102,241,0.15); color: #a5b4fc;">Overview</span>',
        'stock': '<span class="badge" style="background: rgba(96,165,250,0.15); color: #93c5fd;">Stock</span>',
        'risk': '<span class="badge" style="background: rgba(251,113,133,0.15); color: #fda4af;">Risk</span>',
        'opportunity': '<span class="badge" style="background: rgba(45,212,191,0.15); color: #5eead4;">Opportunity</span>',
        'action': '<span class="badge" style="background: rgba(252,211,77,0.15); color: #fde68a;">Action</span>'
    };

    // Replace childish emojis with mature icons
    const matureIcons = {
        '📊': '◈', '⚠️': '⚡', '🚀': '↗', '📉': '↘',
        '🎯': '◎', '💡': '✦', '🔍': '⊘', '💰': '◇',
        '📈': '↗', '🐂': '↗', '🐻': '↘'
    };

    let html = '';

    for (const insight of data.insights) {
        const borderStyle = severityColors[insight.severity] || severityColors['medium'];
        const badge = categoryBadges[insight.category] || categoryBadges['overview'];
        const tickerTag = insight.ticker ? `<span class="badge bg-dark ms-1">${insight.ticker}</span>` : '';

        html += `
            <div class="insight-card p-3 mb-3" style="${borderStyle} background: rgba(255,255,255,0.03); border-radius: 8px;">
                <div class="d-flex align-items-center mb-2">
                    <span class="me-2" style="font-size: 1.1rem; color: #a78bfa; font-weight: 600;">${matureIcons[insight.icon] || insight.icon}</span>
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

let sentimentChart = null;

/**
 * Get sentiment color based on score
 */
function sentimentColor(score) {
    if (score >= 0.5) return '#2dd4bf';   // Very Bullish — icy teal
    if (score >= 0.15) return '#5eead4';  // Bullish — mint
    if (score >= -0.15) return 'rgba(255,255,255,0.7)'; // Neutral — white
    if (score >= -0.5) return '#fb7185';  // Bearish — cool rose
    return '#f471b5';                     // Very Bearish — icy pink
}

/**
 * Get trend icon
 */
function trendIcon(trend) {
    if (trend === 'Improving') return '↗ Improving';
    if (trend === 'Declining') return '↘ Declining';
    return '→ Stable';
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
        // Fetch sentiment data (no auth needed)
        const response = await fetch(`/api/shares/ml/sentiment?ticker=${ticker}`);
        if (!response.ok) throw new Error('Sentiment API error (status ' + response.status + ')');
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
        sentimentLoaded = true;

    } catch (error) {
        console.error('Sentiment analysis error:', error);
        if (loading) loading.style.display = 'none';
        if (content) {
            content.style.display = 'block';
            content.innerHTML = `<div class="glass-card p-4 text-center">
                <div style="font-size: 2rem;">⚠️</div>
                <p class="text-white-50 mt-2 small">Failed to load sentiment data.</p>
                <button class="btn btn-sm btn-outline-light mt-2" onclick="sentimentLoaded=false;loadSentimentAnalysis()">Retry</button>
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
        trendEl.style.color = data.trend === 'Improving' ? '#2dd4bf' :
            data.trend === 'Declining' ? '#fb7185' : 'rgba(255,255,255,0.7)';
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
        { label: 'News', key: 'news', weight: '45%', color: '#60a5fa' },
        { label: 'Social', key: 'social', weight: '25%', color: '#a78bfa' },
        { label: 'Technical', key: 'technical', weight: '20%', color: '#2dd4bf' },
        { label: 'Market', key: 'market', weight: '10%', color: '#fcd34d' },
    ];

    let html = '';
    sources.forEach(s => {
        const score = breakdown[s.key] || 0;
        const pct = Math.round((score + 1) * 50); // -1→0%, 0→50%, 1→100%
        const scoreColor = score >= 0 ? '#2dd4bf' : '#fb7185';
        html += `
            <div class="mb-3">
                <div class="d-flex justify-content-between mb-1">
                    <span class="text-white small">${s.label} <span class="text-white-50">(${s.weight})</span></span>
                    <span class="small" style="color: ${scoreColor};">${score >= 0 ? '+' : ''}${score.toFixed(3)}</span>
                </div>
                <div style="height: 6px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden;">
                    <div style="width: ${pct}%; height: 100%; background: ${s.color}; border-radius: 3px; transition: width 0.6s ease;"></div>
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
window.loadAnomalyDetection = loadAnomalyDetection;
window.loadCorrelationAnalysis = loadCorrelationAnalysis;

// ========== ANOMALY DETECTION ==========

/**
 * Load anomaly detection results
 */
async function loadAnomalyDetection() {
    anomalyLoaded = true;
    const timelineEl = document.getElementById('anomaly-timeline');
    if (!timelineEl) return;

    try {
        // Get user's tickers from holdings
        const sharesRes = await fetch(`${API_BASE_URL}/shares/holdings`, { headers: getAuthHeaders() });
        if (!sharesRes.ok) {
            timelineEl.innerHTML = '<div class="text-white-50 text-center py-3">Please log in to run anomaly detection</div>';
            return;
        }
        const sharesData = await sharesRes.json();
        const holdings = Array.isArray(sharesData) ? sharesData : [];
        const tickers = [...new Set(holdings.filter(s => s.status === 'active').map(s => s.symbol).filter(Boolean))];

        if (tickers.length === 0) {
            timelineEl.innerHTML = '<div class="text-white-50 text-center py-3">Add shares to your portfolio to run anomaly detection</div>';
            return;
        }

        const tickerStr = tickers.join(',');
        const response = await fetch(`/api/shares/ml/anomaly-detection?tickers=${tickerStr}`);
        const result = await response.json();

        if (result.status !== 'success') throw new Error('Anomaly detection failed');

        const data = result.data;

        // Update summary cards
        const totalEl = document.getElementById('anomaly-total');
        const highEl = document.getElementById('anomaly-high');
        const mediumEl = document.getElementById('anomaly-medium');
        const tickersEl = document.getElementById('anomaly-tickers');

        if (totalEl) totalEl.textContent = data.summary.total_anomalies;
        if (highEl) highEl.textContent = data.summary.high_severity;
        if (mediumEl) mediumEl.textContent = data.summary.medium_severity;
        if (tickersEl) tickersEl.textContent = data.summary.tickers_analyzed;

        // Render timeline
        if (data.events.length === 0) {
            timelineEl.innerHTML = `
                <div class="text-center py-4">
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">\u2713</div>
                    <div class="text-white-50">No anomalies detected in the last 6 months — your portfolio looks stable</div>
                </div>
            `;
            return;
        }

        const severityColors = {
            'high': '#fb7185',
            'medium': '#fcd34d',
            'low': '#94a3b8'
        };
        const severityIcons = {
            'high': '\u26a1',
            'medium': '\u25c8',
            'low': '\u00b7'
        };

        let html = '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">';
        data.events.forEach(event => {
            const color = severityColors[event.severity] || '#94a3b8';
            const icon = severityIcons[event.severity] || '\u00b7';
            const priceStr = `${event.metrics.price_change > 0 ? '+' : ''}${event.metrics.price_change}%`;
            html += `
                <div style="border-left: 3px solid ${color}; background: rgba(255,255,255,0.02); border-radius: 0 8px 8px 0; padding: 10px 12px;">
                    <div class="d-flex justify-content-between align-items-center" style="margin-bottom: 4px;">
                        <div class="d-flex align-items-center gap-2">
                            <span style="font-size: 0.9rem;">${icon}</span>
                            <span class="text-white fw-medium" style="font-size: 0.8rem;">${event.ticker}</span>
                            <span class="badge" style="background: ${color}20; color: ${color}; font-size: 0.55rem; padding: 2px 6px;">${event.severity.toUpperCase()}</span>
                        </div>
                        <span class="text-white-50" style="font-size: 0.65rem;">${event.date}</span>
                    </div>
                    <div class="text-white-50" style="font-size: 0.72rem; line-height: 1.3; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${event.description}</div>
                    <div class="d-flex gap-3">
                        <span style="font-size: 0.6rem; color: ${event.metrics.price_change >= 0 ? '#2dd4bf' : '#fb7185'};">▸ Price ${priceStr}</span>
                        <span class="text-white-50" style="font-size: 0.6rem;">▸ Vol ${event.metrics.volume_change > 0 ? '+' : ''}${event.metrics.volume_change}%</span>
                    </div>
                </div>
            `;
        });
        html += '</div>';

        timelineEl.innerHTML = html;

    } catch (error) {
        console.error('Anomaly detection error:', error);
        timelineEl.innerHTML = `<div class="text-white-50 text-center py-3">Anomaly detection failed: ${error.message}</div>`;
    }
}

// ========== CORRELATION ANALYSIS ==========

/**
 * Load correlation analysis results
 */
async function loadCorrelationAnalysis() {
    correlationLoaded = true;
    const heatmapEl = document.getElementById('correlation-heatmap');
    if (!heatmapEl) return;

    try {
        // Get user's tickers from holdings
        const sharesRes = await fetch(`${API_BASE_URL}/shares/holdings`, { headers: getAuthHeaders() });
        if (!sharesRes.ok) {
            heatmapEl.innerHTML = '<div class="text-white-50 text-center py-3">Please log in to run correlation analysis</div>';
            return;
        }
        const sharesData = await sharesRes.json();
        const holdings = Array.isArray(sharesData) ? sharesData : [];
        const tickers = [...new Set(holdings.filter(s => s.status === 'active').map(s => s.symbol).filter(Boolean))];

        if (tickers.length < 2) {
            heatmapEl.innerHTML = '<div class="text-white-50 text-center py-3">Add at least 2 shares to your portfolio for correlation analysis</div>';
            return;
        }

        const tickerStr = tickers.join(',');
        const response = await fetch(`/api/shares/ml/correlation?tickers=${tickerStr}`);
        const result = await response.json();

        if (result.status !== 'success') throw new Error('Correlation analysis failed');

        const data = result.data;

        // Update diversification score
        const scoreEl = document.getElementById('diversification-score');
        const barEl = document.getElementById('diversification-bar');
        const avgEl = document.getElementById('diversification-avg');
        const labelEl = document.getElementById('diversification-label');

        if (scoreEl) {
            const score = data.diversification_score;
            scoreEl.textContent = score;
            const scoreColor = score >= 70 ? '#2dd4bf' : score >= 40 ? '#fcd34d' : '#fb7185';
            scoreEl.style.color = scoreColor;

            if (barEl) {
                barEl.style.width = score + '%';
                barEl.style.background = `linear-gradient(90deg, ${scoreColor}, ${scoreColor}88)`;
            }
            if (labelEl) {
                const labelText = score >= 70 ? 'Well Diversified' : score >= 40 ? 'Moderately Diversified' : 'Low Diversification';
                labelEl.textContent = labelText;
            }
        }
        if (avgEl) {
            avgEl.textContent = `Avg correlation: ${(data.avg_correlation * 100).toFixed(1)}%`;
        }

        // Render correlation heatmap
        renderCorrelationHeatmap(heatmapEl, data.tickers, data.matrix);

        // Render warnings
        const warningsEl = document.getElementById('correlation-warnings');
        if (warningsEl) {
            if (data.warnings.length === 0) {
                warningsEl.innerHTML = '<div class="text-white-50 small">\u2713 No high-correlation warnings</div>';
            } else {
                warningsEl.innerHTML = data.warnings.map(w => `
                    <div class="mb-2 p-2" style="border-left: 2px solid #fb7185; background: rgba(251,113,133,0.05); border-radius: 0 6px 6px 0;">
                        <div class="text-white small">${w.pair} <span style="color: #fb7185;">(${(w.correlation * 100).toFixed(0)}%)</span></div>
                        <div class="text-white-50" style="font-size: 0.75rem;">${w.message}</div>
                    </div>
                `).join('');
            }
        }

        // Render insights
        const insightsEl = document.getElementById('correlation-insights');
        if (insightsEl) {
            if (data.insights.length === 0) {
                insightsEl.innerHTML = '<div class="text-white-50 small">No insights available</div>';
            } else {
                const typeColors = { 'positive': '#2dd4bf', 'warning': '#fcd34d', 'neutral': '#94a3b8' };
                insightsEl.innerHTML = data.insights.map(ins => {
                    const c = typeColors[ins.type] || '#94a3b8';
                    return `
                        <div class="mb-2 p-2" style="border-left: 2px solid ${c}; background: rgba(255,255,255,0.02); border-radius: 0 6px 6px 0;">
                            <div class="text-white-50" style="font-size: 0.8rem;">${ins.message}</div>
                        </div>
                    `;
                }).join('');
            }
        }

    } catch (error) {
        console.error('Correlation analysis error:', error);
        heatmapEl.innerHTML = `<div class="text-white-50 text-center py-3">Correlation analysis failed: ${error.message}</div>`;
    }
}

/**
 * Render correlation heatmap as an HTML table with color-coded cells
 */
function renderCorrelationHeatmap(container, tickers, matrix) {
    const n = tickers.length;

    // Smooth gradient color interpolation: teal (low) → blue → yellow → pink → red (high)
    function corrColor(val, forGlow = false) {
        const t = Math.abs(val);
        let r, g, b;
        if (t < 0.25) {
            // Teal to Blue
            const p = t / 0.25;
            r = Math.round(45 + (96 - 45) * p);
            g = Math.round(212 + (165 - 212) * p);
            b = Math.round(191 + (250 - 191) * p);
        } else if (t < 0.5) {
            // Blue to Yellow
            const p = (t - 0.25) / 0.25;
            r = Math.round(96 + (252 - 96) * p);
            g = Math.round(165 + (211 - 165) * p);
            b = Math.round(250 + (77 - 250) * p);
        } else if (t < 0.75) {
            // Yellow to Pink
            const p = (t - 0.5) / 0.25;
            r = Math.round(252 + (251 - 252) * p);
            g = Math.round(211 + (113 - 211) * p);
            b = Math.round(77 + (133 - 77) * p);
        } else {
            // Pink to Red
            const p = (t - 0.75) / 0.25;
            r = Math.round(251 + (239 - 251) * p);
            g = Math.round(113 + (68 - 113) * p);
            b = Math.round(133 + (68 - 133) * p);
        }
        const alpha = forGlow ? 0.5 : (0.15 + t * 0.55);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    function corrTextColor(val) {
        const t = Math.abs(val);
        if (t < 0.25) return '#5eead4';
        if (t < 0.5) return '#93c5fd';
        if (t < 0.75) return '#fde68a';
        return '#fda4af';
    }

    function corrLabel(val) {
        const t = Math.abs(val);
        if (t >= 0.8) return 'Very High';
        if (t >= 0.6) return 'High';
        if (t >= 0.4) return 'Moderate';
        if (t >= 0.2) return 'Low';
        return 'Very Low';
    }

    // Generate unique tooltip ID
    const tooltipId = 'corr-tooltip-' + Date.now();

    let html = `
        <style>
            .corr-cell {
                text-align: center;
                padding: 10px 6px;
                border-radius: 8px;
                font-size: 0.78rem;
                font-weight: 500;
                min-width: 56px;
                cursor: pointer;
                transition: all 0.25s ease;
                position: relative;
                letter-spacing: 0.02em;
            }
            .corr-cell:hover {
                transform: scale(1.12);
                z-index: 10;
                box-shadow: 0 0 18px var(--cell-glow);
            }
            .corr-diag {
                background: linear-gradient(135deg, rgba(99,102,241,0.35), rgba(139,92,246,0.25)) !important;
                box-shadow: inset 0 0 12px rgba(139,92,246,0.15);
            }
            .corr-diag:hover {
                box-shadow: 0 0 20px rgba(139,92,246,0.4), inset 0 0 12px rgba(139,92,246,0.15);
            }
            .corr-header {
                padding: 8px 6px;
                font-size: 0.7rem;
                color: rgba(255,255,255,0.55);
                font-weight: 600;
                letter-spacing: 0.05em;
                text-transform: uppercase;
            }
            .corr-row-label {
                padding: 8px 10px;
                font-size: 0.7rem;
                color: rgba(255,255,255,0.55);
                font-weight: 600;
                text-align: right;
                letter-spacing: 0.05em;
                white-space: nowrap;
            }
            #${tooltipId} {
                position: fixed;
                pointer-events: none;
                background: rgba(15, 15, 30, 0.95);
                border: 1px solid rgba(255,255,255,0.12);
                backdrop-filter: blur(16px);
                -webkit-backdrop-filter: blur(16px);
                border-radius: 10px;
                padding: 10px 14px;
                font-size: 0.72rem;
                color: rgba(255,255,255,0.85);
                z-index: 9999;
                display: none;
                box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 0 1px rgba(255,255,255,0.1);
                min-width: 140px;
            }
        </style>
        <div id="${tooltipId}"></div>
    `;

    html += '<div style="overflow-x: auto; padding: 4px;">';
    html += '<table style="border-collapse: separate; border-spacing: 4px; width: 100%; table-layout: fixed;">';

    // Header row
    html += '<tr><td></td>';
    for (let j = 0; j < n; j++) {
        html += `<td class="corr-header" style="text-align: center;">${tickers[j]}</td>`;
    }
    html += '</tr>';

    // Data rows
    for (let i = 0; i < n; i++) {
        html += `<tr><td class="corr-row-label">${tickers[i]}</td>`;
        for (let j = 0; j < n; j++) {
            const val = matrix[i][j];
            const isDiag = i === j;
            const bg = isDiag ? '' : `background: ${corrColor(val)};`;
            const tc = isDiag ? '#c4b5fd' : corrTextColor(val);
            const displayVal = val.toFixed(2);
            const glowColor = isDiag ? 'rgba(139,92,246,0.4)' : corrColor(val, true);
            const diagClass = isDiag ? 'corr-diag' : '';
            const fw = Math.abs(val) >= 0.6 ? '600' : '500';
            const pair = isDiag ? tickers[i] : `${tickers[i]} × ${tickers[j]}`;
            const label = isDiag ? 'Self' : corrLabel(val);
            const sign = val > 0 ? 'Positive' : val < 0 ? 'Negative' : 'None';

            html += `<td class="corr-cell ${diagClass}" style="${bg} color: ${tc}; font-weight: ${fw}; --cell-glow: ${glowColor};"
                onmouseenter="(() => {
                    const tt = document.getElementById('${tooltipId}');
                    tt.innerHTML = '<div style=\\'font-weight:600;margin-bottom:4px;color:${tc}\\'>${pair}</div><div style=\\'color:rgba(255,255,255,0.5);font-size:0.65rem;\\'>${label} · ${sign}</div><div style=\\'font-size:1rem;font-weight:700;color:${tc};margin-top:3px;\\'>${displayVal}</div>';
                    tt.style.display = 'block';
                })()"
                onmousemove="(() => {
                    const tt = document.getElementById('${tooltipId}');
                    tt.style.left = (event.clientX + 14) + 'px';
                    tt.style.top = (event.clientY - 10) + 'px';
                })()"
                onmouseleave="document.getElementById('${tooltipId}').style.display='none'"
            >${displayVal}</td>`;
        }
        html += '</tr>';
    }

    html += '</table></div>';

    // Gradient color bar legend
    html += `
        <div style="margin-top: 16px; padding: 0 8px;">
            <div style="display: flex; align-items: center; gap: 10px; justify-content: center;">
                <span style="font-size: 0.6rem; color: #5eead4; font-weight: 600; letter-spacing: 0.05em;">LOW</span>
                <div style="flex: 0 1 220px; height: 8px; border-radius: 4px; background: linear-gradient(90deg, rgba(45,212,191,0.5), rgba(96,165,250,0.5), rgba(252,211,77,0.5), rgba(251,113,133,0.5), rgba(239,68,68,0.5)); box-shadow: 0 0 12px rgba(96,165,250,0.15);"></div>
                <span style="font-size: 0.6rem; color: #fda4af; font-weight: 600; letter-spacing: 0.05em;">HIGH</span>
            </div>
            <div style="text-align: center; margin-top: 6px;">
                <span style="font-size: 0.58rem; color: rgba(255,255,255,0.3); letter-spacing: 0.1em; text-transform: uppercase;">Correlation Intensity</span>
            </div>
        </div>
    `;

    container.innerHTML = html;
}
