"""
Property Valuation API Routes
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, datetime
from uuid import UUID
from pydantic import BaseModel, Field

from database import get_db
from models import PropertyValuation, Property
from models.user import User
from routes.auth import get_current_user


router = APIRouter(prefix="/api/realestate/valuations", tags=["Property Valuations"])


# Pydantic Schemas
class ValuationCreate(BaseModel):
    property_id: UUID
    valuation_date: date
    value: float = Field(..., gt=0, description="Property value must be positive")
    source: Optional[str] = "manual"
    notes: Optional[str] = None


class ValuationResponse(BaseModel):
    id: UUID
    property_id: UUID
    property_name: Optional[str] = None
    valuation_date: date
    value: float
    source: str
    notes: Optional[str]
    created_at: datetime

    class Config:
        orm_mode = True


class ValuationUpdate(BaseModel):
    valuation_date: Optional[date] = None
    value: Optional[float] = Field(None, gt=0)
    source: Optional[str] = None
    notes: Optional[str] = None


# Routes
@router.post("/", response_model=ValuationResponse)
async def create_valuation(
    valuation: ValuationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Add a historical valuation for a property
    """
    # Verify property belongs to user
    property = db.query(Property).filter(
        Property.id == valuation.property_id,
        Property.user_id == current_user.id
    ).first()
    
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    
    # Check for duplicate date
    existing = db.query(PropertyValuation).filter(
        PropertyValuation.property_id == valuation.property_id,
        PropertyValuation.valuation_date == valuation.valuation_date
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=400, 
            detail=f"Valuation already exists for {valuation.valuation_date}. Please update or delete the existing one."
        )
    
    # Create new valuation
    new_valuation = PropertyValuation(
        property_id=valuation.property_id,
        user_id=current_user.id,
        valuation_date=valuation.valuation_date,
        value=valuation.value,
        source=valuation.source,
        notes=valuation.notes
    )
    
    db.add(new_valuation)
    db.commit()
    db.refresh(new_valuation)
    
    # Attach property name for response
    response_data = ValuationResponse.from_orm(new_valuation)
    response_data.property_name = property.name
    
    return response_data


@router.get("/{property_id}", response_model=List[ValuationResponse])
async def get_property_valuations(
    property_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all valuations for a specific property
    Returns valuations sorted by date (most recent first)
    """
    # Verify property belongs to user
    property = db.query(Property).filter(
        Property.id == property_id,
        Property.user_id == current_user.id
    ).first()
    
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    
    # Get all valuations for this property
    valuations = db.query(PropertyValuation).filter(
        PropertyValuation.property_id == property_id
    ).order_by(PropertyValuation.valuation_date.desc()).all()
    
    # Attach property name to each valuation
    results = []
    for v in valuations:
        val_response = ValuationResponse.from_orm(v)
        val_response.property_name = property.name
        results.append(val_response)
    
    return results


@router.put("/{valuation_id}", response_model=ValuationResponse)
async def update_valuation(
    valuation_id: UUID,
    update_data: ValuationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update an existing valuation
    """
    valuation = db.query(PropertyValuation).filter(
        PropertyValuation.id == valuation_id,
        PropertyValuation.user_id == current_user.id
    ).first()
    
    if not valuation:
        raise HTTPException(status_code=404, detail="Valuation not found")
    
    # Update fields if provided
    if update_data.valuation_date is not None:
        valuation.valuation_date = update_data.valuation_date
    if update_data.value is not None:
        valuation.value = update_data.value
    if update_data.source is not None:
        valuation.source = update_data.source
    if update_data.notes is not None:
        valuation.notes = update_data.notes
    
    valuation.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(valuation)
    
    # Get property name
    property = db.query(Property).filter(Property.id == valuation.property_id).first()
    response_data = ValuationResponse.from_orm(valuation)
    response_data.property_name = property.name if property else None
    
    return response_data


@router.delete("/{valuation_id}")
async def delete_valuation(
    valuation_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a valuation
    """
    valuation = db.query(PropertyValuation).filter(
        PropertyValuation.id == valuation_id,
        PropertyValuation.user_id == current_user.id
    ).first()
    
    if not valuation:
        raise HTTPException(status_code=404, detail="Valuation not found")
    
    db.delete(valuation)
    db.commit()
    
    return {"message": "Valuation deleted successfully", "id": str(valuation_id)}


@router.get("/all/user", response_model=List[ValuationResponse])
async def get_all_user_valuations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all valuations across all properties for the current user
    """
    valuations = db.query(PropertyValuation).join(Property).filter(
        Property.user_id == current_user.id
    ).order_by(PropertyValuation.valuation_date.desc()).all()
    
    # Attach property names
    results = []
    for v in valuations:
        property = db.query(Property).filter(Property.id == v.property_id).first()
        val_response = ValuationResponse.from_orm(v)
        val_response.property_name = property.name if property else "Unknown"
        results.append(val_response)
    
    return results
