"""
Feature Engineering for Crypto Price Prediction
Calculates technical indicators using the 'ta' library
"""

import pandas as pd
import numpy as np
from ta.momentum import RSIIndicator
from ta.trend import MACD, EMAIndicator
from ta.volatility import BollingerBands
from typing import Dict


class CryptoFeatureEngineer:
    """
    Feature engineering for cryptocurrency ML models
    
    Features:
    - RSI (Relative Strength Index)
    - MACD (Moving Average Convergence Divergence)
    - Bollinger Bands
    - EMA (Exponential Moving Average)
    - Volume indicators
    """
    
    def __init__(self):
        self.feature_columns = []
    
    def add_technical_indicators(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Add technical indicators to the dataframe
        
        Args:
            df: DataFrame with columns ['date', 'price', 'volume']
        
        Returns:
            DataFrame with added technical indicators
        """
        df = df.copy()
        
        # Ensure price and volume are numeric
        df['price'] = pd.to_numeric(df['price'], errors='coerce')
        df['volume'] = pd.to_numeric(df['volume'], errors='coerce')
        
        # RSI (14-period)
        rsi = RSIIndicator(close=df['price'], window=14)
        df['rsi'] = rsi.rsi()
        
        # MACD
        macd = MACD(close=df['price'], window_slow=26, window_fast=12, window_sign=9)
        df['macd'] = macd.macd()
        df['macd_signal'] = macd.macd_signal()
        df['macd_diff'] = macd.macd_diff()
        
        # Bollinger Bands (20-period, 2 std)
        bb = BollingerBands(close=df['price'], window=20, window_dev=2)
        df['bb_high'] = bb.bollinger_hband()
        df['bb_low'] = bb.bollinger_lband()
        df['bb_mid'] = bb.bollinger_mavg()
        df['bb_width'] = (df['bb_high'] - df['bb_low']) / df['bb_mid']
        
        # EMA (7, 21, 50-day)
        ema_7 = EMAIndicator(close=df['price'], window=7)
        ema_21 = EMAIndicator(close=df['price'], window=21)
        ema_50 = EMAIndicator(close=df['price'], window=50)
        
        df['ema_7'] = ema_7.ema_indicator()
        df['ema_21'] = ema_21.ema_indicator()
        df['ema_50'] = ema_50.ema_indicator()
        
        # Volume indicators
        df['volume_sma_7'] = df['volume'].rolling(window=7).mean()
        df['volume_ratio'] = df['volume'] / df['volume_sma_7']
        
        # Price momentum
        df['price_change_1d'] = df['price'].pct_change(1)
        df['price_change_7d'] = df['price'].pct_change(7)
        
        # Store feature column names
        self.feature_columns = [
            'price', 'volume', 'rsi', 'macd', 'macd_signal', 'macd_diff',
            'bb_high', 'bb_low', 'bb_mid', 'bb_width',
            'ema_7', 'ema_21', 'ema_50',
            'volume_sma_7', 'volume_ratio',
            'price_change_1d', 'price_change_7d'
        ]
        
        # Fill NaN values (from indicators that need warmup)
        df = df.bfill().ffill()
        
        return df
    
    def prepare_lstm_sequences(
        self, 
        df: pd.DataFrame, 
        sequence_length: int = 60,
        target_column: str = 'price'
    ) -> Dict:
        """
        Prepare sequences for LSTM training
        
        Args:
            df: DataFrame with features
            sequence_length: Number of timesteps to look back
            target_column: Column to predict
        
        Returns:
            Dictionary with X, y, scaler info
        """
        from sklearn.preprocessing import MinMaxScaler
        
        # Add features if not already present
        if 'rsi' not in df.columns:
            df = self.add_technical_indicators(df)
        
        # Select feature columns
        feature_data = df[self.feature_columns].values
        
        # Normalize features to [0, 1] range
        scaler = MinMaxScaler(feature_range=(0, 1))
        scaled_data = scaler.fit_transform(feature_data)
        
        # Create sequences
        X, y = [], []
        
        for i in range(sequence_length, len(scaled_data)):
            # Input: past 60 days of features
            X.append(scaled_data[i - sequence_length:i])
            
            # Target: next day's price (first column is price)
            y.append(scaled_data[i, 0])  # price is column 0
        
        X = np.array(X)
        y = np.array(y)
        
        return {
            'X': X,
            'y': y,
            'scaler': scaler,
            'feature_columns': self.feature_columns,
            'sequence_length': sequence_length
        }
    
    def calculate_volatility(self, df: pd.DataFrame, window: int = 30) -> float:
        """Calculate annualized volatility"""
        returns = df['price'].pct_change().dropna()
        volatility = returns.rolling(window=window).std().iloc[-1]
        # Annualize (assuming daily data)
        annualized_volatility = volatility * np.sqrt(365)
        return annualized_volatility
    
    def calculate_sharpe_ratio(
        self, 
        df: pd.DataFrame, 
        risk_free_rate: float = 0.02
    ) -> float:
        """Calculate Sharpe ratio"""
        returns = df['price'].pct_change().dropna()
        mean_return = returns.mean() * 365  # Annualize
        volatility = returns.std() * np.sqrt(365)  # Annualize
        
        if volatility == 0:
            return 0.0
        
        sharpe = (mean_return - risk_free_rate) / volatility
        return sharpe
    
    def calculate_max_drawdown(self, df: pd.DataFrame) -> float:
        """Calculate maximum drawdown percentage"""
        cumulative = (1 + df['price'].pct_change()).cumprod()
        running_max = cumulative.cummax()
        drawdown = (cumulative - running_max) / running_max
        max_drawdown = drawdown.min()
        return abs(max_drawdown) * 100  # Return as percentage


# Singleton instance
feature_engineer = CryptoFeatureEngineer()
