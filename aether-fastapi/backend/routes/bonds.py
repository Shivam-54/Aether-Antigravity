from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import date
from uuid import UUID
from database import get_db
from models.user import User
from models.bonds import Bond
from .auth import get_current_user


router = APIRouter(prefix="/api/bonds", tags=["bonds"])


# ==================== Pydantic Schemas ====================

class BondBase(BaseModel):
    ticker: str
    description: str
    issuer: str
    type: str = "Government"
    face_value: float
    coupon_rate: float = 0.0
    yield_to_maturity: float = 0.0
    maturity_date: date
    purchase_date: Optional[date] = None


class BondCreate(BondBase):
    pass


class BondUpdate(BaseModel):
    ticker: Optional[str] = None
    description: Optional[str] = None
    issuer: Optional[str] = None
    type: Optional[str] = None
    face_value: Optional[float] = None
    coupon_rate: Optional[float] = None
    yield_to_maturity: Optional[float] = None
    maturity_date: Optional[date] = None
    purchase_date: Optional[date] = None


class BondResponse(BondBase):
    id: UUID
    user_id: UUID
    annual_income: float = 0.0

    class Config:
        from_attributes = True


# ==================== CRUD Operations ====================

@router.get("/", response_model=List[BondResponse])
def get_bonds(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get all bonds for the current user"""
    bonds = db.query(Bond).filter(Bond.user_id == current_user.id).all()
    
    # Calculate annual_income for each bond
    result = []
    for bond in bonds:
        bond_dict = {
            "id": bond.id,
            "user_id": bond.user_id,
            "ticker": bond.ticker,
            "description": bond.description,
            "issuer": bond.issuer,
            "type": bond.type,
            "face_value": bond.face_value,
            "coupon_rate": bond.coupon_rate,
            "yield_to_maturity": bond.yield_to_maturity,
            "maturity_date": bond.maturity_date,
            "purchase_date": bond.purchase_date,
            "annual_income": bond.face_value * (bond.coupon_rate / 100)
        }
        result.append(bond_dict)
    
    return result


@router.post("/", response_model=BondResponse, status_code=status.HTTP_201_CREATED)
def create_bond(bond_data: BondCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Create a new bond for the current user"""
    new_bond = Bond(
        user_id=current_user.id,
        ticker=bond_data.ticker,
        description=bond_data.description,
        issuer=bond_data.issuer,
        type=bond_data.type,
        face_value=bond_data.face_value,
        coupon_rate=bond_data.coupon_rate,
        yield_to_maturity=bond_data.yield_to_maturity,
        maturity_date=bond_data.maturity_date,
        purchase_date=bond_data.purchase_date
    )
    
    db.add(new_bond)
    db.commit()
    db.refresh(new_bond)
    
    return {
        "id": new_bond.id,
        "user_id": new_bond.user_id,
        "ticker": new_bond.ticker,
        "description": new_bond.description,
        "issuer": new_bond.issuer,
        "type": new_bond.type,
        "face_value": new_bond.face_value,
        "coupon_rate": new_bond.coupon_rate,
        "yield_to_maturity": new_bond.yield_to_maturity,
        "maturity_date": new_bond.maturity_date,
        "purchase_date": new_bond.purchase_date,
        "annual_income": new_bond.face_value * (new_bond.coupon_rate / 100)
    }


@router.get("/{bond_id}", response_model=BondResponse)
def get_bond(bond_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get a specific bond by ID"""
    bond = db.query(Bond).filter(Bond.id == bond_id, Bond.user_id == current_user.id).first()
    
    if not bond:
        raise HTTPException(status_code=404, detail="Bond not found")
    
    return {
        "id": bond.id,
        "user_id": bond.user_id,
        "ticker": bond.ticker,
        "description": bond.description,
        "issuer": bond.issuer,
        "type": bond.type,
        "face_value": bond.face_value,
        "coupon_rate": bond.coupon_rate,
        "yield_to_maturity": bond.yield_to_maturity,
        "maturity_date": bond.maturity_date,
        "purchase_date": bond.purchase_date,
        "annual_income": bond.face_value * (bond.coupon_rate / 100)
    }


@router.put("/{bond_id}", response_model=BondResponse)
def update_bond(bond_id: UUID, bond_data: BondUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Update a bond"""
    bond = db.query(Bond).filter(Bond.id == bond_id, Bond.user_id == current_user.id).first()
    
    if not bond:
        raise HTTPException(status_code=404, detail="Bond not found")
    
    # Update only provided fields
    update_data = bond_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(bond, field, value)
    
    db.commit()
    db.refresh(bond)
    
    return {
        "id": bond.id,
        "user_id": bond.user_id,
        "ticker": bond.ticker,
        "description": bond.description,
        "issuer": bond.issuer,
        "type": bond.type,
        "face_value": bond.face_value,
        "coupon_rate": bond.coupon_rate,
        "yield_to_maturity": bond.yield_to_maturity,
        "maturity_date": bond.maturity_date,
        "purchase_date": bond.purchase_date,
        "annual_income": bond.face_value * (bond.coupon_rate / 100)
    }


@router.delete("/{bond_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_bond(bond_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Delete a bond"""
    bond = db.query(Bond).filter(Bond.id == bond_id, Bond.user_id == current_user.id).first()
    
    if not bond:
        raise HTTPException(status_code=404, detail="Bond not found")
    
    db.delete(bond)
    db.commit()
    
    return None
