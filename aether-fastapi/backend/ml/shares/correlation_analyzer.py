"""
Portfolio Correlation Analysis
Computes Pearson correlation matrix, diversification score, and portfolio insights
"""

import numpy as np
import yfinance as yf
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


class CorrelationAnalyzer:
    """Analyze correlations between portfolio stocks."""

    def analyze(self, tickers: list) -> dict:
        """
        Compute correlation matrix and diversification metrics.

        Args:
            tickers: List of stock ticker symbols (min 2)

        Returns:
            Dict with correlation matrix, diversification score, warnings, insights
        """
        if len(tickers) < 2:
            raise ValueError("Need at least 2 tickers for correlation analysis")

        # Fetch 3 months of close prices
        end_date = datetime.now()
        start_date = end_date - timedelta(days=90)

        prices = {}
        valid_tickers = []

        for ticker in tickers:
            try:
                df = yf.download(ticker, start=start_date, end=end_date, progress=False)
                if df.empty or len(df) < 20:
                    logger.warning(f"Insufficient data for {ticker}, skipping")
                    continue
                # Flatten MultiIndex columns
                if hasattr(df.columns, 'levels'):
                    df.columns = df.columns.get_level_values(0)
                prices[ticker] = df['Close'].values
                valid_tickers.append(ticker)
            except Exception as e:
                logger.warning(f"Failed to fetch data for {ticker}: {e}")

        if len(valid_tickers) < 2:
            raise ValueError("Need at least 2 tickers with valid data")

        # Align data lengths (use shortest series)
        min_len = min(len(v) for v in prices.values())
        aligned = {t: prices[t][-min_len:] for t in valid_tickers}

        # Compute daily returns
        returns = {}
        for t in valid_tickers:
            p = aligned[t]
            r = np.diff(p) / p[:-1]
            returns[t] = r

        n = len(valid_tickers)
        corr_matrix = np.zeros((n, n))

        for i in range(n):
            for j in range(n):
                if i == j:
                    corr_matrix[i][j] = 1.0
                else:
                    corr_val = np.corrcoef(returns[valid_tickers[i]], returns[valid_tickers[j]])[0, 1]
                    corr_matrix[i][j] = round(float(corr_val), 4) if not np.isnan(corr_val) else 0.0

        # Diversification Score (0-100)
        # Lower avg correlation = better diversification
        if n > 1:
            upper_triangle = []
            for i in range(n):
                for j in range(i + 1, n):
                    upper_triangle.append(abs(corr_matrix[i][j]))
            avg_correlation = float(np.mean(upper_triangle))
            diversification_score = round(max(0, min(100, (1 - avg_correlation) * 100)))
        else:
            avg_correlation = 0
            diversification_score = 0

        # Identify warnings (high correlation pairs)
        warnings = []
        high_corr_pairs = []
        low_corr_pairs = []

        for i in range(n):
            for j in range(i + 1, n):
                val = corr_matrix[i][j]
                pair = f"{valid_tickers[i]} & {valid_tickers[j]}"
                if abs(val) >= 0.8:
                    high_corr_pairs.append((pair, val))
                    warnings.append({
                        'type': 'high_correlation',
                        'pair': pair,
                        'correlation': round(val, 3),
                        'message': f"{pair} are highly correlated ({val:.0%}) — they tend to move together, reducing diversification"
                    })
                elif abs(val) <= 0.2:
                    low_corr_pairs.append((pair, val))

        # Insights
        insights = []

        if diversification_score >= 70:
            insights.append({
                'type': 'positive',
                'message': f"Your portfolio is well diversified (score: {diversification_score}/100). Stocks move independently."
            })
        elif diversification_score >= 40:
            insights.append({
                'type': 'neutral',
                'message': f"Moderate diversification (score: {diversification_score}/100). Some stocks move together."
            })
        else:
            insights.append({
                'type': 'warning',
                'message': f"Low diversification (score: {diversification_score}/100). Many holdings are correlated — consider adding uncorrelated assets."
            })

        if high_corr_pairs:
            most_corr = max(high_corr_pairs, key=lambda x: abs(x[1]))
            insights.append({
                'type': 'warning',
                'message': f"Most correlated pair: {most_corr[0]} at {most_corr[1]:.0%}. In a downturn, both would likely decline together."
            })

        if low_corr_pairs:
            best_pair = min(low_corr_pairs, key=lambda x: abs(x[1]))
            insights.append({
                'type': 'positive',
                'message': f"Best diversification pair: {best_pair[0]} at {best_pair[1]:.0%} correlation — they move independently."
            })

        return {
            'tickers': valid_tickers,
            'matrix': corr_matrix.tolist(),
            'diversification_score': diversification_score,
            'avg_correlation': round(avg_correlation, 4),
            'warnings': warnings,
            'insights': insights,
            'data_points': min_len,
            'period': '3 months',
            'generated_at': datetime.now().isoformat()
        }
