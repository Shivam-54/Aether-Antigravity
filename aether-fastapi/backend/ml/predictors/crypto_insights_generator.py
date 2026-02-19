"""
Crypto AI Insights Generator using Google Gemini
Generates actionable portfolio insights for cryptocurrency holdings
"""

import google.generativeai as genai
from google.generativeai.types import RequestOptions
import pandas as pd
import numpy as np
import os
import json
import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional

from ml.data.data_collector import data_collector

logger = logging.getLogger(__name__)


class CryptoInsightsGenerator:
    """
    AI-powered crypto portfolio insights using Google Gemini.
    Analyzes price trends, volatility, momentum, and market conditions
    to generate categorized, actionable insights.
    """

    def __init__(self):
        """Initialize Gemini AI for insight generation"""
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY not found in environment")

        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-2.0-flash')

    async def get_crypto_context(self, symbols: List[str]) -> Dict:
        """
        Gather comprehensive crypto data for AI analysis.
        
        Args:
            symbols: List of crypto symbols (e.g., ['BTC', 'ETH'])
        
        Returns:
            Dict mapping symbol to metrics (price, momentum, volatility, etc.)
        """
        context = {}

        for symbol in symbols:
            try:
                df = await data_collector.fetch_historical_data(symbol, days=90)
                if df is None or len(df) < 7:
                    continue

                prices = df['price'].values
                current_price = float(prices[-1])

                # Week and month price changes
                week_ago = float(prices[-7]) if len(prices) >= 7 else float(prices[0])
                month_ago = float(prices[-30]) if len(prices) >= 30 else float(prices[0])

                week_change = ((current_price - week_ago) / week_ago) * 100
                month_change = ((current_price - month_ago) / month_ago) * 100

                # Volatility (annualized)
                daily_returns = pd.Series(prices).pct_change().dropna()
                volatility = float(daily_returns.std() * np.sqrt(365) * 100)

                # Moving averages
                sma_7 = float(pd.Series(prices).rolling(7, min_periods=1).mean().iloc[-1])
                sma_30 = float(pd.Series(prices).rolling(30, min_periods=1).mean().iloc[-1])

                # RSI (14-day)
                delta = pd.Series(prices).diff()
                gain = delta.where(delta > 0, 0).rolling(14, min_periods=1).mean()
                loss = (-delta.where(delta < 0, 0)).rolling(14, min_periods=1).mean()
                rs = gain / loss.replace(0, 1e-10)
                rsi = float((100 - (100 / (1 + rs))).iloc[-1])

                # 90-day high/low
                high_90d = float(max(prices))
                low_90d = float(min(prices))
                pct_from_high = ((current_price - high_90d) / high_90d) * 100

                # Volume trend (if available)
                volume_trend = 'stable'
                if 'volume' in df.columns:
                    avg_vol = float(df['volume'].mean())
                    recent_vol = float(df['volume'].iloc[-5:].mean())
                    if recent_vol > avg_vol * 1.2:
                        volume_trend = 'increasing'
                    elif recent_vol < avg_vol * 0.8:
                        volume_trend = 'decreasing'

                context[symbol] = {
                    'current_price': round(current_price, 2),
                    'week_change_pct': round(week_change, 2),
                    'month_change_pct': round(month_change, 2),
                    'volatility_annual_pct': round(volatility, 2),
                    'sma_7': round(sma_7, 2),
                    'sma_30': round(sma_30, 2),
                    'above_sma_7': bool(current_price > sma_7),
                    'above_sma_30': bool(current_price > sma_30),
                    'rsi_14': round(rsi, 1),
                    'high_90d': round(high_90d, 2),
                    'low_90d': round(low_90d, 2),
                    'pct_from_90d_high': round(pct_from_high, 2),
                    'volume_trend': volume_trend
                }

            except Exception as e:
                logger.error(f"Error getting context for {symbol}: {e}")
                continue

        return context

    async def generate_insights(
        self,
        symbols: List[str],
        portfolio_value: Optional[float] = None
    ) -> Dict:
        """
        Generate AI-powered crypto portfolio insights.
        
        Returns structured insights with categories:
        - Portfolio Overview
        - Individual Asset Analysis
        - Risk Alerts
        - Opportunities
        - Action Items
        """
        stock_context = await self.get_crypto_context(symbols)

        if not stock_context:
            return {
                'insights': [{
                    'category': 'error',
                    'title': 'No Data Available',
                    'content': 'Unable to fetch crypto data for analysis.',
                    'severity': 'low',
                    'icon': '⚡'
                }],
                'generated_at': datetime.now().isoformat()
            }

        prompt = self._build_prompt(stock_context, portfolio_value)

        try:
            response = await asyncio.to_thread(
                self.model.generate_content,
                prompt,
                request_options=RequestOptions(timeout=10)
            )
            insights = self._parse_response(response.text)
        except Exception as e:
            logger.warning(f"Gemini AI failed, falling back to rule-based: {e}")
            insights = self._generate_rule_based_insights(stock_context)

        return {
            'insights': insights,
            'crypto_context': stock_context,
            'generated_at': datetime.now().isoformat(),
            'symbols_analyzed': list(stock_context.keys())
        }

    def _build_prompt(self, crypto_context: dict, portfolio_value: float = None) -> str:
        """Build a structured prompt for Gemini"""
        context_str = json.dumps(crypto_context, indent=2)

        prompt = f"""You are a professional cryptocurrency analyst AI. Analyze the following crypto portfolio data and generate actionable insights.

CRYPTO PORTFOLIO DATA:
{context_str}
{f'Total Portfolio Value: ${portfolio_value:,.2f}' if portfolio_value else ''}

Generate exactly 5-6 insights in the following JSON format. Each insight must be a JSON object in an array:

```json
[
  {{
    "category": "overview|asset|risk|opportunity|action",
    "title": "Short title (max 60 chars)",
    "content": "Detailed explanation (2-3 sentences max)",
    "severity": "low|medium|high",
    "icon": "single minimal icon character (use: ◈ ✦ ⚡ ◎ ◇ ↗ ↘ — avoid childish emojis)",
    "ticker": "BTC or null if portfolio-wide"
  }}
]
```

RULES:
1. Include at least one "risk" insight if any asset has high volatility (>80%), RSI>70 (overbought), or RSI<30 (oversold)
2. Include at least one "opportunity" insight for assets with positive momentum (above SMA 7 & 30)
3. Include one "overview" with a portfolio summary
4. Be specific with numbers and percentages from the data
5. Consider crypto-specific factors: market cycles, correlation with BTC, DeFi trends
6. Keep language professional but accessible
7. Each "content" should be actionable and concise
8. Return ONLY the JSON array, no other text
9. For icons, use minimal professional symbols like ◈ ✦ ⚡ ◎ ◇ ▣. Do NOT use childish emojis."""

        return prompt

    def _parse_response(self, response_text: str) -> list:
        """Parse Gemini's response into structured insights"""
        try:
            text = response_text.strip()
            if text.startswith('```'):
                text = text.split('\n', 1)[1]
            if text.endswith('```'):
                text = text.rsplit('\n', 1)[0]
            if text.startswith('json'):
                text = text[4:]

            insights = json.loads(text.strip())

            valid_insights = []
            for insight in insights:
                valid_insights.append({
                    'category': insight.get('category', 'overview'),
                    'title': insight.get('title', 'Insight'),
                    'content': insight.get('content', ''),
                    'severity': insight.get('severity', 'medium'),
                    'icon': insight.get('icon', '◈'),
                    'ticker': insight.get('ticker', None)
                })

            return valid_insights

        except (json.JSONDecodeError, KeyError):
            return [{
                'category': 'overview',
                'title': 'Analysis Complete',
                'content': response_text[:200],
                'severity': 'medium',
                'icon': '◈',
                'ticker': None
            }]

    def _generate_rule_based_insights(self, crypto_context: dict) -> list:
        """Fallback: Generate insights using rule-based logic when Gemini is unavailable"""
        insights = []
        symbols = list(crypto_context.keys())

        # Portfolio overview
        avg_change = np.mean([v['month_change_pct'] for v in crypto_context.values()])
        insights.append({
            'category': 'overview',
            'title': f'Portfolio Analysis: {len(symbols)} Crypto Assets',
            'content': f'Your portfolio of {", ".join(symbols)} has an average monthly change of {avg_change:+.1f}%. '
                       f'{"Overall positive momentum." if avg_change > 0 else "Market is showing weakness."}',
            'severity': 'medium',
            'icon': '◈',
            'ticker': None
        })

        for symbol, data in crypto_context.items():
            # RSI alerts
            if data['rsi_14'] > 70:
                insights.append({
                    'category': 'risk',
                    'title': f'{symbol}: Overbought Signal (RSI {data["rsi_14"]:.0f})',
                    'content': f'{symbol} RSI at {data["rsi_14"]:.0f} suggests overbought conditions. '
                               f'Consider taking partial profits or tightening stop-losses.',
                    'severity': 'high',
                    'icon': '⚡',
                    'ticker': symbol
                })
            elif data['rsi_14'] < 30:
                insights.append({
                    'category': 'opportunity',
                    'title': f'{symbol}: Oversold Signal (RSI {data["rsi_14"]:.0f})',
                    'content': f'{symbol} RSI at {data["rsi_14"]:.0f} indicates oversold conditions. '
                               f'Potential accumulation zone if fundamentals remain strong.',
                    'severity': 'medium',
                    'icon': '◇',
                    'ticker': symbol
                })

            # Volatility alerts
            if data['volatility_annual_pct'] > 80:
                insights.append({
                    'category': 'risk',
                    'title': f'{symbol}: High Volatility Alert',
                    'content': f'{symbol} has {data["volatility_annual_pct"]:.0f}% annualized volatility. '
                               f'Consider smaller position sizes to manage risk.',
                    'severity': 'high',
                    'icon': '⚡',
                    'ticker': symbol
                })

            # Positive momentum
            if data['above_sma_7'] and data['above_sma_30'] and data['week_change_pct'] > 0:
                insights.append({
                    'category': 'opportunity',
                    'title': f'{symbol}: Strong Uptrend',
                    'content': f'{symbol} is trading above both 7-day and 30-day SMAs with '
                               f'{data["week_change_pct"]:+.1f}% weekly gain. Momentum is bullish.',
                    'severity': 'low',
                    'icon': '↗',
                    'ticker': symbol
                })

            # Below key support
            if not data['above_sma_30'] and data['month_change_pct'] < -10:
                insights.append({
                    'category': 'risk',
                    'title': f'{symbol}: Below Key Support',
                    'content': f'{symbol} at ${data["current_price"]:,.2f} is below its 30-day SMA of '
                               f'${data["sma_30"]:,.2f}. Month decline: {data["month_change_pct"]:.1f}%.',
                    'severity': 'medium',
                    'icon': '↘',
                    'ticker': symbol
                })

            # Near 90-day high
            if data['pct_from_90d_high'] > -3:
                insights.append({
                    'category': 'action',
                    'title': f'{symbol}: Near 90-Day High',
                    'content': f'{symbol} is within {abs(data["pct_from_90d_high"]):.1f}% of its 90-day high. '
                               f'Watch for breakout or resistance rejection.',
                    'severity': 'medium',
                    'icon': '◎',
                    'ticker': symbol
                })

        return insights[:6]  # Max 6 insights


# Singleton instance
crypto_insights_generator = CryptoInsightsGenerator()
