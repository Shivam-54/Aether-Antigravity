"""
Stock Sentiment Analyzer
Analyzes news sentiment for stock tickers using VADER + news APIs
Adapted from the crypto sentiment pipeline for the Shares AI Lab
"""

import os
import random
import requests
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from functools import lru_cache

try:
    from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
except ImportError:
    SentimentIntensityAnalyzer = None


# ---------------------------------------------------------------------------
# Company name lookup (common tickers)
# ---------------------------------------------------------------------------
COMPANY_NAMES = {
    'AAPL': 'Apple', 'MSFT': 'Microsoft', 'GOOGL': 'Google', 'AMZN': 'Amazon',
    'META': 'Meta', 'NVDA': 'NVIDIA', 'TSLA': 'Tesla', 'JPM': 'JPMorgan',
    'V': 'Visa', 'JNJ': 'Johnson & Johnson', 'WMT': 'Walmart', 'PG': 'Procter & Gamble',
    'MA': 'Mastercard', 'UNH': 'UnitedHealth', 'HD': 'Home Depot', 'DIS': 'Disney',
    'BAC': 'Bank of America', 'XOM': 'ExxonMobil', 'NFLX': 'Netflix', 'INTC': 'Intel',
    'AMD': 'AMD', 'CRM': 'Salesforce', 'COST': 'Costco', 'ADBE': 'Adobe',
    'PYPL': 'PayPal', 'PEP': 'PepsiCo', 'KO': 'Coca-Cola', 'NKE': 'Nike',
    'MRK': 'Merck', 'ABBV': 'AbbVie', 'TMO': 'Thermo Fisher', 'AVGO': 'Broadcom',
}

# Sentiment source weights
WEIGHTS = {
    'news': 0.45,
    'social': 0.25,
    'technical': 0.20,
    'market': 0.10,
}


class StockSentimentAnalyzer:
    """Analyze sentiment for stock tickers using VADER + news headlines"""

    def __init__(self):
        if SentimentIntensityAnalyzer:
            self.vader = SentimentIntensityAnalyzer()
            # Add stock-specific lexicon tweaks
            stock_lexicon = {
                'bullish': 2.5, 'bearish': -2.5, 'rally': 2.0, 'crash': -3.0,
                'surge': 2.5, 'plunge': -2.8, 'beat': 1.5, 'miss': -1.5,
                'upgrade': 2.0, 'downgrade': -2.0, 'outperform': 1.8,
                'underperform': -1.8, 'buy': 1.5, 'sell': -1.5, 'hold': 0.2,
                'breakout': 2.0, 'breakdown': -2.0, 'overweight': 1.5,
                'underweight': -1.5, 'recession': -2.5, 'growth': 1.5,
                'layoffs': -2.0, 'hiring': 1.3, 'dividend': 1.0,
                'bankruptcy': -3.5, 'acquisition': 1.2, 'lawsuit': -1.5,
                'innovation': 1.5, 'disruption': 1.0, 'regulation': -0.8,
            }
            self.vader.lexicon.update(stock_lexicon)
        else:
            self.vader = None

        self.newsdata_key = os.getenv('NEWSDATA_API_KEY')
        self.gnews_key = os.getenv('GNEWS_API_KEY')
        self._cache: Dict[str, Dict] = {}
        self._cache_ttl = 600  # 10 min

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def analyze(self, ticker: str, current_price: float = None) -> Dict:
        """
        Full sentiment analysis for a stock ticker.

        Returns dict with: sentiment_score, classification, confidence, trend,
        breakdown, recent_headlines, social_buzz, timestamp
        """
        ticker = ticker.upper()
        company = COMPANY_NAMES.get(ticker, ticker)

        # 1. Fetch & score news headlines
        headlines = self._fetch_news(ticker, company)
        news_scores = [self._score_text(h['title']) for h in headlines]
        news_sentiment = float(np.mean(news_scores)) if news_scores else 0.0

        # Attach scores + emojis to headlines
        for h, score in zip(headlines, news_scores):
            h['sentiment'] = round(score, 3)
            h['emoji'] = self._emoji(score)

        # 2. Mock social / technical / market (would need Twitter API etc.)
        social_sentiment = self._mock_social_sentiment(ticker)
        technical_sentiment = self._mock_technical_sentiment(ticker)
        market_sentiment = self._mock_market_sentiment()

        # 3. Weighted overall
        overall = (
            WEIGHTS['news'] * news_sentiment +
            WEIGHTS['social'] * social_sentiment +
            WEIGHTS['technical'] * technical_sentiment +
            WEIGHTS['market'] * market_sentiment
        )

        # 4. Confidence & trend
        sources = [news_sentiment, social_sentiment, technical_sentiment, market_sentiment]
        confidence = self._confidence(sources)
        trend = self._trend(overall, social_sentiment)

        # 5. Social buzz (mock)
        social_buzz = self._generate_social_buzz(ticker, company, social_sentiment)

        return {
            'symbol': ticker,
            'sentiment_score': round(overall, 3),
            'classification': self._classify(overall),
            'confidence': confidence,
            'trend': trend,
            'breakdown': {
                'news': round(news_sentiment, 3),
                'social': round(social_sentiment, 3),
                'technical': round(technical_sentiment, 3),
                'market': round(market_sentiment, 3),
            },
            'recent_headlines': headlines[:5],
            'social_buzz': social_buzz,
            'timestamp': datetime.now().isoformat(),
        }

    def get_history(self, ticker: str, days: int = 30) -> List[Dict]:
        """Generate sentiment history for charting (random-walk mock)."""
        current = self.analyze(ticker)
        current_score = current['sentiment_score']
        history = []

        for i in range(days):
            date = datetime.now() - timedelta(days=days - i)
            if i == 0:
                score = current_score
            else:
                prev = history[-1]['score']
                change = np.random.normal(0, 0.07) + (0.1 - prev) * 0.08
                score = max(-1.0, min(1.0, prev + change))

            history.append({
                'date': date.strftime('%Y-%m-%d'),
                'score': round(score, 3),
                'classification': self._classify(score),
            })
        return history

    # ------------------------------------------------------------------
    # News fetching (real APIs with fallback)
    # ------------------------------------------------------------------

    def _fetch_news(self, ticker: str, company: str, max_articles: int = 8) -> List[Dict]:
        """Fetch stock news with multi-API fallback → mock."""
        # Check cache
        cached = self._cache.get(ticker)
        if cached and (datetime.now() - cached['time']).seconds < self._cache_ttl:
            return cached['headlines'][:max_articles]

        headlines: List[Dict] = []

        # Try GNews
        if not headlines and self.gnews_key:
            try:
                headlines = self._fetch_gnews(ticker, company, max_articles)
            except Exception:
                pass

        # Try NewsData
        if not headlines and self.newsdata_key:
            try:
                headlines = self._fetch_newsdata(ticker, company, max_articles)
            except Exception:
                pass

        # Fallback: generate mock headlines
        if not headlines:
            headlines = self._mock_headlines(ticker, company)

        self._cache[ticker] = {'headlines': headlines, 'time': datetime.now()}
        return headlines[:max_articles]

    def _fetch_gnews(self, ticker: str, company: str, max_articles: int) -> List[Dict]:
        query = f"{company} stock"
        url = f"https://gnews.io/api/v4/search?q={query}&lang=en&max={max_articles}&apikey={self.gnews_key}"
        resp = requests.get(url, timeout=8)
        resp.raise_for_status()
        data = resp.json()
        articles = data.get('articles', [])
        return [
            {
                'title': a.get('title', ''),
                'source': a.get('source', {}).get('name', 'Unknown'),
                'hours_ago': self._hours_ago(a.get('publishedAt', '')),
            }
            for a in articles
        ]

    def _fetch_newsdata(self, ticker: str, company: str, max_articles: int) -> List[Dict]:
        query = f"{company} stock"
        url = f"https://newsdata.io/api/1/news?apikey={self.newsdata_key}&q={query}&language=en&size={max_articles}"
        resp = requests.get(url, timeout=8)
        resp.raise_for_status()
        data = resp.json()
        articles = data.get('results', [])
        return [
            {
                'title': a.get('title', ''),
                'source': a.get('source_id', 'Unknown'),
                'hours_ago': self._hours_ago(a.get('pubDate', '')),
            }
            for a in articles
        ]

    # ------------------------------------------------------------------
    # VADER scoring helpers
    # ------------------------------------------------------------------

    def _score_text(self, text: str) -> float:
        if not self.vader or not text:
            return 0.0
        return self.vader.polarity_scores(text)['compound']

    def _classify(self, score: float) -> str:
        if score >= 0.5:
            return 'Very Bullish'
        elif score >= 0.15:
            return 'Bullish'
        elif score >= -0.15:
            return 'Neutral'
        elif score >= -0.5:
            return 'Bearish'
        return 'Very Bearish'

    def _emoji(self, score: float) -> str:
        if score >= 0.5:
            return '🚀'
        elif score >= 0.15:
            return '📈'
        elif score >= -0.15:
            return '➡️'
        elif score >= -0.5:
            return '📉'
        return '💥'

    def _confidence(self, sources: List[float]) -> int:
        std = float(np.std(sources))
        conf = max(0, min(100, int((1 - std) * 100)))
        avg_abs = float(np.mean([abs(s) for s in sources]))
        if avg_abs > 0.5:
            conf = min(100, int(conf * 1.15))
        return conf

    def _trend(self, overall: float, social: float) -> str:
        diff = social - overall
        if diff > 0.12:
            return 'Improving'
        elif diff < -0.12:
            return 'Declining'
        return 'Stable'

    # ------------------------------------------------------------------
    # Mock data generators
    # ------------------------------------------------------------------

    def _mock_social_sentiment(self, ticker: str) -> float:
        random.seed(hash(ticker + datetime.now().strftime('%Y-%m-%d')))
        return round(random.uniform(-0.3, 0.6), 3)

    def _mock_technical_sentiment(self, ticker: str) -> float:
        random.seed(hash(ticker + 'tech' + datetime.now().strftime('%Y-%m-%d')))
        return round(random.uniform(-0.2, 0.5), 3)

    def _mock_market_sentiment(self) -> float:
        random.seed(hash('market' + datetime.now().strftime('%Y-%m-%d')))
        return round(random.uniform(-0.1, 0.4), 3)

    def _generate_social_buzz(self, ticker: str, company: str, social_score: float) -> Dict:
        random.seed(hash(ticker + 'buzz'))
        trend = 'Positive' if social_score > 0.1 else ('Negative' if social_score < -0.1 else 'Mixed')
        return {
            'mentions_24h': random.randint(800, 15000),
            'sentiment_trend': trend,
            'trending_hashtags': [f'${ticker}', f'#{company}', '#StockMarket', '#Investing', '#WallStreet'],
            'top_keywords': self._keywords(trend),
        }

    def _keywords(self, trend: str) -> List[str]:
        if trend == 'Positive':
            return ['earnings beat', 'growth', 'outperform', 'bullish', 'momentum']
        elif trend == 'Negative':
            return ['selloff', 'decline', 'risk', 'headwinds', 'warning']
        return ['consolidation', 'mixed', 'sideways', 'watch', 'volatility']

    def _mock_headlines(self, ticker: str, company: str) -> List[Dict]:
        """Deterministic mock headlines when no API key is available."""
        random.seed(hash(ticker + datetime.now().strftime('%Y-%m-%d')))
        templates = [
            (f"{company} ({ticker}) reports strong quarterly results, stock rallies", 'Reuters', 2),
            (f"Analysts upgrade {company} price target citing growth potential", 'Bloomberg', 5),
            (f"{company} announces strategic partnership to expand market reach", 'CNBC', 8),
            (f"Investors weigh {company} outlook amid sector-wide volatility", 'MarketWatch', 12),
            (f"{company} faces regulatory scrutiny over market practices", 'WSJ', 18),
            (f"{ticker} stock sees heavy trading volume on mixed earnings signal", 'Yahoo Finance', 3),
            (f"Wall Street mixed on {company} as growth expectations adjust", 'Barrons', 7),
            (f"{company} innovation pipeline boosts long-term investor confidence", 'TechCrunch', 10),
        ]
        random.shuffle(templates)
        return [
            {'title': t[0], 'source': t[1], 'hours_ago': t[2]}
            for t in templates[:5]
        ]

    def _hours_ago(self, date_str: str) -> int:
        if not date_str:
            return random.randint(1, 24)
        try:
            for fmt in ('%Y-%m-%dT%H:%M:%SZ', '%Y-%m-%d %H:%M:%S', '%Y-%m-%d'):
                try:
                    dt = datetime.strptime(date_str[:19], fmt)
                    return max(1, int((datetime.now() - dt).total_seconds() / 3600))
                except ValueError:
                    continue
        except Exception:
            pass
        return random.randint(1, 24)


# Singleton
stock_sentiment_analyzer = StockSentimentAnalyzer()
