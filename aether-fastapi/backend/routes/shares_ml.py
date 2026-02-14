"""
Shares AI Lab - ML API Routes
Isolated endpoints for stock predictions, risk analysis, and insights
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from database import get_db
from ml.shares.price_predictor import PricePredictor
from ml.shares.risk_analyzer import RiskAnalyzer
from ml.shares.insights_generator import InsightsGenerator
from ml.shares.sentiment_analyzer import stock_sentiment_analyzer

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


@router.get("/shares/ml/risk-analysis")
async def get_risk_analysis(
    tickers: str = Query(..., description="Comma-separated list of tickers"),
    weights: Optional[str] = Query(None, description="Comma-separated weights (must sum to 1.0)"),
    investment_amount: float = Query(10000, description="Total portfolio value"),
    simulations: int = Query(10000, description="Number of Monte Carlo simulations"),
    db: Session = Depends(get_db)
):
    """
    Portfolio risk analysis using Monte Carlo simulation.
    
    Args:
        tickers: Comma-separated ticker symbols (e.g., 'AAPL,MSFT,GOOGL')
        weights: Portfolio weights (must sum to 1.0), evenly distributed if not provided
        investment_amount: Total portfolio investment amount
        simulations: Number of Monte Carlo simulations (default 10,000)
    
    Returns:
        Risk metrics (VaR, CVaR, Sharpe), statistics, and distribution data
    """
    try:
        # Parse tickers
        ticker_list = [t.strip().upper() for t in tickers.split(',')]
        
        # Parse weights
        if weights:
            weight_list = [float(w.strip()) for w in weights.split(',')]
            if len(weight_list) != len(ticker_list):
                raise ValueError("Number of weights must match number of tickers")
        else:
            weight_list = None
        
        # Initialize and run risk analyzer
        analyzer = RiskAnalyzer(
            tickers=ticker_list,
            weights=weight_list,
            investment_amount=investment_amount
        )
        results = analyzer.analyze_risk(num_simulations=simulations)
        
        return {
            "status": "success",
            "data": results
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid input: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Risk analysis error: {str(e)}"
        )


@router.get("/shares/ml/insights")
async def get_portfolio_insights(
    tickers: str = Query(..., description="Comma-separated list of tickers"),
    portfolio_value: Optional[float] = Query(None, description="Total portfolio value"),
    db: Session = Depends(get_db)
):
    """
    AI-generated portfolio insights using Google Gemini.
    
    Args:
        tickers: Comma-separated ticker symbols
        portfolio_value: Optional total portfolio value for context
    
    Returns:
        Structured insights with categories, severity, and actionable content
    """
    try:
        ticker_list = [t.strip().upper() for t in tickers.split(',')]
        
        generator = InsightsGenerator()
        results = generator.generate_insights(
            tickers=ticker_list,
            portfolio_value=portfolio_value
        )
        
        return {
            "status": "success",
            "data": results
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid input: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Insights generation error: {str(e)}"
        )


@router.get("/shares/ml/sentiment")
async def get_stock_sentiment(
    ticker: str = Query(..., description="Stock ticker symbol"),
    db: Session = Depends(get_db)
):
    """
    Sentiment analysis for a stock ticker using VADER + news APIs.

    Args:
        ticker: Stock ticker symbol (e.g., 'AAPL', 'MSFT')

    Returns:
        Sentiment score, classification, breakdown, headlines, social buzz
    """
    try:
        result = stock_sentiment_analyzer.analyze(ticker)
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Sentiment analysis error: {str(e)}"
        )


@router.get("/shares/ml/sentiment/history")
async def get_stock_sentiment_history(
    ticker: str = Query(..., description="Stock ticker symbol"),
    days: int = Query(30, description="Number of days of history"),
    db: Session = Depends(get_db)
):
    """
    Historical sentiment scores for charting.
    """
    try:
        history = stock_sentiment_analyzer.get_history(ticker, days)
        return {
            "status": "success",
            "data": {
                "symbol": ticker.upper(),
                "history": history,
                "days": days,
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Sentiment history error: {str(e)}"
        )


@router.get("/shares/ml/test")
async def test_shares_ml():
    """Test endpoint to verify Shares ML router is working"""
    return {
        "status": "success",
        "message": "Shares ML API is operational",
        "endpoints": [
            "/api/shares/ml/price-prediction",
            "/api/shares/ml/risk-analysis",
            "/api/shares/ml/insights",
            "/api/shares/ml/sentiment",
            "/api/shares/ml/sentiment/history",
            "/api/shares/ml/test"
        ]
    }

