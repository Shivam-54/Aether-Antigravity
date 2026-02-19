"""
Crypto ML API Routes
Endpoints for crypto price predictions and AI insights
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List
from uuid import UUID
from datetime import datetime
import asyncio

from database import get_db
from models.crypto import CryptoHolding
from models.user import User
from routes.auth import get_current_user
from ml.predictors.crypto_forecaster import crypto_forecaster
from ml.predictors.insight_generator import generate_all_insights, calculate_portfolio_health_score
from ml.predictors.scenario_engine import scenario_simulator
from pydantic import BaseModel

router = APIRouter(
    prefix="/api/crypto/ml",
    tags=["Crypto AI Insights"]
)


@router.get("/predict/{symbol}")
async def predict_crypto_price(
    symbol: str,
    days_ahead: Optional[int] = 30,
    current_user: User = Depends(get_current_user)
):
    """
    Get ML price prediction for a specific cryptocurrency
    
    Args:
        symbol: Crypto symbol (e.g., "BTC", "ETH")
        days_ahead: Forecast horizon in days (default: 30)
    
    Returns:
        Prediction with current price, predicted price, confidence interval, trend
    """
    prediction = await crypto_forecaster.predict(
        symbol=symbol,
        days_ahead=days_ahead
    )
    
    if not prediction:
        raise HTTPException(
            status_code=400,
            detail=f"Unable to generate prediction for {symbol}. Symbol may not be supported."
        )
    
    return prediction


@router.get("/predict-multi/{symbol}")
async def predict_crypto_multi_horizon(
    symbol: str,
    current_user: User = Depends(get_current_user)
):
    """
    Get predictions at multiple time horizons (7, 30, 90 days)
    
    Returns:
        Dict with predictions for each horizon
    """
    predictions = await crypto_forecaster.predict_multi_horizon(
        symbol=symbol,
        horizons=[7, 30, 90]
    )
    
    if not predictions:
        raise HTTPException(
            status_code=400,
            detail=f"Unable to generate predictions for {symbol}"
        )
    
    return {
        "symbol": symbol.upper(),
        "predictions": predictions
    }


@router.get("/predict-portfolio")
async def predict_portfolio(
    days_ahead: Optional[int] = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get portfolio value forecast series and stats
    
    Returns:
        Dict with aggregated forecast series and metrics
    """
    # Fetch user holdings
    holdings = db.query(CryptoHolding).filter(
        CryptoHolding.user_id == current_user.id
    ).all()
    
    if not holdings:
        return {
            "series": [],
            "message": "No crypto holdings found",
            "total_current_value": 0,
            "total_predicted_value": 0
        }
    
    # Convert to dict format
    holdings_data = [
        {
            "symbol": h.symbol,
            "quantity": float(h.quantity),
            "purchase_price_avg": float(h.purchase_price_avg or 0),
            "current_price": float(h.current_price or 0),
            "current_value": float(h.quantity * (h.current_price or 0))
        }
        for h in holdings
    ]
    
    # Get portfolio series forecast
    forecast_data = await crypto_forecaster.get_portfolio_series_prediction(
        holdings=holdings_data,
        days_ahead=days_ahead
    )
    
    # Calculate current usage stats
    total_current = sum(h["current_value"] for h in holdings_data)
    
    # Get end predicted value from series
    series = forecast_data.get("series", [])
    total_predicted = series[-1]["predicted_value"] if series else total_current
    
    total_change = total_predicted - total_current
    percent_change = (total_change / total_current * 100) if total_current > 0 else 0
    
    return {
        "series": series,
        "total_holdings": len(holdings),
        "total_current_value": round(total_current, 2),
        "total_predicted_value": round(total_predicted, 2),
        "total_change": round(total_change, 2),
        "percent_change": round(percent_change, 2),
        "forecast_days": days_ahead
    }


@router.get("/insights")
async def get_ai_insights(
    days_ahead: Optional[int] = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get AI-generated insights and health score for user's crypto portfolio
    
    This is the main endpoint for the AI Insights panel.
    Returns prioritized, actionable insights based on ML predictions.
    
    Returns:
        List of insight objects sorted by priority
    """
    # Fetch user holdings
    holdings = db.query(CryptoHolding).filter(
        CryptoHolding.user_id == current_user.id
    ).all()
    
    if not holdings:
        return {
            "insights": [],
            "health_score": {"score": 0, "components": {}}, # Added health_score
            "message": "Add some crypto holdings to get personalized AI insights",
            "total_holdings": 0
        }
    
    # Convert to dict format with all needed fields
    holdings_data = [
        {
            "symbol": h.symbol,
            "name": h.name,
            "quantity": float(h.quantity),
            "purchase_price_avg": float(h.purchase_price_avg or 0),
            "current_price": float(h.current_price or 0),
            "current_value": float(h.quantity * (h.current_price or 0))
        }
        for h in holdings
    ]
    
    # Generate insights and health score
    try:
        # We need predictions for the health score calculation
        predictions = await crypto_forecaster.get_portfolio_predictions(
            holdings=holdings_data,
            days_ahead=days_ahead
        )
        
        insights = await generate_all_insights(
            holdings=holdings_data,
            days_ahead=days_ahead
        )
        
        health_score = await asyncio.to_thread(calculate_portfolio_health_score, holdings_data, predictions)
        
        return {
            "insights": insights,
            "health_score": health_score, # Included health_score
            "total_holdings": len(holdings),
            "forecast_horizon_days": days_ahead,
            "generated_at": datetime.now().isoformat() # Changed to datetime.now()
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate insights: {str(e)}"
        )


@router.get("/model-status")
async def get_model_status(
    current_user: User = Depends(get_current_user)
):
    """
    Get status of trained ML models
    
    Returns:
        Dict with model training status for each symbol
    """
    return {
        "trained_models": list(crypto_forecaster.models.keys()),
        "last_trained": {
            symbol: dt.isoformat()
            for symbol, dt in crypto_forecaster.last_trained.items()
        },
        "cache_duration_hours": crypto_forecaster.cache_duration_hours
    }


@router.post("/retrain/{symbol}")
async def retrain_model(
    symbol: str,
    current_user: User = Depends(get_current_user)
):
    """
    Force retrain the ML model for a specific symbol
    
    Use this if you want fresh predictions based on latest data.
    """
    success = await crypto_forecaster.train_model(symbol.upper())
    
    if not success:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to train model for {symbol}. Symbol may not be supported."
        )
    
    return {
        "message": f"Model retrained for {symbol.upper()}",
        "trained_at": crypto_forecaster.last_trained.get(symbol.upper()).isoformat()
    }


class SimulationRequest(BaseModel):
    shock_target: str
    shock_percent: float


@router.post("/simulate")
async def simulate_scenario(
    request: SimulationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Run a "What-If" market scenario simulation
    
    Args:
        shock_target: The asset experiencing the shock (e.g. "BTC")
        shock_percent: The percentage move (e.g. -20 for a 20% crash)
        
    Returns:
        Simulated portfolio impact
    """
    # Fetch user holdings
    holdings = db.query(CryptoHolding).filter(
        CryptoHolding.user_id == current_user.id
    ).all()
    
    if not holdings:
        raise HTTPException(status_code=400, detail="No holdings to simulate")
        
    # Convert to dict format
    holdings_data = [
        {
            "symbol": h.symbol,
            "quantity": float(h.quantity),
            "current_value": float(h.quantity * (h.current_price or 0))
        }
        for h in holdings
    ]
    
    result = await scenario_simulator.simulate_shock(
        holdings=holdings_data,
        shock_target=request.shock_target,
        shock_percent=request.shock_percent
    )
    
    return result
