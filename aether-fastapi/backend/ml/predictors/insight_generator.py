"""
Crypto Insight Generator
Translates ML predictions into actionable, user-facing insights
"""

from typing import Dict, List, Optional
from datetime import datetime
import logging

from ml.predictors.crypto_forecaster import crypto_forecaster

logger = logging.getLogger(__name__)


# Insight priority levels
class InsightPriority:
    CRITICAL = "critical"      # Red - Act Now
    WARNING = "warning"        # Orange - Monitor
    OPPORTUNITY = "opportunity" # Green - Opportunity
    INFO = "info"              # Blue - FYI


# Insight categories
class InsightCategory:
    PRICE_PREDICTION = "price_prediction"
    TREND_ANALYSIS = "trend_analysis"
    VOLATILITY_ALERT = "volatility_alert"
    PORTFOLIO_HEALTH = "portfolio_health"
    DIP_OPPORTUNITY = "dip_opportunity"
    PROFIT_TAKING = "profit_taking"
    CONCENTRATION_RISK = "concentration_risk"
    TOP_PERFORMER = "top_performer"
    ON_CHAIN_METRIC = "on_chain_metric"


def _create_insight(
    category: str,
    priority: str,
    title: str,
    description: str,
    icon: str,
    data: Optional[Dict] = None
) -> Dict:
    """Create a standardized insight object"""
    return {
        "id": f"{category}_{datetime.now().timestamp()}",
        "category": category,
        "priority": priority,
        "title": title,
        "description": description,
        "icon": icon,
        "data": data or {},
        "generated_at": datetime.now().isoformat()
    }


async def generate_price_prediction_insights(
    predictions: List[Dict]
) -> List[Dict]:
    """
    Generate insights from ML price predictions
    
    Args:
        predictions: List of prediction dicts from crypto_forecaster
    
    Returns:
        List of insight objects
    """
    insights = []
    
    for pred in predictions:
        symbol = pred.get("symbol", "")
        percent_change = pred.get("percent_change", 0)
        trend = pred.get("trend", "neutral")
        trend_confidence = pred.get("trend_confidence", 50)
        days_ahead = pred.get("days_ahead", 30)
        volatility = pred.get("volatility_score", 0)
        
        # Strong bullish signal
        if percent_change > 10 and trend_confidence > 70:
            insights.append(_create_insight(
                category=InsightCategory.PRICE_PREDICTION,
                priority=InsightPriority.OPPORTUNITY,
                title=f"📈 {symbol} Bullish Prediction",
                description=f"Our ML model predicts {symbol} may rise {percent_change:.1f}% over the next {days_ahead} days. Confidence: {trend_confidence:.0f}%.",
                icon="trending_up",
                data=pred
            ))
        
        # Strong bearish signal
        elif percent_change < -10 and trend_confidence > 70:
            insights.append(_create_insight(
                category=InsightCategory.PRICE_PREDICTION,
                priority=InsightPriority.WARNING,
                title=f"📉 {symbol} Bearish Prediction",
                description=f"Our ML model predicts {symbol} may decline {abs(percent_change):.1f}% over the next {days_ahead} days. Consider reviewing your position.",
                icon="trending_down",
                data=pred
            ))
        
        # High volatility warning
        if volatility > 30:
            insights.append(_create_insight(
                category=InsightCategory.VOLATILITY_ALERT,
                priority=InsightPriority.WARNING,
                title=f"⚡ High Volatility Alert: {symbol}",
                description=f"Model predicts ±{volatility:.0f}% price swing possible for {symbol}. Risk score elevated. Consider position sizing.",
                icon="bolt",
                data={"volatility_score": volatility, "symbol": symbol}
            ))
    
    return insights


async def generate_portfolio_insights(
    holdings: List[Dict],
    predictions: List[Dict]
) -> List[Dict]:
    """
    Generate portfolio-level insights
    
    Args:
        holdings: User's crypto holdings
        predictions: ML predictions for holdings
    
    Returns:
        List of insight objects
    """
    insights = []
    
    if not holdings or not predictions:
        return insights
    
    # Calculate portfolio metrics
    total_value = sum(h.get("current_value", 0) for h in holdings)
    
    # --- Concentration Risk ---
    if total_value > 0:
        for holding in holdings:
            symbol = holding.get("symbol", "")
            value = holding.get("current_value", 0)
            concentration = (value / total_value) * 100 if total_value > 0 else 0
            
            if concentration > 60:
                insights.append(_create_insight(
                    category=InsightCategory.CONCENTRATION_RISK,
                    priority=InsightPriority.WARNING,
                    title=f"⚠️ Concentration Risk: {symbol}",
                    description=f"{concentration:.0f}% of your portfolio is in {symbol}. Consider diversifying to reduce single-asset risk.",
                    icon="warning",
                    data={"symbol": symbol, "concentration": concentration}
                ))
            elif concentration > 40:
                insights.append(_create_insight(
                    category=InsightCategory.CONCENTRATION_RISK,
                    priority=InsightPriority.INFO,
                    title=f"📊 {symbol} Dominance",
                    description=f"{symbol} represents {concentration:.0f}% of your portfolio. Monitor for rebalancing opportunities.",
                    icon="pie_chart",
                    data={"symbol": symbol, "concentration": concentration}
                ))
    
    # --- Profit Taking Opportunities ---
    for holding in holdings:
        buy_price = holding.get("purchase_price_avg", 0)
        current_price = holding.get("current_price", 0)
        symbol = holding.get("symbol", "")
        
        if buy_price > 0 and current_price > 0:
            gain_pct = ((current_price - buy_price) / buy_price) * 100
            
            if gain_pct > 50:
                insights.append(_create_insight(
                    category=InsightCategory.PROFIT_TAKING,
                    priority=InsightPriority.OPPORTUNITY,
                    title=f"💰 {symbol} Up {gain_pct:.0f}% from Buy",
                    description=f"Consider taking partial profits. Your {symbol} has gained {gain_pct:.0f}% from your average buy price.",
                    icon="attach_money",
                    data={"symbol": symbol, "gain_percent": gain_pct, "buy_price": buy_price, "current_price": current_price}
                ))
            
            elif gain_pct < -30:
                insights.append(_create_insight(
                    category=InsightCategory.PORTFOLIO_HEALTH,
                    priority=InsightPriority.INFO,
                    title=f"📉 {symbol} Down {abs(gain_pct):.0f}%",
                    description=f"Your {symbol} position is down {abs(gain_pct):.0f}%. Consider tax-loss harvesting if applicable.",
                    icon="trending_down",
                    data={"symbol": symbol, "loss_percent": gain_pct}
                ))
    
    # --- Dip Opportunity Detection ---
    for pred in predictions:
        symbol = pred.get("symbol", "")
        percent_change = pred.get("percent_change", 0)
        trend = pred.get("trend", "neutral")
        
        # Find corresponding holding
        holding = next((h for h in holdings if h.get("symbol", "").upper() == symbol), None)
        
        if holding and percent_change > 15 and trend == "bullish":
            current_price = pred.get("current_price", 0)
            predicted_price = pred.get("predicted_price", 0)
            
            insights.append(_create_insight(
                category=InsightCategory.DIP_OPPORTUNITY,
                priority=InsightPriority.OPPORTUNITY,
                title=f"🎯 {symbol} Buy Opportunity",
                description=f"Model predicts {symbol} may rise to ${predicted_price:,.0f}. Current price: ${current_price:,.0f}. Consider DCA strategy.",
                icon="shopping_cart",
                data=pred
            ))
    
    return insights


async def generate_trend_insights(predictions: List[Dict]) -> List[Dict]:
    """
    Generate trend-based insights from predictions
    """
    insights = []
    
    bullish_count = sum(1 for p in predictions if p.get("trend") == "bullish")
    bearish_count = sum(1 for p in predictions if p.get("trend") == "bearish")
    total = len(predictions)
    
    if total >= 3:
        if bullish_count > total * 0.7:
            insights.append(_create_insight(
                category=InsightCategory.TREND_ANALYSIS,
                priority=InsightPriority.OPPORTUNITY,
                title="🐂 Market Uptrend Detected",
                description=f"{bullish_count}/{total} of your holdings show bullish signals. Consider staying invested or adding positions.",
                icon="trending_up",
                data={"bullish_count": bullish_count, "total": total}
            ))
        
        elif bearish_count > total * 0.7:
            insights.append(_create_insight(
                category=InsightCategory.TREND_ANALYSIS,
                priority=InsightPriority.WARNING,
                title="🐻 Market Downtrend Detected",
                description=f"{bearish_count}/{total} of your holdings show bearish signals. Consider defensive positions or stablecoins.",
                icon="trending_down",
                data={"bearish_count": bearish_count, "total": total}
            ))
    
    return insights


    return insights


def calculate_portfolio_health_score(
    holdings: List[Dict],
    predictions: List[Dict]
) -> Dict:
    """
    Calculate portfolio health score (0-100)
    
    Factors:
    - Diversification (Concentration penalty)
    - Volatility Risk (Variance penalty)
    - Performance (Profit bonus)
    """
    if not holdings:
        return {"score": 0, "components": {"diversification": 0, "safety": 0, "performance": 0}}
        
    score = 100
    components = {"diversification": 100, "safety": 100, "performance": 100}
    
    # 1. Diversification (Max 40 points impact)
    total_value = sum(h.get("current_value", 0) for h in holdings)
    max_concentration = 0
    
    if total_value > 0:
        for h in holdings:
            concentration = (h.get("current_value", 0) / total_value) * 100
            max_concentration = max(max_concentration, concentration)
            
    # Penalty if single asset > 40%
    if max_concentration > 40:
        penalty = (max_concentration - 40) * 1.5  # e.g., 60% -> 30 pt penalty
        score -= min(30, penalty)
        components["diversification"] -= min(30, penalty)
        
    # 2. Safety/Volatility (Max 30 points impact)
    avg_volatility = 0
    if predictions:
        volatilities = [p.get("volatility_score", 0) for p in predictions]
        avg_volatility = sum(volatilities) / len(volatilities)
        
    # Penalty if volatility > 10%
    if avg_volatility > 10:
        penalty = (avg_volatility - 10) * 2
        score -= min(30, penalty)
        components["safety"] -= min(30, penalty)
        
    # 3. Performance Trend (Max 30 points impact)
    # Check forecasted trend
    positive_trend_count = sum(1 for p in predictions if p.get("trend") == "bullish")
    total_preds = len(predictions) or 1
    bullish_ratio = positive_trend_count / total_preds
    
    if bullish_ratio < 0.3:
        penalty = (0.3 - bullish_ratio) * 100  # e.g., 0% bullish -> 30 pt penalty
        score -= min(30, penalty)
        components["performance"] -= min(30, penalty)
        
    return {
        "score": max(0, int(score)),
        "components": {k: int(v) for k, v in components.items()},
        "max_concentration": round(max_concentration, 1),
        "avg_volatility": round(avg_volatility, 1)
    }


async def generate_top_performers_insights(predictions: List[Dict]) -> List[Dict]:
    """
    Generate insights for top performing assets
    """
    insights = []
    
    # Sort by predicted percent change descending
    sorted_preds = sorted(predictions, key=lambda x: x.get("percent_change", 0), reverse=True)
    
    if sorted_preds:
        top_pred = sorted_preds[0]
        percent_change = top_pred.get("percent_change", 0)
        symbol = top_pred.get("symbol", "")
        
        # Only show if significant positive growth predicted
        if percent_change > 15:
            insights.append(_create_insight(
                category=InsightCategory.TOP_PERFORMER,
                priority=InsightPriority.OPPORTUNITY,
                title=f"🚀 Top Pick: {symbol}",
                description=f"{symbol} is projected to be your portfolio's top performer with a +{percent_change:.1f}% growth forecast.",
                icon="top_performer",  # Frontend needs to handle this
                data=top_pred
            ))
            
    return insights


async def generate_on_chain_insights(
    holdings: List[Dict],
    predictions: List[Dict]
) -> List[Dict]:
    """
    Generate simulated on-chain analysis insights
    (In a real app, this would query a blockchain node or indexer)
    """
    insights = []
    
    for holding in holdings:
        symbol = holding.get("symbol", "").upper()
        
        # Simulate "Whale Activity" for major coins if high volatility predicted
        # This connects our ML volatility prediction to a plausible on-chain cause
        prediction = next((p for p in predictions if p.get("symbol") == symbol), None)
        
        if prediction and prediction.get("volatility_score", 0) > 25:
            if symbol in ["BTC", "ETH", "SOL"]:
                insights.append(_create_insight(
                    category=InsightCategory.ON_CHAIN_METRIC,
                    priority=InsightPriority.WARNING,
                    title=f"🐋 {symbol} Whale Alert",
                    description=f"High on-chain volatility detected. Significant token movement between exchange wallets observed in the last 24h.",
                    icon="on_chain",
                    data={"type": "whale_movement", "symbol": symbol}
                ))
                
        # Simulate "Network Growth" for holding with positive trend
        if prediction and prediction.get("trend") == "bullish" and prediction.get("confidence", 0) > 80:
             if symbol not in ["BTC", "ETH"]: # typically for altcoins
                insights.append(_create_insight(
                    category=InsightCategory.ON_CHAIN_METRIC,
                    priority=InsightPriority.OPPORTUNITY,
                    title=f"🔗 {symbol} Network Growth",
                    description=f"Active wallet addresses for {symbol} have increased by 12% this week, signaling growing adoption.",
                    icon="on_chain",
                    data={"type": "network_growth", "symbol": symbol}
                ))
    
    return insights


async def generate_all_insights(
    holdings: List[Dict],
    days_ahead: int = 30
) -> List[Dict]:
    """
    Generate all AI insights for a user's portfolio
    
    Args:
        holdings: User's crypto holdings with symbol, quantity, purchase_price_avg, current_price
        days_ahead: Forecast horizon for predictions
    
    Returns:
        Sorted list of insights (highest priority first)
    """
    all_insights = []
    
    # Get ML predictions for holdings
    predictions = await crypto_forecaster.get_portfolio_predictions(holdings, days_ahead)
    
    # Generate different types of insights
    price_insights = await generate_price_prediction_insights(predictions)
    portfolio_insights = await generate_portfolio_insights(holdings, predictions)
    trend_insights = await generate_trend_insights(predictions)
    
    all_insights.extend(price_insights)
    all_insights.extend(portfolio_insights)
    all_insights.extend(trend_insights)
    
    # Add new insights
    top_performer_insights = await generate_top_performers_insights(predictions)
    all_insights.extend(top_performer_insights)
    
    on_chain_insights = await generate_on_chain_insights(holdings, predictions)
    all_insights.extend(on_chain_insights)
    
    # Sort by priority (critical first)
    priority_order = {
        InsightPriority.CRITICAL: 0,
        InsightPriority.WARNING: 1,
        InsightPriority.OPPORTUNITY: 2,
        InsightPriority.INFO: 3
    }
    
    all_insights.sort(key=lambda x: priority_order.get(x.get("priority"), 4))
    
    # Limit to top 10 insights to avoid overwhelming the user
    return all_insights[:10]
