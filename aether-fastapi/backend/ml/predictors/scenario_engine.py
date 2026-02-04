"""
Crypto Scenario Engine
Simulates "What-If" scenarios for a portfolio based on historical correlations (Beta)
"""

import pandas as pd
import numpy as np
import logging
from typing import Dict, List, Optional
from datetime import datetime

from services.coingecko_service import fetch_historical_prices

logger = logging.getLogger(__name__)

class ScenarioSimulator:
    """
    AI Engine for simulating market scenarios on a portfolio.
    Uses historical correlation (Beta) to predict how assets react to shocks.
    """

    def __init__(self):
        # Cache for correlation matrices: { "BTC,ETH,SOL": {matrix: df, updated_at: datetime} }
        self.correlation_cache = {}
        self.cache_duration_hours = 24

    async def _get_correlation_matrix(self, symbols: List[str], days: int = 90) -> Optional[pd.DataFrame]:
        """
        Fetch historical data and compute correlation matrix for standard list of assets
        """
        # Sort symbols to create a stable cache key
        symbols = sorted(list(set([s.upper() for s in symbols])))
        cache_key = ",".join(symbols)

        # Check cache
        if cache_key in self.correlation_cache:
            entry = self.correlation_cache[cache_key]
            if (datetime.now() - entry["updated_at"]).total_seconds() < 3600 * self.cache_duration_hours:
                return entry["matrix"]

        # Fetch data for all symbols
        price_data = {}
        
        # Always include BTC and ETH as benchmarks for correlation
        fetch_symbols = set(symbols)
        fetch_symbols.add("BTC")
        fetch_symbols.add("ETH")

        for symbol in fetch_symbols:
            # We skip stablecoins for efficiency, assume 0 correlation later
            if symbol in ["USDT", "USDC", "DAI"]:
                continue
                
            df = await fetch_historical_prices(symbol, days=days)
            if df is not None and not df.empty:
                # Set index to date to align series
                df['date'] = pd.to_datetime(df['date'])
                df.set_index('date', inplace=True)
                # Store percentage returns, not raw prices, for correlation
                price_data[symbol] = df['price'].pct_change()

        if not price_data:
            return None

        # Create combined dataframe
        combined_df = pd.DataFrame(price_data)
        
        # Calculate Correlation Matrix
        correlation_matrix = combined_df.corr()

        # Update Cache
        self.correlation_cache[cache_key] = {
            "matrix": correlation_matrix,
            "updated_at": datetime.now()
        }

        return correlation_matrix

    async def simulate_shock(
        self, 
        holdings: List[Dict], 
        shock_target: str, 
        shock_percent: float
    ) -> Dict:
        """
        Simulate a shock event (e.g. "BTC drops 20%")

        Args:
            holdings: List of dicts {symbol, quantity, current_price, current_value}
            shock_target: Symbol causing the shock (e.g. "BTC")
            shock_percent: Magnitude of shock (e.g. -20.0)

        Returns:
            Dict containing simulated new values and delta
        """
        shock_target = shock_target.upper()
        symbols = [h["symbol"] for h in holdings]
        
        # Get correlations
        corr_matrix = await self._get_correlation_matrix(symbols)
        
        simulated_holdings = []
        total_current_value = 0
        total_simulated_value = 0

        for holding in holdings:
            symbol = holding["symbol"].upper()
            curr_val = holding.get("current_value", 0)
            quantity = holding.get("quantity", 0)
            
            # Stablecoins stay stable (approx)
            if symbol in ["USDT", "USDC", "DAI"]:
                implied_change = 0
            
            # The target asset moves exactly by the shock amount
            elif symbol == shock_target:
                implied_change = shock_percent
                
            # Other assets move based on correlation (Beta approx)
            elif corr_matrix is not None and symbol in corr_matrix.index and shock_target in corr_matrix.columns:
                # Simple Beta Proxy: Correlation * Volatility_Ratio (Assuming 1:1 volatility for MVP simplification)
                # Or just use raw correlation as a "direction multiplier"
                correlation = corr_matrix.loc[symbol, shock_target]
                
                # Logic: If BTC drops 10%, and ETH corr is 0.8, ETH drops 8%
                # This is a simplification. Real Beta requires variance ratio.
                # For a consumer "Simulator", Correlation * Shock is a decent "sensitivity" metric.
                implied_change = correlation * shock_percent
            else:
                # Fallback if no data: Assume high correlation for crypto (0.7) or 0? 
                # Let's be conservative and assume 0.5 correlation with major moves
                implied_change = 0.5 * shock_percent

            # Calculate new value
            change_amount = curr_val * (implied_change / 100)
            sim_val = curr_val + change_amount
            
            simulated_holdings.append({
                "symbol": symbol,
                "quantity": quantity,
                "current_value": curr_val,
                "simulated_value": sim_val,
                "change_percent": implied_change,
                "change_value": change_amount
            })
            
            total_current_value += curr_val
            total_simulated_value += sim_val

        return {
            "scenario": f"{shock_target} moves {shock_percent}%",
            "total_current_value": round(total_current_value, 2),
            "total_simulated_value": round(total_simulated_value, 2),
            "total_change_percent": round((total_simulated_value - total_current_value) / total_current_value * 100, 2) if total_current_value else 0,
            "holdings": simulated_holdings
        }

# Singleton
scenario_simulator = ScenarioSimulator()
