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
from ml.realestate.re_insights_generator import REInsightsGenerator
from ml.realestate.re_diversification_analyzer import REDiversificationAnalyzer
from ml.realestate.re_rebalancing_advisor import RERebalancingAdvisor
from ml.realestate.re_rental_yield_optimizer import RERentalYieldOptimizer


router = APIRouter(prefix="/api/realestate", tags=["Real Estate"])

# --- Pydantic Schemas ---

class PropertyBase(BaseModel):
    name: str
    type: str = "Residential"
    status: str = "Owned"
    land_area: Optional[float] = 0.0
    land_unit: Optional[str] = "sq ft"
    purchase_price: Optional[float] = 0.0
    current_value: Optional[float] = 0.0
    location: Optional[str] = None
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
    equity = total_value 
    
    return {
        "total_properties": total_properties,
        "total_value": total_value,
        "total_investment": total_investment,
        "equity": equity
    }


# ═══════════════════════════════════════════════════
# Portfolio Performance Endpoint
# NOTE: Must be defined BEFORE /{property_id} to avoid
# FastAPI routing shadowing ("performance" != UUID).
# ═══════════════════════════════════════════════════

@router.get("/performance")
async def get_portfolio_performance(
    months: int = 24,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Month-by-month portfolio value for the last N months.
    Uses real PropertyValuation records; falls back to purchase_price
    for months with no recorded valuation.
    """
    from models import PropertyValuation
    from calendar import month_abbr
    from dateutil.relativedelta import relativedelta

    today = date.today()

    properties = db.query(Property).filter(
        Property.user_id == current_user.id,
        Property.status != "Sold"
    ).all()

    if not properties:
        return {"months": [], "values": [], "property_count": 0}

    prop_ids = [p.id for p in properties]
    all_valuations = db.query(PropertyValuation).filter(
        PropertyValuation.property_id.in_(prop_ids)
    ).order_by(PropertyValuation.valuation_date.asc()).all()

    val_by_prop: dict = {}
    for v in all_valuations:
        pid = str(v.property_id)
        val_by_prop.setdefault(pid, []).append(v)

    start_month = today - relativedelta(months=months - 1)
    month_labels, month_values = [], []

    for i in range(months):
        target = start_month + relativedelta(months=i)
        if target.month == 12:
            snapshot = date(target.year, 12, 31)
        else:
            snapshot = date(target.year, target.month + 1, 1) - relativedelta(days=1)

        total = 0.0
        for p in properties:
            if p.acquisition_date and p.acquisition_date > snapshot:
                continue
            pid = str(p.id)
            best = None
            for v in val_by_prop.get(pid, []):
                if v.valuation_date <= snapshot:
                    if best is None or v.valuation_date > best.valuation_date:
                        best = v
            total += float(best.value if best else (p.purchase_price or 0))

        month_labels.append(f"{month_abbr[target.month]} {str(target.year)[2:]}")
        month_values.append(round(total, 2))

    return {
        "months": month_labels,
        "values": month_values,
        "property_count": len(properties),
    }


# ═══════════════════════════════════════════════════
# AI Lab Endpoints
# NOTE: Must be defined BEFORE /{property_id} to avoid
# FastAPI routing shadowing ("ai" != UUID).
# ═══════════════════════════════════════════════════

@router.get("/ai/summary")
async def get_ai_portfolio_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate Gemini AI-powered insights for the user's real estate portfolio.
    """
    properties = db.query(Property).filter(
        Property.user_id == current_user.id,
        Property.status != "Sold"
    ).all()

    try:
        generator = REInsightsGenerator()
        result = generator.generate_summary(properties)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI summary generation failed: {str(e)}")


@router.get("/ai/diversification")
async def get_diversification_score(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Calculate portfolio diversification score based on city, type, and value concentration.
    """
    properties = db.query(Property).filter(
        Property.user_id == current_user.id,
        Property.status != "Sold"
    ).all()

    try:
        analyzer = REDiversificationAnalyzer()
        result = analyzer.analyze(properties)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Diversification analysis failed: {str(e)}")


@router.get("/ai/rebalancing")
async def get_rebalancing_advice(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Portfolio rebalancing advisor — gaps in city/type spread + Gemini suggestions.
    """
    properties = db.query(Property).filter(
        Property.user_id == current_user.id,
        Property.status != "Sold"
    ).all()

    try:
        advisor = RERebalancingAdvisor()
        result = advisor.analyze(properties)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Rebalancing analysis failed: {str(e)}")


@router.get("/ai/rental-yield")
async def get_rental_yield_analysis(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Rental yield optimizer — actual vs market-rate rent per property.
    """
    properties = db.query(Property).filter(
        Property.user_id == current_user.id,
        Property.status != "Sold"
    ).all()

    try:
        optimizer = RERentalYieldOptimizer()
        result = optimizer.analyze(properties)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Rental yield analysis failed: {str(e)}")


# ── Dynamic property detail (MUST be last among GET routes) ──────────────────
# ⚠️  Any new named static GET routes (e.g. /export, /summary) must be added
#     ABOVE this line, not below it — otherwise FastAPI will treat the route
#     segment as a property_id UUID and return 422.
# ─────────────────────────────────────────────────────────────────────────────

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



