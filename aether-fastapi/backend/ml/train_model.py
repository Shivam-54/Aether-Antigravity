"""
Gradient Boosting Price Prediction Training Script
Uses scikit-learn's GradientBoostingRegressor - no external dependencies needed
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

import asyncio
import numpy as np
import pandas as pd
from datetime import datetime
import pickle

from sklearn.ensemble import GradientBoostingRegressor
from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, mean_absolute_error

from ml.data.data_collector import data_collector


class MLTrainer:
    """Train ML model for cryptocurrency price prediction"""
    
    def __init__(self, symbol='BTC', lookback=30):
        self.symbol = symbol
        self.lookback = lookback
        self.scaler = MinMaxScaler(feature_range=(0, 1))
        self.model = None
        
        # Model save paths
        self.model_dir = os.path.join(os.path.dirname(__file__), '../models')
        os.makedirs(self.model_dir, exist_ok=True)
        
        self.model_path = os.path.join(self.model_dir, f'ml_model_{symbol.lower()}.pkl')
        self.scaler_path = os.path.join(self.model_dir, f'scaler_ml_{symbol.lower()}.pkl')
        self.metadata_path = os.path.join(self.model_dir, f'metadata_ml_{symbol.lower()}.pkl')
    
    async def fetch_training_data(self, days=730):
        """Fetch historical data for training"""
        print(f"\n📊 Fetching {days} days of historical data for {self.symbol}...")
        df = await data_collector.fetch_historical_data(self.symbol, days=days, use_cache=False)
        
        if len(df) < 100:
            raise ValueError(f"Insufficient data: only {len(df)} days available")
        
        print(f"✅ Fetched {len(df)} days of data")
        print(f"   Date range: {df['date'].min()} to {df['date'].max()}")
        print(f"   Price range: ${df['price'].min():.2f} to ${df['price'].max():.2f}")
        
        return df
    
    def create_features(self, df):
        """Create features from price data"""
        df = df.copy()
        
        # Technical indicators as features
        df['returns'] = df['price'].pct_change()
        df['sma_7'] = df['price'].rolling(window=7).mean()
        df['sma_30'] = df['price'].rolling(window=30).mean()
        df['ema_7'] = df['price'].ewm(span=7).mean()
        df['volatility'] = df['returns'].rolling(window=30).std()
        df['momentum'] = df['price'].diff(5)
        
        # Lagged features (past prices)
        for i in range(1, self.lookback + 1):
            df[f'lag_{i}'] = df['price'].shift(i)
        
        # Target: next day price
        df['target'] = df['price'].shift(-1)
        
        # Drop NaN
        df = df.dropna()
        
        return df
    
    async def train(self):
        """Train ML model"""
        
        # 1. Fetch data
        df = await self.fetch_training_data(days=730)
        
        # 2. Create features
        print("\n🔧 Creating features...")
        df_features = self.create_features(df)
        
        # 3. Prepare X and y
        feature_cols = [col for col in df_features.columns 
                       if col not in ['date', 'price', 'target', 'volume', 'market_cap']]
        
        X = df_features[feature_cols].values
        y = df_features['target'].values
        
        print(f"✅ Created {len(X)} samples with {X.shape[1]} features")
        
        # 4. Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # 5. Train/test split
        X_train, X_test, y_train, y_test = train_test_split(
            X_scaled, y, test_size=0.2, shuffle=False
        )
        
        print(f"\n📚 Training set: {len(X_train)} samples")
        print(f"   Test set: {len(X_test)} samples")
        
        # 6. Train Gradient Boosting model
        print("\n🚀 Training Gradient Boosting model...")
        print("=" * 60)
        
        self.model = GradientBoostingRegressor(
            n_estimators=200,
            max_depth=6,
            learning_rate=0.1,
            subsample=0.8,
            random_state=42,
            verbose=1
        )
        
        self.model.fit(X_train, y_train)
        
        # 7. Evaluate
        print("\n📈 Evaluating model...")
        y_pred_train = self.model.predict(X_train)
        y_pred_test = self.model.predict(X_test)
        
        train_rmse = np.sqrt(mean_squared_error(y_train, y_pred_train))
        test_rmse = np.sqrt(mean_squared_error(y_test, y_pred_test))
        test_mae = mean_absolute_error(y_test, y_pred_test)
        
        print(f"✅ Train RMSE: ${train_rmse:.2f}")
        print(f"✅ Test RMSE: ${test_rmse:.2f}")
        print(f"✅ Test MAE: ${test_mae:.2f}")
        
        # 8. Save model
        print(f"\n💾 Saving model...")
        with open(self.model_path, 'wb') as f:
            pickle.dump(self.model, f)
        
        with open(self.scaler_path, 'wb') as f:
            pickle.dump(self.scaler, f)
        
        metadata = {
            'symbol': self.symbol,
            'model_type': 'GradientBoosting',
            'trained_at': datetime.now().isoformat(),
            'lookback': self.lookback,
            'training_days': len(df),
            'train_rmse': float(train_rmse),
            'test_rmse': float(test_rmse),
            'test_mae': float(test_mae),
            'feature_count': X.shape[1],
            'feature_names': feature_cols
        }
        
        with open(self.metadata_path, 'wb') as f:
            pickle.dump(metadata, f)
        
        print(f"✅ Model saved to {self.model_path}")
        print(f"✅ Metadata saved")
        
        print("\n" + "=" * 60)
        print("🎉 Training Complete!")
        print("=" * 60)
        print(f"Symbol: {self.symbol}")
        print(f"Model Type: Gradient Boosting")
        print(f"Test RMSE: ${test_rmse:.2f}")
        print(f"Test MAE: ${test_mae:.2f}")
        print(f"Features: {X.shape[1]}")
        print("=" * 60)
        
        return metadata


async def main():
    """Main training function"""
    print("\n" + "=" * 60)
    print("GRADIENT BOOSTING PRICE PREDICTION TRAINING")
    print("=" * 60)
    
    trainer = MLTrainer(symbol='BTC', lookback=30)
    
    try:
        metadata = await trainer.train()
        print("\n✅ SUCCESS! ML model ready for predictions.")
        return 0
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
