"""
LSTM Model Training Script
Trains cryptocurrency price prediction model on real historical data
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

import asyncio
import numpy as np
import pandas as pd
from datetime import datetime
from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split
import pickle

try:
    from tensorflow import keras
    from tensorflow.keras.models import Sequential
    from tensorflow.keras.layers import LSTM, Dense, Dropout
    from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint
except ImportError:
    print("TensorFlow not installed. Install with: pip install tensorflow")
    sys.exit(1)

from ml.data.data_collector import data_collector


class LSTMTrainer:
    """Train and save LSTM price prediction model"""
    
    def __init__(self, symbol='BTC', sequence_length=60):
        self.symbol = symbol
        self.sequence_length = sequence_length
        self.scaler = MinMaxScaler(feature_range=(0, 1))
        self.model = None
        
        # Model save paths
        self.model_dir = os.path.join(os.path.dirname(__file__), '../models')
        os.makedirs(self.model_dir, exist_ok=True)
        
        self.model_path = os.path.join(self.model_dir, f'lstm_{symbol.lower()}.h5')
        self.scaler_path = os.path.join(self.model_dir, f'scaler_{symbol.lower()}.pkl')
        self.metadata_path = os.path.join(self.model_dir, f'metadata_{symbol.lower()}.pkl')
    
    async def fetch_training_data(self, days=730):
        """Fetch historical data for training (2 years default)"""
        print(f"\n📊 Fetching {days} days of historical data for {self.symbol}...")
        df = await data_collector.fetch_historical_data(self.symbol, days=days, use_cache=False)
        
        if len(df) < 100:
            raise ValueError(f"Insufficient data: only {len(df)} days available")
        
        print(f"✅ Fetched {len(df)} days of data")
        print(f"   Date range: {df['date'].min()} to {df['date'].max()}")
        print(f"   Price range: ${df['price'].min():.2f} to ${df['price'].max():.2f}")
        
        return df
    
    def prepare_sequences(self, prices):
        """Create sequences for LSTM training"""
        X, y = [], []
        
        for i in range(self.sequence_length, len(prices)):
            X.append(prices[i-self.sequence_length:i, 0])
            y.append(prices[i, 0])
        
        return np.array(X), np.array(y)
    
    def build_model(self, input_shape):
        """Build LSTM model architecture"""
        model = Sequential([
            # First LSTM layer
            LSTM(units=128, return_sequences=True, input_shape=input_shape),
            Dropout(0.2),
            
            # Second LSTM layer
            LSTM(units=64, return_sequences=False),
            Dropout(0.2),
            
            # Dense layers
            Dense(units=32, activation='relu'),
            Dense(units=1)  # Output layer
        ])
        
        model.compile(
            optimizer='adam',
            loss='mean_squared_error',
            metrics=['mae']
        )
        
        return model
    
    async def train(self, epochs=100, batch_size=32, validation_split=0.2):
        """Train the LSTM model"""
        
        # 1. Fetch data
        df = await self.fetch_training_data(days=730)
        
        # 2. Prepare data
        print("\n🔧 Preparing training data...")
        prices = df['price'].values.reshape(-1, 1)
        
        # Scale prices
        prices_scaled = self.scaler.fit_transform(prices)
        
        # Create sequences
        X, y = self.prepare_sequences(prices_scaled)
        
        # Reshape for LSTM [samples, time steps, features]
        X = X.reshape((X.shape[0], X.shape[1], 1))
        
        print(f"✅ Created {len(X)} training sequences")
        print(f"   Input shape: {X.shape}")
        print(f"   Output shape: {y.shape}")
        
        # 3. Train/test split
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, shuffle=False
        )
        
        print(f"\n📚 Training set: {len(X_train)} samples")
        print(f"   Test set: {len(X_test)} samples")
        
        # 4. Build model
        print("\n🏗️  Building LSTM model...")
        self.model = self.build_model(input_shape=(X.shape[1], 1))
        
        print(self.model.summary())
        
        # 5. Setup callbacks
        early_stop = EarlyStopping(
            monitor='val_loss',
            patience=10,
            restore_best_weights=True
        )
        
        checkpoint = ModelCheckpoint(
            self.model_path,
            monitor='val_loss',
            save_best_only=True,
            verbose=1
        )
        
        # 6. Train model
        print(f"\n🚀 Training model for up to {epochs} epochs...")
        print("=" * 60)
        
        history = self.model.fit(
            X_train, y_train,
            epochs=epochs,
            batch_size=batch_size,
            validation_split=validation_split,
            callbacks=[early_stop, checkpoint],
            verbose=1
        )
        
        # 7. Evaluate on test set
        print("\n📈 Evaluating model...")
        test_loss, test_mae = self.model.evaluate(X_test, y_test, verbose=0)
        
        # Convert back to price scale
        test_rmse = np.sqrt(test_loss) * (self.scaler.data_max_[0] - self.scaler.data_min_[0])
        test_mae_price = test_mae * (self.scaler.data_max_[0] - self.scaler.data_min_[0])
        
        print(f"✅ Test RMSE: ${test_rmse:.2f}")
        print(f"✅ Test MAE: ${test_mae_price:.2f}")
        
        # 8. Save model and metadata
        print(f"\n💾 Saving model to {self.model_path}...")
        self.model.save(self.model_path)
        
        # Save scaler
        with open(self.scaler_path, 'wb') as f:
            pickle.dump(self.scaler, f)
        
        # Save metadata
        metadata = {
            'symbol': self.symbol,
            'trained_at': datetime.now().isoformat(),
            'sequence_length': self.sequence_length,
            'training_days': len(df),
            'test_rmse': float(test_rmse),
            'test_mae': float(test_mae_price),
            'price_range': {
                'min': float(df['price'].min()),
                'max': float(df['price'].max())
            },
            'epochs_trained': len(history.history['loss'])
        }
        
        with open(self.metadata_path, 'wb') as f:
            pickle.dump(metadata, f)
        
        print(f"✅ Scaler saved to {self.scaler_path}")
        print(f"✅ Metadata saved to {self.metadata_path}")
        
        print("\n" + "=" * 60)
        print("🎉 Training Complete!")
        print("=" * 60)
        print(f"Symbol: {self.symbol}")
        print(f"Model: {self.model_path}")
        print(f"Test RMSE: ${test_rmse:.2f}")
        print(f"Test MAE: ${test_mae_price:.2f}")
        print(f"Epochs: {metadata['epochs_trained']}")
        print("=" * 60)
        
        return metadata


async def main():
    """Main training function"""
    print("\n" + "=" * 60)
    print("LSTM CRYPTOCURRENCY PRICE PREDICTION MODEL TRAINING")
    print("=" * 60)
    
    # Train Bitcoin model
    trainer = LSTMTrainer(symbol='BTC', sequence_length=60)
    
    try:
        metadata = await trainer.train(epochs=100, batch_size=32)
        print("\n✅ SUCCESS! Model is ready for predictions.")
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return 1
    
    return 0


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
