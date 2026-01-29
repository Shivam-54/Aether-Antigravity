"""
Stock Market Data Service
Uses yfinance to fetch real-time prices and historical data for stocks
"""
import yfinance as yf
from typing import Optional, Dict, List
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


def get_stock_symbol(symbol: str) -> str:
    """
    Intelligently detect and normalize stock symbols for multiple exchanges.
    Tries: US stocks (no suffix) → NSE (.NS) → BSE (.BO)
    
    Examples:
        BA → BA (Boeing - US)
        AAPL → AAPL (Apple - US)
        HDFCBANK → HDFCBANK.NS (HDFC Bank - NSE)
        SUZLON → SUZLON.NS (Suzlon - NSE)
    """
    symbol = symbol.upper().strip()
    
    # Already has exchange suffix - return as is
    if any(symbol.endswith(suffix) for suffix in ['.NS', '.BO', '.BSE', '.NYSE', '.NASDAQ']):
        return symbol
    
    # Try multiple variations to find working symbol
    attempts = [
        symbol,           # Try without suffix first (works for US stocks)
        f"{symbol}.NS",   # NSE (National Stock Exchange of India)
        f"{symbol}.BO"    # BSE (Bombay Stock Exchange)
    ]
    
    # Quick validation - try to get info for each variation
    for attempt in attempts:
        try:
            ticker = yf.Ticker(attempt)
            info = ticker.info
            
            # Check if we got valid data
            if info and (info.get('symbol') or info.get('regularMarketPrice') or info.get('currentPrice')):
                logger.info(f"Found valid symbol: {symbol} → {attempt}")
                return attempt
        except Exception as e:
            logger.debug(f"Attempt {attempt} failed: {str(e)}")
            continue
    
    # If no variation worked, default to NSE for Indian-sounding symbols
    # This helps with initial search even if price fetch fails
    logger.warning(f"No valid data found for {symbol}, defaulting to {symbol}.NS")
    return f"{symbol}.NS"


# Backward compatibility alias
normalize_indian_stock_symbol = get_stock_symbol


def get_current_price(symbol: str) -> Optional[Dict]:
    """
    Fetch the current price for a stock symbol.
    
    Args:
        symbol: Stock symbol (e.g., 'SUZLON', 'HDFCBANK', 'SUZLON.NS')
    
    Returns:
        Dict with price info or None if failed
        {
            'symbol': str,
            'price': float,
            'currency': str,
            'change_percent': float,
            'last_updated': datetime
        }
    """
    try:
        normalized_symbol = get_stock_symbol(symbol)
        ticker = yf.Ticker(normalized_symbol)
        
        # Try fast_info first (faster and more reliable)
        current_price = None
        try:
            fast_info = ticker.fast_info
            current_price = fast_info.get('lastPrice') or fast_info.get('last_price')
        except Exception as e:
            logger.debug(f"fast_info not available for {normalized_symbol}: {str(e)}")
        
        # Fallback to regular info
        if not current_price:
            info = ticker.info
            current_price = (
                info.get('currentPrice') or 
                info.get('regularMarketPrice') or 
                info.get('previousClose')
            )
        
        if not current_price:
            logger.warning(f"No price found for {normalized_symbol}")
            return None
        
        # Get additional info
        try:
            info = ticker.info
            change_percent = info.get('regularMarketChangePercent', 0.0)
            currency = info.get('currency', 'INR')
        except:
            change_percent = 0.0
            currency = 'INR' if normalized_symbol.endswith('.NS') or normalized_symbol.endswith('.BO') else 'USD'
        
        return {
            'symbol': normalized_symbol,
            'price': float(current_price),
            'currency': currency,
            'change_percent': float(change_percent),
            'last_updated': datetime.now()
        }
    
    except Exception as e:
        logger.error(f"Error fetching price for {symbol}: {str(e)}")
        return None


def get_historical_data(symbol: str, period: str = "1mo") -> Optional[List[Dict]]:
    """
    Fetch historical price data for charting.
    
    Args:
        symbol: Stock symbol
        period: Time period ('1d', '5d', '1mo', '3mo', '6mo', '1y', '2y', '5y', '10y', 'ytd', 'max')
    
    Returns:
        List of price points: [{'date': str, 'price': float}, ...]
    """
    try:
        normalized_symbol = get_stock_symbol(symbol)
        ticker = yf.Ticker(normalized_symbol)
        
        # Download historical data
        hist = ticker.history(period=period)
        
        if hist.empty:
            logger.warning(f"No historical data for {normalized_symbol}")
            return None
        
        # Convert to list of dicts
        data_points = []
        for index, row in hist.iterrows():
            data_points.append({
                'date': index.strftime('%Y-%m-%d'),
                'price': float(row['Close']),
                'volume': int(row['Volume']) if 'Volume' in row else 0
            })
        
        return data_points
    
    except Exception as e:
        logger.error(f"Error fetching historical data for {symbol}: {str(e)}")
        return None


def bulk_refresh_prices(symbols: List[str]) -> Dict[str, Optional[float]]:
    """
    Fetch current prices for multiple symbols at once.
    More efficient than calling get_current_price individually.
    
    Args:
        symbols: List of stock symbols
    
    Returns:
        Dict mapping symbol to price: {'SUZLON.NS': 45.50, 'HDFCBANK.NS': 1650.00}
    """
    result = {}
    
    # Normalize all symbols
    normalized_symbols = [get_stock_symbol(s) for s in symbols]
    
    try:
        # Download data for all symbols at once
        tickers = yf.Tickers(' '.join(normalized_symbols))
        
        for symbol in normalized_symbols:
            try:
                ticker = tickers.tickers[symbol]
                info = ticker.info
                
                current_price = (
                    info.get('currentPrice') or 
                    info.get('regularMarketPrice') or 
                    info.get('previousClose')
                )
                
                result[symbol] = float(current_price) if current_price else None
            
            except Exception as e:
                logger.warning(f"Failed to get price for {symbol}: {str(e)}")
                result[symbol] = None
        
        return result
    
    except Exception as e:
        logger.error(f"Bulk price refresh failed: {str(e)}")
        # Fallback to individual requests
        for symbol in symbols:
            price_data = get_current_price(symbol)
            result[get_stock_symbol(symbol)] = (
                price_data['price'] if price_data else None
            )
        
        return result
