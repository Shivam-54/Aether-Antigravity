from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from database import get_db
from models.crypto import CryptoHolding, CryptoTransaction, CryptoWallet
from models.user import User
from routes.auth import get_current_user

router = APIRouter(prefix="/api/crypto", tags=["Crypto"])

# --- Pydantic Schemas ---

class CryptoHoldingBase(BaseModel):
    symbol: str
    name: str
    network: str = "Bitcoin"
    quantity: float
    purchase_price_avg: float = 0.0
    current_price: float = 0.0
    wallet_id: Optional[int] = None

class CryptoHoldingCreate(CryptoHoldingBase):
    pass

class CryptoHoldingUpdate(BaseModel):
    symbol: Optional[str] = None
    name: Optional[str] = None
    network: Optional[str] = None
    quantity: Optional[float] = None
    purchase_price_avg: Optional[float] = None
    current_price: Optional[float] = None
    wallet_id: Optional[int] = None

class CryptoHoldingResponse(CryptoHoldingBase):
    id: int
    user_id: int
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
    id: int
    user_id: int
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
    id: int
    user_id: int
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
async def get_holdings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all crypto holdings for the current user"""
    holdings = db.query(CryptoHolding).filter(CryptoHolding.user_id == current_user.id).all()
    return holdings

@router.post("/holdings", response_model=CryptoHoldingResponse, status_code=status.HTTP_201_CREATED)
async def create_holding(
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
async def update_holding(
    holding_id: int,
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
async def delete_holding(
    holding_id: int,
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
async def sell_holding(
    holding_id: int,
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
async def get_transactions(
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
async def get_wallets(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all connected wallets for the current user"""
    wallets = db.query(CryptoWallet).filter(CryptoWallet.user_id == current_user.id).all()
    return wallets

# --- Metrics Route ---

@router.get("/metrics", response_model=CryptoMetrics)
async def get_metrics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get aggregated crypto portfolio metrics"""
    holdings = db.query(CryptoHolding).filter(CryptoHolding.user_id == current_user.id).all()
    
    total_value = sum(h.quantity * h.current_price for h in holdings)
    total_invested = sum(h.quantity * h.purchase_price_avg for h in holdings)
    
    # Calculate portfolio return
    if total_invested > 0:
        avg_portfolio_return = ((total_value - total_invested) / total_invested) * 100
    else:
        avg_portfolio_return = 0.0
    
    # Mock 24h change (would need price history for real calculation)
    change_24h_percent = 2.85  # Mock value
    change_24h_value = total_value * (change_24h_percent / 100)
    
    return {
        "total_value": total_value,
        "change_24h_value": change_24h_value,
        "change_24h_percent": change_24h_percent,
        "total_assets_count": len(holdings),
        "avg_portfolio_return": round(avg_portfolio_return, 2)
    }
