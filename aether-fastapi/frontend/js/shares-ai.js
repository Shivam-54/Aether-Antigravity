/**
 * Shares AI Lab - Price Prediction Frontend
 */

let currentTicker = 'AAPL';
let currentHorizon = 30;
let predictionChart = null;

/**
 * Initialize Shares AI Lab when section becomes visible
 */
function initializeSharesAILab() {
    console.log('Initializing Shares AI Lab');
    loadSharesForPrediction();
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

// Make function globally accessible
window.initializeSharesAILab = initializeSharesAILab;
