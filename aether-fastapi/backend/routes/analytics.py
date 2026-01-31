from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from uuid import UUID
from datetime import date, datetime

from database import get_db
from models.real_estate import Property
from models.user import User
from routes.auth import get_current_user
from pydantic import BaseModel

router = APIRouter(prefix="/api/realestate/analytics", tags=["Real Estate Analytics"])

# --- Schemas ---

class PropertyOneLine(BaseModel):
    property_id: UUID
    name: str
    rank: int
    performance_score: float
    roi_percent: float
    rental_yield: float
    badge: str

class RankingResponse(BaseModel):
    rankings: List[PropertyOneLine]
    insights: Dict[str, Any]

class HealthScoreResponse(BaseModel):
    overall_score: int
    grade: str
    breakdown: Dict[str, int]
    recommendations: List[str]

class RiskItem(BaseModel):
    type: str
    severity: str # low, medium, high
    confidence: float
    message: str

class PropertyRisk(BaseModel):
    property_id: UUID
    property_name: str
    risks: List[RiskItem]
    risk_score: int

# --- Logic Helpers ---

def calculate_yield(property: Property) -> float:
    if not property.current_value or property.current_value == 0:
        return 0.0
    
    annual_rent = 0
    if property.status == 'Rented' or property.rent_status == 'Rented':
        rent = property.rent_amount or 0
        rent_type = property.rent_type or 'Monthly'
        if rent_type == 'Monthly':
            annual_rent = rent * 12
        else:
            annual_rent = rent
            
    return (annual_rent / property.current_value) * 100

def calculate_roi(property: Property) -> float:
    if not property.purchase_price or property.purchase_price == 0:
        return 0.0
    
    current = property.current_value or 0
    return ((current - property.purchase_price) / property.purchase_price) * 100

# --- Endpoints ---

@router.get("/ranking", response_model=RankingResponse)
async def get_property_ranking(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get properties ranked by performance score (ROI + Yield + Growth)
    """
    properties = db.query(Property).filter(Property.user_id == current_user.id).all()
    
    ranked_props = []
    
    for prop in properties:
        roi = calculate_roi(prop)
        rental_yield = calculate_yield(prop)
        
        # Simple scoring algorithm from plan
        # Weights: ROI (40%), Yield (40%), Appreciation (20%) - simplified
        # Since we don't have historical data for true "appreciation rate" over time easily without transaction history,
        # we will use ROI as a proxy for appreciation.
        
        score = (roi * 0.6) + (rental_yield * 4.0) # Yield is usually single digit, ROI can be double digit. Scaling yield.
        
        # Cap score for UI sanity? Or just relative.
        
        badge = "bronze"
        if score > 20: badge = "gold"
        elif score > 10: badge = "silver"
        
        ranked_props.append({
            "property_obj": prop,
            "score": score,
            "roi": roi,
            "yield": rental_yield,
            "badge": badge
        })
        
    # Sort by score desc
    ranked_props.sort(key=lambda x: x["score"], reverse=True)
    
    # Format response
    response_items = []
    for idx, item in enumerate(ranked_props):
        p = item["property_obj"]
        response_items.append(PropertyOneLine(
            property_id=p.id,
            name=p.name,
            rank=idx + 1,
            performance_score=round(item["score"], 1),
            roi_percent=round(item["roi"], 1),
            rental_yield=round(item["yield"], 1),
            badge=item["badge"]
        ))
        
    insights = {
        "best_performer": response_items[0].name if response_items else None,
        "worst_performer": response_items[-1].name if response_items else None,
        "total_properties": len(properties)
    }
    
    return RankingResponse(rankings=response_items, insights=insights)

@router.get("/health-score", response_model=HealthScoreResponse)
async def get_portfolio_health(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Calculate overall portfolio health score (0-100)
    """
    properties = db.query(Property).filter(Property.user_id == current_user.id).all()
    
    if not properties:
        return HealthScoreResponse(
            overall_score=0,
            grade="N/A",
            breakdown={"growth": 0, "risk": 0, "yield": 0, "liquidity": 0},
            recommendations=["Add properties to see health score."]
        )
        
    # 1. Growth Score (Based on Avg ROI)
    avg_roi = sum(calculate_roi(p) for p in properties) / len(properties)
    growth_score = min(100, max(0, avg_roi * 2)) # 50% ROI = 100 score
    
    # 2. Yield Score (Target 5%)
    avg_yield = sum(calculate_yield(p) for p in properties) / len(properties)
    yield_score = min(100, max(0, avg_yield * 20)) # 5% yield = 100 score
    
    # 3. Risk Score (Occupancy)
    rented_count = sum(1 for p in properties if p.status == 'Rented' or p.rent_status == 'Rented')
    occupancy_rate = (rented_count / len(properties)) * 100 if properties else 0
    risk_metric = occupancy_rate # Higher occupancy = lower risk (better score)
    
    # 4. Overall
    overall = (growth_score * 0.4) + (yield_score * 0.3) + (risk_metric * 0.3)
    overall = round(overall)
    
    grade = "Needs Attention"
    if overall > 80: grade = "Excellent"
    elif overall > 60: grade = "Strong"
    elif overall > 40: grade = "Moderate"
    
    recs = []
    if risk_metric < 50:
        recs.append("High vacancy rate detected. Consider listing empty properties.")
    if yield_score < 40:
        recs.append("Rental yields are below market average (2-3%). Review rent prices.")
    if growth_score > 80:
        recs.append("Excellent capital appreciation. Consider leveraging equity.")
        
    return HealthScoreResponse(
        overall_score=overall,
        grade=grade,
        breakdown={
            "growth": round(growth_score),
            "risk": round(risk_metric), # This is "safety score" really
            "yield": round(yield_score),
            "liquidity": 50 # Placeholder
        },
        recommendations=recs
    )

@router.get("/risks", response_model=List[PropertyRisk])
async def get_risk_analysis(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Detect risks in the portfolio
    """
    properties = db.query(Property).filter(Property.user_id == current_user.id).all()
    
    results = []
    
    for prop in properties:
        risks = []
        
        # Risk 1: Vacancy
        if prop.status == 'Owned' and prop.rent_status != 'Rented':
            risks.append(RiskItem(
                type="vacancy",
                severity="medium",
                confidence=0.9,
                message="Property is vacant, losing potential rental income."
            ))
            
        # Risk 2: Low Yield
        y = calculate_yield(prop)
        if prop.rent_status == 'Rented' and y < 2.0:
            risks.append(RiskItem(
                type="low_yield",
                severity="low",
                confidence=0.8,
                message=f"Rental yield ({y:.1f}%) is below inflation rate."
            ))
            
        # Risk 3: High Value Concentration (if single property is > 50% of portfolio?)
        # Skipping for now to keep it simple per object
        
        if risks:
            # Calculate simple risk score (higher is riskier)
            score = len(risks) * 25
            results.append(PropertyRisk(
                property_id=prop.id,
                property_name=prop.name,
                risks=risks,
                risk_score=score
            ))
            
    return results
