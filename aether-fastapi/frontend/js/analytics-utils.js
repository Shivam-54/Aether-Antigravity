/**
 * Analytics Utilities for Performance Module
 * Handles calculations for Risk, Momentum, Grades, and Simulations
 */

const AnalyticsUtils = {
    // --- 1. Behavioral Scoring ---

    /**
     * Calculates a Momentum Score based on daily change % and trend context (mocked for now)
     * @param {number} dailyChangePercent - The 24h % change
     * @returns {string} 'Strong', 'Weak', 'Reversing', or 'Neutral'
     */
    calculateMomentumScore: (dailyChangePercent, gainLossPercent) => {
        // Mock Logic:
        // Strong: High daily gain (> 2%) AND High overall gain
        // Weak: Low daily gain (< -2%)
        // Reversing: High overall gain but negative daily change

        if (dailyChangePercent > 2) return 'Strong';
        if (dailyChangePercent < -2) return 'Weak';

        if (gainLossPercent > 10 && dailyChangePercent < -1) return 'Reversing';
        if (gainLossPercent < -10 && dailyChangePercent > 1) return 'Reversing';

        return 'Neutral';
    },

    /**
     * Determines the Trend Trend Direction
     * @returns {string} 'Uptrend', 'Downtrend', 'Sideways'
     */
    calculateTrendDirection: (dailyChangePercent) => {
        if (dailyChangePercent > 0.5) return 'Uptrend';
        if (dailyChangePercent < -0.5) return 'Downtrend';
        return 'Sideways';
    },

    /**
     * Assigns a Performance Grade (A, B, C, D, F)
     * Based on ROI and "Stability" (mocked)
     */
    calculatePerformanceGrade: (roiPercent, isStable = true) => {
        if (roiPercent > 20) return isStable ? 'A+' : 'A';
        if (roiPercent > 10) return isStable ? 'A' : 'B+';
        if (roiPercent > 5) return 'B';
        if (roiPercent > 0) return 'C';
        if (roiPercent > -5) return 'D';
        return 'F';
    },

    /**
     * Estimates Volatility Level based on stock symbol (Mock DB)
     */
    getVolatilityLevel: (symbol) => {
        const highVol = ['TSLA', 'IDEA', 'ADANI', 'ZOMATO', 'CRYPTO'];
        const lowVol = ['HDFCBANK', 'RELIANCE', 'ITC', 'BONDS'];

        const s = symbol.toUpperCase();
        if (highVol.some(h => s.includes(h))) return 'High';
        if (lowVol.some(l => s.includes(l))) return 'Low';
        return 'Medium';
    },

    // --- 2. Portfolio Risk Metrics ---

    /**
     * Calculates the Diversification Score (0-100) using Herfindahl-Hirschman Index (HHI)
     * HHI = sum(weight^2). Lower HHI = Higher Diversification.
     * We invert it for a "Score": 100 - (HHI * 100)
     */
    calculateDiversificationScore: (holdings) => {
        if (!holdings || holdings.length === 0) return 0;

        const totalValue = holdings.reduce((sum, h) => sum + h.total_value, 0);
        if (totalValue === 0) return 0;

        let hhi = 0;
        holdings.forEach(h => {
            const weight = h.total_value / totalValue;
            hhi += (weight * weight);
        });

        // HHI ranges from 1/N to 1. 
        // 1 asset = HHI 1.0 (Score 0). 
        // 100 assets = HHI close to 0 (Score 100).

        // Map 1.0 -> 0, 0.2 -> 80, 0.0 -> 100 roughly
        let score = (1 - hhi) * 100;

        // Normalize: A score > 80 is excellent.
        return Math.min(100, Math.max(0, Math.round(score)));
    },

    /**
     * Checks for Overexposure (Any single asset > threshold %)
     */
    getConcentrationRisks: (holdings, thresholdPercent = 20) => {
        const warnings = [];
        const totalValue = holdings.reduce((sum, h) => sum + h.total_value, 0);

        holdings.forEach(h => {
            const weight = (h.total_value / totalValue) * 100;
            if (weight > thresholdPercent) {
                warnings.push({
                    symbol: h.symbol,
                    weight: weight.toFixed(1)
                });
            }
        });
        return warnings;
    },

    // --- 3. Simulation Logic ---

    /**
     * "What If" Simulator
     * Calculates impact on Portfolio Value and ROI based on scenarios
     */
    simulateScenario: (currentTotalValue, currentTotalInvested, scenarioType, params = {}) => {
        let newValue = currentTotalValue;

        switch (scenarioType) {
            case 'market_crash':
                // Market drops 20%
                newValue = currentTotalValue * 0.8;
                break;
            case 'asset_drop':
                // Current asset drops X% (handled in UI, but logic here for generic)
                // For simplified "Market Drop 10%":
                newValue = currentTotalValue * 0.9;
                break;
            case 'custom_growth':
                newValue = currentTotalValue * 1.15; // +15%
                break;
        }

        const newProfit = newValue - currentTotalInvested;
        const newRoi = (newProfit / currentTotalInvested) * 100;

        return {
            newValue: newValue,
            newProfit: newProfit,
            newRoi: newRoi,
            valueChange: newValue - currentTotalValue
        };
    },

    // --- 4. Helpers ---

    getRiskColor: (level) => {
        if (level === 'High') return 'text-danger';
        if (level === 'Medium') return 'text-warning';
        return 'text-success';
    },

    getRiskBadgeColor: (level) => {
        if (level === 'High') return 'bg-danger text-danger';
        if (level === 'Medium') return 'bg-warning text-warning';
        return 'bg-success text-success';
    }
};

// Expose globally
window.AnalyticsUtils = AnalyticsUtils;
