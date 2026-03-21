from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, date, timedelta
from uuid import UUID
import requests
import os

from database import get_db
from models.crypto import CryptoHolding, CryptoTransaction, CryptoWallet
from models.user import User
from routes.auth import get_current_user
from services import coingecko_service

router = APIRouter(prefix="/api/crypto", tags=["Crypto"])

# --- Pydantic Schemas ---

class CryptoHoldingBase(BaseModel):
    symbol: str
    name: str
    network: str = "Bitcoin"
    quantity: float
    purchase_price_avg: float = 0.0
    current_price: float = 0.0
    purchase_date: Optional[date] = None
    wallet_id: Optional[UUID] = None

class CryptoHoldingCreate(CryptoHoldingBase):
    pass

class CryptoHoldingUpdate(BaseModel):
    symbol: Optional[str] = None
    name: Optional[str] = None
    network: Optional[str] = None
    quantity: Optional[float] = None
    purchase_price_avg: Optional[float] = None
    current_price: Optional[float] = None
    purchase_date: Optional[date] = None
    wallet_id: Optional[UUID] = None

class CryptoHoldingResponse(CryptoHoldingBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class SellCryptoRequest(BaseModel):
    quantity: float
    sell_price: float

class CryptoTransactionBase(BaseModel):
    type: str  # Incoming, Outgoing, Swap, Fee
    asset_symbol: str
    amount: float
    amount_currency_value: float = 0.0
    wallet_name: Optional[str] = None
    tx_hash: Optional[str] = None
    network: str = "Ethereum"
    status: str = "Completed"

class CryptoTransactionResponse(CryptoTransactionBase):
    id: UUID
    user_id: UUID
    timestamp: datetime

    class Config:
        from_attributes = True

class CryptoWalletBase(BaseModel):
    name: str
    network: str = "Multi-Chain"
    address: Optional[str] = None
    total_value: float = 0.0
    asset_count: int = 0
    last_active: Optional[str] = None
    is_connected: bool = False

class CryptoWalletResponse(CryptoWalletBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class CryptoMetrics(BaseModel):
    total_value: float
    change_24h_value: float
    change_24h_percent: float
    total_assets_count: int
    avg_portfolio_return: float

# --- Holdings Routes ---

@router.get("/holdings", response_model=List[CryptoHoldingResponse])
def get_holdings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all crypto holdings for the current user"""
    holdings = db.query(CryptoHolding).filter(CryptoHolding.user_id == current_user.id).all()
    return holdings

@router.post("/holdings/refresh", response_model=List[CryptoHoldingResponse])
def refresh_holdings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Fetch live prices for all holdings using CoinMarketCap and update them"""
    holdings = db.query(CryptoHolding).filter(CryptoHolding.user_id == current_user.id).all()
    if not holdings:
        return []
    
    # Extract unique symbols
    symbols = list(set([h.symbol.upper() for h in holdings]))
    symbol_str = ",".join(symbols)
    
    api_key = os.environ.get("COINMARKETCAP_API_KEY", "")
    if not api_key:
        print("Warning: COINMARKETCAP_API_KEY not found in environment.")
        return holdings
        
    url = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest"
    headers = {
        'Accepts': 'application/json',
        'X-CMC_PRO_API_KEY': api_key
    }
    params = {
        'symbol': symbol_str,
        'convert': 'INR'
    }
    
    try:
        response = requests.get(url, headers=headers, params=params, timeout=10)
        if response.status_code == 200:
            data = response.json()
            # cmc returns data['data'][SYMBOL]['quote']['INR']['price']
            quotes = data.get("data", {})
            
            for holding in holdings:
                symbol = holding.symbol.upper()
                if symbol in quotes:
                    price = quotes[symbol].get("quote", {}).get("INR", {}).get("price")
                    if price and price > 0:
                        holding.current_price = float(price)
            
            db.commit()
            for h in holdings:
                db.refresh(h)
        else:
            print(f"Failed to fetch prices from CMC: Status {response.status_code}")
    except Exception as e:
        print(f"Error fetching live crypto prices: {e}")
        
    return holdings

@router.post("/holdings", response_model=CryptoHoldingResponse, status_code=status.HTTP_201_CREATED)
def create_holding(
    holding_data: CryptoHoldingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add a new crypto holding"""
    new_holding = CryptoHolding(
        **holding_data.dict(),
        user_id=current_user.id
    )
    
    db.add(new_holding)
    db.commit()
    db.refresh(new_holding)
    return new_holding

@router.put("/holdings/{holding_id}", response_model=CryptoHoldingResponse)
def update_holding(
    holding_id: UUID,
    holding_update: CryptoHoldingUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a crypto holding"""
    holding = db.query(CryptoHolding).filter(
        CryptoHolding.id == holding_id,
        CryptoHolding.user_id == current_user.id
    ).first()
    
    if not holding:
        raise HTTPException(status_code=404, detail="Holding not found")
    
    update_data = holding_update.dict(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(holding, key, value)
    
    db.commit()
    db.refresh(holding)
    return holding

@router.delete("/holdings/{holding_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_holding(
    holding_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove a crypto holding"""
    holding = db.query(CryptoHolding).filter(
        CryptoHolding.id == holding_id,
        CryptoHolding.user_id == current_user.id
    ).first()
    
    if not holding:
        raise HTTPException(status_code=404, detail="Holding not found")
    
    db.delete(holding)
    db.commit()
    return None

@router.post("/holdings/{holding_id}/sell", response_model=CryptoHoldingResponse)
def sell_holding(
    holding_id: UUID,
    sell_data: SellCryptoRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Sell a portion of a crypto holding"""
    holding = db.query(CryptoHolding).filter(
        CryptoHolding.id == holding_id,
        CryptoHolding.user_id == current_user.id
    ).first()
    
    if not holding:
        raise HTTPException(status_code=404, detail="Holding not found")
    
    if sell_data.quantity > holding.quantity:
        raise HTTPException(status_code=400, detail="Cannot sell more than owned")
    
    new_quantity = holding.quantity - sell_data.quantity
    
    if new_quantity <= 0:
        # Remove holding entirely
        db.delete(holding)
        db.commit()
        # Return the holding with 0 quantity (it's deleted but we return the last state)
        holding.quantity = 0
        return holding
    else:
        # Update quantity
        holding.quantity = new_quantity
        holding.current_price = sell_data.sell_price
        db.commit()
        db.refresh(holding)
        return holding

# --- Transactions Routes ---

@router.get("/transactions", response_model=List[CryptoTransactionResponse])
def get_transactions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all crypto transactions for the current user"""
    transactions = db.query(CryptoTransaction).filter(
        CryptoTransaction.user_id == current_user.id
    ).order_by(CryptoTransaction.timestamp.desc()).all()
    return transactions

# --- Wallets Routes ---

@router.get("/wallets", response_model=List[CryptoWalletResponse])
def get_wallets(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all connected wallets for the current user"""
    wallets = db.query(CryptoWallet).filter(CryptoWallet.user_id == current_user.id).all()
    return wallets

class CryptoWalletCreate(BaseModel):
    name: str
    network: str = "Multi-Chain"
    address: Optional[str] = None

@router.post("/wallets", response_model=CryptoWalletResponse, status_code=status.HTTP_201_CREATED)
def create_wallet(
    wallet_data: CryptoWalletCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new crypto wallet"""
    new_wallet = CryptoWallet(
        **wallet_data.dict(),
        user_id=current_user.id,
        total_value=0.0,
        asset_count=0,
        is_connected=True
    )
    
    db.add(new_wallet)
    db.commit()
    db.refresh(new_wallet)
    return new_wallet

@router.delete("/wallets/{wallet_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_wallet(
    wallet_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a crypto wallet"""
    wallet = db.query(CryptoWallet).filter(
        CryptoWallet.id == wallet_id,
        CryptoWallet.user_id == current_user.id
    ).first()
    
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
    
    db.delete(wallet)
    db.commit()
    return None

# --- Portfolio History Route ---

class PortfolioDataPoint(BaseModel):
    date: str
    value: float

@router.get("/portfolio-history", response_model=List[PortfolioDataPoint])
async def get_portfolio_history(
    period: str = "1mo",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Real portfolio value history using live CoinGecko price data.
    Falls back to linear interpolation if CoinGecko is unavailable.
    """
    import aiohttp, ssl, certifi
    holdings = db.query(CryptoHolding).filter(CryptoHolding.user_id == current_user.id).all()

    if not holdings:
        return []

    today = date.today()
    now_time = datetime.now()
    timeline_values: dict = {}

    period_to_days = {
        "1d": 1, "1D": 1,
        "1w": 7,  "1W": 7,
        "1mo": 30, "1m": 30,
        "3mo": 90, "3m": 90,
        "6mo": 180, "6m": 180,
        "1y": 365, "1Y": 365,
        "all": 365,
    }
    days = period_to_days.get(period, 30)
    is_intraday = period in ["1d", "1D"]

    for holding in holdings:
        symbol = holding.symbol.upper()
        qty = holding.quantity or 0.0
        if qty <= 0:
            continue

        coin_id = coingecko_service.get_coin_id(symbol)
        if not coin_id:
            _add_flat_fallback(timeline_values, holding, today, now_time, is_intraday)
            continue

        try:
            ssl_ctx = ssl.create_default_context(cafile=certifi.where())
            url = f"{coingecko_service.COINGECKO_BASE_URL}/coins/{coin_id}/market_chart"
            params = {
                "vs_currency": "inr",
                "days": str(days),
                "interval": "hourly" if is_intraday else "daily",
            }
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params,
                                       timeout=aiohttp.ClientTimeout(total=15),
                                       ssl=ssl_ctx) as resp:
                    resp.raise_for_status()
                    data = await resp.json()

            for ts_ms, price_inr in data.get("prices", []):
                pt = datetime.fromtimestamp(ts_ms / 1000)
                if is_intraday:
                    if pt.date() != today:
                        continue
                    key = pt.strftime('%Y-%m-%d %H:%M')
                else:
                    key = pt.strftime('%Y-%m-%d')
                timeline_values[key] = timeline_values.get(key, 0.0) + round(qty * price_inr, 2)

        except Exception as e:
            print(f"[CoinGecko] History failed for {symbol}: {e}. Fallback.")
            _add_flat_fallback(timeline_values, holding, today, now_time, is_intraday)

    return [
        PortfolioDataPoint(date=k, value=round(v, 2))
        for k, v in sorted(timeline_values.items())
    ]


def _add_flat_fallback(timeline_values, holding, today, now_time, is_intraday):
    """Linear interpolation fallback when CoinGecko is unavailable."""
    buy_price = holding.purchase_price_avg or 0.0
    cur_price = holding.current_price or buy_price
    qty = holding.quantity or 0.0
    start_date = (holding.purchase_date
                  or (holding.created_at.date() if holding.created_at else today))
    if start_date > today:
        start_date = today
    start_val = qty * buy_price
    end_val = qty * cur_price

    if is_intraday:
        for hour in range(now_time.hour + 1):
            key = now_time.replace(hour=hour, minute=0, second=0,
                                   microsecond=0).strftime('%Y-%m-%d %H:%M')
            timeline_values[key] = timeline_values.get(key, 0.0) + end_val
    else:
        num_days = max((today - start_date).days, 0)
        for d in range(num_days + 1):
            day = start_date + timedelta(days=d)
            t = d / num_days if num_days > 0 else 1.0
            val = start_val + t * (end_val - start_val)
            timeline_values[day.isoformat()] = timeline_values.get(day.isoformat(), 0.0) + val



# --- Metrics Route ---

class CryptoMetrics(BaseModel):
    total_value: float
    change_24h_value: float
    change_24h_percent: float
    total_assets_count: int
    avg_portfolio_return: float

@router.get("/metrics", response_model=CryptoMetrics)
async def get_metrics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Aggregated crypto portfolio metrics with real-time 24h change from CoinGecko."""
    holdings = db.query(CryptoHolding).filter(CryptoHolding.user_id == current_user.id).all()

    total_value = sum(h.quantity * h.current_price for h in holdings)
    total_invested = sum(h.quantity * h.purchase_price_avg for h in holdings)
    avg_portfolio_return = ((total_value - total_invested) / total_invested * 100
                            if total_invested > 0 else 0.0)

    change_24h_percent = 0.0
    change_24h_value = 0.0

    if holdings:
        try:
            symbols = list(set(h.symbol.upper() for h in holdings))
            live_prices = await coingecko_service.fetch_current_prices(symbols, vs_currency="inr")
            if live_prices:
                weighted_change = 0.0
                weights_sum = 0.0
                for h in holdings:
                    sym = h.symbol.upper()
                    coin_val = h.quantity * h.current_price
                    if coin_val > 0 and sym in live_prices:
                        coin_24h = live_prices[sym].get("change_24h", 0.0) or 0.0
                        weighted_change += coin_24h * coin_val
                        weights_sum += coin_val
                if weights_sum > 0:
                    change_24h_percent = round(weighted_change / weights_sum, 2)
                    change_24h_value = round(total_value * change_24h_percent / 100, 2)
        except Exception as e:
            print(f"[CoinGecko] Metrics 24h fetch failed: {e}")

    return {
        "total_value": round(total_value, 2),
        "change_24h_value": change_24h_value,
        "change_24h_percent": change_24h_percent,
        "total_assets_count": len(holdings),
        "avg_portfolio_return": round(avg_portfolio_return, 2),
    }
