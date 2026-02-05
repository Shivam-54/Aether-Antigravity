"""
Sentiment Aggregator
Combines sentiment from multiple sources into unified scores
"""

from typing import Dict, List
import numpy as np
from ml.nlp.sentiment_analyzer import crypto_sentiment_analyzer
from ml.data.sentiment_generator import sentiment_generator
from ml.data.news_fetcher import news_fetcher  # NEW: Real news API


class SentimentAggregator:
    """Aggregate sentiment from news, social, technical, and market sources"""
    
    # Weights for different sentiment sources
    WEIGHTS = {
        'news': 0.4,
        'social': 0.3,
        'technical': 0.2,
        'market': 0.1
    }
    
    def __init__(self):
        self.analyzer = crypto_sentiment_analyzer
        self.generator = sentiment_generator
        self.news_fetcher = news_fetcher  # Real news fetcher
    
    def aggregate_sentiment(
        self,
        symbol: str,
        current_price: float = None
    ) -> Dict:
        """
        Calculate comprehensive sentiment analysis for a cryptocurrency
        
        Args:
            symbol: Crypto symbol (e.g., BTC, ETH)
            current_price: Optional current price for context
            
        Returns:
            Comprehensive sentiment analysis dictionary
        """
        # Fetch REAL news headlines from APIs
        real_headlines = self.news_fetcher.get_crypto_news(symbol, max_articles=10)
        
        # Analyze real headline sentiments with VADER
        headline_texts = [h['title'] for h in real_headlines]
        news_analysis = self.analyzer.aggregate_sentiment(headline_texts)
        news_sentiment = news_analysis['compound']
        
        # Add sentiment scores to headlines
        for i, headline in enumerate(real_headlines):
            if i < len(news_analysis['individual_scores']):
                headline['sentiment'] = news_analysis['individual_scores'][i]
            else:
                headline['sentiment'] = 0.0
        
        # Get mock data for other components (social, technical, market)
        # These would require Twitter/Reddit APIs which are expensive
        mock_data = self.generator.generate_full_sentiment_data(symbol, current_price)
        
        social_sentiment = mock_data['social_buzz']['sentiment_avg']
        technical_sentiment = mock_data['sentiment_breakdown']['technical']
        market_sentiment = mock_data['sentiment_breakdown']['market']
        
        # Calculate weighted overall sentiment
        overall_sentiment = (
            self.WEIGHTS['news'] * news_sentiment +
            self.WEIGHTS['social'] * social_sentiment +
            self.WEIGHTS['technical'] * technical_sentiment +
            self.WEIGHTS['market'] * market_sentiment
        )
        
        # Classify overall sentiment
        classification = self.analyzer.classify_sentiment(overall_sentiment)
        
        # Calculate confidence (based on agreement between sources)
        confidence = self._calculate_confidence([
            news_sentiment,
            social_sentiment,
            technical_sentiment,
            market_sentiment
        ])
        
        # Determine trend
        trend = self._determine_trend(overall_sentiment, social_sentiment)
        
        # Add emoji indicators to headlines
        for headline in real_headlines:
            headline['emoji'] = self.analyzer.get_sentiment_emoji(headline['sentiment'])
        
        return {
            'symbol': symbol,
            'sentiment_score': round(overall_sentiment, 3),
            'classification': classification,
            'confidence': confidence,
            'trend': trend,
            'breakdown': {
                'news': round(news_sentiment, 3),
                'social': round(social_sentiment, 3),
                'technical': round(technical_sentiment, 3),
                'market': round(market_sentiment, 3)
            },
            'recent_headlines': real_headlines,  # Real headlines from APIs
            'social_buzz': mock_data['social_buzz'],  # Mock social data
            'timestamp': mock_data['timestamp']
        }
    
    def _calculate_confidence(self, sentiments: List[float]) -> int:
        """
        Calculate confidence score based on agreement between sources
        
        Args:
            sentiments: List of sentiment scores from different sources
            
        Returns:
            Confidence score (0-100)
        """
        # Calculate standard deviation (lower = more agreement = higher confidence)
        std_dev = np.std(sentiments)
        
        # Convert to confidence score (0-100)
        # std_dev of 0 = 100% confidence
        # std_dev of 1 = 0% confidence
        confidence = max(0, min(100, int((1 - std_dev) * 100)))
        
        # Adjust based on absolute sentiment strength
        avg_abs_sentiment = np.mean([abs(s) for s in sentiments])
        
        # Strong absolute sentiment increases confidence
        if avg_abs_sentiment > 0.6:
            confidence = min(100, int(confidence * 1.2))
        
        return confidence
    
    def _determine_trend(self, overall: float, social: float) -> str:
        """
        Determine sentiment trend
        
        Args:
            overall: Overall sentiment score
            social: Social media sentiment (more volatile, indicates trend)
            
        Returns:
            Trend: "Improving", "Stable", or "Declining"
        """
        # If social sentiment is significantly higher than overall, sentiment is improving
        diff = social - overall
        
        if diff > 0.15:
            return "Improving"
        elif diff < -0.15:
            return "Declining"
        else:
            return "Stable"
    
    def get_sentiment_history(
        self,
        symbol: str,
        days: int = 30
    ) -> List[Dict]:
        """
        Generate mock sentiment history for charting
        
        Args:
            symbol: Crypto symbol
            days: Number of days of history
            
        Returns:
            List of daily sentiment scores
        """
        from datetime import datetime, timedelta
        
        history = []
        
        # Start from current sentiment
        current = self.aggregate_sentiment(symbol)
        current_score = current['sentiment_score']
        
        # Generate backwards with random walk
        for i in range(days):
            date = datetime.now() - timedelta(days=days - i)
            
            # Random walk with mean reversion
            if i == 0:
                score = current_score
            else:
                # Previous score with some random variation
                prev_score = history[-1]['score']
                # Mean revert toward 0.1 (slightly bullish bias)
                change = np.random.normal(0, 0.08) + (0.1 - prev_score) * 0.1
                score = prev_score + change
                score = max(-1.0, min(1.0, score))  # Clamp
            
            history.append({
                'date': date.strftime('%Y-%m-%d'),
                'score': round(score, 3),
                'classification': self.analyzer.classify_sentiment(score)
            })
        
        return history


# Singleton instance
sentiment_aggregator = SentimentAggregator()
