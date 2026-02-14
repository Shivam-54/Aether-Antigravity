"""
Portfolio Risk Analyzer using Monte Carlo Simulation
Calculates VaR, CVaR, Sharpe Ratio, and generates risk distribution
"""

import numpy as np
import pandas as pd
import yfinance as yf
from datetime import datetime, timedelta
from scipy import stats


class RiskAnalyzer:
    def __init__(self, tickers: list, weights: list = None, investment_amount: float = 10000):
        """
        Initialize risk analyzer
        
        Args:
            tickers: List of stock ticker symbols
            weights: Portfolio weights (must sum to 1.0)
            investment_amount: Total portfolio value
        """
        self.tickers = tickers
        self.weights = weights if weights else [1.0 / len(tickers)] * len(tickers)
        self.investment_amount = investment_amount
        self.historical_data = None
        self.returns = None
        
    def fetch_historical_data(self, period='1y'):
        """Fetch historical price data for all tickers, dropping ones with bad data"""
        data = {}
        valid_tickers = []
        valid_weights = []
        
        for i, ticker in enumerate(self.tickers):
            try:
                stock = yf.Ticker(ticker)
                hist = stock.history(period=period)
                if not hist.empty and len(hist) > 30:  # Need at least 30 days
                    data[ticker] = hist['Close']
                    valid_tickers.append(ticker)
                    valid_weights.append(self.weights[i])
            except Exception:
                continue
        
        if not valid_tickers:
            raise ValueError("No valid historical data found for any tickers")
        
        # Update tickers and weights to only valid ones
        self.tickers = valid_tickers
        total_weight = sum(valid_weights)
        self.weights = [w / total_weight for w in valid_weights]  # Renormalize
        
        self.historical_data = pd.DataFrame(data)
        
        # Forward-fill and drop any remaining NaN rows
        self.historical_data = self.historical_data.ffill().dropna()
        
        if len(self.historical_data) < 20:
            raise ValueError("Insufficient overlapping historical data for analysis")
        
        # Calculate daily returns
        self.returns = self.historical_data.pct_change().dropna()
        
        # Drop any columns (tickers) that have zero variance (constant price)
        zero_var = self.returns.columns[self.returns.var() == 0]
        if len(zero_var) > 0:
            self.returns = self.returns.drop(columns=zero_var)
            self.historical_data = self.historical_data.drop(columns=zero_var)
            # Remove from tickers and weights
            indices = [i for i, t in enumerate(self.tickers) if t not in zero_var]
            self.tickers = [self.tickers[i] for i in indices]
            weights = [self.weights[i] for i in indices]
            total_weight = sum(weights)
            self.weights = [w / total_weight for w in weights]
        
        if len(self.tickers) == 0:
            raise ValueError("No tickers with valid price variation found")
        
        return self.historical_data
    
    def calculate_portfolio_return(self, individual_returns):
        """Calculate weighted portfolio return"""
        return np.dot(individual_returns, self.weights)
    
    def monte_carlo_simulation(self, num_simulations=10000, time_horizon=252):
        """
        Run Monte Carlo simulation with robust covariance handling
        """
        mean_returns = self.returns.mean().values
        cov_matrix = self.returns.cov().values
        
        # Make covariance matrix positive semi-definite (fix SVD convergence)
        try:
            # Try Cholesky decomposition to test if it's positive definite
            np.linalg.cholesky(cov_matrix)
        except np.linalg.LinAlgError:
            # Fix: add small regularization to diagonal
            min_eig = np.min(np.real(np.linalg.eigvals(cov_matrix)))
            if min_eig < 0:
                cov_matrix -= 2 * min_eig * np.eye(cov_matrix.shape[0])
            else:
                cov_matrix += 1e-8 * np.eye(cov_matrix.shape[0])
        
        # Run simulations
        portfolio_returns = []
        
        for _ in range(num_simulations):
            try:
                random_returns = np.random.multivariate_normal(
                    mean_returns,
                    cov_matrix,
                    time_horizon
                )
            except Exception:
                # Fallback: simulate independently using standard deviations
                std_devs = np.sqrt(np.diag(cov_matrix))
                random_returns = np.column_stack([
                    np.random.normal(mean_returns[j], std_devs[j], time_horizon)
                    for j in range(len(mean_returns))
                ])
            
            daily_portfolio_returns = random_returns.dot(self.weights)
            cumulative_return = (1 + daily_portfolio_returns).prod() - 1
            final_value = self.investment_amount * (1 + cumulative_return)
            portfolio_returns.append(final_value)
        
        return np.array(portfolio_returns)
    
    def calculate_var(self, simulation_results, confidence_level=0.95):
        """Calculate Value at Risk (VaR)"""
        sorted_results = np.sort(simulation_results)
        index = int((1 - confidence_level) * len(sorted_results))
        var_value = self.investment_amount - sorted_results[index]
        return var_value
    
    def calculate_cvar(self, simulation_results, confidence_level=0.95):
        """Calculate Conditional Value at Risk (CVaR) / Expected Shortfall"""
        sorted_results = np.sort(simulation_results)
        index = int((1 - confidence_level) * len(sorted_results))
        worst_cases = sorted_results[:index]
        if len(worst_cases) == 0:
            return self.calculate_var(simulation_results, confidence_level)
        cvar_value = self.investment_amount - worst_cases.mean()
        return cvar_value
    
    def calculate_sharpe_ratio(self, risk_free_rate=0.02):
        """Calculate Sharpe Ratio"""
        portfolio_returns = self.returns.dot(self.weights)
        annual_return = portfolio_returns.mean() * 252
        annual_volatility = portfolio_returns.std() * np.sqrt(252)
        if annual_volatility == 0:
            return 0.0
        sharpe_ratio = (annual_return - risk_free_rate) / annual_volatility
        return sharpe_ratio
    
    def analyze_risk(self, num_simulations=10000, time_horizon=252, confidence_level=0.95):
        """Complete risk analysis pipeline"""
        # Fetch data if not already loaded
        if self.historical_data is None:
            self.fetch_historical_data()
        
        # Run Monte Carlo simulation
        simulation_results = self.monte_carlo_simulation(num_simulations, time_horizon)
        
        # Calculate risk metrics
        var_95 = self.calculate_var(simulation_results, 0.95)
        var_99 = self.calculate_var(simulation_results, 0.99)
        cvar_95 = self.calculate_cvar(simulation_results, 0.95)
        cvar_99 = self.calculate_cvar(simulation_results, 0.99)
        sharpe = self.calculate_sharpe_ratio()
        
        # Calculate statistics
        expected_value = simulation_results.mean()
        median_value = np.median(simulation_results)
        std_dev = simulation_results.std()
        min_value = simulation_results.min()
        max_value = simulation_results.max()
        
        # Calculate percentiles for distribution
        percentiles = {
            'p10': np.percentile(simulation_results, 10),
            'p25': np.percentile(simulation_results, 25),
            'p50': np.percentile(simulation_results, 50),
            'p75': np.percentile(simulation_results, 75),
            'p90': np.percentile(simulation_results, 90)
        }
        
        # Create histogram data for distribution chart
        hist, bin_edges = np.histogram(simulation_results, bins=50)
        distribution_data = {
            'bins': bin_edges[:-1].tolist(),
            'frequencies': hist.tolist()
        }
        
        return {
            'portfolio_info': {
                'tickers': self.tickers,
                'weights': [round(w, 4) for w in self.weights],
                'initial_investment': self.investment_amount,
                'time_horizon_days': time_horizon
            },
            'risk_metrics': {
                'var_95': round(var_95, 2),
                'var_99': round(var_99, 2),
                'cvar_95': round(cvar_95, 2),
                'cvar_99': round(cvar_99, 2),
                'sharpe_ratio': round(sharpe, 3)
            },
            'portfolio_statistics': {
                'expected_value': round(expected_value, 2),
                'median_value': round(median_value, 2),
                'std_deviation': round(std_dev, 2),
                'min_value': round(min_value, 2),
                'max_value': round(max_value, 2),
                'expected_return_pct': round(((expected_value - self.investment_amount) / self.investment_amount) * 100, 2)
            },
            'percentiles': {k: round(v, 2) for k, v in percentiles.items()},
            'distribution': distribution_data,
            'num_simulations': num_simulations
        }
