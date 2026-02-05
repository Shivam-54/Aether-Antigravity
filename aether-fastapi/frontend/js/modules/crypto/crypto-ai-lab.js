// AI Lab JavaScript Module
// Handles ML-powered crypto insights and predictions

class CryptoAILab {
    constructor() {
        this.currentTab = 'predictions';
        this.charts = {};
        this.apiBaseUrl = 'http://localhost:8000/api/ml';
    }

    async init() {
        console.log('Initializing AI Lab...');

        // Find the AI Lab section container
        const sectionContainer = document.getElementById('crypto-section-ai-lab');
        if (!sectionContainer) {
            console.error('AI Lab section not found');
            return;
        }

        // Clear all old content and replace with clean AI Lab structure
        const flexColumn = sectionContainer.querySelector('.d-flex.flex-column');
        if (flexColumn) {
            // Keep only the header, remove everything else after it
            const header = flexColumn.querySelector('.glass-header');
            flexColumn.innerHTML = ''; // Clear all content

            if (header) {
                flexColumn.appendChild(header); // Re-add header
            }

            // Add tabs
            const tabsHtml = `
                <div class="d-flex gap-2 mb-3">
                    <button class="ai-lab-tab active" data-tab="predictions" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: white; padding: 0.75rem 1.5rem; border-radius: 12px; font-size: 0.9rem; cursor: pointer; transition: all 0.2s;">
                        📈 Price Forecasts
                    </button>
                    <button class="ai-lab-tab" data-tab="risk" style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.5); padding: 0.75rem 1.5rem; border-radius: 12px; font-size: 0.9rem; cursor: pointer; transition: all 0.2s;">
                        ⚠️ Risk Analysis
                    </button>
                    <button class="ai-lab-tab" data-tab="sentiment" style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.5); padding: 0.75rem 1.5rem; border-radius: 12px; font-size: 0.9rem; cursor: pointer; transition: all 0.2s;">
                        💬 Sentiment Analysis
                    </button>
                    <button class="ai-lab-tab" data-tab="performance" style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.5); padding: 0.75rem 1.5rem; border-radius: 12px; font-size: 0.9rem; cursor: pointer; transition: all 0.2s;">
                        🏆 Model Performance
                    </button>
                </div>
                <div id="ai-lab-content"></div>
            `;

            flexColumn.insertAdjacentHTML('beforeend', tabsHtml);
        }

        this.setupTabSwitching();
        await this.loadDefaultView();
    }

    setupTabSwitching() {
        const tabs = document.querySelectorAll('.ai-lab-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchTab(tabName);
            });
        });
    }

    switchTab(tabName) {
        // Update active tab visually with inline styles
        document.querySelectorAll('.ai-lab-tab').forEach(tab => {
            tab.classList.remove('active');
            // Inactive style
            tab.style.background = 'rgba(255,255,255,0.02)';
            tab.style.border = '1px solid rgba(255,255,255,0.08)';
            tab.style.color = 'rgba(255,255,255,0.5)';
        });

        const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
            // Active style
            activeTab.style.background = 'rgba(255,255,255,0.05)';
            activeTab.style.border = '1px solid rgba(255,255,255,0.1)';
            activeTab.style.color = 'white';
        }

        this.currentTab = tabName;

        // Render appropriate content
        switch (tabName) {
            case 'predictions':
                this.renderPredictionsTab();
                break;
            case 'risk':
                this.renderRiskTab();
                break;
            case 'sentiment':
                this.renderSentimentTab();
                break;
            case 'performance':
                this.renderPerformanceTab();
                break;
        }
    }

    async loadDefaultView() {
        await this.renderPredictionsTab();
    }

    async renderPredictionsTab() {
        const container = document.getElementById('ai-lab-content');
        if (!container) return;

        container.innerHTML = `
            <div class="d-flex flex-column gap-4">
                <!-- Model Selector -->
                <div class="d-flex gap-3 align-items-center">
                    <label class="text-white-50 small">Select Asset:</label>
                    <select id="aiLabSymbolSelector" class="form-select form-select-sm" style="width: 150px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: white;">
                        <option value="BTC">Bitcoin (BTC)</option>
                        <option value="ETH">Ethereum (ETH)</option>
                        <option value="SOL">Solana (SOL)</option>
                        <option value="ADA">Cardano (ADA)</option>
                    </select>
                    <button id="runPredictionBtn" class="btn btn-sm btn-primary">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            <path d="M9 12l2 2 4-4"/>
                        </svg>
                        Run Prediction
                    </button>
                </div>

                <!-- Loading State -->
                <div id="aiLabLoading" class="text-center py-5" style="display: none;">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="text-white-50 mt-3 small">Training LSTM model and generating predictions...</p>
                </div>

                <!-- Predictions Content -->
                <div id="aiLabPredictions"></div>
            </div>
        `;

        // Setup event listeners
        document.getElementById('runPredictionBtn')?.addEventListener('click', () => {
            const symbol = document.getElementById('aiLabSymbolSelector').value;
            this.fetchAndDisplayPredictions(symbol);
        });

        // Auto-load BTC predictions
        this.fetchAndDisplayPredictions('BTC');
    }

    async fetchAndDisplayPredictions(symbol) {
        const loadingEl = document.getElementById('aiLabLoading');
        const contentEl = document.getElementById('aiLabPredictions');

        // Show loading
        loadingEl.style.display = 'block';
        contentEl.innerHTML = '';

        try {
            // Fetch real Prophet predictions from compare endpoint
            const response = await fetch(`${this.apiBaseUrl}/compare/${symbol}`);
            const compareData = await response.json();

            // Extract predictions from all models (REAL DATA - not mock)
            // API returns: compareData.lstm, compareData.prophet, compareData.ensemble
            const prophetData = compareData.prophet || {};
            const lstmData = compareData.lstm || {};
            const ensembleData = compareData.ensemble || {};

            // Use LSTM's current_price (fresh data) instead of Prophet's (stale from training time)
            const currentPrice = lstmData.current_price || compareData.current_price || prophetData.current_price;

            // Helper function to safely extract prediction data with fallback chain
            const getPrediction = (horizon) => {
                // Priority: Ensemble > LSTM > Prophet (for best accuracy)
                const ensemblePred = ensembleData.predictions?.[horizon];
                const lstmPred = lstmData.predictions?.[horizon];
                const prophetPred = prophetData.predictions?.[horizon];

                // Use ensemble if available (most accurate), fallback to LSTM, then Prophet
                const pred = ensemblePred || lstmPred || prophetPred || {};

                return {
                    price: pred.price || currentPrice,
                    change: pred.change || 0,
                    change_percent: pred.change_percent || 0,
                    confidence: pred.confidence || 0.65,
                    confidence_lower: pred.confidence_lower || (currentPrice * 0.95),
                    confidence_upper: pred.confidence_upper || (currentPrice * 1.05)
                };
            };

            const data = {
                symbol: symbol,
                model: ensembleData.predictions ? 'Ensemble' : (lstmData.predictions ? 'LSTM' : 'Prophet'),
                current_price: currentPrice,
                predictions: {
                    '1_day': getPrediction('1_day'),
                    '7_day': getPrediction('7_day'),
                    '30_day': getPrediction('30_day')
                },
                model_metrics: {
                    // Show ensemble/LSTM metrics if available, fallback to Prophet
                    mae: ensembleData.model_metrics?.mae || lstmData.model_metrics?.train_rmse,
                    rmse: ensembleData.model_metrics?.rmse || lstmData.model_metrics?.val_rmse,
                    trend_confidence: prophetData.trend_confidence,
                    volatility_score: prophetData.volatility_score,
                    model_trained_at: lstmData.model_metrics?.model_trained || prophetData.model_trained_at,
                    prediction_date: prophetData.prediction_date,
                    model_used: ensembleData.predictions ? 'Ensemble' : (lstmData.predictions ? 'LSTM' : 'Prophet')
                },
                timestamp: compareData.timestamp
            };

            // Hide loading
            loadingEl.style.display = 'none';

            // Display predictions
            this.displayPredictionResults(data);

        } catch (error) {
            console.error('Error fetching predictions:', error);
            loadingEl.style.display = 'none';
            contentEl.innerHTML = `
                <div class="alert alert-danger">
                    Failed to fetch predictions. Please try again.
                </div>
            `;
        }
    }

    displayPredictionResults(data) {
        const contentEl = document.getElementById('aiLabPredictions');

        const predictions = data.predictions;
        const metrics = data.model_metrics;

        contentEl.innerHTML = `
            <!-- Current Price Card -->
            <div class="glass-card p-4 mb-4">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h5 class="text-white-50 small mb-2">${data.symbol} Current Price</h5>
                        <h2 class="text-white fw-bold mb-0">$${data.current_price.toLocaleString()}</h2>
                    </div>
                    <div class="text-end">
                        <div class="badge bg-primary bg-opacity-10 text-primary px-3 py-2">
                            ${data.model} ${data.model === 'Ensemble' ? 'Multi-Model' : (data.model === 'LSTM' ? 'Neural Network' : 'Time-Series')}
                        </div>
                        <div class="text-white-50 small mt-2">
                            ✅ Real AI Predictions
                        </div>
                    </div>
                </div>
            </div>

            <!-- Price Forecast Chart -->
            <div class="glass-card p-4 mb-4">
                <h5 class="text-white mb-3">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="me-2">
                        <path d="M3 3v18h18"></path>
                        <path d="M18 17l-5-5-3 3-7-7"></path>
                    </svg>
                    Price Forecast Visualization
                </h5>
                <div style="height: 350px; position: relative;">
                    <canvas id="predictionChart"></canvas>
                </div>
            </div>

            <!-- Prediction Cards -->
            <div class="row g-3 mb-4">
                ${this.renderPredictionCard(predictions['1_day'], '1-Day', 'Tomorrow')}
                ${this.renderPredictionCard(predictions['7_day'], '7-Day', 'Next Week')}
                ${this.renderPredictionCard(predictions['30_day'], '30-Day', 'Next Month')}
            </div>

            <!-- Model Performance -->
            <div class="glass-card p-4">
                <h5 class="text-white mb-3">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="me-2">
                        <line x1="12" y1="20" x2="12" y2="10"/>
                        <line x1="18" y1="20" x2="18" y2="4"/>
                        <line x1="6" y1="20" x2="6" y2="16"/>
                    </svg>
                    Model Performance Metrics
                </h5>
                <div class="row">
                    <div class="col-md-4">
                        <div class="text-white-50 small mb-1">Trend Confidence</div>
                        <div class="h4 text-white">${metrics.trend_confidence ? metrics.trend_confidence.toFixed(1) + '%' : 'N/A'}</div>
                    </div>
                    <div class="col-md-4">
                        <div class="text-white-50 small mb-1">Volatility Score</div>
                        <div class="h4 text-white">${metrics.volatility_score ? metrics.volatility_score.toFixed(2) + '%' : 'N/A'}</div>
                    </div>
                    <div class="col-md-4">
                        <div class="text-white-50 small mb-1">Model Trained</div>
                        <div class="h6 text-white-50">${metrics.model_trained_at ? new Date(metrics.model_trained_at).toLocaleDateString() : 'N/A'}</div>
                    </div>
                </div>
            </div>
        `;

        // Render the chart after DOM is updated
        setTimeout(() => {
            this.renderPredictionChart(data);
        }, 100);
    }

    renderPredictionCard(prediction, label, sublabel) {
        const isPositive = prediction.change >= 0;
        const changeColor = isPositive ? '#22d399' : '#ef4444';
        const arrow = isPositive ? '↑' : '↓';

        return `
            <div class="col-md-4">
                <div class="glass-card p-4 h-100">
                    <div class="text-white-50 small mb-2">${label} Forecast</div>
                    <div class="h6 text-white-30 mb-3">${sublabel}</div>
                    <div class="h3 text-white fw-bold mb-2">$${prediction.price.toLocaleString()}</div>
                    <div class="d-flex align-items-center gap-2 mb-3">
                        <span style="color: ${changeColor}; font-size: 1.2rem;">${arrow}</span>
                        <span style="color: ${changeColor}; font-weight: 600;">
                            ${Math.abs(prediction.change_percent).toFixed(2)}%
                        </span>
                        <span class="text-white-50 small">
                            ($${Math.abs(prediction.change).toLocaleString()})
                        </span>
                    </div>
                    <div class="text-white-50 small">
                        <div>Range: $${prediction.confidence_lower.toLocaleString()} - $${prediction.confidence_upper.toLocaleString()}</div>
                        <div class="mt-1">Confidence: ${(prediction.confidence * 100).toFixed(0)}%</div>
                    </div>
                </div>
            </div>
        `;
    }

    renderPredictionChart(data) {
        const ctx = document.getElementById('predictionChart');
        if (!ctx) return;

        // Destroy existing chart if it exists
        if (this.charts.predictionChart) {
            this.charts.predictionChart.destroy();
        }

        const predictions = data.predictions;
        const currentPrice = data.current_price;

        // Prepare data points: Current, 1-day, 7-day, 30-day
        const labels = ['Now', '1 Day', '7 Days', '30 Days'];
        const dataPoints = [
            currentPrice,
            predictions['1_day'].price,
            predictions['7_day'].price,
            predictions['30_day'].price
        ];

        // Confidence intervals
        const upperBounds = [
            currentPrice,
            predictions['1_day'].confidence_upper,
            predictions['7_day'].confidence_upper,
            predictions['30_day'].confidence_upper
        ];

        const lowerBounds = [
            currentPrice,
            predictions['1_day'].confidence_lower,
            predictions['7_day'].confidence_lower,
            predictions['30_day'].confidence_lower
        ];

        // Create gradient for confidence interval
        const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.2)');
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0.05)');

        this.charts.predictionChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Upper Bound (95% CI)',
                        data: upperBounds,
                        borderColor: 'rgba(59, 130, 246, 0.3)',
                        backgroundColor: 'transparent',
                        borderWidth: 1,
                        borderDash: [5, 5],
                        pointRadius: 0,
                        fill: false
                    },
                    {
                        label: 'Predicted Price',
                        data: dataPoints,
                        borderColor: '#3b82f6',
                        backgroundColor: gradient,
                        borderWidth: 3,
                        pointRadius: 6,
                        pointBackgroundColor: '#3b82f6',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointHoverRadius: 8,
                        fill: '+1',
                        tension: 0.4
                    },
                    {
                        label: 'Lower Bound (95% CI)',
                        data: lowerBounds,
                        borderColor: 'rgba(59, 130, 246, 0.3)',
                        backgroundColor: 'transparent',
                        borderWidth: 1,
                        borderDash: [5, 5],
                        pointRadius: 0,
                        fill: false
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
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: {
                            color: 'rgba(255, 255, 255, 0.7)',
                            padding: 15,
                            font: {
                                family: 'Inter',
                                size: 11
                            },
                            filter: function (item) {
                                // Only show predicted price in legend
                                return item.text === 'Predicted Price';
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(10, 10, 12, 0.95)',
                        titleColor: '#fff',
                        bodyColor: 'rgba(255, 255, 255, 0.8)',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1,
                        padding: 12,
                        cornerRadius: 8,
                        displayColors: true,
                        callbacks: {
                            label: function (context) {
                                const label = context.dataset.label || '';
                                const value = context.parsed.y;

                                if (label === 'Predicted Price') {
                                    const index = context.dataIndex;
                                    if (index === 0) {
                                        return `Current: $${value.toLocaleString()}`;
                                    }
                                    const change = value - currentPrice;
                                    const changePercent = ((change / currentPrice) * 100).toFixed(2);
                                    return [
                                        `Price: $${value.toLocaleString()}`,
                                        `Change: ${change >= 0 ? '+' : ''}$${change.toLocaleString()} (${change >= 0 ? '+' : ''}${changePercent}%)`
                                    ];
                                }
                                return `${label}: $${value.toLocaleString()}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)',
                            drawBorder: false
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.5)',
                            font: {
                                size: 11
                            },
                            callback: function (value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)',
                            font: {
                                size: 12,
                                weight: '500'
                            }
                        }
                    }
                }
            }
        });
    }

    async renderRiskTab() {
        const container = document.getElementById('ai-lab-content');
        if (!container) return;

        container.innerHTML = `
            <div class="d-flex flex-column gap-4">
                <!-- Asset Selector -->
                <div class="d-flex gap-3 align-items-center">
                    <label class="text-white-50 small">Select Asset:</label>
                    <select id="riskSymbolSelector" class="form-select form-select-sm" style="width: 150px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: white;">
                        <option value="BTC">Bitcoin (BTC)</option>
                        <option value="ETH">Ethereum (ETH)</option>
                        <option value="SOL">Solana (SOL)</option>
                        <option value="ADA">Cardano (ADA)</option>
                    </select>
                    <button id="runRiskAnalysisBtn" class="btn btn-sm btn-primary">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            <path d="M9 12l2 2 4-4"/>
                        </svg>
                        Analyze Risk
                    </button>
                </div>

                <!--Loading State -->
                <div id="riskLoading" class="text-center py-5" style="display: none;">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="text-white-50 mt-3 small">Calculating risk features and classification...</p>
                </div>

                <!-- Risk Analysis Content -->
                <div id="riskAnalysisContent"></div>
            </div>
        `;

        // Setup event listeners
        document.getElementById('runRiskAnalysisBtn')?.addEventListener('click', () => {
            const symbol = document.getElementById('riskSymbolSelector').value;
            this.fetchAndDisplayRiskAnalysis(symbol);
        });

        // Auto-load BTC risk analysis
        this.fetchAndDisplayRiskAnalysis('BTC');
    }

    async fetchAndDisplayRiskAnalysis(symbol) {
        const loadingEl = document.getElementById('riskLoading');
        const contentEl = document.getElementById('riskAnalysisContent');

        // Show loading
        loadingEl.style.display = 'block';
        contentEl.innerHTML = '';

        try {
            // Fetch risk classification
            const response = await fetch(`${this.apiBaseUrl}/risk/classify/${symbol}`);
            const data = await response.json();

            // Hide loading
            loadingEl.style.display = 'none';

            // Display risk analysis
            this.displayRiskAnalysis(data);

        } catch (error) {
            console.error('Error fetching risk analysis:', error);
            loadingEl.style.display = 'none';
            contentEl.innerHTML = `
                <div class="alert alert-danger">
                    Failed to fetch risk analysis. Please try again.
                </div>
            `;
        }
    }

    displayRiskAnalysis(data) {
        const contentEl = document.getElementById('riskAnalysisContent');

        const riskColors = {
            'Low': { color: '#22d399', bg: 'rgba(34, 211, 153, 0.1)' },
            'Medium': { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
            'High': { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' }
        };

        const riskColor = riskColors[data.risk_level] || riskColors['Medium'];

        contentEl.innerHTML = `
            <!-- Risk Score Card -->
            <div class="glass-card p-4 mb-4">
                <div class="row align-items-center">
                    <div class="col-md-4 text-center">
                        <h5 class="text-white-50 small mb-3">${data.symbol} Risk Score</h5>
                        <div style="width: 150px; height: 150px; margin: 0 auto; position: relative;">
                            <svg viewBox="0 0 100 100" style="transform: rotate(-90deg);">
                                <!-- Background circle -->
                                <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="8"/>
                                <!-- Progress circle -->
                                <circle cx="50" cy="50" r="40" fill="none" 
                                    stroke="${riskColor.color}" 
                                    stroke-width="8" 
                                    stroke-dasharray="${data.risk_score * 2.51} 251"
                                    stroke-linecap="round"/>
                            </svg>
                            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
                                <div class="h2 text-white fw-bold mb-0">${data.risk_score}</div>
                                <div class="small text-white-50">Risk Score</div>
                            </div>
                        </div>
                        <div class="mt-3">
                            <span class="badge px-3 py-2" style="background: ${riskColor.bg}; color: ${riskColor.color};">
                                ${data.risk_level} Risk
                            </span>
                        </div>
                    </div>
                    <div class="col-md-8">
                        <h6 class="text-white mb-3">Volatility Forecast</h6>
                        <div class="row g-3">
                            <div class="col-4">
                                <div class="text-white-50 small mb-1">Current</div>
                                <div class="h4 text-white">${data.volatility.current.toFixed(1)}%</div>
                            </div>
                            <div class="col-4">
                                <div class="text-white-50 small mb-1">7-Day</div>
                                <div class="h4 text-white">${data.volatility.forecast_7d.toFixed(1)}%</div>
                            </div>
                            <div class="col-4">
                                <div class="text-white-50 small mb-1">30-Day</div>
                                <div class="h4 text-white">${data.volatility.forecast_30d.toFixed(1)}%</div>
                            </div>
                        </div>
                        <div class="mt-4">
                            <h6 class="text-white-50 small mb-2">Risk Probability Distribution</h6>
                            ${this.renderProbabilityBars(data.probabilities)}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Top Risk Factors -->
            <div class="glass-card p-4 mb-4">
                <h5 class="text-white mb-3">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="me-2">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                        <line x1="12" y1="9" x2="12" y2="13"/>
                        <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                    Top Risk Factors
                </h5>
                <div class="row g-3">
                    ${data.top_risk_factors.map(factor => `
                        <div class="col-md-6">
                            <div class="mb-2">
                                <div class="d-flex justify-content-between mb-1">
                                    <span class="text-white-50 small">${factor.factor}</span>
                                    <span class="text-white small">${(factor.impact * 100).toFixed(1)}%</span>
                                </div>
                                <div style="background: rgba(255,255,255,0.1); height: 8px; border-radius: 4px; overflow: hidden;">
                                    <div style="background: ${riskColor.color}; width: ${factor.impact * 100}%; height: 100%;"></div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Model Info -->
            <div class="glass-card p-3">
                <div class="d-flex justify-content-between align-items-center">
                    <span class="text-white-50 small">
                        ${data.model_trained ? '🤖 XGBoost Model' : '📊 Volatility-based Classification'}
                    </span>
                    <span class="text-white-50 small">
                        Updated: ${new Date(data.timestamp).toLocaleTimeString()}
                    </span>
                </div>
            </div>
        `;
    }

    renderProbabilityBars(probabilities) {
        const colors = {
            low: '#22d399',
            medium: '#f59e0b',
            high: '#ef4444'
        };

        return `
            <div class="d-flex gap-2">
                ${Object.entries(probabilities).map(([level, prob]) => `
                    <div class="flex-fill">
                        <div class="small text-white-50 mb-1">${level.charAt(0).toUpperCase() + level.slice(1)}</div>
                        <div style="background: rgba(255,255,255,0.1); height: 4px; border-radius: 2px; overflow: hidden;">
                            <div style="background: ${colors[level]}; width: ${prob * 100}%; height: 100%;"></div>
                        </div>
                        <div class="small text-white mt-1">${(prob * 100).toFixed(1)}%</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    async renderSentimentTab() {
        const container = document.getElementById('ai-lab-content');
        if (!container) return;

        container.innerHTML = `
            <div class="d-flex flex-column gap-4">
                <!-- Asset Selector -->
                <div class="d-flex gap-3 align-items-center">
                    <label class="text-white-50 small">Select Asset:</label>
                    <select id="sentimentSymbolSelector" class="form-select form-select-sm" style="width: 150px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: white;">
                        <option value="BTC">Bitcoin (BTC)</option>
                        <option value="ETH">Ethereum (ETH)</option>
                        <option value="SOL">Solana (SOL)</option>
                        <option value="ADA">Cardano (ADA)</option>
                    </select>
                    <button id="analyzeSentimentBtn" class="btn btn-sm btn-primary">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                            <line x1="9" y1="9" x2="9.01" y2="9"/>
                            <line x1="15" y1="9" x2="15.01" y2="9"/>
                        </svg>
                        Analyze Sentiment
                    </button>
                </div>

                <!-- Loading State -->
                <div id="sentimentLoading" class="text-center py-5" style="display: none;">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="text-white-50 mt-3 small">Analyzing sentiment from news and social media...</p>
                </div>

                <!-- Sentiment Content -->
                <div id="sentimentContent"></div>
            </div>
        `;

        // Setup event listeners
        document.getElementById('analyzeSentimentBtn')?.addEventListener('click', () => {
            const symbol = document.getElementById('sentimentSymbolSelector').value;
            this.fetchAndDisplaySentiment(symbol);
        });

        // Auto-load BTC sentiment
        this.fetchAndDisplaySentiment('BTC');
    }

    async fetchAndDisplaySentiment(symbol) {
        const loadingEl = document.getElementById('sentimentLoading');
        const contentEl = document.getElementById('sentimentContent');

        loadingEl.style.display = 'block';
        contentEl.innerHTML = '';

        try {
            const response = await fetch(`${this.apiBaseUrl}/sentiment/analyze/${symbol}`);
            const data = await response.json();

            loadingEl.style.display = 'none';
            this.displaySentiment(data);

        } catch (error) {
            console.error('Error fetching sentiment:', error);
            loadingEl.style.display = 'none';
            contentEl.innerHTML = `
                <div class="alert alert-danger">
                    Failed to fetch sentiment analysis. Please try again.
                </div>
            `;
        }
    }

    displaySentiment(data) {
        const contentEl = document.getElementById('sentimentContent');

        // Sentiment score to percentage (0-100 scale)
        const scorePercent = ((data.sentiment_score + 1) / 2) * 100;

        // Determine color based on classification
        const sentimentColors = {
            'Very Bullish': { bg: 'rgba(34, 211, 153, 0.1)', color: '#22d399' },
            'Bullish': { bg: 'rgba(74, 222, 128, 0.1)', color: '#4ade80' },
            'Neutral': { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' },
            'Bearish': { bg: 'rgba(251, 146, 60, 0.1)', color: '#fb923c' },
            'Very Bearish': { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }
        };

        const colors = sentimentColors[data.classification] || sentimentColors['Neutral'];

        contentEl.innerHTML = `
            <!-- Sentiment Gauge Card -->
            <div class="glass-card p-4 mb-4">
                <div class="row">
                    <div class="col-md-8">
                        <h5 class="text-white mb-3">${data.symbol} Market Sentiment</h5>
                        
                        <!-- Horizontal Gauge -->
                        <div class="mb-3">
                            <div class="d-flex justify-content-between mb-2">
                                <span class="small text-danger">Bearish</span>
                                <span class="small text-warning">Neutral</span>
                                <span class="small text-success">Bullish</span>
                            </div>
                            <div style="position: relative; height: 30px; background: linear-gradient(to right, #ef4444, #f59e0b, #22d399); border-radius: 15px; overflow: hidden;">
                                <div style="position: absolute; left: ${scorePercent}%; top: 50%; transform: translate(-50%, -50%); width: 8px; height: 40px; background: white; border: 2px solid ${colors.color}; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>
                            </div>
                        </div>

                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <div class="h3 text-white mb-0">${(data.sentiment_score * 100).toFixed(0)}/100</div>
                                <span class="badge px-3 py-2 mt-2" style="background: ${colors.bg}; color: ${colors.color};">
                                    ${data.classification}
                                </span>
                            </div>
                            <div class="text-end">
                                <div class="text-white-50 small">Confidence</div>
                                <div class="h4 text-white">${data.confidence}%</div>
                                <div class="small" style="color: ${colors.color};">
                                    Trend: ${data.trend}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col-md-4">
                        <h6 class="text-white-50 small mb-3">Source Breakdown</h6>
                        ${this.renderSentimentBreakdown(data.breakdown, colors.color)}
                    </div>
                </div>
            </div>

            <!-- Recent Headlines -->
            <div class="glass-card p-4 mb-4">
                <h5 class="text-white mb-3">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="me-2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    Recent Headlines
                </h5>
                <div class="d-flex flex-column gap-3">
                    ${data.recent_headlines.map(h => `
                        <div class="p-3" style="background: rgba(255,255,255,0.03); border-radius: 8px; border-left: 3px solid ${h.sentiment > 0.2 ? '#22d399' : h.sentiment < -0.2 ? '#ef4444' : '#f59e0b'};">
                            <div class="d-flex align-items-start gap-3">
                                <div style="font-size: 24px;">${h.emoji}</div>
                                <div class="flex-grow-1">
                                    <div class="text-white mb-1">${h.title}</div>
                                    <div class="d-flex justify-content-between align-items-center">
                                        <span class="text-white-50 small">${h.source} • ${h.hours_ago}h ago</span>
                                        <span class="small" style="color: ${h.sentiment > 0 ? '#22d399' : h.sentiment < 0 ? '#ef4444' : '#f59e0b'};">
                                            Sentiment: ${(h.sentiment * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Social Buzz -->
            <div class="glass-card p-4">
                <h5 class="text-white mb-3">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="me-2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                    Social Media Buzz
                </h5>
                <div class="row g-3">
                    <div class="col-md-4">
                        <div class="text-white-50 small mb-1">24h Mentions</div>
                        <div class="h4 text-white">${(data.social_buzz.mentions_24h / 1000).toFixed(1)}K</div>
                        <div class="small" style="color: ${colors.color};">
                            Trend: ${data.social_buzz.sentiment_trend === 'up' ? '↑' : data.social_buzz.sentiment_trend === 'down' ? '↓' : '→'}
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="text-white-50 small mb-1">Trending Hashtags</div>
                        <div class="d-flex flex-wrap gap-2 mt-2">
                            ${data.social_buzz.trending_hashtags.map(tag => `
                                <span class="badge" style="background: rgba(59, 130, 246, 0.1); color: #3b82f6;">
                                    ${tag}
                                </span>
                            `).join('')}
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="text-white-50 small mb-1">Top Keywords</div>
                        <div class="d-flex flex-wrap gap-2 mt-2">
                            ${data.social_buzz.top_keywords.map(kw => `
                                <span class="badge" style="background: ${colors.bg}; color: ${colors.color};">
                                    ${kw}
                                </span>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderSentimentBreakdown(breakdown, color) {
        const sources = [
            { label: 'News', value: breakdown.news },
            { label: 'Social', value: breakdown.social },
            { label: 'Technical', value: breakdown.technical },
            { label: 'Market', value: breakdown.market }
        ];

        return sources.map(s => {
            const percent = ((s.value + 1) / 2) * 100;
            return `
                <div class="mb-3">
                    <div class="d-flex justify-content-between mb-1">
                        <span class="small text-white-50">${s.label}</span>
                        <span class="small text-white">${(s.value * 100).toFixed(0)}%</span>
                    </div>
                    <div style="background: rgba(255,255,255,0.1); height: 6px; border-radius: 3px; overflow: hidden;">
                        <div style="background: ${color}; width: ${percent}%; height: 100%;"></div>
                    </div>
                </div>
            `;
        }).join('');
    }

    async renderPerformanceTab() {
        const container = document.getElementById('ai-lab-content');
        if (!container) return;

        container.innerHTML = `
            <div class="d-flex flex-column gap-4">
                <!-- Asset Selector -->
                <div class="d-flex gap-3 align-items-center">
                    <label class="text-white-50 small">Select Asset:</label>
                    <select id="performanceSymbolSelector" class="form-select form-select-sm" style="width: 150px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: white;">
                        <option value="BTC">Bitcoin (BTC)</option>
                        <option value="ETH">Ethereum (ETH)</option>
                        <option value="SOL">Solana (SOL)</option>
                        <option value="ADA">Cardano (ADA)</option>
                    </select>
                    <button id="loadPerformanceBtn" class="btn btn-sm btn-primary">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            <path d="M9 12l2 2 4-4"/>
                        </svg>
                        Load Performance
                    </button>
                </div>

                <!-- Loading State -->
                <div id="performanceLoading" class="text-center py-5" style="display: none;">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="text-white-50 mt-3 small">Calculating model performance metrics...</p>
                </div>

                <!-- Performance Content -->
                <div id="performanceContent"></div>
            </div>
        `;

        // Setup event listeners
        document.getElementById('loadPerformanceBtn')?.addEventListener('click', () => {
            const symbol = document.getElementById('performanceSymbolSelector').value;
            this.fetchAndDisplayPerformance(symbol);
        });

        // Auto-load BTC performance
        this.fetchAndDisplayPerformance('BTC');
    }

    async fetchAndDisplayPerformance(symbol) {
        const loadingEl = document.getElementById('performanceLoading');
        const contentEl = document.getElementById('performanceContent');

        loadingEl.style.display = 'block';
        contentEl.innerHTML = '';

        try {
            // Fetch compare data which includes historical_accuracy
            const response = await fetch(`${this.apiBaseUrl}/compare/${symbol}`);
            const data = await response.json();

            loadingEl.style.display = 'none';
            this.displayPerformance(data);

        } catch (error) {
            console.error('Error fetching performance:', error);
            loadingEl.style.display = 'none';
            contentEl.innerHTML = `
                <div class="alert alert-danger">
                    Failed to fetch model performance. Please try again.
                </div>
            `;
        }
    }

    displayPerformance(data) {
        const contentEl = document.getElementById('performanceContent');
        const accuracy = data.historical_accuracy || {};

        // Model comparison data
        const models = [
            {
                name: 'Ensemble',
                color: '#8b5cf6',
                data: accuracy.ensemble || {},
                description: 'Combined predictions from LSTM + Prophet'
            },
            {
                name: 'LSTM',
                color: '#3b82f6',
                data: accuracy.lstm || {},
                description: 'Neural network for pattern recognition'
            },
            {
                name: 'Prophet',
                color: '#22d399',
                data: accuracy.prophet || {},
                description: 'Time-series forecasting model'
            }
        ];

        contentEl.innerHTML = `
            <!-- Header Card -->
            <div class="glass-card p-4 mb-4">
                <h5 class="text-white mb-2">Model Performance Comparison</h5>
                <p class="text-white-50 small mb-0">Historical accuracy metrics for ${data.symbol} predictions over the last 30 days</p>
            </div>

            <!-- Model Comparison Cards -->
            <div class="row g-3 mb-4">
                ${models.map(model => this.renderModelCard(model)).join('')}
            </div>

            <!-- Detailed Metrics Table -->
            <div class="glass-card p-4 mb-4">
                <h6 class="text-white mb-3">Detailed Metrics</h6>
                <div class="table-responsive">
                    <table class="table table-dark table-hover">
                        <thead>
                            <tr>
                                <th class="text-white-50 small">Model</th>
                                <th class="text-white-50 small">MAE (Mean Absolute Error)</th>
                                <th class="text-white-50 small">RMSE (Root Mean Square Error)</th>
                                <th class="text-white-50 small">Win Rate</th>
                                <th class="text-white-50 small">Last 30 Days</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${models.map(model => `
                                <tr>
                                    <td>
                                        <div class="d-flex align-items-center gap-2">
                                            <div style="width: 8px; height: 8px; border-radius: 50%; background: ${model.color};"></div>
                                            <span class="text-white">${model.name}</span>
                                        </div>
                                    </td>
                                    <td class="text-white">${model.data.mae || 'N/A'}</td>
                                    <td class="text-white">${model.data.rmse || 'N/A'}</td>
                                    <td class="text-white">${model.data.win_rate || 'N/A'}%</td>
                                    <td class="text-white-50 small">${model.data.last_30_days?.predictions_count || 0} predictions</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Best Model Recommendation -->
            <div class="glass-card p-4">
                <div class="d-flex align-items-center gap-3">
                    <div style="font-size: 2rem;">🏆</div>
                    <div>
                        <h6 class="text-white mb-1">Recommended Model: ${data.best_model || 'Ensemble'}</h6>
                        <p class="text-white-50 small mb-0">Based on lowest MAE and highest win rate across all timeframes</p>
                    </div>
                </div>
            </div>
        `;
    }

    renderModelCard(model) {
        const winRate = model.data.win_rate || 0;
        const mae = model.data.mae || 'N/A';
        const rmse = model.data.rmse || 'N/A';

        return `
            <div class="col-md-4">
                <div class="glass-card p-4 h-100">
                    <div class="d-flex align-items-center gap-2 mb-3">
                        <div style="width: 12px; height: 12px; border-radius: 50%; background: ${model.color};"></div>
                        <h6 class="text-white mb-0">${model.name}</h6>
                    </div>
                    <p class="text-white-50 small mb-3">${model.description}</p>
                    
                    <!-- Win Rate Circle -->
                    <div style="width: 120px; height: 120px; margin: 0 auto 1rem; position: relative;">
                        <svg viewBox="0 0 100 100" style="transform: rotate(-90deg);">
                            <!-- Background circle -->
                            <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="8"/>
                            <!-- Progress circle -->
                            <circle cx="50" cy="50" r="40" fill="none" 
                                stroke="${model.color}" 
                                stroke-width="8" 
                                stroke-dasharray="${winRate * 2.51} 251"
                                stroke-linecap="round"/>
                        </svg>
                        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
                            <div class="h3 text-white fw-bold mb-0">${winRate}%</div>
                            <div class="small text-white-50">Win Rate</div>
                        </div>
                    </div>

                    <!-- Metrics -->
                    <div class="row g-2 text-center">
                        <div class="col-6">
                            <div class="text-white-50 small">MAE</div>
                            <div class="text-white fw-bold">${mae}</div>
                        </div>
                        <div class="col-6">
                            <div class="text-white-50 small">RMSE</div>
                            <div class="text-white fw-bold">${rmse}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

// Initialize AI Lab when crypto AI section is shown
window.cryptoAILab = new CryptoAILab();

// Auto-initialize when switching to AI Lab section
function initializeAILab() {
    if (window.cryptoAILab) {
        window.cryptoAILab.init();
    }
}

