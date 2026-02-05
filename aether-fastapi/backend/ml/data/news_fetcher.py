"""
Real News Fetcher
Fetches cryptocurrency news from multiple APIs with fallback logic
"""

import os
import requests
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import time
from functools import lru_cache


class NewsAPIFetcher:
    """Fetches cryptocurrency news from multiple news APIs"""
    
    def __init__(self):
        # Load API keys from environment
        self.newsdata_key = os.getenv('NEWSDATA_API_KEY')
        self.gnews_key = os.getenv('GNEWS_API_KEY')
        self.worldnews_key = os.getenv('WORLD_NEWS_API_KEY')
        
        # Cache for news results (symbol -> (headlines, timestamp))
        self._cache = {}
        self._cache_duration = 300  # 5 minutes in seconds
    
    def get_crypto_news(self, symbol: str, max_articles: int = 10) -> List[Dict]:
        """
        Fetch cryptocurrency news with multi-API fallback
        
        Args:
            symbol: Crypto symbol (e.g., BTC, ETH)
            max_articles: Maximum number of articles to return
            
        Returns:
            List of news articles with title, source, time, etc.
        """
        # Check cache first
        cached = self._get_from_cache(symbol)
        if cached:
            return cached
        
        # Try APIs in order of preference
        headlines = None
        
        # 1. Try NewsData.io (most reliable for crypto)
        if self.newsdata_key and not headlines:
            headlines = self._fetch_newsdata(symbol, max_articles)
        
        # 2. Try GNews (good alternative)
        if self.gnews_key and not headlines:
            headlines = self._fetch_gnews(symbol, max_articles)
        
        # 3. Try World News API (last resort)
        if self.worldnews_key and not headlines:
            headlines = self._fetch_worldnews(symbol, max_articles)
        
        # 4. Fallback to mock data if all APIs fail
        if not headlines:
            print(f"Warning: All news APIs failed for {symbol}, using mock data")
            headlines = self._generate_mock_headlines(symbol)
        
        # Cache the results
        self._save_to_cache(symbol, headlines)
        
        return headlines
    
    def _fetch_newsdata(self, symbol: str, max_articles: int) -> Optional[List[Dict]]:
        """Fetch from NewsData.io API"""
        try:
            # Build search query
            crypto_names = {
                'BTC': 'Bitcoin',
                'ETH': 'Ethereum',
                'SOL': 'Solana',
                'ADA': 'Cardano'
            }
            crypto_name = crypto_names.get(symbol, symbol)
            
            url = "https://newsdata.io/api/1/news"
            params = {
                'apikey': self.newsdata_key,
                'q': f'{crypto_name} OR {symbol} OR cryptocurrency',
                'language': 'en',
                'size': max_articles
            }
            
            response = requests.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                articles = data.get('results', [])
                
                return self._parse_newsdata_articles(articles)
            else:
                print(f"NewsData.io error: {response.status_code}")
                return None
                
        except Exception as e:
            print(f"NewsData.io exception: {str(e)}")
            return None
    
    def _fetch_gnews(self, symbol: str, max_articles: int) -> Optional[List[Dict]]:
        """Fetch from GNews API"""
        try:
            crypto_names = {
                'BTC': 'Bitcoin',
                'ETH': 'Ethereum',
                'SOL': 'Solana',
                'ADA': 'Cardano'
            }
            crypto_name = crypto_names.get(symbol, symbol)
            
            url = "https://gnews.io/api/v4/search"
            params = {
                'apikey': self.gnews_key,
                'q': f'{crypto_name} cryptocurrency',
                'lang': 'en',
                'max': max_articles
            }
            
            response = requests.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                articles = data.get('articles', [])
                
                return self._parse_gnews_articles(articles)
            else:
                print(f"GNews error: {response.status_code}")
                return None
                
        except Exception as e:
            print(f"GNews exception: {str(e)}")
            return None
    
    def _fetch_worldnews(self, symbol: str, max_articles: int) -> Optional[List[Dict]]:
        """Fetch from World News API"""
        try:
            crypto_names = {
                'BTC': 'Bitcoin',
                'ETH': 'Ethereum',
                'SOL': 'Solana',
                'ADA': 'Cardano'
            }
            crypto_name = crypto_names.get(symbol, symbol)
            
            url = "https://api.worldnewsapi.com/search-news"
            params = {
                'api-key': self.worldnews_key,
                'text': f'{crypto_name} OR {symbol}',
                'language': 'en',
                'number': max_articles
            }
            
            response = requests.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                articles = data.get('news', [])
                
                return self._parse_worldnews_articles(articles)
            else:
                print(f"World News API error: {response.status_code}")
                return None
                
        except Exception as e:
            print(f"World News API exception: {str(e)}")
            return None
    
    def _parse_newsdata_articles(self, articles: List) -> List[Dict]:
        """Parse NewsData.io article format"""
        parsed = []
        
        for article in articles:
            try:
                # Calculate time ago
                pub_date = article.get('pubDate', '')
                hours_ago = self._calculate_hours_ago(pub_date)
                
                parsed.append({
                    'title': article.get('title', 'No title'),
                    'source': article.get('source_id', 'NewsData'),
                    'hours_ago': hours_ago,
                    'url': article.get('link', ''),
                    'description': article.get('description', '')[:200]
                })
            except:
                continue
        
        return parsed
    
    def _parse_gnews_articles(self, articles: List) -> List[Dict]:
        """Parse GNews article format"""
        parsed = []
        
        for article in articles:
            try:
                pub_date = article.get('publishedAt', '')
                hours_ago = self._calculate_hours_ago(pub_date)
                
                parsed.append({
                    'title': article.get('title', 'No title'),
                    'source': article.get('source', {}).get('name', 'GNews'),
                    'hours_ago': hours_ago,
                    'url': article.get('url', ''),
                    'description': article.get('description', '')[:200]
                })
            except:
                continue
        
        return parsed
    
    def _parse_worldnews_articles(self, articles: List) -> List[Dict]:
        """Parse World News API article format"""
        parsed = []
        
        for article in articles:
            try:
                pub_date = article.get('publish_date', '')
                hours_ago = self._calculate_hours_ago(pub_date)
                
                parsed.append({
                    'title': article.get('title', 'No title'),
                    'source': article.get('source_country', 'WorldNews'),
                    'hours_ago': hours_ago,
                    'url': article.get('url', ''),
                    'description': article.get('text', '')[:200]
                })
            except:
                continue
        
        return parsed
    
    def _calculate_hours_ago(self, date_string: str) -> int:
        """Calculate hours ago from date string"""
        try:
            # Try various date formats
            for fmt in ['%Y-%m-%d %H:%M:%S', '%Y-%m-%dT%H:%M:%SZ', '%Y-%m-%d']:
                try:
                    pub_date = datetime.strptime(date_string, fmt)
                    delta = datetime.now() - pub_date
                    return int(delta.total_seconds() / 3600)
                except:
                    continue
            
            # Default to random recent time
            return int(2 + (hash(date_string) % 20))
        except:
            return 2
    
    def _get_from_cache(self, symbol: str) -> Optional[List[Dict]]:
        """Get news from cache if not expired"""
        if symbol in self._cache:
            headlines, timestamp = self._cache[symbol]
            
            # Check if cache is still valid (5 minutes)
            if time.time() - timestamp < self._cache_duration:
                return headlines
        
        return None
    
    def _save_to_cache(self, symbol: str, headlines: List[Dict]):
        """Save news to cache"""
        self._cache[symbol] = (headlines, time.time())
    
    def _generate_mock_headlines(self, symbol: str) -> List[Dict]:
        """Fallback mock headlines if all APIs fail"""
        mock_headlines = [
            f"{symbol} trading volume increases amid market volatility",
            f"Analysts predict {symbol} consolidation in coming weeks",
            f"{symbol} network upgrade scheduled for next month",
            "Cryptocurrency market shows mixed signals today",
            f"{symbol} maintains position despite regulatory concerns"
        ]
        
        return [
            {
                'title': title,
                'source': 'Mock Data',
                'hours_ago': i + 1,
                'url': '',
                'description': title
            }
            for i, title in enumerate(mock_headlines)
        ]


# Singleton instance
news_fetcher = NewsAPIFetcher()
