"""
VADER Sentiment Analyzer for Cryptocurrency Text
Wrapper around vaderSentiment with crypto-specific lexicon additions
"""

from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from typing import Dict, List
import re


class CryptoSentimentAnalyzer:
    """Sentiment analyzer optimized for cryptocurrency content"""
    
    def __init__(self):
        self.analyzer = SentimentIntensityAnalyzer()
        self._add_crypto_lexicon()
    
    def _add_crypto_lexicon(self):
        """Add cryptocurrency-specific words to VADER lexicon"""
        
        # Positive crypto terms
        crypto_positive = {
            'moon': 3.5,
            'mooning': 3.5,
            'lambo': 3.0,
            'hodl': 2.5,
            'bullish': 3.0,
            'pump': 25,
            'rally': 2.8,
            'breakout': 2.7,
            'ath': 2.5,  # All-time high
            'gem': 2.8,
            'diamond': 2.5,
            'stack': 2.0,
            'accumulate': 2.2,
            'adoption': 2.5,
            'winner': 2.7,
            'strong': 2.3
        }
        
        # Negative crypto terms
        crypto_negative = {
            'rekt': -3.5,
            'dump': -3.0,
            'crash': -3.2,
            'rugpull': -4.0,
            'scam': -3.8,
            'bearish': -2.8,
            'fud': -2.5,  # Fear, Uncertainty, Doubt
            'capitulation': -3.0,
            'dead': -3.5,
            'failed': -3.0,
            'hack': -3.5,
            'exploit': -3.3,
            'concern': -2.0,
            'panic': -2.8,
            'selloff': -2.7
        }
        
        # Neutral/context-dependent
        crypto_neutral = {
            'volatile': -0.5,  # Slightly negative
            'dip': -1.5,  # Often seen as buying opportunity
            'correction': -1.0,
            'consolidation': 0.0,
            'sideways': 0.0,
            'range': 0.0
        }
        
        # Combine all lexicons
        crypto_lexicon = {
            **crypto_positive,
            **crypto_negative,
            **crypto_neutral
        }
        
        # Update VADER lexicon
        self.analyzer.lexicon.update(crypto_lexicon)
    
    def analyze_text(self, text: str) -> Dict:
        """
        Analyze sentiment of text
        
        Args:
            text: Input text to analyze
            
        Returns:
            Dict with compound, pos, neu, neg scores
        """
        # Preprocess text
        text = self._preprocess (text)
        
        # Get VADER scores
        scores = self.analyzer.polarity_scores(text)
        
        return {
            'compound': scores['compound'],  # Overall sentiment [-1, 1]
            'positive': scores['pos'],
            'neutral': scores['neu'],
            'negative': scores['neg'],
            'classification': self.classify_sentiment(scores['compound'])
        }
    
    def _preprocess(self, text: str) -> str:
        """Preprocess text for better sentiment analysis"""
        
        # Convert common abbreviations
        text = re.sub(r'\bbtc\b', 'Bitcoin', text, flags=re.IGNORECASE)
        text = re.sub(r'\beth\b', 'Ethereum', text, flags=re.IGNORECASE)
        
        # Handle emoji sentiment (VADER handles most emojis well)
        # Just ensure proper spacing
        text = re.sub(r'([🚀🌙💎📈])', r' \1 ', text)
        text = re.sub(r'([📉💩⚠️])', r' \1 ', text)
        
        # Handle excessive punctuation (!!!! = very strong)
        # VADER handles this, but we ensure it's not overdone
        text = re.sub(r'!{4,}', '!!!', text)
        text = re.sub(r'\?{4,}', '???', text)
        
        return text.strip()
    
    def classify_sentiment(self, compound_score: float) -> str:
        """
        Classify sentiment based on compound score
        
        Args:
            compound_score: VADER compound score [-1, 1]
            
        Returns:
            Classification: Very Bearish, Bearish, Neutral, Bullish, Very Bullish
        """
        if compound_score >= 0.6:
            return "Very Bullish"
        elif compound_score >= 0.2:
            return "Bullish"
        elif compound_score > -0.2:
            return "Neutral"
        elif compound_score > -0.6:
            return "Bearish"
        else:
            return "Very Bearish"
    
    def aggregate_sentiment(self, texts: List[str]) -> Dict:
        """
        Analyze multiple texts and aggregate results
        
        Args:
            texts: List of text strings
            
        Returns:
            Aggregated sentiment scores
        """
        if not texts:
            return {
                'compound': 0.0,
                'positive': 0.0,
                'neutral': 1.0,
                'negative': 0.0,
                'classification': 'Neutral',
                'count': 0,
                'individual_scores': []
            }
        
        # Analyze each text
        results = [self.analyze_text(text) for text in texts]
        
        # Calculate averages
        avg_compound = sum(r['compound'] for r in results) / len(results)
        avg_pos = sum(r['positive'] for r in results) / len(results)
        avg_neu = sum(r['neutral'] for r in results) / len(results)
        avg_neg = sum(r['negative'] for r in results) / len(results)
        
        # Extract individual compound scores
        individual_scores = [r['compound'] for r in results]
        
        return {
            'compound': round(avg_compound, 3),
            'positive': round(avg_pos, 3),
            'neutral': round(avg_neu, 3),
            'negative': round(avg_neg, 3),
            'classification': self.classify_sentiment(avg_compound),
            'count': len(texts),
            'individual_scores': individual_scores  # NEW: per-headline scores
        }
    
    def get_sentiment_emoji(self, compound_score: float) -> str:
        """Get emoji representation of sentiment"""
        if compound_score >= 0.5:
            return "😊"  # Very positive
        elif compound_score >= 0.2:
            return "🙂"  # Positive
        elif compound_score >= -0.2:
            return "😐"  # Neutral
        elif compound_score >= -0.5:
            return "🙁"  # Negative
        else:
            return "😢"  # Very negative


# Singleton instance
crypto_sentiment_analyzer = CryptoSentimentAnalyzer()
