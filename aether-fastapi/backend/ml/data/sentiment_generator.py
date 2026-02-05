"""
Mock Sentiment Data Generator
Generates realistic crypto sentiment data without requiring real API access
"""

import random
from datetime import datetime, timedelta
from typing import Dict, List
import numpy as np


class SentimentDataGenerator:
    """Generate mock sentiment data for cryptocurrencies"""
    
    # News headline templates with sentiment scores
    HEADLINE_TEMPLATES = {
        'positive': [
            ("{symbol} surges past ${price}K amid institutional buying", 0.75),
            ("{symbol} sees strong adoption in {sector} sector", 0.68),
            ("Analysts predict {symbol} could reach ${target}K by year-end", 0.72),
            ("Major company announces {symbol} integration", 0.80),
            ("{symbol} network upgrade successful, community celebrates", 0.77),
            ("{symbol} developer activity hits all-time high", 0.70),
            ("Institutional investors increase {symbol} holdings", 0.73),
            ("{symbol} trading volume reaches new milestone", 0.65),
        ],
        'neutral': [
            ("{symbol} consolidates around ${price}K mark", 0.05),
            ("Analysts divided on {symbol} short-term outlook", 0.0),
            ("{symbol} market shows mixed signals amid volatility", -0.05),
            ("Technical analysis: {symbol} trading in range", 0.02),
            ("{symbol} maintains stability despite market uncertainty", 0.08),
            ("Traders await clarity on {symbol} next move", 0.03),
        ],
        'negative': [
            ("{symbol} faces resistance at ${price}K level", -0.55),
            ("Concerns grow over {symbol} network congestion", -0.62),
            ("{symbol} drops amid broader market selloff", -0.70),
            ("Regulatory uncertainty weighs on {symbol} price", -0.68),
            ("Whale moves {amount}M {symbol}, sparking concerns", -0.58),
            ("{symbol} struggles to maintain support level", -0.65),
        ]
    }
    
    NEWS_SOURCES = [
        "CryptoDaily", "CoinDesk", "CryptoNews", "The Block", 
        "Decrypt", "CoinTelegraph", "Bitcoin Magazine", "CryptoSlate"
    ]
    
    CRYPTO_SECTORS = [
        "DeFi", "payments", "enterprise", "gaming", 
        "NFT", "institutional", "retail", "Web3"
    ]
    
    def __init__(self):
        self.symbol_contexts = {}
    
    def _get_price_context(self, symbol: str, current_price: float = None) -> Dict:
        """Get or generate price context for a symbol"""
        if symbol not in self.symbol_contexts:
            # Initialize context based on symbol
            base_prices = {
                'BTC': 58000,
                'ETH': 3200,
                'SOL': 110,
                'ADA': 0.58,
                'BNB': 320,
                'XRP': 0.52
            }
            self.symbol_contexts[symbol] = {
                'base_price': current_price or base_prices.get(symbol, 100),
                'sentiment_trend': random.choice([-0.1, 0, 0.1, 0.2])
            }
        
        return self.symbol_contexts[symbol]
    
    def generate_headlines(
        self, 
        symbol: str, 
        count: int = 5,
        current_price: float = None
    ) -> List[Dict]:
        """Generate mock news headlines for a symbol"""
        
        context = self._get_price_context(symbol, current_price)
        base_price = context['base_price']
        trend = context['sentiment_trend']
        
        # Bias toward positive if trend is up, negative if down
        if trend > 0.1:
            sentiment_weights = [0.6, 0.3, 0.1]  # More positive
        elif trend < -0.1:
            sentiment_weights = [0.2, 0.3, 0.5]  # More negative
        else:
            sentiment_weights = [0.35, 0.35, 0.3]  # Balanced
        
        headlines = []
        now = datetime.now()
        
        for i in range(count):
            # Choose sentiment category
            sentiment_type = random.choices(
                ['positive', 'neutral', 'negative'],
                weights=sentiment_weights
            )[0]
            
            # Select random template
            template, base_sentiment = random.choice(
                self.HEADLINE_TEMPLATES[sentiment_type]
            )
            
            # Fill in template variables
            title = template.format(
                symbol=symbol,
                price=int(base_price / 1000) if base_price > 1000 else round(base_price, 2),
                target=int(base_price * 1.3 / 1000) if base_price > 1000 else round(base_price * 1.3, 2),
                sector=random.choice(self.CRYPTO_SECTORS),
                amount=random.randint(10, 500)
            )
            
            # Add slight random variation to sentiment
            sentiment = base_sentiment + random.uniform(-0.1, 0.1)
            sentiment = max(-1.0, min(1.0, sentiment))  # Clamp to [-1, 1]
            
            # Generate timestamp (within last 24 hours)
            hours_ago = random.randint(1, 24)
            timestamp = now - timedelta(hours=hours_ago)
            
            headlines.append({
                'title': title,
                'source': random.choice(self.NEWS_SOURCES),
                'sentiment': round(sentiment, 3),
                'timestamp': timestamp.isoformat(),
                'hours_ago': hours_ago,
                'relevance': round(random.uniform(0.7, 1.0), 2)
            })
        
        # Sort by recency
        headlines.sort(key=lambda x: x['hours_ago'])
        
        return headlines
    
    def generate_social_buzz(self, symbol: str) -> Dict:
        """Generate mock social media metrics"""
        
        context = self._get_price_context(symbol)
        trend = context['sentiment_trend']
        
        # Base mention counts by symbol popularity
        base_mentions = {
            'BTC': 45000,
            'ETH': 28000,
            'SOL': 15000,
            'ADA': 8000,
            'BNB': 12000,
            'XRP': 10000
        }
        
        mentions_24h = base_mentions.get(symbol, 5000)
        mentions_24h = int(mentions_24h * random.uniform(0.8, 1.2))
        
        # Trending hashtags
        common_tags = ["#Crypto", f"#{symbol}"]
        if trend > 0.1:
            common_tags.extend(["#Bullish", "#ToTheMoon", "#HODL"])
        elif trend < -0.1:
            common_tags.extend(["#Bearish", "#Dip", "#BuyTheDip"])
        else:
            common_tags.extend(["#Trading", "#Blockchain", "#Web3"])
        
        trending = random.sample(common_tags, min(5, len(common_tags)))
        
        # Sentiment average (correlated with price trend)
        sentiment_avg = 0.5 + trend * 2 + random.uniform(-0.15, 0.15)
        sentiment_avg = max(-1.0, min(1.0, sentiment_avg))
        
        # Trend direction
        if trend > 0.05:
            sentiment_trend = "up"
        elif trend < -0.05:
            sentiment_trend = "down"
        else:
            sentiment_trend = "stable"
        
        return {
            'mentions_24h': mentions_24h,
            'sentiment_avg': round(sentiment_avg, 3),
            'sentiment_trend': sentiment_trend,
            'trending_hashtags': trending,
            'top_keywords': self._generate_keywords(sentiment_trend)
        }
    
    def _generate_keywords(self, trend: str) -> List[str]:
        """Generate top keywords based on trend"""
        
        keyword_pools = {
            'up': ["bullish", "rally", "surge", "breakout", "ATH"],
            'down': ["dip", "correction", "support", "oversold", "opportunity"],
            'stable': ["consolidation", "range", "sideways", "accumulation", "waiting"]
        }
        
        pool = keyword_pools.get(trend, keyword_pools['stable'])
        return random.sample(pool, min(3, len(pool)))
    
    def generate_technical_sentiment(self, symbol: str) -> float:
        """Generate mock technical analysis sentiment"""
        
        context = self._get_price_context(symbol)
        trend = context['sentiment_trend']
        
        # Technical sentiment slightly lags price trend
        tech_sentiment = trend * 0.8 + random.uniform(-0.1, 0.1)
        return max(-1.0, min(1.0, tech_sentiment))
    
    def generate_market_sentiment(self, symbol: str) -> float:
        """Generate overall market sentiment"""
        
        # Market sentiment is less volatile than individual coin sentiment
        base_sentiment = random.uniform(-0.2, 0.4)  # Slightly bullish bias
        return round(base_sentiment, 3)
    
    def generate_full_sentiment_data(
        self, 
        symbol: str,
        current_price: float = None
    ) -> Dict:
        """Generate complete sentiment dataset for a symbol"""
        
        headlines = self.generate_headlines(symbol, count=5, current_price=current_price)
        social = self.generate_social_buzz(symbol)
        technical = self.generate_technical_sentiment(symbol)
        market = self.generate_market_sentiment(symbol)
        
        # Calculate news sentiment average
        news_sentiment = np.mean([h['sentiment'] for h in headlines])
        
        return {
            'symbol': symbol,
            'headlines': headlines,
            'social_buzz': social,
            'sentiment_breakdown': {
                'news': round(float(news_sentiment), 3),
                'social': social['sentiment_avg'],
                'technical': round(technical, 3),
                'market': market
            },
            'timestamp': datetime.now().isoformat()
        }


# Singleton instance
sentiment_generator = SentimentDataGenerator()
