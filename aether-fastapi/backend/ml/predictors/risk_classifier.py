"""
XGBoost Risk Classifier
Predicts cryptocurrency risk level (Low/Medium/High) based on risk features
"""

import xgboost as xgb
import numpy as np
import pandas as pd
from typing import Dict, Tuple, Optional
from sklearn.preprocessing import StandardScaler
import pickle
import os
import warnings
warnings.filterwarnings('ignore')


class CryptoRiskClassifier:
    """XGBoost-based risk classifier for cryptocurrencies"""
    
    # Risk level thresholds (based on volatility %)
    LOW_RISK_THRESHOLD = 20.0
    MEDIUM_RISK_THRESHOLD = 50.0
    
    def __init__(self, model_dir: str = 'ml/models'):
        self.model = None
        self.scaler = StandardScaler()
        self.model_dir = model_dir
        self.feature_names = []
        self.model_trained = False
        
        # XGBoost parameters
        self.params = {
            'objective': 'multi:softprob',
            'num_class': 3,
            'max_depth': 5,
            'learning_rate': 0.1,
            'n_estimators': 100,
            'eval_metric': 'mlogloss',
            'random_state': 42
        }
    
    def _create_risk_labels(self, volatility: np.ndarray) -> np.ndarray:
        """
        Create risk labels based on volatility thresholds
        
        Args:
            volatility: Array of volatility values
            
        Returns:
            Risk labels: 0=Low, 1=Medium, 2=High
        """
        labels = np.zeros(len(volatility), dtype=int)
        labels[volatility >= self.LOW_RISK_THRESHOLD] = 1  # Medium
        labels[volatility >= self.MEDIUM_RISK_THRESHOLD] = 2  # High
        return labels
    
    def train(
        self, 
        X: np.ndarray, 
        volatility: np.ndarray,
        feature_names: list
    ) -> Dict:
        """
        Train XGBoost risk classifier
        
        Args:
            X: Feature matrix (n_samples, n_features)
            volatility: Target volatility values for labeling
            feature_names: List of feature names
            
        Returns:
            Training metrics dictionary
        """
        self.feature_names = feature_names
        
        # Create risk labels from volatility
        y = self._create_risk_labels(volatility)
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Split train/validation (80/20)
        split_idx = int(0.8 * len(X_scaled))
        X_train, X_val = X_scaled[:split_idx], X_scaled[split_idx:]
        y_train, y_val = y[:split_idx], y[split_idx:]
        
        # Train XGBoost classifier
        self.model = xgb.XGBClassifier(**self.params)
        self.model.fit(
            X_train, y_train,
            eval_set=[(X_val, y_val)],
            verbose=False
        )
        
        # Calculate accuracy
        train_acc = self.model.score(X_train, y_train)
        val_acc = self.model.score(X_val, y_val)
        
        self.model_trained = True
        
        return {
            'train_accuracy': float(train_acc),
            'val_accuracy': float(val_acc),
            'n_samples': len(X),
            'feature_count': len(feature_names)
        }
    
    def predict(self, features: Dict[str, float]) -> Dict:
        """
        Predict risk level for given features
        
        Args:
            features: Dictionary of risk features
            
        Returns:
            Dict with risk_level, risk_score, and probabilities
        """
        if not self.model_trained:
            # If model not trained, use simple volatility-based classification
            return self._fallback_prediction(features)
        
        # Convert features to array
        X = np.array([features[name] for name in self.feature_names]).reshape(1, -1)
        X_scaled = self.scaler.transform(X)
        
        # Get predictions
        probabilities = self.model.predict_proba(X_scaled)[0]
        prediction = self.model.predict(X_scaled)[0]
        
        # Map prediction to risk level
        risk_levels = ['Low', 'Medium', 'High']
        risk_level = risk_levels[prediction]
        
        # Calculate risk score (0-100)
        # Weighted average: Low=25, Medium=50, High=85
        risk_score = (probabilities[0] * 25 + 
                     probabilities[1] * 55 + 
                     probabilities[2] * 85)
        
        return {
            'risk_level': risk_level,
            'risk_score': float(risk_score),
            'probabilities': {
                'low': float(probabilities[0]),
                'medium': float(probabilities[1]),
                'high': float(probabilities[2])
            },
            'model_trained': True
        }
    
    def _fallback_prediction(self, features: Dict[str, float]) -> Dict:
        """Fallback prediction using simple volatility thresholds"""
        volatility = features.get('historical_volatility', 30.0)
        
        if volatility < self.LOW_RISK_THRESHOLD:
            risk_level = 'Low'
            probabilities = {'low': 0.8, 'medium': 0.15, 'high': 0.05}
            risk_score = 25.0
        elif volatility < self.MEDIUM_RISK_THRESHOLD:
            risk_level = 'Medium'
            probabilities = {'low': 0.15, 'medium': 0.7, 'high': 0.15}
            risk_score = 55.0
        else:
            risk_level = 'High'
            probabilities = {'low': 0.05, 'medium': 0.2, 'high': 0.75}
            risk_score = 85.0
        
        return {
            'risk_level': risk_level,
            'risk_score': risk_score,
            'probabilities': probabilities,
            'model_trained': False
        }
    
    def get_feature_importance(self) -> Dict[str, float]:
        """
        Get feature importance scores
        
        Returns:
            Dictionary mapping feature names to importance scores
        """
        if not self.model_trained:
            return {}
        
        importance = self.model.feature_importances_
        
        # Sort by importance
        feature_importance = {
            name: float(score) 
            for name, score in zip(self.feature_names, importance)
        }
        
        # Sort descending
        sorted_importance = dict(
            sorted(feature_importance.items(), key=lambda x: x[-1], reverse=True)
        )
        
        return sorted_importance
    
    def get_top_risk_factors(self, features: Dict[str, float], top_n: int = 3) -> list:
        """
        Get top risk factors with their values and importance
        
        Args:
            features: Current feature values
            top_n: Number of top factors to return
            
        Returns:
            List of dicts with factor name, value, and impact
        """
        importance = self.get_feature_importance()
        
        if not importance:
            # Fallback to top volatility features
            return [
                {'factor': 'historical_volatility', 
                 'impact': features.get('historical_volatility', 0) / 100},
                {'factor': 'max_drawdown',
                 'impact': features.get('max_drawdown', 0) / 100},
                {'factor': 'sharp_moves_pct',
                 'impact': features.get('sharp_moves_pct', 0) / 100}
            ]
        
        # Get top N features by importance
        top_factors = []
        for i, (name, score) in enumerate(importance.items()):
            if i >= top_n:
                break
            
            top_factors.append({
                'factor': name,
                'value': features.get(name, 0),
                'impact': score
            })
        
        return top_factors
    
    def save_model(self, filename: str = 'risk_classifier.pkl'):
        """Save trained model to disk"""
        if not self.model_trained:
            print("No trained model to save")
            return
        
        os.makedirs(self.model_dir, exist_ok=True)
        filepath = os.path.join(self.model_dir, filename)
        
        model_data = {
            'model': self.model,
            'scaler': self.scaler,
            'feature_names': self.feature_names,
            'params': self.params
        }
        
        with open(filepath, 'wb') as f:
            pickle.dump(model_data, f)
        
        print(f"Model saved to {filepath}")
    
    def load_model(self, filename: str = 'risk_classifier.pkl') -> bool:
        """Load trained model from disk"""
        filepath = os.path.join(self.model_dir, filename)
        
        if not os.path.exists(filepath):
            print(f"Model file not found: {filepath}")
            return False
        
        try:
            with open(filepath, 'rb') as f:
                model_data = pickle.load(f)
            
            self.model = model_data['model']
            self.scaler = model_data['scaler']
            self.feature_names = model_data['feature_names']
            self.params = model_data['params']
            self.model_trained = True
            
            print(f"Model loaded from {filepath}")
            return True
        except Exception as e:
            print(f"Error loading model: {e}")
            return False
