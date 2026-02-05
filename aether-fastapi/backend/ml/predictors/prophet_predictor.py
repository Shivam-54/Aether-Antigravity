"""
Prophet-based Price Forecaster
Uses Facebook Prophet for time-series cryptocurrency price predictions
"""

from prophet import Prophet
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List
import warnings
warnings.filterwarnings('ignore')


class ProphetPricePredictor:
    """Facebook Prophet-based cryptocurrency price forecaster"""
    
    def __init__(self):
        self.models = {}  # Cache models by symbol
    
    def predict(
        self,
        df: pd.DataFrame,
        symbol: str,
        horizons: List[int] = [1, 7, 30]
    ) -> Dict:
        """
        Generate price predictions using Prophet
        
        Args:
            df: Historical price data with 'timestamp' and 'price' columns
            symbol: Cryptocurrency symbol
            horizons: Forecast horizons in days
            
        Returns:
            Predictions dict with forecasts and confidence intervals
        """
        # Prepare data for Prophet (requires 'ds' and 'y' columns)
        # Handle both 'date' and 'timestamp' column names
        date_column = 'date' if 'date' in df.columns else 'timestamp'
        prophet_df = pd.DataFrame({
            'ds': pd.to_datetime(df[date_column]),
            'y': df['price'].values
        })
        
        # Initialize and fit Prophet model
        model = Prophet(
            daily_seasonality=True,
            weekly_seasonality=True,
            yearly_seasonality=False,  # Crypto doesn't have yearly patterns
            changepoint_prior_scale=0.05,  # Flexibility for trend changes
            interval_width=0.95  # 95% confidence intervals
        )
        
        # Fit model
        model.fit(prophet_df)
        
        # Cache model
        self.models[symbol] = model
        
        # Create future dataframe for predictions
        max_horizon = max(horizons)
        future = model.make_future_dataframe(periods=max_horizon, freq='D')
        
        # Generate forecast
        forecast = model.predict(future)
        
        # Extract predictions for each horizon
        current_price = float(df['price'].iloc[-1])
        predictions = {}
        
        for horizon in horizons:
            # Get forecast for specific horizon
            idx = len(df) + horizon - 1
            pred_row = forecast.iloc[idx]
            
            predicted_price = float(pred_row['yhat'])
            lower_bound = float(pred_row['yhat_lower'])
            upper_bound = float(pred_row['yhat_upper'])
            
            # Calculate change
            change_pct = ((predicted_price - current_price) / current_price) * 100
            
            predictions[f'{horizon}_day'] = {
                'price': round(predicted_price, 2),
                'confidence_lower': round(lower_bound, 2),
                'confidence_upper': round(upper_bound, 2),
                'change_percent': round(change_pct, 2)
            }
        
        # Calculate model strength (based on R²-like metric)
        y_true = prophet_df['y'].values
        y_pred = forecast['yhat'].iloc[:len(y_true)].values
        
        # Calculate R² score
        ss_res = np.sum((y_true - y_pred) ** 2)
        ss_tot = np.sum((y_true - np.mean(y_true)) ** 2)
        r2 = 1 - (ss_res / ss_tot)
        
        # Calculate RMSE
        rmse = np.sqrt(np.mean((y_true - y_pred) ** 2))
        
        return {
            'symbol': symbol,
            'current_price': round(current_price, 2),
            'predictions': predictions,
            'model_metrics': {
                'model_type': 'Prophet',
                'r2_score': round(float(r2), 4),
                'rmse': round(float(rmse), 2),
                'data_points': len(df),
                'seasonality': self._get_seasonality_strength(forecast)
            },
            'timestamp': datetime.now().isoformat()
        }
    
    def _get_seasonality_strength(self, forecast: pd.DataFrame) -> Dict:
        """Calculate strength of detected seasonality patterns"""
        
        seasonality = {
            'weekly': 0.0,
            'daily': 0.0
        }
        
        # Calculate weekly seasonality strength if available
        if 'weekly' in forecast.columns:
            weekly_impact = forecast['weekly'].std()
            seasonality['weekly'] = round(float(weekly_impact), 2)
        
        # Calculate daily seasonality strength if available  
        if 'daily' in forecast.columns:
            daily_impact = forecast['daily'].std()
            seasonality['daily'] = round(float(daily_impact), 2)
        
        return seasonality
    
    def get_forecast_components(self, symbol: str) -> Dict:
        """
        Get decomposition of forecast into trend and seasonality
        
        Args:
            symbol: Cryptocurrency symbol
            
        Returns:
            Components breakdown
        """
        if symbol not in self.models:
            return {'error': 'Model not trained for this symbol'}
        
        model = self.models[symbol]
        
        # Get recent forecast
        future = model.make_future_dataframe(periods=30, freq='D')
        forecast = model.predict(future)
        
        # Extract components
        components = {
            'trend': forecast['trend'].iloc[-30:].tolist(),
            'weekly': forecast.get('weekly', pd.Series([0] * 30)).iloc[-30:].tolist(),
            'daily': forecast.get('daily', pd.Series([0] * 30)).iloc[-30:].tolist(),
            'dates': forecast['ds'].iloc[-30:].dt.strftime('%Y-%m-%d').tolist()
        }
        
        return components
    
    def get_changepoints(self, symbol: str) -> List[Dict]:
        """
        Get detected regime change points in the time series
        
        Args:
            symbol: Cryptocurrency symbol
            
        Returns:
            List of changepoint dates and magnitudes
        """
        if symbol not in self.models:
            return []
        
        model = self.models[symbol]
        
        # Get changepoints from model
        changepoints = []
        
        if hasattr(model, 'changepoints'):
            cp_dates = model.changepoints
            cp_magnitudes = model.params['delta'].mean(axis=0)
            
            for date, magnitude in zip(cp_dates, cp_magnitudes):
                if abs(magnitude) > 0.01:  # Only significant changes
                    changepoints.append({
                        'date': pd.to_datetime(date).strftime('%Y-%m-%d'),
                        'magnitude': round(float(magnitude), 4)
                    })
        
        return changepoints


# Singleton instance
prophet_predictor = ProphetPricePredictor()
