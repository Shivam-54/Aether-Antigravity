/**
 * Real Estate AI Insights Logic
 * Handles fetching and rendering of analytics data.
 */

window.renderRealEstateAIInsights = async function () {
    console.log('Rendering Real Estate AI Insights...');

    // Parallel fetch for speed
    try {
        await Promise.all([
            fetchAndRenderAccuracyChart(),
            fetchAndRenderAIInsights(),
            fetchAndRenderHealthScore(),
            fetchAndRenderRanking(),
            fetchAndRenderRisks(),
            fetchAndRenderPricePredictions()
        ]);
    } catch (error) {
        console.error("Error loading AI insights:", error);
    }
};

// Global function to update predictions when model/timeframe changes
window.updateAIPredictions = async function () {
    console.log('Updating predictions with new parameters...');
    await fetchAndRenderPricePredictions();
    await fetchAndRenderAccuracyChart();
};

// Global function to compare model performance
window.compareModelPerformance = function () {
    // Show the comparison modal
    const modal = new bootstrap.Modal(document.getElementById('modelComparisonModal'));
    modal.show();
};

async function fetchAndRenderAccuracyChart() {
    const canvas = document.getElementById('accuracyChart');
    const metricsContainer = document.getElementById('accuracyMetrics');
    if (!canvas || !metricsContainer) return;

    try {
        const token = localStorage.getItem('access_token');
        const model = document.getElementById('mlModelSelector')?.value || 'prophet';

        // Fetch real accuracy data from API
        const response = await fetch(`${API_BASE_URL}/realestate/ml/accuracy-history?model=${model}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to fetch accuracy data');
        const data = await response.json();

        // Render Chart
        const ctx = canvas.getContext('2d');

        // Destroy existing chart if it exists
        if (window.accuracyChartInstance) {
            window.accuracyChartInstance.destroy();
        }

        window.accuracyChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.dates,
                datasets: [
                    {
                        label: 'Predicted Price',
                        data: data.predicted,
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: false,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    },
                    {
                        label: 'Actual Price',
                        data: data.actual,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: false,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    },
                    {
                        label: 'Confidence Range',
                        data: data.confidence_upper,
                        borderColor: 'rgba(59, 130, 246, 0.2)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderWidth: 0,
                        tension: 0.4,
                        fill: '+1',
                        pointRadius: 0
                    },
                    {
                        label: 'Confidence Lower',
                        data: data.confidence_lower,
                        borderColor: 'rgba(59, 130, 246, 0.2)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderWidth: 0,
                        tension: 0.4,
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
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: 'rgba(255,255,255,0.7)',
                            font: { family: 'Inter', size: 11 },
                            filter: (item) => item.text !== 'Confidence Lower' // Hide from legend
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(10,10,12,0.95)',
                        titleColor: '#fff',
                        bodyColor: 'rgba(255,255,255,0.8)',
                        borderColor: 'rgba(255,255,255,0.1)',
                        borderWidth: 1,
                        padding: 12,
                        cornerRadius: 8,
                        callbacks: {
                            label: function (context) {
                                const label = context.dataset.label || '';
                                const value = context.parsed.y;
                                return `${label}: ₹${(value / 100000).toFixed(2)}L`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        grid: { color: 'rgba(255,255,255,0.05)', drawBorder: false },
                        ticks: {
                            color: 'rgba(255,255,255,0.4)',
                            font: { size: 10 },
                            callback: (value) => `₹${(value / 100000).toFixed(1)}L`
                        }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: 'rgba(255,255,255,0.6)', font: { size: 10 } }
                    }
                }
            }
        });

        // Render Metrics using real data
        const rmse = data.metrics.rmse;
        const mae = data.metrics.mae;
        const r2 = data.metrics.r2;

        metricsContainer.innerHTML = `
            <div class="col-md-3">
                <div class="text-center p-3 rounded" style="background: rgba(255,255,255,0.03);">
                    <div class="text-white-50 small mb-1">RMSE</div>
                    <div class="h5 text-white mb-0">₹${(rmse / 1000).toFixed(1)}k</div>
                    <div class="text-white-50" style="font-size: 0.7rem;">Root Mean Sq Error</div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="text-center p-3 rounded" style="background: rgba(255,255,255,0.03);">
                    <div class="text-white-50 small mb-1">MAE</div>
                    <div class="h5 text-white mb-0">₹${(mae / 1000).toFixed(1)}k</div>
                    <div class="text-white-50" style="font-size: 0.7rem;">Mean Absolute Error</div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="text-center p-3 rounded" style="background: rgba(255,255,255,0.03);">
                    <div class="text-white-50 small mb-1">R² Score</div>
                    <div class="h5 text-white mb-0">${r2.toFixed(3)}</div>
                    <div class="text-white-50" style="font-size: 0.7rem;">Model Fit Quality</div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="text-center p-3 rounded" style="background: rgba(255,255,255,0.03);">
                    <div class="text-white-50 small mb-1">Training Data</div>
                    <div class="h5 text-white mb-0">${data.metrics.training_samples}</div>
                    <div class="text-white-50" style="font-size: 0.7rem;">Data Points Used</div>
                </div>
            </div>
        `;

    } catch (e) {
        console.error('Accuracy chart error:', e);
        if (metricsContainer) {
            metricsContainer.innerHTML = '<div class="col-12 text-center text-white-50 py-3 small">Unable to load accuracy data</div>';
        }
    }
}


async function fetchAndRenderHealthScore() {
    const container = document.getElementById('ai-health-score-container');
    if (!container) return;

    try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${API_BASE_URL}/realestate/analytics/health-score`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to fetch health score');
        const data = await response.json();

        // Render
        const score = data.overall_score;
        const offset = 565.48 - (score / 100) * 565.48;
        const colorClass = score > 80 ? 'text-success' : (score > 60 ? 'text-info' : (score > 40 ? 'text-warning' : 'text-danger'));
        const strokeColor = score > 80 ? '#10b981' : (score > 60 ? '#06b6d4' : (score > 40 ? '#f59e0b' : '#ef4444'));

        let breakdownHtml = Object.entries(data.breakdown).map(([key, val]) => {
            return `
                <div class="d-flex align-items-center justify-content-between mb-2 small">
                    <span class="text-white-50 text-capitalize">${key}</span>
                    <div class="d-flex align-items-center gap-2" style="width: 60%">
                        <div class="progress flex-grow-1" style="height: 4px; background: rgba(255,255,255,0.1);">
                            <div class="progress-bar" role="progressbar" style="width: ${val}%; background-color: ${strokeColor};"></div>
                        </div>
                        <span class="text-white fw-light" style="width: 25px; text-align: right;">${val}</span>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = `
            <div class="row align-items-center">
                <div class="col-md-5 text-center">
                    <div class="position-relative d-inline-block">
                        <svg width="160" height="160" viewBox="0 0 200 200" style="transform: rotate(-90deg);">
                            <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="12"/>
                            <circle cx="100" cy="100" r="90" fill="none" stroke="${strokeColor}" stroke-width="12"
                                    stroke-dasharray="565.48" stroke-dashoffset="${offset}"
                                    stroke-linecap="round"
                                    style="transition: stroke-dashoffset 1.5s ease-out;"/>
                        </svg>
                        <div class="position-absolute top-50 start-50 translate-middle text-center">
                            <div class="h2 mb-0 fw-light text-white">${score}</div>
                            <div class="msg small text-white-50">${data.grade}</div>
                        </div>
                    </div>
                </div>
                <div class="col-md-7">
                    <h3 class="h5 fw-light text-white mb-3">Portfolio Health</h3>
                    <div class="mb-3">
                        ${breakdownHtml}
                    </div>
                    <div class="d-flex gap-2">
                        ${data.recommendations.slice(0, 1).map(rec =>
            `<div class="p-2 rounded text-white-80 small d-flex gap-2" style="background: rgba(255,255,255,0.05);">
                                <span>💡</span> ${rec}
                             </div>`
        ).join('')}
                    </div>
                </div>
            </div>
        `;

    } catch (e) {
        console.error(e);
        container.innerHTML = '<div class="text-white-50 text-center py-4">Failed to load health score</div>';
    }
}

async function fetchAndRenderRanking() {
    const container = document.getElementById('ai-performance-ranking');
    if (!container) return;

    try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${API_BASE_URL}/realestate/analytics/ranking`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to fetch ranking');
        const data = await response.json();

        if (data.rankings.length === 0) {
            container.innerHTML = '<div class="col-12 text-center text-white-50 py-3">No properties to rank</div>';
            return;
        }

        // Top 3 cards
        container.innerHTML = data.rankings.slice(0, 3).map((prop, index) => {
            const medal = index === 0 ? '🥇' : (index === 1 ? '🥈' : '🥉');
            const bgStyle = index === 0
                ? 'background: linear-gradient(135deg, rgba(255,215,0,0.1), rgba(255,215,0,0.05)); border: 1px solid rgba(255,215,0,0.3);'
                : 'background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05);';

            return `
                <div class="col-md-4">
                    <div class="glass-card p-3 h-100 d-flex flex-column align-items-center text-center position-relative" style="${bgStyle}">
                        <div class="fs-1 mb-2">${medal}</div>
                        <h4 class="h6 text-white text-truncate w-100 mb-1" title="${prop.name}">${prop.name}</h4>
                        <div class="text-success small fw-medium mb-2">+${prop.roi_percent}% ROI</div>
                        
                        <div class="mt-auto w-100 pt-2 border-top border-white-10 d-flex justify-content-between text-white-50 small">
                            <span>Yield</span>
                            <span>${prop.rental_yield}%</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

    } catch (e) {
        console.error(e);
    }
}

async function fetchAndRenderRisks() {
    const section = document.getElementById('ai-risk-section');
    const container = document.getElementById('ai-risk-container');
    if (!section || !container) return;

    try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${API_BASE_URL}/realestate/analytics/risks`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to fetch risks');
        const result = await response.json(); // Array of PropertyRisk

        if (result.length === 0) {
            section.style.display = 'none';
            return;
        }

        section.style.display = 'block';

        // Flatten risks for display
        let allRisks = [];
        result.forEach(p => {
            p.risks.forEach(r => {
                allRisks.push({ ...r, property_name: p.property_name });
            });
        });

        if (allRisks.length === 0) {
            section.style.display = 'none';
            return;
        }

        container.innerHTML = allRisks.map(risk => {
            const borderClass = risk.severity === 'high' ? 'border-danger' : (risk.severity === 'medium' ? 'border-warning' : 'border-success');
            const icon = risk.severity === 'high' ? '⚠️' : '🛡️';

            return `
                <div class="glass-card p-3 d-flex gap-3 align-items-start" style="border-left: 3px solid ${risk.severity === 'high' ? '#ef4444' : '#f59e0b'};">
                    <div class="fs-4">${icon}</div>
                    <div>
                        <div class="d-flex align-items-center gap-2 mb-1">
                            <span class="text-white fw-light">${risk.property_name}</span>
                            <span class="badge bg-white bg-opacity-10 text-white-50 fw-light rounded-pill px-2" style="font-size: 0.7em;">${risk.type.replace('_', ' ')}</span>
                        </div>
                        <p class="text-white-80 small mb-0 fw-light">${risk.message}</p>
                    </div>
                </div>
            `;
        }).join('');

    } catch (e) {
        console.error(e);
        section.style.display = 'none';
    }
}

async function fetchAndRenderPricePredictions() {
    const container = document.getElementById('ai-price-predictions');
    if (!container) return;

    try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${API_BASE_URL}/realestate/ml/predict-all?days_ahead=90`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to fetch predictions');
        const data = await response.json();

        if (!data.predictions || data.predictions.length === 0) {
            container.innerHTML = '<div class="col-12 text-center text-white-50 py-3 small">No predictions available</div>';
            return;
        }

        // Show top 3 predictions with minimal dark glass design
        container.innerHTML = data.predictions.slice(0, 3).map((pred, idx) => {
            const isPositive = pred.percent_change >= 0;
            const trendColor = isPositive ? '#10b981' : '#ef4444';
            const trendIcon = isPositive ? '📈' : '📉';
            const formatCurrency = (val) => `₹${(val / 100000).toFixed(2)}L`;

            // Rank badges
            const rankEmoji = idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉';

            return `
                <div class="col-lg-4 col-md-6 mb-3">
                    <div class="glass-card h-100" 
                         style="
                             background: rgba(0, 0, 0, 0.4);
                             backdrop-filter: blur(10px);
                             border: 1px solid rgba(255, 255, 255, 0.08);
                             border-left: 3px solid ${trendColor};
                             border-radius: 12px;
                             padding: 1.5rem;
                             transition: all 0.3s ease;
                         "
                         onmouseover="this.style.transform='translateY(-2px)'; this.style.borderColor='${trendColor}40';"
                         onmouseout="this.style.transform='translateY(0)'; this.style.borderColor='rgba(255, 255, 255, 0.08)';">
                        
                        <!-- Header with Rank -->
                        <div class="d-flex align-items-start justify-content-between mb-3">
                            <div class="d-flex align-items-center gap-2">
                                <span style="font-size: 1.5rem;">${trendIcon}</span>
                                <div>
                                    <h6 class="text-white mb-0" style="font-size: 0.95rem; font-weight: 600;" title="${pred.property_name}">
                                        ${pred.property_name.length > 20 ? pred.property_name.substring(0, 20) + '...' : pred.property_name}
                                    </h6>
                                    <div class="d-flex align-items-center gap-2 mt-1">
                                        <span class="badge" style="background: rgba(99, 102, 241, 0.2); color: #818cf8; font-size: 0.65rem;">
                                            ${getModelBadge()}
                                        </span>
                                        <span class="text-white-50" style="font-size: 0.6rem; text-transform: uppercase; letter-spacing: 0.5px;">
                                            ${getDaysBadge()} Forecast
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <span style="font-size: 1.3rem;">${rankEmoji}</span>
                        </div>

                        <!-- Limited Data Warning -->
                        <div class="mb-2 px-2 py-1" style="background: rgba(255, 193, 7, 0.1); border-left: 2px solid #FFC107; border-radius: 4px;">
                            <small class="text-warning" style="font-size: 0.65rem;">
                                ⚠️ Estimate based on 2 data points
                            </small>
                        </div>

                        <!-- Values -->
                        <div class="row g-2 mb-3">
                            <div class="col-6">
                                <div class="text-white-50 mb-1" style="font-size: 0.65rem; text-transform: uppercase;">Current</div>
                                <div class="text-white" style="font-size: 1rem; font-weight: 600;">${formatCurrency(pred.current_value)}</div>
                            </div>
                            <div class="col-6">
                                <div class="text-white-50 mb-1" style="font-size: 0.65rem; text-transform: uppercase;">Predicted</div>
                                <div style="font-size: 1rem; font-weight: 700; color: ${trendColor};">
                                    ${formatCurrency(pred.predicted_value)}
                                </div>
                            </div>
                        </div>

                        <!-- Expected Change -->
                        <div class="text-center py-2 mb-3" style="background: rgba(0, 0, 0, 0.3); border-radius: 8px;">
                            <div class="text-white-50 mb-1" style="font-size: 0.65rem; text-transform: uppercase;">Expected Change</div>
                            <div style="font-size: 1.8rem; font-weight: 800; color: ${trendColor};">
                                ${isPositive ? '+' : ''}${pred.percent_change.toFixed(2)}%
                            </div>
                            <div class="text-white-50" style="font-size: 0.7rem;">
                                ${formatCurrency(Math.abs(pred.predicted_value - pred.current_value))}
                            </div>
                        </div>

                        <!-- Confidence Range -->
                        <div style="border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 0.75rem;">
                            <div class="d-flex justify-content-between align-items-center mb-1">
                                <span class="text-white-50" style="font-size: 0.65rem;">Confidence Range</span>
                                <span class="text-white-50" style="font-size: 0.65rem;">80%</span>
                            </div>
                            <div style="font-size: 0.7rem; color: rgba(255, 255, 255, 0.5);">
                                ${pred.confidence_lower ? formatCurrency(pred.confidence_lower) : '—'} 
                                <span style="color: ${trendColor};">→</span> 
                                ${pred.confidence_upper ? formatCurrency(pred.confidence_upper) : '—'}
                            </div>
                        </div>

                    </div>
                </div>
            `;
        }).join('');

    } catch (e) {
        console.error('Price prediction error:', e);
        container.innerHTML = '<div class="col-12 text-center text-white-50 py-3 small">Unable to load predictions</div>';
    }
}

// Helper function to get model badge text
function getModelBadge() {
    const modelSelect = document.getElementById('mlModelSelector');
    if (!modelSelect) return 'Prophet';

    const model = modelSelect.value;
    const modelNames = {
        'prophet': 'Prophet',
        'lstm': 'LSTM',
        'ensemble': 'Ensemble'
    };
    return modelNames[model] || 'Prophet';
}

// Helper function to get forecast period
function getDaysBadge() {
    const periodSelect = document.getElementById('forecastPeriodSelector');
    if (!periodSelect) return '90-Day';

    const days = periodSelect.value;
    const periods = {
        '30': '30-Day',
        '90': '90-Day',
        '180': '180-Day',
        '365': '1-Year'
    };
    return periods[days] || '90-Day';
}

// ==================== AI INSIGHTS FEED ====================

async function fetchAndRenderAIInsights() {
    const feedContainer = document.getElementById('aiInsightsFeed');
    const lastUpdateEl = document.getElementById('insightsLastUpdate');
    if (!feedContainer) return;

    try {
        const token = localStorage.getItem('access_token');

        // Fetch real AI insights from API
        const response = await fetch(`${API_BASE_URL}/realestate/ml/insights`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to fetch insights');
        const data = await response.json();
        const insights = data.insights || [];

        if (insights.length === 0) {
            feedContainer.innerHTML = '<div class="text-center text-white-50 py-3 small">No insights available. Add properties to unlock AI-powered recommendations.</div>';
            return;
        }

        // Render insights
        feedContainer.innerHTML = insights.map((insight, idx) => `
            <div class="p-3 rounded" style="background: rgba(255,255,255,0.03); border-left: 3px solid ${insight.color}; animation: slideIn 0.3s ease-out ${idx * 0.1}s both;">
                <div class="d-flex align-items-start gap-2">
                    <span style="font-size: 1.2rem;">${insight.icon}</span>
                    <div class="flex-grow-1">
                        <div class="text-white-90 small mb-1"><strong>${insight.title}</strong></div>
                        <div class="text-white-60" style="font-size: 0.85rem;">${insight.description}</div>
                        <div class="d-flex align-items-center gap-2 mt-2">
                            <span class="badge px-2 py-1" style="background: rgba(${insight.confidence > 80 ? '16, 185, 129' : '251, 191, 36'}, 0.2); color: ${insight.confidence > 80 ? '#10b981' : '#fbbf24'}; font-size: 0.7rem;">
                                ${insight.confidence}% Confidence
                            </span>
                            <span class="text-white-50" style="font-size: 0.7rem;">${insight.timestamp}</span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        // Update timestamp
        if (lastUpdateEl) {
            lastUpdateEl.textContent = `Last updated: ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
        }

    } catch (e) {
        console.error('AI Insights error:', e);
        feedContainer.innerHTML = '<div class="text-center text-white-50 py-3 small">Unable to load AI insights</div>';
    }
}

// Make function globally accessible
window.fetchAndRenderAIInsights = fetchAndRenderAIInsights;

// ==================== SCENARIO SIMULATOR ====================

// Global function to update scenario as slider moves
window.updateScenario = function () {
    const slider = document.getElementById('marketGrowthSlider');
    const growthValueEl = document.getElementById('growthValue');
    const scenarioValueEl = document.getElementById('scenarioValue');
    const scenarioChangeEl = document.getElementById('scenarioChange');

    if (!slider || !growthValueEl || !scenarioValueEl || !scenarioChangeEl) return;

    const growthPercent = parseInt(slider.value);
    const baseValue = 5.0; // Base portfolio value in Cr

    // Calculate new value
    const newValue = baseValue * (1 + growthPercent / 100);
    const absoluteChange = newValue - baseValue;
    const percentChange = ((newValue - baseValue) / baseValue) * 100;

    // Update display
    growthValueEl.textContent = `${growthPercent >= 0 ? '+' : ''}${growthPercent}%`;
    growthValueEl.style.background = growthPercent >= 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)';
    growthValueEl.style.color = growthPercent >= 0 ? '#10b981' : '#ef4444';

    scenarioValueEl.textContent = `₹${newValue.toFixed(1)} Cr`;
    scenarioChangeEl.innerHTML = `
        <span class="${percentChange >= 0 ? 'text-success' : 'text-danger'}">
            ${percentChange >= 0 ? '+' : ''}${percentChange.toFixed(1)}% ${percentChange >= 0 ? '📈' : '📉'}
        </span>
        <span class="text-white-50 ms-2" style="font-size: 0.75rem;">
            (${absoluteChange >= 0 ? '+' : ''}₹${Math.abs(absoluteChange).toFixed(2)} Cr)
        </span>
    `;
};

// Global function to run detailed scenario analysis
window.runDetailedScenario = async function () {
    const slider = document.getElementById('marketGrowthSlider');
    if (!slider) return;

    const growthPercent = parseInt(slider.value);

    // Show modal with detailed analysis
    alert(`Detailed Scenario Analysis:\n\nMarket Growth: ${growthPercent}%\n\nThis feature will show:\n• Property-by-property impact\n• Risk exposure changes\n• Recommended actions\n• Timeline projections\n\nComing soon!`);

    // TODO: Implement detailed modal with:
    // - Property breakdown
    // - Risk analysis
    // - Recommended actions
    // - Timeline visualization
};

