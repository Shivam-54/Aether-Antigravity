"""
CoinGecko API Service
Fetches historical cryptocurrency price data for ML predictions
"""

import httpx
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import logging

logger = logging.getLogger(__name__)

# CoinGecko API base URL (free tier)
COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3"

# Common symbol to CoinGecko ID mapping
SYMBOL_TO_ID = {
    "BTC": "bitcoin",
    "ETH": "ethereum",
    "USDT": "tether",
    "BNB": "binancecoin",
    "XRP": "ripple",
    "ADA": "cardano",
    "DOGE": "dogecoin",
    "SOL": "solana",
    "DOT": "polkadot",
    "MATIC": "matic-network",
    "SHIB": "shiba-inu",
    "LTC": "litecoin",
    "AVAX": "avalanche-2",
    "LINK": "chainlink",
    "UNI": "uniswap",
    "ATOM": "cosmos",
    "XLM": "stellar",
    "ALGO": "algorand",
    "VET": "vechain",
    "FIL": "filecoin",
}


def get_coin_id(symbol: str) -> Optional[str]:
    """
    Convert a crypto symbol to CoinGecko coin ID
    
    Args:
        symbol: Crypto symbol (e.g., "BTC", "ETH")
    
    Returns:
        CoinGecko coin ID or None if not found
    """
    symbol_upper = symbol.upper().strip()
    return SYMBOL_TO_ID.get(symbol_upper)


async def fetch_historical_prices(
    symbol: str,
    days: int = 365,
    vs_currency: str = "usd"
) -> Optional[pd.DataFrame]:
    """
    Fetch historical OHLC price data from CoinGecko
    
    Args:
        symbol: Crypto symbol (e.g., "BTC")
        days: Number of days of history (max 365 for free tier)
        vs_currency: Quote currency (default: USD)
    
    Returns:
        DataFrame with columns: date, price, volume, market_cap
        Returns None if fetch fails
    """
    coin_id = get_coin_id(symbol)
    if not coin_id:
        logger.warning(f"Unknown symbol: {symbol}")
        return None
    
    url = f"{COINGECKO_BASE_URL}/coins/{coin_id}/market_chart"
    params = {
        "vs_currency": vs_currency,
        "days": str(min(days, 365)),  # Cap at 365 for free tier
        "interval": "daily"
    }
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            data = response.json()
        
        # Parse prices
        prices = data.get("prices", [])
        volumes = data.get("total_volumes", [])
        market_caps = data.get("market_caps", [])
        
        if not prices:
            logger.warning(f"No price data for {symbol}")
            return None
        
        # Build DataFrame
        df = pd.DataFrame(prices, columns=["timestamp", "price"])
        df["date"] = pd.to_datetime(df["timestamp"], unit="ms")
        df["volume"] = [v[1] for v in volumes] if len(volumes) == len(prices) else 0
        df["market_cap"] = [m[1] for m in market_caps] if len(market_caps) == len(prices) else 0
        
        # Clean up
        df = df[["date", "price", "volume", "market_cap"]]
        df = df.sort_values("date").reset_index(drop=True)
        
        logger.info(f"Fetched {len(df)} days of data for {symbol}")
        return df
    
    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP error fetching {symbol}: {e.response.status_code}")
        return None
    except Exception as e:
        logger.error(f"Error fetching {symbol}: {str(e)}")
        return None


async def fetch_current_prices(symbols: List[str], vs_currency: str = "usd") -> Dict[str, float]:
    """
    Fetch current prices for multiple cryptocurrencies
    
    Args:
        symbols: List of crypto symbols
        vs_currency: Quote currency
    
    Returns:
        Dict mapping symbol to current price
    """
    # Convert symbols to coin IDs
    coin_ids = []
    symbol_map = {}
    for symbol in symbols:
        coin_id = get_coin_id(symbol)
        if coin_id:
            coin_ids.append(coin_id)
            symbol_map[coin_id] = symbol.upper()
    
    if not coin_ids:
        return {}
    
    url = f"{COINGECKO_BASE_URL}/simple/price"
    params = {
        "ids": ",".join(coin_ids),
        "vs_currencies": vs_currency,
        "include_24hr_change": "true"
    }
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            data = response.json()
        
        result = {}
        for coin_id, price_data in data.items():
            symbol = symbol_map.get(coin_id)
            if symbol and vs_currency in price_data:
                result[symbol] = {
                    "price": price_data[vs_currency],
                    "change_24h": price_data.get(f"{vs_currency}_24h_change", 0)
                }
        
        return result
    
    except Exception as e:
        logger.error(f"Error fetching current prices: {str(e)}")
        return {}


def calculate_technical_indicators(df: pd.DataFrame) -> pd.DataFrame:
    """
    Calculate technical indicators for ML feature engineering
    
    Args:
        df: DataFrame with 'date' and 'price' columns
    
    Returns:
        DataFrame with additional indicator columns
    """
    df = df.copy()
    
    # Moving Averages
    df["ma_7"] = df["price"].rolling(window=7, min_periods=1).mean()
    df["ma_30"] = df["price"].rolling(window=30, min_periods=1).mean()
    df["ma_90"] = df["price"].rolling(window=90, min_periods=1).mean()
    
    # Price momentum (% change)
    df["momentum_7d"] = df["price"].pct_change(periods=7) * 100
    df["momentum_30d"] = df["price"].pct_change(periods=30) * 100
    
    # Volatility (rolling std)
    df["volatility_7d"] = df["price"].rolling(window=7, min_periods=1).std()
    df["volatility_30d"] = df["price"].rolling(window=30, min_periods=1).std()
    
    # RSI (14-day)
    delta = df["price"].diff()
    gain = delta.where(delta > 0, 0).rolling(window=14, min_periods=1).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=14, min_periods=1).mean()
    rs = gain / loss.replace(0, 1e-10)
    df["rsi_14"] = 100 - (100 / (1 + rs))
    
    # Price relative to moving averages
    df["price_vs_ma_30"] = (df["price"] / df["ma_30"] - 1) * 100
    df["price_vs_ma_90"] = (df["price"] / df["ma_90"] - 1) * 100
    
    # Fill NaN values
    df = df.fillna(method="bfill").fillna(0)
    
    return df
