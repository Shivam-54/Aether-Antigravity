"""
Shares AI Lab - ML API Routes
Isolated endpoints for stock predictions, risk analysis, and insights
"""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import Optional
from database import get_db
from ml.shares.price_predictor import PricePredictor

# Isolated router for Shares ML
router = APIRouter(prefix="/api", tags=["Shares ML"])


@router.get("/shares/ml/price-prediction")
async def get_price_prediction(
    ticker: str,
    horizon: Optional[int] = 30,
    db: Session = Depends(get_db)
):
    """
    Multi-model stock price prediction using Prophet + ARIMA ensemble.
    
    Args:
        ticker: Stock ticker symbol (e.g., 'AAPL', 'MSFT')
        horizon: Prediction horizon in days (7, 30, or 90)
    
    Returns:
        Prediction results with confidence intervals and metrics
    """
    # Validate horizon
    if horizon not in [7, 30, 90]:
        raise HTTPException(
            status_code=400,
            detail="Horizon must be 7, 30, or 90 days"
        )
    
    try:
        # Initialize and run predictor
        predictor = PricePredictor(ticker=ticker, horizon_days=horizon)
        results = predictor.run_full_prediction()
        
        return {
            "status": "success",
            "data": results
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid ticker or data unavailable: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction error: {str(e)}"
        )


@router.get("/shares/ml/test")
async def test_shares_ml():
    """Test endpoint to verify Shares ML router is working"""
    return {
        "status": "success",
        "message": "Shares ML API is operational",
        "endpoints": [
            "/api/shares/ml/price-prediction",
            "/api/shares/ml/test"
        ]
    }
