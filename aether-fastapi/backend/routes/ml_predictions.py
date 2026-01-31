"""
ML Prediction API Routes
Endpoints for property price predictions and ML insights
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID
from datetime import datetime

from database import get_db
from models.real_estate import Property
from models.user import User
from routes.auth import get_current_user
from ml.predictors.price_forecaster import PropertyPriceForecaster

router = APIRouter(
    prefix="/api/realestate/ml",
    tags=["ML Predictions"]
)

# Initialize forecaster (singleton pattern)
forecaster = PropertyPriceForecaster()


@router.get("/predict-price/{property_id}")
async def predict_property_price(
    property_id: UUID,
    days_ahead: Optional[int] = 90,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Predict future value of a specific property
    
    Args:
        property_id: UUID of the property
        days_ahead: Forecast horizon in days (default: 90)
    
    Returns:
        Prediction with confidence intervals and growth factors
    """
    # Fetch property
    property = db.query(Property).filter(
        Property.id == property_id,
        Property.user_id == current_user.id
    ).first()
    
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    
    # Check if property has required data (acquisition_date is optional, will use created_at as fallback)
    if not property.purchase_price or not property.current_value:
        raise HTTPException(
            status_code=400, 
            detail="Property missing required data (purchase_price, current_value)"
        )
    
    # Prepare property data for forecaster
    # Use acquisition_date if available, otherwise fall back to created_at
    date_to_use = property.acquisition_date if property.acquisition_date else property.created_at
    
    property_data = {
        "purchase_date": date_to_use.isoformat() if hasattr(date_to_use, 'isoformat') else str(date_to_use),
        "purchase_price": float(property.purchase_price),
        "current_value": float(property.current_value)
    }
    
    try:
        # Generate prediction
        prediction = forecaster.predict(property_data, days_ahead=days_ahead)
        
        # Add property context
        prediction["property_id"] = str(property_id)
        prediction["property_name"] = property.name
        
        return prediction
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )


@router.get("/predict-price-multi/{property_id}")
async def predict_property_price_multi_horizon(
    property_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Predict property value at multiple time horizons (30, 90, 180, 365 days)
    
    Returns:
        Dict with predictions for each horizon
    """
    # Fetch property
    property = db.query(Property).filter(
        Property.id == property_id,
        Property.user_id == current_user.id
    ).first()
    
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    
    if not property.purchase_price or not property.current_value:
        raise HTTPException(
            status_code=400,
            detail="Property missing required data"
        )
    
    date_to_use = property.acquisition_date if property.acquisition_date else property.created_at
    property_data = {
        "purchase_date": date_to_use.isoformat() if hasattr(date_to_use, 'isoformat') else str(date_to_use),
        "purchase_price": float(property.purchase_price),
        "current_value": float(property.current_value)
    }
    
    try:
        predictions = forecaster.predict_multi_horizon(property_data)
        
        return {
            "property_id": str(property_id),
            "property_name": property.name,
            "predictions": predictions
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )


@router.get("/predict-all")
async def predict_all_properties(
    days_ahead: Optional[int] = 90,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get price predictions for all user's properties
    
    Returns:
        List of predictions for all properties
    """
    properties = db.query(Property).filter(
        Property.user_id == current_user.id
    ).all()
    
    if not properties:
        return {"predictions": [], "message": "No properties found"}
    
    predictions = []
    
    for property in properties:
        # Skip properties without required data
        if not property.purchase_price or not property.current_value:
            continue
        
        date_to_use = property.acquisition_date if property.acquisition_date else property.created_at
        property_data = {
            "purchase_date": date_to_use.isoformat() if hasattr(date_to_use, 'isoformat') else str(date_to_use),
            "purchase_price": float(property.purchase_price),
            "current_value": float(property.current_value)
        }
        
        try:
            prediction = forecaster.predict(property_data, days_ahead=days_ahead)
            prediction["property_id"] = str(property.id)
            prediction["property_name"] = property.name
            prediction["location"] = property.location
            
            predictions.append(prediction)
        
        except Exception as e:
            # Skip this property if prediction fails
            print(f"Failed to predict for {property.name}: {str(e)}")
            continue
    
    # Sort by predicted percent change (best performers first)
    predictions.sort(key=lambda x: x.get('percent_change', 0), reverse=True)
    
    return {
        "predictions": predictions,
        "total_properties": len(properties),
        "predicted_count": len(predictions),
        "forecast_horizon_days": days_ahead
    }


@router.get("/portfolio-forecast")
async def get_portfolio_forecast(
    days_ahead: Optional[int] = 90,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get aggregated portfolio value forecast
    
    Returns:
        Portfolio-level prediction with total current and predicted values
    """
    properties = db.query(Property).filter(
        Property.user_id == current_user.id
    ).all()
    
    if not properties:
        return {"message": "No properties found"}
    
    total_current_value = 0
    total_predicted_value = 0
    property_predictions = []
    
    for property in properties:
        if not property.purchase_price or not property.current_value:
            # For properties without prediction data, use current value
            total_current_value += float(property.current_value or 0)
            total_predicted_value += float(property.current_value or 0)
            continue
        
        date_to_use = property.acquisition_date if property.acquisition_date else property.created_at
        property_data = {
            "purchase_date": date_to_use.isoformat() if hasattr(date_to_use, 'isoformat') else str(date_to_use),
            "purchase_price": float(property.purchase_price),
            "current_value": float(property.current_value)
        }
        
        try:
            prediction = forecaster.predict(property_data, days_ahead=days_ahead)
            total_current_value += prediction["current_value"]
            total_predicted_value += prediction["predicted_value"]
            property_predictions.append({
                "name": property.name,
                "percent_change": prediction["percent_change"]
            })
        except:
            total_current_value += float(property.current_value)
            total_predicted_value += float(property.current_value)
    
    portfolio_change = total_predicted_value - total_current_value
    portfolio_percent_change = (portfolio_change / total_current_value * 100) if total_current_value > 0 else 0
    
    return {
        "current_portfolio_value": round(total_current_value, 2),
        "predicted_portfolio_value": round(total_predicted_value, 2),
        "absolute_change": round(portfolio_change, 2),
        "percent_change": round(portfolio_percent_change, 2),
        "forecast_horizon_days": days_ahead,
        "total_properties": len(properties),
        "top_gainers": sorted(property_predictions, key=lambda x: x['percent_change'], reverse=True)[:3]
    }
