// AI Lab JavaScript Module
// Handles ML-powered crypto insights and predictions

class CryptoAILab {
    constructor() {
        this.currentTab = 'predictions-risk';
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

            // Add tabs - grouped like Shares AI Lab
            const tabsHtml = `
                <div class="glass-card mb-4 p-3">
                    <div class="d-flex align-items-center justify-content-between mb-3 px-1">
                        <span class="text-white-50 small fw-medium" style="letter-spacing: 0.08em; text-transform: uppercase; font-size: 0.65rem;">Select Feature</span>
                    </div>
                    <div class="ai-lab-tab-grid">
                        <button class="ai-lab-tab active" data-tab="predictions-risk">
                            <div class="tab-icon-wrap">📈</div>
                            <div class="tab-content">
                                <span class="tab-title">Forecasts & Risk</span>
                                <span class="tab-desc">Price predictions + Risk analysis</span>
                            </div>
                        </button>
                        <button class="ai-lab-tab" data-tab="insights-sentiment">
                            <div class="tab-icon-wrap">✨</div>
                            <div class="tab-content">
                                <span class="tab-title">Insights & Sentiment</span>
                                <span class="tab-desc">AI analysis + News signals</span>
                            </div>
                            <span class="tab-badge" style="background: rgba(118,75,162,0.3); color: #c4b5fd;">AI</span>
                        </button>
                        <button class="ai-lab-tab" data-tab="performance">
                            <div class="tab-icon-wrap">🏆</div>
                            <div class="tab-content">
                                <span class="tab-title">Model Performance</span>
                                <span class="tab-desc">Accuracy & metrics</span>
                            </div>
                            <span class="tab-badge" style="background: rgba(45,212,191,0.3); color: #5eead4;">ML</span>
                        </button>
                    </div>
                </div>
                <div id="ai-lab-content"></div>
            `;

            flexColumn.insertAdjacentHTML('beforeend', tabsHtml);
        }

        this.setupTabSwitching();
        await this.loadDefaultView();
    }

    setupTabSwitching() {
        const sectionContainer = document.getElementById('crypto-section-ai-lab');
        if (!sectionContainer) return;
        const tabContainer = sectionContainer.querySelector('.ai-lab-tab-grid');
        if (tabContainer) {
            tabContainer.addEventListener('click', (e) => {
                const tab = e.target.closest('.ai-lab-tab');
                if (tab) {
                    const tabName = tab.dataset.tab;
                    this.switchTab(tabName);
                }
            });
        }
    }

    switchTab(tabName) {
        // Update active tab visually using CSS classes
        const sectionContainer = document.getElementById('crypto-section-ai-lab');
        if (!sectionContainer) return;
        sectionContainer.querySelectorAll('.ai-lab-tab').forEach(tab => {
            tab.classList.remove('active');
        });

        const activeTab = sectionContainer.querySelector(`[data-tab="${tabName}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }

        this.currentTab = tabName;

        // Render appropriate content
        switch (tabName) {
            case 'predictions-risk':
                this.renderPredictionsRiskTab();
                break;
            case 'insights-sentiment':
                this.renderInsightsSentimentTab();
                break;
            case 'performance':
                this.renderPerformanceTab();
                break;
        }
    }

    async loadDefaultView() {
        await this.renderPredictionsRiskTab();
    }

    async renderPredictionsRiskTab() {
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
                        Run Analysis
                    </button>
                </div>

                <!-- Loading State -->
                <div id="aiLabLoading" class="text-center py-5" style="display: none;">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="text-white-50 mt-3 small">Training Prophet model and generating predictions...</p>
                </div>

                <!-- Predictions Content -->
                <div id="aiLabPredictions"></div>

                <!-- Risk Analysis Section Divider -->
                <div class="d-flex align-items-center gap-3 mt-2">
                    <div style="flex: 1; height: 1px; background: linear-gradient(90deg, transparent, rgba(245,158,11,0.3), transparent);"></div>
                    <span class="text-white-50 small fw-medium" style="letter-spacing: 0.05em;">⚠️ RISK ANALYSIS</span>
                    <div style="flex: 1; height: 1px; background: linear-gradient(90deg, transparent, rgba(245,158,11,0.3), transparent);"></div>
                </div>

                <!-- Risk Loading -->
                <div id="riskLoading" class="text-center py-4" style="display: none;">
                    <div class="spinner-border spinner-border-sm text-warning" role="status"></div>
                    <p class="text-white-50 mt-2 small">Calculating risk features and classification...</p>
                </div>

                <!-- Risk Analysis Content -->
                <div id="riskAnalysisContent"></div>
            </div>
        `;

        // Setup event listeners
        document.getElementById('runPredictionBtn')?.addEventListener('click', () => {
            const symbol = document.getElementById('aiLabSymbolSelector').value;
            this.fetchAndDisplayPredictions(symbol);
            this.fetchAndDisplayRiskAnalysis(symbol);
        });

        // Auto-load BTC
        this.fetchAndDisplayPredictions('BTC');
        this.fetchAndDisplayRiskAnalysis('BTC');
    }

    async fetchAndDisplayPredictions(symbol) {
        const loadingEl = document.getElementById('aiLabLoading');
        const contentEl = document.getElementById('aiLabPredictions');

        // Show loading
        loadingEl.style.display = 'block';
        contentEl.innerHTML = '';

        try {
            // Fetch Prophet predictions directly (more reliable than LSTM)
            const responses = await Promise.all([
                fetch(`${this.apiBaseUrl}/predict/prophet/${symbol}?days_ahead=1`),
                fetch(`${this.apiBaseUrl}/predict/prophet/${symbol}?days_ahead=7`),
                fetch(`${this.apiBaseUrl}/predict/prophet/${symbol}?days_ahead=30`)
            ]);

            const [pred1Day, pred7Day, pred30Day] = await Promise.all(
                responses.map(r => r.json())
            );

            // Use the current price from the most recent prediction
            const currentPrice = pred1Day.current_price;

            const data = {
                symbol: symbol,
                model: 'Prophet',
                current_price: currentPrice,
                predictions: {
                    '1_day': {
                        price: pred1Day.predicted_price,
                        change: pred1Day.absolute_change,
                        change_percent: pred1Day.percent_change,
                        confidence: pred1Day.trend_confidence / 100,
                        confidence_lower: pred1Day.confidence_lower,
                        confidence_upper: pred1Day.confidence_upper
                    },
                    '7_day': {
                        price: pred7Day.predicted_price,
                        change: pred7Day.absolute_change,
                        change_percent: pred7Day.percent_change,
                        confidence: pred7Day.trend_confidence / 100,
                        confidence_lower: pred7Day.confidence_lower,
                        confidence_upper: pred7Day.confidence_upper
                    },
                    '30_day': {
                        price: pred30Day.predicted_price,
                        change: pred30Day.absolute_change,
                        change_percent: pred30Day.percent_change,
                        confidence: pred30Day.trend_confidence / 100,
                        confidence_lower: pred30Day.confidence_lower,
                        confidence_upper: pred30Day.confidence_upper
                    }
                },
                model_metrics: {
                    trend_confidence: pred1Day.trend_confidence,
                    volatility_score: pred1Day.volatility_score,
                    model_trained_at: pred1Day.model_trained_at,
                    prediction_date: pred1Day.prediction_date,
                    model_used: 'Prophet'
                },
                timestamp: new Date().toISOString()
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

    async renderInsightsSentimentTab() {
        const container = document.getElementById('ai-lab-content');
        if (!container) return;

        container.innerHTML = `
            <div class="d-flex flex-column gap-4">
                <!-- ═══ Section 1: AI-Generated Insights ═══ -->
                <div class="glass-card p-4">
                    <div class="d-flex align-items-center justify-content-between mb-3">
                        <h3 class="h5 fw-light text-white mb-0">
                            <span style="background: linear-gradient(135deg, #667eea, #764ba2); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;">AI-Generated Insights</span>
                        </h3>
                        <button class="glass-button btn-sm px-2 py-1" id="refreshInsightsBtn" title="Refresh">
                                    <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15">
                                        </path>
                                    </svg>
                                </button>
                    </div>
                    <div id="cryptoInsightsFeed">
                        <div class="text-center py-4">
                            <div class="spinner-border text-light" role="status" style="width: 2rem; height: 2rem;">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                            <p class="text-white-50 mt-2 small">Generating AI insights...</p>
                        </div>
                    </div>
                </div>

                <!-- How It Works Card -->
                <div class="glass-card p-4">
                    <h4 class="h6 fw-light mb-3 text-white">How AI Insights Work</h4>
                    <div class="row g-3">
                        <div class="col-md-4">
                            <div class="text-white-50 small">
                                <strong class="text-white">📊 Data Collection:</strong><br>
                                Analyzes 90-day price data, SMAs, RSI, volume trends, and volatility for each crypto asset.
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="text-white-50 small">
                                <strong class="text-white">🤖 AI Analysis:</strong><br>
                                Google Gemini processes the data to identify patterns, risks, and market opportunities.
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="text-white-50 small">
                                <strong class="text-white">💡 Actionable Output:</strong><br>
                                Categorized insights with severity levels help you make informed crypto decisions.
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ═══ Section Divider: News Sentiment ═══ -->
                <div class="d-flex align-items-center gap-3 mt-2">
                    <div style="flex: 1; height: 1px; background: linear-gradient(90deg, transparent, rgba(118,75,162,0.4), transparent);"></div>
                    <span class="text-white-50 small fw-medium" style="letter-spacing: 0.05em;">📰 NEWS SENTIMENT</span>
                    <div style="flex: 1; height: 1px; background: linear-gradient(90deg, transparent, rgba(118,75,162,0.4), transparent);"></div>
                </div>

                <!-- ═══ Section 2: News Sentiment ═══ -->
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

                <!-- Sentiment Loading State -->
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

        document.getElementById('refreshInsightsBtn')?.addEventListener('click', () => {
            this.loadCryptoInsights();
        });

        // Auto-load both sections
        this.loadCryptoInsights();
        this.fetchAndDisplaySentiment('BTC');
    }

    async loadCryptoInsights() {
        const container = document.getElementById('cryptoInsightsFeed');
        if (!container) return;

        container.innerHTML = `
            <div class="text-center py-4">
                <div class="spinner-border text-light" role="status" style="width: 2rem; height: 2rem;">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="text-white-50 mt-2 small">Generating AI insights...</p>
            </div>
        `;

        try {
            // Get user's crypto holdings to determine symbols
            let symbols = 'BTC,ETH';
            let portfolioValue = null;

            try {
                const holdingsResponse = await fetch('/api/crypto/holdings', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
                });
                if (holdingsResponse.ok) {
                    const holdings = await holdingsResponse.json();
                    if (holdings && holdings.length > 0) {
                        symbols = [...new Set(holdings.map(h => h.symbol))].join(',');
                        portfolioValue = holdings.reduce((sum, h) => sum + (h.quantity * (h.avg_buy_price || 0)), 0);
                    }
                }
            } catch (e) {
                console.log('Using default symbols for insights');
            }

            const response = await fetch(
                `${this.apiBaseUrl}/crypto/insights?symbols=${symbols}${portfolioValue ? `&portfolio_value=${portfolioValue}` : ''}`
            );

            if (!response.ok) throw new Error('Insights generation failed');

            const result = await response.json();

            if (result.status === 'success') {
                this.displayCryptoInsights(result.data, container);
            } else {
                throw new Error('Invalid response');
            }

        } catch (error) {
            console.error('Error loading crypto insights:', error);
            container.innerHTML = `
                <div class="text-center py-4">
                    <p class="text-danger small">Error: ${error.message}</p>
                    <button class="btn btn-sm btn-outline-light mt-2" id="retryInsightsBtn">Retry</button>
                </div>
            `;
            document.getElementById('retryInsightsBtn')?.addEventListener('click', () => {
                this.loadCryptoInsights();
            });
        }
    }

    displayCryptoInsights(data, container) {
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
            'asset': '<span class="badge" style="background: rgba(96,165,250,0.15); color: #93c5fd;">Asset</span>',
            'risk': '<span class="badge" style="background: rgba(251,113,133,0.15); color: #fda4af;">Risk</span>',
            'opportunity': '<span class="badge" style="background: rgba(45,212,191,0.15); color: #5eead4;">Opportunity</span>',
            'action': '<span class="badge" style="background: rgba(252,211,77,0.15); color: #fde68a;">Action</span>'
        };

        let html = '';

        for (const insight of data.insights) {
            const borderStyle = severityColors[insight.severity] || severityColors['medium'];
            const badge = categoryBadges[insight.category] || categoryBadges['overview'];
            const tickerTag = insight.ticker ? `<span class="badge bg-dark ms-1">${insight.ticker}</span>` : '';

            html += `
                <div class="insight-card p-3 mb-3" style="${borderStyle} background: rgba(255,255,255,0.03); border-radius: 8px;">
                    <div class="d-flex align-items-center mb-2">
                        <span class="me-2" style="font-size: 1.1rem; color: #a78bfa; font-weight: 600;">${insight.icon}</span>
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
        </div>`;

        container.innerHTML = html;
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

