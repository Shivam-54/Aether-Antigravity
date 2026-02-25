"""
ML Prediction API Routes
Endpoints for property price predictions and ML insights
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID
from datetime import datetime
import asyncio
import time

from database import get_db
from models.real_estate import Property
from models.user import User
from routes.auth import get_current_user
from ml.predictors.price_forecaster import PropertyPriceForecaster

router = APIRouter(
    prefix="/api/realestate/ml",
    tags=["ML Predictions"]
)

# ---------------------------------------------------------------------------
# Simple in-process TTL cache — avoids re-running Prophet on every page load
# Cache key: (user_id, days_ahead)  |  TTL: 5 minutes
# ---------------------------------------------------------------------------
_predict_cache: dict = {}
_CACHE_TTL_SECONDS = 300  # 5 minutes


def _cache_get(key):
    entry = _predict_cache.get(key)
    if entry and (time.monotonic() - entry["ts"]) < _CACHE_TTL_SECONDS:
        return entry["data"]
    return None


def _cache_set(key, data):
    _predict_cache[key] = {"ts": time.monotonic(), "data": data}


# ---------------------------------------------------------------------------
# Helper — run one property prediction in a thread (uses its own forecaster
# instance so parallel calls don't share mutable model state)
# ---------------------------------------------------------------------------
# ── Concurrency guard for Prophet / cmdstanpy: run at most 2 at a time ──
# Running all properties simultaneously spawns N*cmdstanpy processes and
# exhausts CPU/file handles, causing the server to hang.
_ML_SEM = asyncio.Semaphore(2)

async def _predict_one(property_data: dict, days_ahead: int) -> dict:
    forecaster = PropertyPriceForecaster()
    return await asyncio.to_thread(forecaster.predict, property_data, days_ahead)


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
        prediction = await _predict_one(property_data, days_ahead)
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
        forecaster = PropertyPriceForecaster()
        predictions = await asyncio.to_thread(forecaster.predict_multi_horizon, property_data)
        
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
    Get price predictions for all user's properties — runs in parallel
    with a 5-minute TTL cache to avoid re-running Prophet on every load.
    """
    # --- Check cache first ---
    cache_key = (str(current_user.id), days_ahead)
    cached = _cache_get(cache_key)
    if cached:
        return cached

    properties = db.query(Property).filter(
        Property.user_id == current_user.id
    ).all()
    
    if not properties:
        return {"predictions": [], "message": "No properties found"}

    # Build list of (property, property_data) for those with enough data
    # ── Minimum value guard: skip properties with suspiciously low amounts
    #    (< ₹1 L = 100 000 indicates test / corrupted data and causes Prophet
    #    to produce explosive multi-thousand-percent forecasts)
    _MIN_PRICE = 100_000
    eligible = []
    for prop in properties:
        purchase_price = float(prop.purchase_price or 0)
        current_value  = float(prop.current_value  or 0)
        if purchase_price < _MIN_PRICE or current_value < _MIN_PRICE:
            continue
        date_to_use = prop.acquisition_date if prop.acquisition_date else prop.created_at
        property_data = {
            "purchase_date": date_to_use.isoformat() if hasattr(date_to_use, 'isoformat') else str(date_to_use),
            "purchase_price": purchase_price,
            "current_value":  current_value
        }
        eligible.append((prop, property_data))

    # --- Run predictions with concurrency limit (max 2 simultaneous Prophet models) ---
    async def _safe_predict(prop, pdata):
        try:
            async with _ML_SEM:          # throttle to 2 concurrent Prophet fits
                result = await asyncio.wait_for(_predict_one(pdata, days_ahead), timeout=45)
            result["property_id"] = str(prop.id)
            result["property_name"] = prop.name
            result["location"] = prop.location
            return result
        except Exception as e:
            print(f"Failed to predict for {prop.name}: {str(e)}")
            return None

    results = await asyncio.gather(*[_safe_predict(p, d) for p, d in eligible])

    # ── Sanity cap: drop predictions where Prophet returns >500 % change.
    #    This happens when base data is inconsistent (e.g. purchase_price ≈ 0).
    _MAX_PCT = 500
    predictions = [
        r for r in results
        if r is not None and abs(r.get("percent_change", 0)) <= _MAX_PCT
    ]

    # Sort by predicted percent change (best performers first)
    predictions.sort(key=lambda x: x.get("percent_change", 0), reverse=True)

    response = {
        "predictions": predictions,
        "total_properties": len(properties),
        "predicted_count": len(predictions),
        "forecast_horizon_days": days_ahead
    }

    # --- Store in cache ---
    _cache_set(cache_key, response)

    return response



@router.get("/portfolio-forecast")
async def get_portfolio_forecast(
    days_ahead: Optional[int] = 90,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get aggregated portfolio value forecast — runs in parallel.
    """
    properties = db.query(Property).filter(
        Property.user_id == current_user.id
    ).all()

    if not properties:
        return {"message": "No properties found"}

    # ── Minimum value guard (same as predict-all)
    _MIN_PRICE = 100_000
    # Split into predictable vs non-predictable
    eligible = []
    no_data_value = 0.0
    for prop in properties:
        purchase_price = float(prop.purchase_price or 0)
        current_value  = float(prop.current_value  or 0)
        if purchase_price < _MIN_PRICE or current_value < _MIN_PRICE:
            no_data_value += current_value
            continue
        date_to_use = prop.acquisition_date if prop.acquisition_date else prop.created_at
        property_data = {
            "purchase_date": date_to_use.isoformat() if hasattr(date_to_use, 'isoformat') else str(date_to_use),
            "purchase_price": purchase_price,
            "current_value":  current_value,
        }
        eligible.append((prop, property_data))

    async def _safe_portfolio_predict(prop, pdata):
        try:
            async with _ML_SEM:
                pred = await asyncio.wait_for(_predict_one(pdata, days_ahead), timeout=45)
            return pred, prop
        except Exception:
            return None, prop

    results = await asyncio.gather(*[_safe_portfolio_predict(p, d) for p, d in eligible])

    total_current_value = no_data_value
    total_predicted_value = no_data_value
    property_predictions = []

    for pred, prop in results:
        if pred is None:
            total_current_value += float(prop.current_value)
            total_predicted_value += float(prop.current_value)
        else:
            total_current_value += pred["current_value"]
            total_predicted_value += pred["predicted_value"]
            property_predictions.append({
                "name": prop.name,
                "percent_change": pred["percent_change"]
            })

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
