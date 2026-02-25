"""
Bonds AI Lab – ML API Routes
Real AI insights from the user's actual bond portfolio using Google Gemini + VADER
"""

import asyncio
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.bonds import Bond
from models.user import User
from .auth import get_current_user
from ml.bonds.bond_insights import BondInsightsGenerator, BondSentimentAnalyzer

router_bonds_ml = APIRouter(prefix="/api/bonds", tags=["Bonds ML"])


@router_bonds_ml.get("/ml/insights")
async def get_bond_portfolio_insights(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Generate real AI-powered insights for the user's actual bond portfolio.
    Uses Google Gemini 2.0 Flash with live DB data — every call may produce
    different, fresh analysis.
    """
    try:
        # Pull user's bonds from the database
        bonds = db.query(Bond).filter(Bond.user_id == current_user.id).all()

        if not bonds:
            return {
                "status": "success",
                "data": {
                    "insights": [],
                    "generated_at": None,
                    "message": "No bonds in portfolio",
                }
            }

        # Serialize to dict list for the generator
        bond_list = [
            {
                "id": str(b.id),
                "ticker": b.ticker,
                "issuer": b.issuer,
                "description": b.description,
                "type": b.type,
                "face_value": float(b.face_value),
                "coupon_rate": float(b.coupon_rate),
                "yield_to_maturity": float(b.yield_to_maturity),
                "maturity_date": str(b.maturity_date) if b.maturity_date else None,
                "purchase_date": str(b.purchase_date) if b.purchase_date else None,
            }
            for b in bonds
        ]

        generator = BondInsightsGenerator()
        result = await asyncio.to_thread(generator.generate_insights, bond_list)

        return {"status": "success", "data": result}

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Bond insights error: {str(e)}")


@router_bonds_ml.get("/ml/sentiment")
async def get_bond_market_sentiment():
    """
    Bond market sentiment analysis using VADER NLP on Indian bond market headlines.
    Returns overall market mood + individual news items with sentiment scores.
    """
    try:
        analyzer = BondSentimentAnalyzer()
        result = await asyncio.to_thread(analyzer.analyze)
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Bond sentiment error: {str(e)}")
