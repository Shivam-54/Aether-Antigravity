"""
Property Price Forecaster using Prophet
Predicts future property values based on historical trends
"""

from prophet import Prophet
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import pickle
import os


class PropertyPriceForecaster:
    """
    Uses Facebook Prophet to forecast property prices.
    Simple implementation that works well with limited historical data.
    """
    
    def __init__(self):
        self.model = None
        self.model_path = os.path.join(
            os.path.dirname(__file__), 
            '../models/price_predictor_v1.pkl'
        )
    
    def prepare_data(self, property_data: Dict) -> pd.DataFrame:
        """
        Convert property data to Prophet format
        
        Args:
            property_data: Dict with 'purchase_date', 'purchase_price', 'current_value'
        
        Returns:
            DataFrame with columns ['ds', 'y'] for Prophet
        """
        # Create time series from purchase to present
        purchase_date = pd.to_datetime(property_data['purchase_date'])
        purchase_price = property_data['purchase_price']
        current_value = property_data['current_value']
        
        # Create data points: purchase date and today
        today = pd.Timestamp.now()
        
        df = pd.DataFrame({
            'ds': [purchase_date, today],
            'y': [purchase_price, current_value]
        })
        
        # Add intermediate points if property is old enough (linear interpolation)
        days_held = (today - purchase_date).days
        if days_held > 180:
            # Add quarterly checkpoints
            num_quarters = days_held // 90
            for i in range(1, num_quarters):
                checkpoint_date = purchase_date + timedelta(days=90 * i)
                # Linear interpolation for intermediate values
                progress = (checkpoint_date - purchase_date).days / days_held
                interpolated_value = purchase_price + (current_value - purchase_price) * progress
                
                df = pd.concat([df, pd.DataFrame({
                    'ds': [checkpoint_date],
                    'y': [interpolated_value]
                })], ignore_index=True)
        
        return df.sort_values('ds').reset_index(drop=True)
    
    def train_model(self, property_data: Dict):
        """
        Train Prophet model on property data
        
        Args:
            property_data: Property information for training
        """
        df = self.prepare_data(property_data)
        
        # Initialize Prophet with conservative settings
        self.model = Prophet(
            yearly_seasonality=True,
            weekly_seasonality=False,
            daily_seasonality=False,
            changepoint_prior_scale=0.05,  # Conservative trend changes
            seasonality_prior_scale=10.0,
            interval_width=0.80  # 80% confidence interval
        )
        
        # Train the model
        self.model.fit(df)
    
    def predict(
        self, 
        property_data: Dict, 
        days_ahead: int = 90
    ) -> Dict:
        """
        Predict future property value
        
        Args:
            property_data: Current property information
            days_ahead: Number of days to forecast (default 90)
        
        Returns:
            Dict with prediction, confidence intervals, and factors
        """
        # Train model on this property's data
        self.train_model(property_data)
        
        # Create future dataframe
        future = self.model.make_future_dataframe(periods=days_ahead)
        forecast = self.model.predict(future)
        
        # Get the final prediction
        final_prediction = forecast.iloc[-1]
        current_value = property_data['current_value']
        predicted_value = final_prediction['yhat']
        
        # Calculate growth metrics
        absolute_change = predicted_value - current_value
        percent_change = (absolute_change / current_value) * 100
        
        # Determine trend
        if percent_change > 2:
            trend = "positive"
        elif percent_change < -2:
            trend = "negative"
        else:
            trend = "stable"
        
        return {
            "current_value": float(current_value),
            "predicted_value": float(predicted_value),
            "confidence_lower": float(final_prediction['yhat_lower']),
            "confidence_upper": float(final_prediction['yhat_upper']),
            "prediction_date": (pd.Timestamp.now() + timedelta(days=days_ahead)).strftime('%Y-%m-%d'),
            "absolute_change": float(absolute_change),
            "percent_change": round(percent_change, 2),
            "trend": trend,
            "confidence_score": 75,  # Default confidence
            "factors": {
                "market_trend": trend,
                "days_held": (pd.Timestamp.now() - pd.to_datetime(property_data['purchase_date'])).days,
                "annualized_growth": round((percent_change / days_ahead) * 365, 2)
            }
        }
    
    def predict_multi_horizon(
        self, 
        property_data: Dict
    ) -> Dict[str, Dict]:
        """
        Predict property value at multiple time horizons
        
        Returns:
            Dict with predictions for 30, 90, 180, 365 days
        """
        horizons = {
            "30_days": 30,
            "90_days": 90,
            "180_days": 180,
            "365_days": 365
        }
        
        results = {}
        for label, days in horizons.items():
            results[label] = self.predict(property_data, days_ahead=days)
        
        return results
    
    def save_model(self):
        """Save trained model to disk"""
        if self.model:
            os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
            with open(self.model_path, 'wb') as f:
                pickle.dump(self.model, f)
    
    def load_model(self):
        """Load trained model from disk"""
        if os.path.exists(self.model_path):
            with open(self.model_path, 'rb') as f:
                self.model = pickle.load(f)
