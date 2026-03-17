from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import date
from uuid import UUID
import asyncio
from database import get_db
from models.user import User
from models.business import Business, BusinessTransaction
from .auth import get_current_user
from ml.business.business_ai import BusinessFinancialAnalyst, BusinessBoardMember


router = APIRouter(prefix="/api/business", tags=["business"])


# ==================== Pydantic Schemas ====================

class BusinessBase(BaseModel):
    name: str
    industry: str
    description: Optional[str] = None
    ownership: float = 100.0
    valuation: float = 0.0
    annual_revenue: float = 0.0
    annual_profit: float = 0.0
    monthly_revenue: float = 0.0
    monthly_profit: float = 0.0
    cash_flow: float = 0.0
    status: str = "Stable"
    founded: Optional[date] = None


class BusinessCreate(BusinessBase):
    pass


class BusinessUpdate(BaseModel):
    name: Optional[str] = None
    industry: Optional[str] = None
    description: Optional[str] = None
    ownership: Optional[float] = None
    valuation: Optional[float] = None
    annual_revenue: Optional[float] = None
    annual_profit: Optional[float] = None
    monthly_revenue: Optional[float] = None
    monthly_profit: Optional[float] = None
    cash_flow: Optional[float] = None
    status: Optional[str] = None
    founded: Optional[date] = None


class BusinessResponse(BusinessBase):
    id: UUID
    user_id: UUID

    class Config:
        from_attributes = True


class TransactionBase(BaseModel):
    business_id: UUID
    date: date
    amount: float
    type: str  # Income, Expense, Investment
    category: Optional[str] = None
    notes: Optional[str] = None


class TransactionCreate(TransactionBase):
    pass


class TransactionResponse(TransactionBase):
    id: UUID
    user_id: UUID
    business_name: Optional[str] = None

    class Config:
        from_attributes = True


# ==================== Business CRUD Operations ====================

@router.get("/", response_model=List[BusinessResponse])
def get_businesses(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get all business ventures for the current user"""
    businesses = db.query(Business).filter(Business.user_id == current_user.id).all()
    return businesses


@router.post("/", response_model=BusinessResponse, status_code=status.HTTP_201_CREATED)
def create_business(business_data: BusinessCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Create a new business venture"""
    new_business = Business(
        user_id=current_user.id,
        name=business_data.name,
        industry=business_data.industry,
        description=business_data.description,
        ownership=business_data.ownership,
        valuation=business_data.valuation,
        annual_revenue=business_data.annual_revenue,
        annual_profit=business_data.annual_profit,
        monthly_revenue=business_data.monthly_revenue,
        monthly_profit=business_data.monthly_profit,
        cash_flow=business_data.cash_flow,
        status=business_data.status,
        founded=business_data.founded
    )
    
    db.add(new_business)
    db.commit()
    db.refresh(new_business)
    
    return new_business


# ==================== AI Lab Endpoints ====================
# IMPORTANT: These MUST come before the /{business_id} wildcard routes.
# Otherwise FastAPI matches 'ai' as a business_id UUID and returns HTTP 500.

# Pydantic model for chat request body
class BizChatRequest(BaseModel):
    message: str
    history: Optional[list] = []


@router.get("/ai/financial-analysis")
async def get_business_financial_analysis(
    period: str = Query("6", description="Period in months or 'all'"),
    focus: str = Query("overall", description="Focus area: overall|revenue|profitability|cashflow|risk"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    AI-powered P&L and financial insights for the user's business portfolio.
    Uses Google Gemini 2.0 Flash with live DB data.
    """
    try:
        businesses = db.query(Business).filter(Business.user_id == current_user.id).all()
        transactions = db.query(BusinessTransaction).filter(BusinessTransaction.user_id == current_user.id).all()

        biz_list: List[Dict[str, Any]] = [
            {
                "name":            b.name,
                "industry":        b.industry,
                "description":     b.description,
                "ownership":       float(b.ownership or 0),
                "valuation":       float(b.valuation or 0),
                "annual_revenue":  float(b.annual_revenue or 0),
                "annual_profit":   float(b.annual_profit or 0),
                "monthly_revenue": float(b.monthly_revenue or 0),
                "monthly_profit":  float(b.monthly_profit or 0),
                "cash_flow":       float(b.cash_flow or 0),
                "status":          b.status,
                "founded":         str(b.founded) if b.founded else None,
            }
            for b in businesses
        ]

        tx_list: List[Dict[str, Any]] = [
            {
                "date":     str(t.date),
                "amount":   float(t.amount or 0),
                "type":     t.type,
                "category": t.category,
                "notes":    t.notes,
            }
            for t in transactions
        ]

        period_months = 12 if period == "all" else int(period)
        analyst = BusinessFinancialAnalyst()
        result = await asyncio.to_thread(
            analyst.generate_analysis, biz_list, tx_list, period_months, focus
        )
        return result

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Business AI analysis error: {str(e)}")


@router.post("/ai/chat")
async def business_ai_chat(
    body: BizChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    AI Board Member conversational endpoint.
    Injects live business portfolio context into every Gemini call.
    """
    try:
        businesses = db.query(Business).filter(Business.user_id == current_user.id).all()
        transactions = db.query(BusinessTransaction).filter(BusinessTransaction.user_id == current_user.id).all()

        biz_list: List[Dict[str, Any]] = [
            {
                "name":           b.name,
                "industry":       b.industry,
                "annual_revenue": float(b.annual_revenue or 0),
                "annual_profit":  float(b.annual_profit  or 0),
                "cash_flow":      float(b.cash_flow      or 0),
                "valuation":      float(b.valuation      or 0),
                "status":         b.status,
            }
            for b in businesses
        ]

        biz_name_map = {str(b.id): b.name for b in businesses}
        tx_list: List[Dict[str, Any]] = [
            {
                "date":          str(t.date),
                "amount":        float(t.amount or 0),
                "type":          t.type,
                "category":      t.category,
                "business_name": biz_name_map.get(str(t.business_id), "Unknown"),
            }
            for t in transactions
        ]

        board_member = BusinessBoardMember()
        reply = await asyncio.to_thread(
            board_member.chat, body.message, biz_list, tx_list, body.history
        )
        return {"reply": reply}

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Business AI chat error: {str(e)}")


# ==================== Business CRUD: Single Venture ====================

@router.get("/{business_id}", response_model=BusinessResponse)
def get_business(business_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get a specific business by ID"""
    business = db.query(Business).filter(Business.id == business_id, Business.user_id == current_user.id).first()
    
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    return business


@router.put("/{business_id}", response_model=BusinessResponse)
def update_business(business_id: UUID, business_data: BusinessUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Update a business"""
    business = db.query(Business).filter(Business.id == business_id, Business.user_id == current_user.id).first()
    
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    update_data = business_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(business, field, value)
    
    db.commit()
    db.refresh(business)
    
    return business


@router.delete("/{business_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_business(business_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Delete a business and all its transactions"""
    business = db.query(Business).filter(Business.id == business_id, Business.user_id == current_user.id).first()
    
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    db.delete(business)
    db.commit()
    
    return None


# ==================== Transaction CRUD Operations ====================

@router.get("/transactions/all", response_model=List[TransactionResponse])
def get_all_transactions(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get all transactions for the current user (Optimized)"""
    # Use JOIN to fetch transaction + business name in one query
    results = db.query(BusinessTransaction, Business.name).join(
        Business, BusinessTransaction.business_id == Business.id
    ).filter(BusinessTransaction.user_id == current_user.id).all()
    
    response = []
    for tx, business_name in results:
        response.append({
            "id": tx.id,
            "user_id": tx.user_id,
            "business_id": tx.business_id,
            "business_name": business_name,
            "date": tx.date,
            "amount": tx.amount,
            "type": tx.type,
            "category": tx.category,
            "notes": tx.notes
        })
    
    return response


@router.get("/{business_id}/transactions", response_model=List[TransactionResponse])
def get_business_transactions(business_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get all transactions for a specific business"""
    business = db.query(Business).filter(Business.id == business_id, Business.user_id == current_user.id).first()
    
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    transactions = db.query(BusinessTransaction).filter(BusinessTransaction.business_id == business_id).all()
    
    return [{
        "id": tx.id,
        "user_id": tx.user_id,
        "business_id": tx.business_id,
        "business_name": business.name,
        "date": tx.date,
        "amount": tx.amount,
        "type": tx.type,
        "category": tx.category,
        "notes": tx.notes
    } for tx in transactions]


@router.post("/transactions", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
def create_transaction(tx_data: TransactionCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Create a new transaction"""
    # Verify business belongs to user
    business = db.query(Business).filter(Business.id == tx_data.business_id, Business.user_id == current_user.id).first()
    
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    new_tx = BusinessTransaction(
        user_id=current_user.id,
        business_id=tx_data.business_id,
        date=tx_data.date,
        amount=tx_data.amount,
        type=tx_data.type,
        category=tx_data.category,
        notes=tx_data.notes
    )
    
    db.add(new_tx)
    db.commit()
    db.refresh(new_tx)
    
    return {
        "id": new_tx.id,
        "user_id": new_tx.user_id,
        "business_id": new_tx.business_id,
        "business_name": business.name,
        "date": new_tx.date,
        "amount": new_tx.amount,
        "type": new_tx.type,
        "category": new_tx.category,
        "notes": new_tx.notes
    }


@router.delete("/transactions/{tx_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(tx_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Delete a transaction"""
    tx = db.query(BusinessTransaction).filter(BusinessTransaction.id == tx_id, BusinessTransaction.user_id == current_user.id).first()
    
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    db.delete(tx)
    db.commit()
    
    return None
