"""
Multi-Model Stock Price Predictor
Combines Prophet (60%) and ARIMA (40%) for ensemble forecasting
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import yfinance as yf
from prophet import Prophet
from statsmodels.tsa.arima.model import ARIMA
import warnings
warnings.filterwarnings('ignore')


class PricePredictor:
    def __init__(self, ticker: str, horizon_days: int = 30):
        self.ticker = ticker.upper()
        self.horizon_days = horizon_days
        self.historical_data = None
        self.prophet_model = None
        self.arima_model = None
        
    def fetch_historical_data(self, period='1y'):
        """Fetch historical stock data using yfinance"""
        stock = yf.Ticker(self.ticker)
        self.historical_data = stock.history(period=period)
        
        if self.historical_data.empty:
            raise ValueError(f"No data found for ticker {self.ticker}")
        
        return self.historical_data
    
    def train_prophet(self):
        """Train Facebook Prophet model"""
        # Prepare data for Prophet (needs 'ds' and 'y' columns)
        df = pd.DataFrame({
            'ds': self.historical_data.index.tz_localize(None) if self.historical_data.index.tz else self.historical_data.index,
            'y': self.historical_data['Close'].values
        })
        
        # Train Prophet
        self.prophet_model = Prophet(
            daily_seasonality=True,
            weekly_seasonality=True,
            yearly_seasonality=True,
            interval_width=0.95
        )
        self.prophet_model.fit(df)
        
        return self.prophet_model
    
    def train_arima(self):
        """Train ARIMA model"""
        # Use order (5,1,0) as a reasonable default for stock prices
        self.arima_model = ARIMA(
            self.historical_data['Close'].values,
            order=(5, 1, 0)
        )
        self.arima_model = self.arima_model.fit()
        
        return self.arima_model
    
    def predict_ensemble(self):
        """Generate ensemble predictions (Prophet 60% + ARIMA 40%)"""
        # Generate future dates
        last_date = self.historical_data.index[-1]
        future_dates = pd.date_range(
            start=last_date + timedelta(days=1),
            periods=self.horizon_days,
            freq='D'
        )
        
        # Prophet predictions
        future_df = pd.DataFrame({'ds': pd.to_datetime(future_dates).tz_localize(None)})
        prophet_forecast = self.prophet_model.predict(future_df)
        prophet_pred = prophet_forecast['yhat'].values
        prophet_upper = prophet_forecast['yhat_upper'].values
        prophet_lower = prophet_forecast['yhat_lower'].values
        
        # ARIMA predictions
        arima_forecast = self.arima_model.forecast(steps=self.horizon_days)
        arima_pred = arima_forecast
        
        # Ensemble (weighted average)
        prophet_weight = 0.6
        arima_weight = 0.4
        
        ensemble_pred = (prophet_weight * prophet_pred) + (arima_weight * arima_pred)
        
        # Confidence intervals (using Prophet's intervals, adjusted for ensemble)
        ensemble_upper = (prophet_weight * prophet_upper) + (arima_weight * arima_pred)
        ensemble_lower = (prophet_weight * prophet_lower) + (arima_weight * arima_pred)
        
        return {
            'dates': [d.strftime('%Y-%m-%d') for d in future_dates],
            'predictions': ensemble_pred.tolist(),
            'confidence_upper': ensemble_upper.tolist(),
            'confidence_lower': ensemble_lower.tolist(),
            'prophet_predictions': prophet_pred.tolist(),
            'arima_predictions': arima_pred.tolist()
        }
    
    def calculate_metrics(self, predictions):
        """Calculate accuracy metrics using historical data cross-validation"""
        # Use last 30 days for validation
        train_data = self.historical_data[:-30]
        test_data = self.historical_data[-30:]
        
        if len(test_data) < 30:
            # Not enough data for validation, return placeholder metrics
            return {
                'rmse': 0.0,
                'mae': 0.0,
                'mape': 0.0
            }
        
        # Train on reduced dataset
        temp_predictor = PricePredictor(self.ticker, horizon_days=30)
        temp_predictor.historical_data = train_data
        temp_predictor.train_prophet()
        temp_predictor.train_arima()
        temp_predictions = temp_predictor.predict_ensemble()
        
        # Calculate errors
        actual = test_data['Close'].values
        predicted = np.array(temp_predictions['predictions'][:len(actual)])
        
        rmse = np.sqrt(np.mean((actual - predicted) ** 2))
        mae = np.mean(np.abs(actual - predicted))
        mape = np.mean(np.abs((actual - predicted) / actual)) * 100
        
        return {
            'rmse': float(rmse),
            'mae': float(mae),
            'mape': float(mape)
        }
    
    def run_full_prediction(self):
        """Complete prediction pipeline"""
        # Fetch data
        self.fetch_historical_data()
        
        # Train models
        self.train_prophet()
        self.train_arima()
        
        # Generate predictions
        predictions = self.predict_ensemble()
        
        # Calculate metrics
        metrics = self.calculate_metrics(predictions)
        
        # Get current price and predicted price
        current_price = float(self.historical_data['Close'].iloc[-1])
        predicted_price = float(predictions['predictions'][-1])
        price_change_pct = ((predicted_price - current_price) / current_price) * 100
        
        return {
            'ticker': self.ticker,
            'current_price': round(current_price, 2),
            'predicted_price': round(predicted_price, 2),
            'price_change_pct': round(price_change_pct, 2),
            'horizon_days': self.horizon_days,
            'predictions': predictions,
            'metrics': metrics,
            'model_weights': {
                'prophet': 60,
                'arima': 40
            },
            'forecast_summary': {
                'horizon_days': self.horizon_days,
                'predicted_price': round(predicted_price, 2),
                'price_change_pct': round(price_change_pct, 2)
            }
        }
