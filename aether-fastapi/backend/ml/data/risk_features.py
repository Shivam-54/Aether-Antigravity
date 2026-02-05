"""
Risk Feature Engineering Module
Calculates risk-specific features for XGBoost risk classification
"""

import pandas as pd
import numpy as np
from typing import Dict, List
import warnings
warnings.filterwarnings('ignore')


class RiskFeatureEngineer:
    """Engineer risk features from cryptocurrency price/volume data"""
    
    def __init__(self):
        self.feature_names = []
    
    def calculate_returns(self, df: pd.DataFrame) -> pd.Series:
        """Calculate daily returns"""
        return df['price'].pct_change()
    
    def calculate_volatility_features(self, df: pd.DataFrame) -> Dict[str, float]:
        """
        Calculate volatility-based risk features
        
        Features:
        - historical_volatility: 30-day rolling std of returns (annualized)
        - ewm_volatility: Exponentially weighted volatility
        - volatility_ratio: Current vs average volatility
        """
        returns = self.calculate_returns(df)
        
        # Historical volatility (30-day, annualized)
        hist_vol = returns.rolling(window=30).std() * np.sqrt(365) * 100
        current_hist_vol = hist_vol.iloc[-1] if not hist_vol.empty else 0
        
        # Exponentially weighted volatility
        ewm_vol = returns.ewm(span=30).std() * np.sqrt(365) * 100
        current_ewm_vol = ewm_vol.iloc[-1] if not ewm_vol.empty else 0
        
        # Volatility ratio (current vs 90-day average)
        avg_vol = hist_vol.rolling(window=90).mean()
        vol_ratio = (current_hist_vol / avg_vol.iloc[-1]) if avg_vol.iloc[-1] > 0 else 1.0
        
        return {
            'historical_volatility': float(current_hist_vol),
            'ewm_volatility': float(current_ewm_vol),
            'volatility_ratio': float(vol_ratio)
        }
    
    def calculate_volume_features(self, df: pd.DataFrame) -> Dict[str, float]:
        """
        Calculate volume-based risk features
        
        Features:
        - volume_volatility: Std of volume changes
        - volume_trend: 7-day vs 30-day average ratio
        - volume_spike: Recent volume vs average
        """
        if 'volume' not in df.columns:
            return {
                'volume_volatility': 0.0,
                'volume_trend': 1.0,
                'volume_spike': 1.0
            }
        
        volume = df['volume']
        
        # Volume volatility
        volume_changes = volume.pct_change()
        vol_volatility = volume_changes.rolling(window=30).std() * 100
        current_vol_vol = vol_volatility.iloc[-1] if not vol_volatility.empty else 0
        
        # Volume trend (7-day vs 30-day)
        vol_7d = volume.rolling(window=7).mean().iloc[-1]
        vol_30d = volume.rolling(window=30).mean().iloc[-1]
        vol_trend = (vol_7d / vol_30d) if vol_30d > 0 else 1.0
        
        # Volume spike (current vs 30-day average)
        current_vol = volume.iloc[-1]
        avg_vol = volume.rolling(window=30).mean().iloc[-1]
        vol_spike = (current_vol / avg_vol) if avg_vol > 0 else 1.0
        
        return {
            'volume_volatility': float(current_vol_vol),
            'volume_trend': float(vol_trend),
            'volume_spike': float(vol_spike)
        }
    
    def calculate_price_features(self, df: pd.DataFrame) -> Dict[str, float]:
        """
        Calculate price-based risk features
        
        Features:
        - drawdown: Peak to current decline percentage
        - sharp_moves: Count of daily changes > 5%
        - price_acceleration: 2nd derivative of price
        """
        prices = df['price']
        returns = self.calculate_returns(df)
        
        # Maximum drawdown (30-day)
        rolling_max = prices.rolling(window=30, min_periods=1).max()
        drawdown = ((prices - rolling_max) / rolling_max) * 100
        max_drawdown = abs(drawdown.min())
        
        # Sharp price movements (>5% in 30 days)
        sharp_moves = (abs(returns) > 0.05).rolling(window=30).sum().iloc[-1]
        sharp_moves_pct = (sharp_moves / 30) * 100  # As percentage
        
        # Price acceleration (2nd derivative)
        price_change = prices.diff()
        acceleration = price_change.diff()
        recent_acceleration = abs(acceleration.iloc[-1]) if not acceleration.empty else 0
        
        return {
            'max_drawdown': float(max_drawdown),
            'sharp_moves_pct': float(sharp_moves_pct),
            'price_acceleration': float(recent_acceleration)
        }
    
    def calculate_correlation_features(
        self, 
        df: pd.DataFrame, 
        btc_df: pd.DataFrame = None
    ) -> Dict[str, float]:
        """
        Calculate correlation-based risk features
        
        Features:
        - btc_correlation: Correlation with Bitcoin
        - beta: Market beta coefficient
        - correlation_strength: Absolute correlation value
        """
        if btc_df is None or len(btc_df) < 30:
            # If no BTC data, return neutral values
            return {
                'btc_correlation': 0.5,
                'beta_coefficient': 1.0,
                'correlation_strength': 0.5
            }
        
        # Calculate returns for both assets
        asset_returns = self.calculate_returns(df)
        btc_returns = btc_df['price'].pct_change()
        
        # Align data
        min_len = min(len(asset_returns), len(btc_returns))
        asset_returns = asset_returns.iloc[-min_len:]
        btc_returns = btc_returns.iloc[-min_len:]
        
        # Drop NaN values
        combined = pd.DataFrame({
            'asset': asset_returns.values,
            'btc': btc_returns.values
        }).dropna()
        
        if len(combined) < 10:
            return {
                'btc_correlation': 0.5,
                'beta_coefficient': 1.0,
                'correlation_strength': 0.5
            }
        
        # Correlation with BTC
        correlation = combined['asset'].corr(combined['btc'])
        
        # Beta coefficient (Cov(asset, market) / Var(market))
        covariance = combined['asset'].cov(combined['btc'])
        market_variance = combined['btc'].var()
        beta = (covariance / market_variance) if market_variance > 0 else 1.0
        
        return {
            'btc_correlation': float(correlation),
            'beta_coefficient': float(beta),
            'correlation_strength': float(abs(correlation))
        }
    
    def engineer_features(
        self, 
        df: pd.DataFrame,
        btc_df: pd.DataFrame = None
    ) -> Dict[str, float]:
        """
        Calculate all risk features for a cryptocurrency
        
        Args:
            df: DataFrame with 'price' and 'volume' columns
            btc_df: Optional Bitcoin DataFrame for correlation features
            
        Returns:
            Dictionary of risk features
        """
        features = {}
        
        # Volatility features
        features.update(self.calculate_volatility_features(df))
        
        # Volume features
        features.update(self.calculate_volume_features(df))
        
        # Price features
        features.update(self.calculate_price_features(df))
        
        # Correlation features
        features.update(self.calculate_correlation_features(df, btc_df))
        
        # Store feature names
        self.feature_names = list(features.keys())
        
        return features
    
    def get_feature_vector(self, features: Dict[str, float]) -> np.ndarray:
        """Convert feature dict to numpy array (for model input)"""
        return np.array([features[name] for name in self.feature_names]).reshape(1, -1)


# Utility function for quick feature generation
def generate_risk_features(
    price_data: pd.DataFrame,
    btc_data: pd.DataFrame = None
) -> Dict[str, float]:
    """
    Quick utility to generate risk features
    
    Args:
        price_data: DataFrame with 'price' and 'volume'
        btc_data: Optional BTC DataFrame for correlation
        
    Returns:
        Risk features dictionary
    """
    engineer = RiskFeatureEngineer()
    return engineer.engineer_features(price_data, btc_data)
