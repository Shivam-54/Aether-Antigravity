"""
Anomaly Detection for Stock Portfolio
Uses Isolation Forest + Z-score to detect unusual price/volume movements
"""

import numpy as np
import yfinance as yf
from sklearn.ensemble import IsolationForest
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


def _safe_float(val):
    """Convert a value to a JSON-safe float (replace NaN/Inf with 0.0)."""
    f = float(val)
    if np.isnan(f) or np.isinf(f):
        return 0.0
    return f


class AnomalyDetector:
    """Detect anomalies in stock price and volume data using Isolation Forest."""

    def __init__(self, contamination: float = 0.05):
        """
        Args:
            contamination: Expected proportion of anomalies (default 5%)
        """
        self.contamination = contamination

    def detect(self, tickers: list) -> dict:
        """
        Run anomaly detection across all portfolio tickers.

        Args:
            tickers: List of stock ticker symbols

        Returns:
            Dict with anomaly events, summary stats, and per-ticker results
        """
        all_events = []
        ticker_summaries = {}

        for ticker in tickers:
            try:
                events, summary = self._detect_for_ticker(ticker)
                all_events.extend(events)
                ticker_summaries[ticker] = summary
            except Exception as e:
                logger.warning(f"Anomaly detection failed for {ticker}: {e}")
                ticker_summaries[ticker] = {
                    'status': 'error',
                    'message': str(e)
                }

        # Sort events by date (most recent first)
        all_events.sort(key=lambda x: x['date'], reverse=True)

        # Limit to most recent 30 events
        all_events = all_events[:30]

        # Summary stats
        high_count = sum(1 for e in all_events if e['severity'] == 'high')
        medium_count = sum(1 for e in all_events if e['severity'] == 'medium')
        low_count = sum(1 for e in all_events if e['severity'] == 'low')

        return {
            'events': all_events,
            'summary': {
                'total_anomalies': len(all_events),
                'high_severity': high_count,
                'medium_severity': medium_count,
                'low_severity': low_count,
                'tickers_analyzed': len(tickers),
                'analysis_period': '6 months'
            },
            'ticker_details': ticker_summaries,
            'generated_at': datetime.now().isoformat()
        }

    def _detect_for_ticker(self, ticker: str) -> tuple:
        """Run anomaly detection for a single ticker."""

        # Fetch 6 months of data
        end_date = datetime.now()
        start_date = end_date - timedelta(days=180)
        df = yf.download(ticker, start=start_date, end=end_date, progress=False)

        if df.empty or len(df) < 30:
            raise ValueError(f"Insufficient data for {ticker}")

        # Flatten MultiIndex columns if present
        if hasattr(df.columns, 'levels'):
            df.columns = df.columns.get_level_values(0)

        # Compute features
        df['returns'] = df['Close'].pct_change()
        df['volume_change'] = df['Volume'].pct_change()
        df['price_range'] = (df['High'] - df['Low']) / df['Close']
        df['gap'] = (df['Open'] - df['Close'].shift(1)) / df['Close'].shift(1)
        df = df.dropna()

        if len(df) < 20:
            raise ValueError(f"Not enough data points for {ticker} after feature computation")

        # Feature matrix for Isolation Forest
        features = df[['returns', 'volume_change', 'price_range', 'gap']].values

        # Run Isolation Forest
        iso_forest = IsolationForest(
            contamination=self.contamination,
            random_state=42,
            n_estimators=100
        )
        anomaly_labels = iso_forest.fit_predict(features)
        anomaly_scores = iso_forest.decision_function(features)

        # Z-scores for interpretability
        returns_zscore = np.abs((df['returns'] - df['returns'].mean()) / df['returns'].std())
        volume_zscore = np.abs((df['volume_change'] - df['volume_change'].mean()) / df['volume_change'].std())

        # Collect anomaly events
        events = []
        anomaly_indices = np.where(anomaly_labels == -1)[0]

        for idx in anomaly_indices:
            row = df.iloc[idx]
            date_str = row.name.strftime('%Y-%m-%d')
            r_z = _safe_float(returns_zscore.iloc[idx])
            v_z = _safe_float(volume_zscore.iloc[idx])
            ret = _safe_float(row['returns'])
            vol_chg = _safe_float(row['volume_change'])
            score = _safe_float(anomaly_scores[idx])

            # Determine anomaly type and severity
            if r_z > v_z:
                anomaly_type = 'price'
                detail_val = ret * 100
                if abs(ret) > 0.05:
                    severity = 'high'
                    description = f"{ticker} had a {'surge' if ret > 0 else 'drop'} of {detail_val:+.1f}% — significantly outside normal range"
                elif abs(ret) > 0.03:
                    severity = 'medium'
                    description = f"{ticker} moved {detail_val:+.1f}% — an unusual price swing"
                else:
                    severity = 'low'
                    description = f"{ticker} showed abnormal price behavior ({detail_val:+.1f}%)"
            else:
                anomaly_type = 'volume'
                vol_multiple = abs(vol_chg) + 1
                if vol_multiple > 3:
                    severity = 'high'
                    description = f"{ticker} volume spiked {vol_multiple:.1f}x above normal — possible institutional activity"
                elif vol_multiple > 2:
                    severity = 'medium'
                    description = f"{ticker} volume was {vol_multiple:.1f}x normal — unusual trading activity"
                else:
                    severity = 'low'
                    description = f"{ticker} had slightly abnormal volume ({vol_multiple:.1f}x)"

            events.append({
                'date': date_str,
                'ticker': ticker,
                'type': anomaly_type,
                'severity': severity,
                'description': description,
                'metrics': {
                    'price_change': round(ret * 100, 2),
                    'volume_change': round(vol_chg * 100, 2),
                    'anomaly_score': round(score, 4),
                    'price_zscore': round(r_z, 2),
                    'volume_zscore': round(v_z, 2)
                }
            })

        summary = {
            'status': 'ok',
            'anomalies_found': len(events),
            'data_points_analyzed': len(df),
            'avg_anomaly_score': round(_safe_float(np.mean(anomaly_scores)), 4)
        }

        return events, summary
