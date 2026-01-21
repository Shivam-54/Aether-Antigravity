from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from uuid import UUID

from database import get_db
from models.shares import Share, ShareStatus, HoldingDuration
from models.user import User
from routes.auth import get_current_user

router = APIRouter(prefix="/api/shares", tags=["Shares"])

# --- Pydantic Schemas ---

class ShareBase(BaseModel):
    symbol: str
    company_name: str
    sector: str
    quantity: float
    avg_buy_price: float
    current_price: float


class ShareCreate(ShareBase):
    pass


class ShareUpdate(BaseModel):
    symbol: Optional[str] = None
    company_name: Optional[str] = None
    sector: Optional[str] = None
    quantity: Optional[float] = None
    avg_buy_price: Optional[float] = None
    current_price: Optional[float] = None


class ShareResponse(ShareBase):
    id: UUID
    user_id: UUID
    acquisition_date: datetime
    holding_duration: HoldingDuration
    status: ShareStatus
    sale_date: Optional[datetime] = None
    sale_price: Optional[float] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    # Calculated fields
    total_value: float
    total_invested: float
    gain_loss: float
    gain_loss_percent: float
    sale_total_value: Optional[float] = None
    profit_loss: Optional[float] = None

    class Config:
        from_attributes = True


class SellShareRequest(BaseModel):
    sale_price: float
    sale_date: Optional[str] = None  # ISO format date string


class ShareMetrics(BaseModel):
    total_value: float
    total_invested: float
    total_gain_loss: float
    total_gain_loss_percent: float
    active_shares_count: int
    sold_shares_count: int


class StockSearchResult(BaseModel):
    symbol: str
    name: str
    exchange: str
    type: str


# --- Holdings Routes ---

@router.get("/holdings", response_model=List[ShareResponse])
async def get_holdings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all share holdings for the current user (active and sold)"""
    holdings = db.query(Share).filter(Share.user_id == current_user.id).all()
    
    # Add calculated properties to response
    result = []
    for share in holdings:
        share_dict = {
            "id": share.id,
            "user_id": share.user_id,
            "symbol": share.symbol,
            "company_name": share.company_name,
            "sector": share.sector,
            "quantity": share.quantity,
            "avg_buy_price": share.avg_buy_price,
            "current_price": share.current_price,
            "acquisition_date": share.acquisition_date,
            "holding_duration": share.holding_duration,
            "status": share.status,
            "sale_date": share.sale_date,
            "sale_price": share.sale_price,
            "created_at": share.created_at,
            "updated_at": share.updated_at,
            "total_value": share.total_value,
            "total_invested": share.total_invested,
            "gain_loss": share.gain_loss,
            "gain_loss_percent": share.gain_loss_percent,
            "sale_total_value": share.sale_total_value,
            "profit_loss": share.profit_loss
        }
        result.append(share_dict)
    
    return result


@router.post("/holdings", response_model=ShareResponse, status_code=status.HTTP_201_CREATED)
async def create_holding(
    holding_data: ShareCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add a new share holding"""
    new_share = Share(
        **holding_data.dict(),
        user_id=current_user.id,
        status=ShareStatus.ACTIVE,
        holding_duration=HoldingDuration.SHORT
    )
    
    db.add(new_share)
    db.commit()
    db.refresh(new_share)
    
    # Return with calculated properties
    return {
        "id": new_share.id,
        "user_id": new_share.user_id,
        "symbol": new_share.symbol,
        "company_name": new_share.company_name,
        "sector": new_share.sector,
        "quantity": new_share.quantity,
        "avg_buy_price": new_share.avg_buy_price,
        "current_price": new_share.current_price,
        "acquisition_date": new_share.acquisition_date,
        "holding_duration": new_share.holding_duration,
        "status": new_share.status,
        "sale_date": new_share.sale_date,
        "sale_price": new_share.sale_price,
        "created_at": new_share.created_at,
        "updated_at": new_share.updated_at,
        "total_value": new_share.total_value,
        "total_invested": new_share.total_invested,
        "gain_loss": new_share.gain_loss,
        "gain_loss_percent": new_share.gain_loss_percent,
        "sale_total_value": new_share.sale_total_value,
        "profit_loss": new_share.profit_loss
    }


@router.put("/holdings/{holding_id}", response_model=ShareResponse)
async def update_holding(
    holding_id: UUID,
    holding_update: ShareUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a share holding"""
    share = db.query(Share).filter(
        Share.id == holding_id,
        Share.user_id == current_user.id
    ).first()
    
    if not share:
        raise HTTPException(status_code=404, detail="Share not found")
    
    update_data = holding_update.dict(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(share, key, value)
    
    db.commit()
    db.refresh(share)
    
    return {
        "id": share.id,
        "user_id": share.user_id,
        "symbol": share.symbol,
        "company_name": share.company_name,
        "sector": share.sector,
        "quantity": share.quantity,
        "avg_buy_price": share.avg_buy_price,
        "current_price": share.current_price,
        "acquisition_date": share.acquisition_date,
        "holding_duration": share.holding_duration,
        "status": share.status,
        "sale_date": share.sale_date,
        "sale_price": share.sale_price,
        "created_at": share.created_at,
        "updated_at": share.updated_at,
        "total_value": share.total_value,
        "total_invested": share.total_invested,
        "gain_loss": share.gain_loss,
        "gain_loss_percent": share.gain_loss_percent,
        "sale_total_value": share.sale_total_value,
        "profit_loss": share.profit_loss
    }


@router.delete("/holdings/{holding_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_holding(
    holding_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove a share holding"""
    share = db.query(Share).filter(
        Share.id == holding_id,
        Share.user_id == current_user.id
    ).first()
    
    if not share:
        raise HTTPException(status_code=404, detail="Share not found")
    
    db.delete(share)
    db.commit()
    return None


@router.post("/holdings/{holding_id}/sell", response_model=ShareResponse)
async def sell_holding(
    holding_id: UUID,
    sell_data: SellShareRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Sell a share holding"""
    share = db.query(Share).filter(
        Share.id == holding_id,
        Share.user_id == current_user.id
    ).first()
    
    if not share:
        raise HTTPException(status_code=404, detail="Share not found")
    
    if share.status == ShareStatus.SOLD:
        raise HTTPException(status_code=400, detail="Share already sold")
    
    # Update share with sale information
    share.status = ShareStatus.SOLD
    share.sale_price = sell_data.sale_price
    
    # Parse sale date if provided, otherwise use current time
    if sell_data.sale_date:
        share.sale_date = datetime.fromisoformat(sell_data.sale_date.replace('Z', '+00:00'))
    else:
        share.sale_date = datetime.utcnow()
    
    db.commit()
    db.refresh(share)
    
    return {
        "id": share.id,
        "user_id": share.user_id,
        "symbol": share.symbol,
        "company_name": share.company_name,
        "sector": share.sector,
        "quantity": share.quantity,
        "avg_buy_price": share.avg_buy_price,
        "current_price": share.current_price,
        "acquisition_date": share.acquisition_date,
        "holding_duration": share.holding_duration,
        "status": share.status,
        "sale_date": share.sale_date,
        "sale_price": share.sale_price,
        "created_at": share.created_at,
        "updated_at": share.updated_at,
        "total_value": share.total_value,
        "total_invested": share.total_invested,
        "gain_loss": share.gain_loss,
        "gain_loss_percent": share.gain_loss_percent,
        "sale_total_value": share.sale_total_value,
        "profit_loss": share.profit_loss
    }


# --- Metrics Route ---

@router.get("/metrics", response_model=ShareMetrics)
async def get_metrics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get aggregated share portfolio metrics"""
    active_shares = db.query(Share).filter(
        Share.user_id == current_user.id,
        Share.status == ShareStatus.ACTIVE
    ).all()
    
    all_shares = db.query(Share).filter(Share.user_id == current_user.id).all()
    sold_shares_count = len([s for s in all_shares if s.status == ShareStatus.SOLD])
    
    total_value = sum(s.total_value for s in active_shares)
    total_invested = sum(s.total_invested for s in active_shares)
    total_gain_loss = total_value - total_invested
    
    if total_invested > 0:
        total_gain_loss_percent = (total_gain_loss / total_invested) * 100
    else:
        total_gain_loss_percent = 0.0
    
    return {
        "total_value": round(total_value, 2),
        "total_invested": round(total_invested, 2),
        "total_gain_loss": round(total_gain_loss, 2),
        "total_gain_loss_percent": round(total_gain_loss_percent, 2),
        "active_shares_count": len(active_shares),
        "sold_shares_count": sold_shares_count
    }


# --- Stock Search & Price Routes ---

@router.get("/stock-search", response_model=List[StockSearchResult])
async def search_stocks(
    q: str,
    current_user: User = Depends(get_current_user)
):
    """Search for stocks by symbol or company name"""
    try:
        import yfinance as yf
        
        # Use yfinance search (this is a simplified version - may need enhancement)
        # For a production app, consider using a dedicated stock API like Twelve Data or Alpha Vantage
        
        # Create a ticker object to search
        # Note: yfinance doesn't have a built-in search, so we'll use a workaround
        # Try to get info for the query as a symbol
        results = []
        
        # Try as symbol
        try:
            ticker = yf.Ticker(q.upper())
            info = ticker.info
            if info and 'symbol' in info:
                results.append({
                    "symbol": info.get('symbol', q.upper()),
                    "name": info.get('longName', info.get('shortName', 'Unknown')),
                    "exchange": info.get('exchange', 'Unknown'),
                    "type": info.get('quoteType', 'EQUITY')
                })
        except:
            pass
        
        # For Indian stocks, try with .NS (NSE) and .BO (BSE) suffixes
        if q.upper() and not any(q.upper().endswith(suffix) for suffix in ['.NS', '.BO', '.BSE']):
            for suffix in ['.NS', '.BO']:
                try:
                    ticker = yf.Ticker(f"{q.upper()}{suffix}")
                    info = ticker.info
                    if info and 'symbol' in info:
                        results.append({
                            "symbol": info.get('symbol', f"{q.upper()}{suffix}"),
                            "name": info.get('longName', info.get('shortName', 'Unknown')),
                            "exchange": info.get('exchange', 'NSE' if suffix == '.NS' else 'BSE'),
                            "type": info.get('quoteType', 'EQUITY')
                        })
                except:
                    continue
        
        return results
    
    except ImportError:
        raise HTTPException(
            status_code=500,
            detail="yfinance not installed. Run: pip install yfinance"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Stock search failed: {str(e)}")


@router.get("/stock-price/{symbol}")
async def get_stock_price(
    symbol: str,
    current_user: User = Depends(get_current_user)
):
    """Get current price for a stock symbol"""
    try:
        import yfinance as yf
        
        ticker = yf.Ticker(symbol)
        info = ticker.info
        
        # Get current price
        current_price = info.get('currentPrice') or info.get('regularMarketPrice') or info.get('previousClose')
        
        if not current_price:
            raise HTTPException(status_code=404, detail="Price not available")
        
        return {
            "symbol": symbol,
            "price": current_price,
            "currency": info.get('currency', 'INR'),
            "exchange": info.get('exchange', 'Unknown'),
            "name": info.get('longName', info.get('shortName', 'Unknown'))
        }
    
    except ImportError:
        raise HTTPException(
            status_code=500,
            detail="yfinance not installed. Run: pip install yfinance"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch price: {str(e)}")
