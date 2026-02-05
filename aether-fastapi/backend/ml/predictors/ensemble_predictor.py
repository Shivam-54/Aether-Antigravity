"""
Ensemble Model Predictor
Combines multiple models (LSTM, Prophet) for improved predictions
"""

import numpy as np
from typing import Dict, List
from datetime import datetime


class EnsemblePredictor:
    """Ensemble predictor combining multiple forecasting models"""
    
    def __init__(self):
        self.model_weights = {
            'lstm': 0.6,  # Higher weight to deep learning
            'prophet': 0.4  # Lower weight to statistical model
        }
    
    def predict(
        self,
        lstm_predictions: Dict,
        prophet_predictions: Dict,
        weights: Dict = None
    ) -> Dict:
        """
        Combine predictions from multiple models
        
        Args:
            lstm_predictions: Predictions from LSTM model
            prophet_predictions: Predictions from Prophet model
            weights: Optional custom weights (default: 0.6 LSTM, 0.4 Prophet)
            
        Returns:
            Ensemble predictions with combined forecasts
        """
        # Use custom weights if provided
        if weights:
            self.model_weights = weights
        
        w_lstm = self.model_weights['lstm']
        w_prophet = self.model_weights['prophet']
        
        # Ensure weights sum to 1
        total_weight = w_lstm + w_prophet
        w_lstm /= total_weight
        w_prophet /= total_weight
        
        # Get symbol and current price
        symbol = lstm_predictions.get('symbol', prophet_predictions.get('symbol'))
        current_price = lstm_predictions.get('current_price', prophet_predictions.get('current_price'))
        
        # Combine predictions for each horizon
        ensemble_predictions = {}
        horizons = ['1_day', '7_day', '30_day']
        
        for horizon in horizons:
            lstm_pred = lstm_predictions['predictions'].get(horizon, {})
            prophet_pred = prophet_predictions['predictions'].get(horizon, {})
            
            if not lstm_pred or not prophet_pred:
                continue
            
            # Weighted average of prices
            lstm_price = lstm_pred.get('price', current_price)
            prophet_price = prophet_pred.get('price', current_price)
            ensemble_price = w_lstm * lstm_price + w_prophet * prophet_price
            
            # Conservative confidence intervals (use widest bounds)
            lstm_lower = lstm_pred.get('confidence_lower', lstm_price * 0.95)
            prophet_lower = prophet_pred.get('confidence_lower', prophet_price * 0.95)
            ensemble_lower = min(lstm_lower, prophet_lower)
            
            lstm_upper = lstm_pred.get('confidence_upper', lstm_price * 1.05)
            prophet_upper = prophet_pred.get('confidence_upper', prophet_price * 1.05)
            ensemble_upper = max(lstm_upper, prophet_upper)
            
            # Calculate change percentage
            change_pct = ((ensemble_price - current_price) / current_price) * 100
            
            ensemble_predictions[horizon] = {
                'price': round(ensemble_price, 2),
                'confidence_lower': round(ensemble_lower, 2),
                'confidence_upper': round(ensemble_upper, 2),
                'change_percent': round(change_pct, 2),
                'component_predictions': {
                    'lstm': round(lstm_price, 2),
                    'prophet': round(prophet_price, 2)
                },
                'weights_used': {
                    'lstm': round(w_lstm, 2),
                    'prophet': round(w_prophet, 2)
                }
            }
        
        # Calculate ensemble confidence (average of model confidences)
        lstm_r2 = lstm_predictions.get('model_metrics', {}).get('val_rmse', 0)
        prophet_r2 = prophet_predictions.get('model_metrics', {}).get('r2_score', 0)
        
        if lstm_r2 > 0:
            lstm_confidence = 1 / (1 + lstm_r2 / 1000)  # Convert RMSE to confidence
        else:
            lstm_confidence = 0.85
        
        prophet_confidence = max(0, min(1, prophet_r2))  # R² is already 0-1
        
        ensemble_confidence = w_lstm * lstm_confidence + w_prophet * prophet_confidence
        
        return {
            'symbol': symbol,
            'current_price': round(current_price, 2),
            'predictions': ensemble_predictions,
            'model_metrics': {
                'model_type': 'Ensemble (LSTM + Prophet)',
                'ensemble_confidence': round(ensemble_confidence, 3),
                'weights': {
                    'lstm': round(w_lstm, 2),
                    'prophet': round(w_prophet, 2)
                },
                'component_metrics': {
                    'lstm': lstm_predictions.get('model_metrics', {}),
                    'prophet': prophet_predictions.get('model_metrics', {})
                }
            },
            'timestamp': datetime.now().isoformat()
        }
    
    def update_weights_by_performance(
        self,
        lstm_mae: float,
        prophet_mae: float
    ):
        """
        Update model weights based on recent performance
        
        Args:
            lstm_mae: LSTM Mean Absolute Error
            prophet_mae: Prophet Mean Absolute Error
        """
        # Inverse weighting (better performance = higher weight)
        if lstm_mae > 0 and prophet_mae > 0:
            lstm_inverse = 1 / lstm_mae
            prophet_inverse = 1 / prophet_mae
            total = lstm_inverse + prophet_inverse
            
            self.model_weights['lstm'] = lstm_inverse / total
            self.model_weights['prophet'] = prophet_inverse / total
        
        # Ensure weights are reasonable (minimum 20% each)
        self.model_weights['lstm'] = max(0.2, min(0.8, self.model_weights['lstm']))
        self.model_weights['prophet'] = max(0.2, min(0.8, self.model_weights['prophet']))
        
        # Normalize
        total = sum(self.model_weights.values())
        for key in self.model_weights:
            self.model_weights[key] /= total
    
    def get_weighted_confidence_interval(
        self,
        predictions: List[Dict]
    ) -> Dict:
        """
        Calculate weighted confidence interval from multiple predictions
        
        Args:
            predictions: List of prediction dicts from different models
            
        Returns:
            Combined confidence interval
        """
        if not predictions:
            return {'lower': 0, 'upper': 0}
        
        # Weighted average of bounds
        total_weight = sum(p.get('weight', 1.0) for p in predictions)
        
        weighted_lower = sum(
            p['confidence_lower'] * p.get('weight', 1.0)
            for p in predictions
        ) / total_weight
        
        weighted_upper = sum(
            p['confidence_upper'] * p.get('weight', 1.0)
            for p in predictions
        ) / total_weight
        
        return {
            'lower': round(weighted_lower, 2),
            'upper': round(weighted_upper, 2)
        }


# Singleton instance
ensemble_predictor = EnsemblePredictor()
