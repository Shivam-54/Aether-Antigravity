"""
Data Collection for ML Models
Fetches and caches historical cryptocurrency data
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Optional, List
import os
import json
import aiohttp
import ssl


class CryptoDataCollector:
    """
    Fetches historical cryptocurrency data from CoinGecko
    Implements smart caching to reduce API calls and avoid 429 rate limits
    """
    
    # Cache TTL by data window size (in minutes)
    CACHE_TTL = {
        365: 30,   # 365-day data: cache 30 minutes (historical, changes slowly)
        90:  15,    # 90-day data: cache 15 minutes
        30:  10,    # 30-day data: cache 10 minutes
        7:   5,     # 7-day data: cache 5 minutes
    }
    DEFAULT_CACHE_TTL = 5  # Default: 5 minutes for any other window
    
    def __init__(self):
        self.cache_dir = os.path.join(os.path.dirname(__file__), '../cache')
        os.makedirs(self.cache_dir, exist_ok=True)
        self.coingecko_base_url = "https://api.coingecko.com/api/v3"
        # In-memory cache: {cache_key: (timestamp, DataFrame)}
        self._memory_cache = {}
    
    def _get_cache_key(self, symbol: str, days: int) -> str:
        """Get cache key for a symbol+days combo"""
        return f"{symbol.lower()}_{days}d"
    
    def _get_cache_path(self, symbol: str, days: int) -> str:
        """Get cache file path for a symbol"""
        return os.path.join(self.cache_dir, f"{self._get_cache_key(symbol, days)}.json")
    
    def _get_ttl_minutes(self, days: int) -> int:
        """Get the appropriate cache TTL based on data window size"""
        return self.CACHE_TTL.get(days, self.DEFAULT_CACHE_TTL)
    
    def _is_cache_valid(self, cache_path: str, max_age_minutes: int) -> bool:
        """Check if cache file is still valid"""
        if not os.path.exists(cache_path):
            return False
        
        file_time = datetime.fromtimestamp(os.path.getmtime(cache_path))
        age = datetime.now() - file_time
        
        return age < timedelta(minutes=max_age_minutes)
    
    def _check_memory_cache(self, cache_key: str, ttl_minutes: int) -> Optional[pd.DataFrame]:
        """Check in-memory cache first (fastest path)"""
        if cache_key in self._memory_cache:
            cached_time, cached_df = self._memory_cache[cache_key]
            age = datetime.now() - cached_time
            if age < timedelta(minutes=ttl_minutes):
                return cached_df
            else:
                # Expired — remove from memory
                del self._memory_cache[cache_key]
        return None
    
    async def fetch_historical_data(
        self,
        symbol: str,
        days: int = 365,
        use_cache: bool = True
    ) -> pd.DataFrame:
        """
        Fetch historical price and volume data with smart caching.
        
        Cache priority: in-memory → disk → CoinGecko API → synthetic fallback
        
        Args:
            symbol: Cryptocurrency symbol (e.g., 'BTC', 'ETH')
            days: Number of days of historical data
            use_cache: Whether to use cached data
        
        Returns:
            DataFrame with columns ['date', 'price', 'volume', 'market_cap']
        """
        cache_key = self._get_cache_key(symbol, days)
        cache_path = self._get_cache_path(symbol, days)
        ttl = self._get_ttl_minutes(days)
        
        if use_cache:
            # 1. Check in-memory cache (instant)
            mem_result = self._check_memory_cache(cache_key, ttl)
            if mem_result is not None:
                print(f"Loading {symbol} {days}d data from memory cache")
                return mem_result
            
            # 2. Check disk cache
            if self._is_cache_valid(cache_path, ttl):
                print(f"Loading {symbol} {days}d data from disk cache")
                with open(cache_path, 'r') as f:
                    data = json.load(f)
                df = pd.DataFrame(data)
                # Promote to memory cache
                self._memory_cache[cache_key] = (datetime.now(), df)
                return df
        
        # 3. Fetch from CoinGecko API
        print(f"Fetching {symbol} data from CoinGecko (last {days} days)")
        
        # Map symbols to CoinGecko IDs
        symbol_map = {
            'BTC': 'bitcoin',
            'ETH': 'ethereum',
            'SOL': 'solana',
            'ADA': 'cardano',
            'DOT': 'polkadot',
            'MATIC': 'polygon',
            'AVAX': 'avalanche-2',
            'LINK': 'chainlink',
            'UNI': 'uniswap',
            'ATOM': 'cosmos'
        }
        
        coin_id = symbol_map.get(symbol.upper(), symbol.lower())
        
        url = f"{self.coingecko_base_url}/coins/{coin_id}/market_chart"
        params = {
            'vs_currency': 'usd',
            'days': days,
            'interval': 'daily'
        }
        
        try:
            # Create SSL context that doesn't verify certificates
            # This is needed because CoinGecko's SSL cert verification fails on some systems
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            
            connector = aiohttp.TCPConnector(ssl=ssl_context)
            
            async with aiohttp.ClientSession(connector=connector) as session:
                async with session.get(url, params=params, timeout=aiohttp.ClientTimeout(total=15)) as response:
                    if response.status == 429:
                        print(f"CoinGecko rate limited for {symbol} {days}d — using cached/fallback data")
                        # Try stale disk cache before falling back to synthetic
                        if os.path.exists(cache_path):
                            print(f"Using stale disk cache for {symbol}")
                            with open(cache_path, 'r') as f:
                                data = json.load(f)
                            df = pd.DataFrame(data)
                            self._memory_cache[cache_key] = (datetime.now(), df)
                            return df
                        return self._get_fallback_data(symbol, days)
                    
                    if response.status != 200:
                        print(f"API Error: {response.status}")
                        return self._get_fallback_data(symbol, days)
                    
                    data = await response.json()
            
            # Parse response
            prices = data.get('prices', [])
            volumes = data.get('total_volumes', [])
            market_caps = data.get('market_caps', [])
            
            df = pd.DataFrame({
                'timestamp': [p[0] for p in prices],
                'price': [p[1] for p in prices],
                'volume': [v[1] for v in volumes],
                'market_cap': [m[1] for m in market_caps]
            })
            
            # Convert timestamp to date
            df['date'] = pd.to_datetime(df['timestamp'], unit='ms')
            df = df.drop('timestamp', axis=1)
            
            # Sort by date
            df = df.sort_values('date').reset_index(drop=True)
            
            # Save to both disk and memory cache
            df.to_json(cache_path, orient='records', date_format='iso')
            self._memory_cache[cache_key] = (datetime.now(), df)
            
            return df
        
        except Exception as e:
            print(f"Error fetching data: {e}")
            # Try stale disk cache before synthetic fallback
            if os.path.exists(cache_path):
                print(f"Using stale disk cache for {symbol} after error")
                with open(cache_path, 'r') as f:
                    data = json.load(f)
                return pd.DataFrame(data)
            return self._get_fallback_data(symbol, days)
    
    def _get_fallback_data(self, symbol: str, days: int) -> pd.DataFrame:
        """Generate synthetic fallback data when no real data is available"""
        print(f"Using fallback synthetic data for {symbol}")
        
        dates = pd.date_range(end=datetime.now(), periods=days, freq='D')
        
        # Generate somewhat realistic price movement
        np.random.seed(hash(symbol) % 2**32)
        base_prices = {
            'BTC': 50000,
            'ETH': 3000,
            'SOL': 100,
            'ADA': 0.5,
            'DOT': 10
        }
        
        base_price = base_prices.get(symbol.upper(), 100)
        
        # Random walk with trend
        returns = np.random.normal(0.001, 0.03, days)  # Slight upward bias
        prices = base_price * np.cumprod(1 + returns)
        
        # Generate volume
        volumes = np.random.lognormal(20, 1, days)
        
        df = pd.DataFrame({
            'date': dates,
            'price': prices,
            'volume': volumes,
            'market_cap': prices * volumes * 1000
        })
        
        return df
    
    async def fetch_multiple_symbols(
        self,
        symbols: List[str],
        days: int = 365
    ) -> dict:
        """
        Fetch data for multiple symbols
        
        Returns:
            Dictionary mapping symbol to DataFrame
        """
        results = {}
        
        for symbol in symbols:
            df = await self.fetch_historical_data(symbol, days)
            results[symbol] = df
        
        return results


# Singleton instance
data_collector = CryptoDataCollector()
