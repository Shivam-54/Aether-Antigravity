"""
LSTM Price Predictor using PyTorch
Deep learning model for cryptocurrency price forecasting
"""

import torch
import torch.nn as nn
import numpy as np
import pandas as pd
from typing import Dict, Optional, Tuple
from datetime import datetime, timedelta
import os
import pickle


class LSTMPriceModel(nn.Module):
    """
    2-layer LSTM neural network for time series prediction
    
    Architecture:
    - LSTM Layer 1: 128 units with dropout
    - LSTM Layer 2: 64 units with dropout
    - Dense Output: 1 unit (price prediction)
    """
    
    def __init__(self, input_size: int, hidden_size_1: int = 128, hidden_size_2: int = 64, dropout: float = 0.2):
        super(LSTMPriceModel, self).__init__()
        
        self.hidden_size_1 = hidden_size_1
        self.hidden_size_2 = hidden_size_2
        
        # LSTM Layer 1
        self.lstm1 = nn.LSTM(
            input_size=input_size,
            hidden_size=hidden_size_1,
            num_layers=1,
            batch_first=True,
            dropout=0
        )
        
        # Dropout
        self.dropout1 = nn.Dropout(dropout)
        
        # LSTM Layer 2
        self.lstm2 = nn.LSTM(
            input_size=hidden_size_1,
            hidden_size=hidden_size_2,
            num_layers=1,
            batch_first=True,
            dropout=0
        )
        
        # Dropout
        self.dropout2 = nn.Dropout(dropout)
        
        # Dense output layer
        self.fc = nn.Linear(hidden_size_2, 1)
    
    def forward(self, x):
        # LSTM Layer 1
        lstm_out, _ = self.lstm1(x)
        lstm_out = self.dropout1(lstm_out)
        
        # LSTM Layer 2
        lstm_out, _ = self.lstm2(lstm_out)
        lstm_out = self.dropout2(lstm_out)
        
        # Take the last output
        last_output = lstm_out[:, -1, :]
        
        # Dense layer
        predictions = self.fc(last_output)
        
        return predictions


class LSTMPricePredictor:
    """
    LSTM-based cryptocurrency price forecaster
    
    Features:
    - Multi-variate input (price + technical indicators)
    - 2-layer LSTM architecture
    - Early stopping and model checkpoints
    - Multi-horizon predictions (1d, 7d, 30d)
    """
    
    def __init__(self):
        self.model = None
        self.scaler = None
        self.feature_columns = None
        self.sequence_length = 60
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.models_dir = os.path.join(os.path.dirname(__file__), '../models')
        os.makedirs(self.models_dir, exist_ok=True)
        
        print(f"LSTM Predictor initialized on device: {self.device}")
    
    def _create_model(self, input_size: int) -> LSTMPriceModel:
        """Create a new LSTM model"""
        model = LSTMPriceModel(input_size=input_size)
        model.to(self.device)
        return model
    
    def train(
        self,
        X_train: np.ndarray,
        y_train: np.ndarray,
        X_val: Optional[np.ndarray] = None,
        y_val: Optional[np.ndarray] = None,
        epochs: int = 50,
        batch_size: int = 32,
        learning_rate: float = 0.001,
        early_stopping_patience: int = 10
    ) -> Dict:
        """
        Train the LSTM model
        
        Args:
            X_train: Training sequences (samples, sequence_length, features)
            y_train: Training targets
            X_val: Validation sequences (optional)
            y_val: Validation targets (optional)
            epochs: Number of training epochs
            batch_size: Batch size
            learning_rate: Learning rate for Adam optimizer
            early_stopping_patience: Epochs to wait before early stopping
        
        Returns:
            Training history dictionary
        """
        # Create model
        input_size = X_train.shape[2]  # Number of features
        self.model = self._create_model(input_size)
        
        # Convert to PyTorch tensors
        X_train_tensor = torch.FloatTensor(X_train).to(self.device)
        y_train_tensor = torch.FloatTensor(y_train).reshape(-1, 1).to(self.device)
        
        if X_val is not None and y_val is not None:
            X_val_tensor = torch.FloatTensor(X_val).to(self.device)
            y_val_tensor = torch.FloatTensor(y_val).reshape(-1, 1).to(self.device)
        
        # Loss and optimizer
        criterion = nn.MSELoss()
        optimizer = torch.optim.Adam(self.model.parameters(), lr=learning_rate)
        
        # Training history
        history = {
            'train_loss': [],
            'val_loss': []
        }
        
        best_val_loss = float('inf')
        patience_counter = 0
        
        # Training loop
        for epoch in range(epochs):
            self.model.train()
            
            # Mini-batch training
            total_loss = 0
            num_batches = 0
            
            for i in range(0, len(X_train_tensor), batch_size):
                batch_X = X_train_tensor[i:i + batch_size]
                batch_y = y_train_tensor[i:i + batch_size]
                
                # Forward pass
                outputs = self.model(batch_X)
                loss = criterion(outputs, batch_y)
                
                # Backward pass
                optimizer.zero_grad()
                loss.backward()
                optimizer.step()
                
                total_loss += loss.item()
                num_batches += 1
            
            avg_train_loss = total_loss / num_batches
            history['train_loss'].append(avg_train_loss)
            
            # Validation
            if X_val is not None:
                self.model.eval()
                with torch.no_grad():
                    val_outputs = self.model(X_val_tensor)
                    val_loss = criterion(val_outputs, y_val_tensor).item()
                    history['val_loss'].append(val_loss)
                
                # Early stopping
                if val_loss < best_val_loss:
                    best_val_loss = val_loss
                    patience_counter = 0
                    # Save best model
                    self._save_checkpoint('best_model.pth')
                else:
                    patience_counter += 1
                
                if patience_counter >= early_stopping_patience:
                    print(f"Early stopping at epoch {epoch + 1}")
                    break
                
                if (epoch + 1) % 10 == 0:
                    print(f"Epoch {epoch + 1}/{epochs} - Train Loss: {avg_train_loss:.6f} - Val Loss: {val_loss:.6f}")
            else:
                if (epoch + 1) % 10 == 0:
                    print(f"Epoch {epoch + 1}/{epochs} - Train Loss: {avg_train_loss:.6f}")
        
        # Load best model
        if X_val is not None:
            self._load_checkpoint('best_model.pth')
        
        return history
    
    def predict(
        self,
        X: np.ndarray,
        return_sequences: bool = False
    ) -> np.ndarray:
        """
        Make predictions using the trained model
        
        Args:
            X: Input sequences (samples, sequence_length, features)
            return_sequences: If True, return all predictions. If False, return last only.
        
        Returns:
            Predictions array
        """
        if self.model is None:
            raise ValueError("Model not trained or loaded")
        
        self.model.eval()
        with torch.no_grad():
            X_tensor = torch.FloatTensor(X).to(self.device)
            predictions = self.model(X_tensor)
            predictions = predictions.cpu().numpy()
        
        if not return_sequences:
            return predictions[-1]
        
        return predictions
    
    def predict_multi_horizon(
        self,
        last_sequence: np.ndarray,
        horizons: list = [1, 7, 30]
    ) -> Dict:
        """
        Predict multiple time horizons (1-day, 7-day, 30-day)
        
        Args:
            last_sequence: Last sequence of shape (sequence_length, features)
            horizons: List of prediction horizons in days
        
        Returns:
            Dictionary with predictions for each horizon
        """
        if self.model is None:
            raise ValueError("Model not trained or loaded")
        
        predictions = {}
        current_sequence = last_sequence.copy()
        
        for horizon in horizons:
            horizon_preds = []
            temp_sequence = current_sequence.copy()
            
            for _ in range(horizon):
                # Predict next day
                X = temp_sequence.reshape(1, self.sequence_length, -1)
                next_pred = self.predict(X, return_sequences=False)
                horizon_preds.append(next_pred[0])
                
                # Update sequence (simple: shift and append, maintain feature structure)
                # In practice, you'd need to update all features, not just price
                temp_sequence = np.roll(temp_sequence, -1, axis=0)
                temp_sequence[-1, 0] = next_pred[0]  # Update price (column 0)
            
            predictions[f'{horizon}_day'] = {
                'prediction': horizon_preds[-1],  # Final prediction
                'sequence': horizon_preds  # Full sequence
            }
        
        return predictions
    
    def _save_checkpoint(self, filename: str):
        """Save model checkpoint"""
        filepath = os.path.join(self.models_dir, filename)
        torch.save(self.model.state_dict(), filepath)
    
    def _load_checkpoint(self, filename: str):
        """Load model checkpoint"""
        filepath = os.path.join(self.models_dir, filename)
        if os.path.exists(filepath):
            self.model.load_state_dict(torch.load(filepath, map_location=self.device))
            print(f"Loaded model from {filepath}")
        else:
            print(f"Checkpoint {filepath} not found")
    
    def save_model(self, symbol: str):
        """Save complete model with metadata"""
        model_data = {
            'model_state': self.model.state_dict() if self.model else None,
            'scaler': self.scaler,
            'feature_columns': self.feature_columns,
            'sequence_length': self.sequence_length,
            'timestamp': datetime.now().isoformat()
        }
        
        filepath = os.path.join(self.models_dir, f'lstm_{symbol.lower()}.pkl')
        with open(filepath, 'wb') as f:
            pickle.dump(model_data, f)
        
        print(f"Model saved to {filepath}")
    
    def load_model(self, symbol: str):
        """Load complete model with metadata"""
        filepath = os.path.join(self.models_dir, f'lstm_{symbol.lower()}.pkl')
        
        if not os.path.exists(filepath):
            print(f"No saved model found for {symbol}")
            return False
        
        with open(filepath, 'rb') as f:
            model_data = pickle.load(f)
        
        self.scaler = model_data['scaler']
        self.feature_columns = model_data['feature_columns']
        self.sequence_length = model_data['sequence_length']
        
        if model_data['model_state']:
            # Reconstruct model
            input_size = len(self.feature_columns)
            self.model = self._create_model(input_size)
            self.model.load_state_dict(model_data['model_state'])
            self.model.eval()
        
        print(f"Model loaded from {filepath} (saved: {model_data['timestamp']})")
        return True


# Singleton instance
lstm_predictor = LSTMPricePredictor()
