"""
Crypto Price Forecaster using Prophet
Time-series prediction for cryptocurrency prices with confidence intervals
"""

from prophet import Prophet
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import logging
import asyncio

from services.coingecko_service import (
    fetch_historical_prices,
    calculate_technical_indicators,
    get_coin_id
)

logger = logging.getLogger(__name__)


class CryptoPriceForecaster:
    """
    ML-based cryptocurrency price forecaster using Facebook Prophet.
    
    Features:
    - Time-series decomposition (trend, seasonality)
    - Uncertainty quantification (confidence intervals)
    - Technical indicator integration
    - Multi-horizon forecasting
    """
    
    def __init__(self):
        self.models: Dict[str, Prophet] = {}
        self.last_trained: Dict[str, datetime] = {}
        self.cache_duration_hours = 6  # Retrain if older than this
    
    def _needs_retraining(self, symbol: str) -> bool:
        """Check if model needs retraining based on cache duration"""
        if symbol not in self.last_trained:
            return True
        elapsed = datetime.now() - self.last_trained[symbol]
        return elapsed.total_seconds() > (self.cache_duration_hours * 3600)
    
    def _prepare_prophet_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Convert historical data to Prophet format
        
        Args:
            df: DataFrame with 'date' and 'price' columns
        
        Returns:
            DataFrame with 'ds' and 'y' columns for Prophet
        """
        prophet_df = pd.DataFrame({
            "ds": df["date"],
            "y": df["price"]
        })
        return prophet_df
    
    async def train_model(self, symbol: str, days: int = 365) -> bool:
        """
        Train Prophet model on historical data for a specific cryptocurrency
        
        Args:
            symbol: Crypto symbol (e.g., "BTC")
            days: Days of historical data to use
        
        Returns:
            True if training successful, False otherwise
        """
        # Fetch historical data
        df = await fetch_historical_prices(symbol, days=days)
        if df is None or len(df) < 30:
            logger.warning(f"Insufficient data for {symbol}: {len(df) if df is not None else 0} days")
            return False
        
        # Prepare data for Prophet
        prophet_df = self._prepare_prophet_data(df)
        
        # Initialize Prophet with crypto-optimized settings
        model = Prophet(
            yearly_seasonality=True,
            weekly_seasonality=True,
            daily_seasonality=False,
            changepoint_prior_scale=0.1,  # Higher for volatile crypto
            seasonality_prior_scale=10.0,
            interval_width=0.80,  # 80% confidence interval
            mcmc_samples=0  # Faster, less accurate (use >0 for production)
        )
        
        # Add custom seasonality for crypto (24/7 market)
        model.add_seasonality(name="monthly", period=30.5, fourier_order=5)
        
        try:
            # Train the model (suppress Prophet's verbose output)
            model.fit(prophet_df)
            
            # Store model
            self.models[symbol] = model
            self.last_trained[symbol] = datetime.now()
            
            logger.info(f"Successfully trained model for {symbol}")
            return True
        
        except Exception as e:
            logger.error(f"Training failed for {symbol}: {str(e)}")
            return False
    
    async def predict(
        self,
        symbol: str,
        days_ahead: int = 30,
        force_retrain: bool = False
    ) -> Optional[Dict]:
        """
        Generate price prediction for a cryptocurrency
        
        Args:
            symbol: Crypto symbol (e.g., "BTC")
            days_ahead: Forecast horizon in days
            force_retrain: Force model retraining
        
        Returns:
            Dict with prediction, confidence intervals, and analysis
        """
        symbol = symbol.upper().strip()
        
        # Check if we need to train/retrain
        if force_retrain or self._needs_retraining(symbol):
            success = await self.train_model(symbol)
            if not success:
                return None
        
        model = self.models.get(symbol)
        if model is None:
            return None
        
        try:
            # Create future dataframe
            future = model.make_future_dataframe(periods=days_ahead)
            forecast = model.predict(future)
            
            # Get current and predicted values
            current_row = forecast.iloc[-days_ahead - 1] if len(forecast) > days_ahead else forecast.iloc[0]
            predicted_row = forecast.iloc[-1]
            
            current_price = float(current_row["yhat"])
            predicted_price = float(predicted_row["yhat"])
            confidence_lower = float(predicted_row["yhat_lower"])
            confidence_upper = float(predicted_row["yhat_upper"])
            
            # Calculate metrics
            absolute_change = predicted_price - current_price
            percent_change = (absolute_change / current_price) * 100 if current_price > 0 else 0
            
            # Determine trend
            trend_component = float(predicted_row["trend"]) - float(current_row["trend"])
            if percent_change > 5:
                trend = "bullish"
                trend_confidence = min(85, 50 + abs(percent_change))
            elif percent_change < -5:
                trend = "bearish"
                trend_confidence = min(85, 50 + abs(percent_change))
            else:
                trend = "neutral"
                trend_confidence = 60
            
            # Calculate volatility from prediction interval
            prediction_range = confidence_upper - confidence_lower
            volatility_score = (prediction_range / predicted_price) * 100 if predicted_price > 0 else 0
            
            return {
                "symbol": symbol,
                "current_price": round(current_price, 2),
                "predicted_price": round(predicted_price, 2),
                "confidence_lower": round(confidence_lower, 2),
                "confidence_upper": round(confidence_upper, 2),
                "absolute_change": round(absolute_change, 2),
                "percent_change": round(percent_change, 2),
                "prediction_date": (datetime.now() + timedelta(days=days_ahead)).strftime("%Y-%m-%d"),
                "days_ahead": days_ahead,
                "trend": trend,
                "trend_confidence": round(trend_confidence, 1),
                "volatility_score": round(volatility_score, 2),
                "model_trained_at": self.last_trained.get(symbol, datetime.now()).isoformat(),
                "confidence_interval": 80  # 80% CI
            }
        
        except Exception as e:
            logger.error(f"Prediction failed for {symbol}: {str(e)}")
            return None
    
    async def predict_multi_horizon(
        self,
        symbol: str,
        horizons: List[int] = [7, 30, 90]
    ) -> Dict[str, Dict]:
        """
        Generate predictions at multiple time horizons
        
        Args:
            symbol: Crypto symbol
            horizons: List of days to forecast
        
        Returns:
            Dict mapping horizon label to prediction
        """
        results = {}
        
        for days in horizons:
            prediction = await self.predict(symbol, days_ahead=days)
            if prediction:
                results[f"{days}_days"] = prediction
        
        return results
    
    async def predict_series(
        self,
        symbol: str,
        days_ahead: int = 30
    ) -> List[Dict]:
        """
        Generate daily price predictions for a cryptocurrency (time series)
        
        Args:
            symbol: Crypto symbol
            days_ahead: Forecast horizon
        
        Returns:
            List of daily prediction objects
        """
        symbol = symbol.upper().strip()
        
        # Ensure model is trained
        if self._needs_retraining(symbol):
            success = await self.train_model(symbol)
            if not success:
                return []
        
        model = self.models.get(symbol)
        if model is None:
            return []
        
        try:
            # Create future dataframe
            future = model.make_future_dataframe(periods=days_ahead)
            forecast = model.predict(future)
            
            # Filter for future dates only (last days_ahead points)
            future_forecast = forecast.tail(days_ahead)
            
            series = []
            for _, row in future_forecast.iterrows():
                series.append({
                    "date": row["ds"].strftime("%Y-%m-%d"),
                    "predicted_price": float(row["yhat"]),
                    "confidence_lower": float(row["yhat_lower"]),
                    "confidence_upper": float(row["yhat_upper"]),
                    "trend": float(row["trend"])
                })
            
            return series
            
        except Exception as e:
            logger.error(f"Series prediction failed for {symbol}: {str(e)}")
            return []

    async def get_portfolio_series_prediction(
        self,
        holdings: List[Dict],
        days_ahead: int = 30
    ) -> Dict:
        """
        Generate aggregated portfolio value forecast series
        
        Args:
            holdings: List of holdings with 'symbol' and 'quantity'
            days_ahead: Forecast horizon
            
        Returns:
            Dict containing aggregated time series and total current value
        """
        daily_totals = {}  # date -> {total, lower, upper}
        
        # Initialize dates
        start_date = datetime.now()
        dates = [(start_date + timedelta(days=i+1)).strftime("%Y-%m-%d") for i in range(days_ahead)]
        
        for date in dates:
            daily_totals[date] = {
                "date": date,
                "predicted_value": 0.0,
                "confidence_lower": 0.0,
                "confidence_upper": 0.0
            }
            
        for holding in holdings:
            symbol = holding.get("symbol", "").upper()
            quantity = float(holding.get("quantity", 0))
            
            # Get series for this asset
            series = await self.predict_series(symbol, days_ahead)
            
            if series:
                for point in series:
                    date = point["date"]
                    if date in daily_totals:
                        daily_totals[date]["predicted_value"] += point["predicted_price"] * quantity
                        daily_totals[date]["confidence_lower"] += point["confidence_lower"] * quantity
                        daily_totals[date]["confidence_upper"] += point["confidence_upper"] * quantity
        
        # Convert to sorted list
        series_list = [daily_totals[date] for date in dates]
        
        # Round values
        for point in series_list:
            point["predicted_value"] = round(point["predicted_value"], 2)
            point["confidence_lower"] = round(point["confidence_lower"], 2)
            point["confidence_upper"] = round(point["confidence_upper"], 2)
            
        return {
            "series": series_list,
            "days_ahead": days_ahead
        }

    async def get_portfolio_predictions(
        self,
        holdings: List[Dict],
        days_ahead: int = 30
    ) -> List[Dict]:
        """
        Generate predictions for a user's crypto portfolio
        
        Args:
            holdings: List of holdings with 'symbol' and 'quantity' keys
            days_ahead: Forecast horizon
        
        Returns:
            List of predictions with portfolio context
        """
        predictions = []
        
        for holding in holdings:
            symbol = holding.get("symbol", "").upper()
            quantity = float(holding.get("quantity", 0))
            
            prediction = await self.predict(symbol, days_ahead=days_ahead)
            
            if prediction:
                # Add portfolio context
                current_value = prediction["current_price"] * quantity
                predicted_value = prediction["predicted_price"] * quantity
                
                prediction["quantity"] = quantity
                prediction["current_value"] = round(current_value, 2)
                prediction["predicted_value"] = round(predicted_value, 2)
                prediction["value_change"] = round(predicted_value - current_value, 2)
                
                predictions.append(prediction)
        
        return predictions


# Singleton instance
crypto_forecaster = CryptoPriceForecaster()
