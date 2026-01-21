from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import date, datetime
from uuid import UUID

from database import get_db
from models.real_estate import Property
from models.user import User
from routes.auth import get_current_user

router = APIRouter(prefix="/api/realestate", tags=["Real Estate"])

# --- Pydantic Schemas ---

class PropertyBase(BaseModel):
    name: str
    type: str = "Residential"
    status: str = "Owned"
    land_area: float = 0.0
    land_unit: str = "sq ft"
    purchase_price: float = 0.0
    current_value: float = 0.0
    location: str
    address: Optional[str] = None
    acquisition_date: Optional[date] = None
    description: Optional[str] = None
    ownership_structure: str = "Individual"
    
    # Rental tracking
    rent_status: str = "Not Rented"
    rent_amount: Optional[float] = None
    rent_type: Optional[str] = None
    rent_start_date: Optional[date] = None
    security_deposit: Optional[float] = None
    tenant_type: Optional[str] = None

class PropertyCreate(PropertyBase):
    pass

class PropertyUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    status: Optional[str] = None
    land_area: Optional[float] = None
    land_unit: Optional[str] = None
    purchase_price: Optional[float] = None
    current_value: Optional[float] = None
    location: Optional[str] = None
    address: Optional[str] = None
    acquisition_date: Optional[date] = None
    description: Optional[str] = None
    ownership_structure: Optional[str] = None
    
    # Rental tracking - Allow updates
    rent_status: Optional[str] = None
    rent_amount: Optional[float] = None
    rent_type: Optional[str] = None
    rent_start_date: Optional[date] = None
    security_deposit: Optional[float] = None
    tenant_type: Optional[str] = None

class PropertyResponse(PropertyBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class PortfolioStats(BaseModel):
    total_properties: int
    total_value: float
    total_investment: float
    equity: float

# --- Routes ---

@router.get("/", response_model=List[PropertyResponse])
async def get_properties(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all properties for the current user
    """
    properties = db.query(Property).filter(Property.user_id == current_user.id).all()
    return properties

@router.post("/", response_model=PropertyResponse, status_code=status.HTTP_201_CREATED)
async def create_property(
    property_data: PropertyCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Add a new property to the portfolio
    """
    new_property = Property(
        **property_data.dict(),
        user_id=current_user.id
    )
    
    db.add(new_property)
    db.commit()
    db.refresh(new_property)
    return new_property

@router.put("/{property_id}", response_model=PropertyResponse)
async def update_property(
    property_id: UUID,
    property_update: PropertyUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a property
    """
    property = db.query(Property).filter(
        Property.id == property_id,
        Property.user_id == current_user.id
    ).first()
    
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    
    update_data = property_update.dict(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(property, key, value)
    
    db.commit()
    db.refresh(property)
    return property

@router.get("/stats", response_model=PortfolioStats)
async def get_real_estate_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get aggregated statistics for the real estate portfolio
    """
    properties = db.query(Property).filter(Property.user_id == current_user.id).all()
    
    total_properties = len(properties)
    total_value = sum(p.current_value for p in properties)
    total_investment = sum(p.purchase_price for p in properties)
    # Assuming full ownership for now, equity = value
    equity = total_value 
    
    return {
        "total_properties": total_properties,
        "total_value": total_value,
        "total_investment": total_investment,
        "equity": equity
    }

@router.get("/{property_id}", response_model=PropertyResponse)
async def get_property_detail(
    property_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get details of a specific property
    """
    property = db.query(Property).filter(
        Property.id == property_id,
        Property.user_id == current_user.id
    ).first()
    
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
        
    return property

# --- Rent Property Endpoint ---

class RentalInfo(BaseModel):
    rent_type: str  # Monthly or Yearly
    rent_amount: float
    rent_start_date: date
    security_deposit: Optional[float] = 0.0
    tenant_type: Optional[str] = "Individual"

@router.put("/{property_id}/rent", response_model=PropertyResponse)
async def rent_property(
    property_id: UUID,
    rental_info: RentalInfo,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Rent out a property
    """
    property = db.query(Property).filter(
        Property.id == property_id,
        Property.user_id == current_user.id
    ).first()
    
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    
    # Update property with rental information
    property.rent_status = "Rented"
    property.rent_amount = rental_info.rent_amount
    property.rent_type = rental_info.rent_type
    property.rent_start_date = rental_info.rent_start_date
    property.security_deposit = rental_info.security_deposit
    property.tenant_type = rental_info.tenant_type
    property.status = "Rented"  # Update general status
    
    db.commit()
    db.refresh(property)
    return property

@router.put("/{property_id}/sell", response_model=PropertyResponse)
async def sell_property(
    property_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mark a property as Sold
    """
    property = db.query(Property).filter(
        Property.id == property_id,
        Property.user_id == current_user.id
    ).first()
    
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    
    # Update property status
    property.status = "Sold"
    property.rent_status = "Not Rented" # Reset rent status if sold
    
    db.commit()
    db.refresh(property)
    return property

@router.delete("/{property_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_property(
    property_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Remove a property from the portfolio
    """
    property = db.query(Property).filter(
        Property.id == property_id,
        Property.user_id == current_user.id
    ).first()
    
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    
    db.delete(property)
    db.commit()
    return None
