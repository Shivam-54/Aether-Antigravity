"""
AI-Powered Portfolio Insights Generator using Google Gemini
Generates actionable insights based on stock data, trends, and risk metrics
"""

import google.generativeai as genai
import yfinance as yf
import pandas as pd
import numpy as np
import os
import json
from datetime import datetime, timedelta


class InsightsGenerator:
    def __init__(self):
        """Initialize Gemini AI for insight generation"""
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY not found in environment")
        
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-2.0-flash')
    
    def get_stock_context(self, tickers: list) -> dict:
        """Gather comprehensive stock data for AI analysis"""
        context = {}
        
        for ticker in tickers:
            try:
                stock = yf.Ticker(ticker)
                hist = stock.history(period='3mo')
                
                if hist.empty:
                    continue
                
                current_price = hist['Close'].iloc[-1]
                month_ago_price = hist['Close'].iloc[-22] if len(hist) > 22 else hist['Close'].iloc[0]
                week_ago_price = hist['Close'].iloc[-5] if len(hist) > 5 else hist['Close'].iloc[0]
                
                # Calculate key metrics
                daily_returns = hist['Close'].pct_change().dropna()
                volatility = daily_returns.std() * np.sqrt(252) * 100  # Annualized %
                
                # Trend analysis
                sma_20 = hist['Close'].rolling(20).mean().iloc[-1] if len(hist) >= 20 else current_price
                sma_50 = hist['Close'].rolling(50).mean().iloc[-1] if len(hist) >= 50 else current_price
                
                # Volume analysis
                avg_volume = hist['Volume'].mean()
                recent_volume = hist['Volume'].iloc[-5:].mean()
                
                context[ticker] = {
                    'current_price': round(float(current_price), 2),
                    'week_change_pct': round(float((current_price - week_ago_price) / week_ago_price * 100), 2),
                    'month_change_pct': round(float((current_price - month_ago_price) / month_ago_price * 100), 2),
                    'volatility_annual_pct': round(float(volatility), 2),
                    'sma_20': round(float(sma_20), 2),
                    'sma_50': round(float(sma_50), 2),
                    'above_sma_20': bool(current_price > sma_20),
                    'above_sma_50': bool(current_price > sma_50),
                    'volume_trend': 'increasing' if float(recent_volume) > float(avg_volume) * 1.2 else ('decreasing' if float(recent_volume) < float(avg_volume) * 0.8 else 'stable'),
                    'high_52w': round(float(hist['Close'].max()), 2),
                    'low_52w': round(float(hist['Close'].min()), 2)
                }
            except Exception as e:
                continue
        
        return context
    
    def generate_insights(self, tickers: list, portfolio_value: float = None) -> dict:
        """
        Generate AI-powered insights for the given tickers
        
        Returns structured insights with categories:
        - Portfolio Overview
        - Individual Stock Analysis
        - Risk Alerts  
        - Opportunities
        - Action Items
        """
        # Gather stock context
        stock_context = self.get_stock_context(tickers)
        
        if not stock_context:
            return {
                'insights': [{
                    'category': 'error',
                    'title': 'No Data Available',
                    'content': 'Unable to fetch stock data for analysis.',
                    'severity': 'low',
                    'icon': '⚠️'
                }],
                'generated_at': datetime.now().isoformat()
            }
        
        # Build prompt
        prompt = self._build_prompt(stock_context, portfolio_value)
        
        try:
            response = self.model.generate_content(prompt)
            insights = self._parse_response(response.text)
        except Exception as e:
            # Fallback to rule-based insights if AI fails
            insights = self._generate_rule_based_insights(stock_context)
        
        return {
            'insights': insights,
            'stock_context': stock_context,
            'generated_at': datetime.now().isoformat(),
            'tickers_analyzed': list(stock_context.keys())
        }
    
    def _build_prompt(self, stock_context: dict, portfolio_value: float = None) -> str:
        """Build a structured prompt for Gemini"""
        context_str = json.dumps(stock_context, indent=2)
        
        prompt = f"""You are a professional financial analyst AI. Analyze the following portfolio data and generate actionable insights.

PORTFOLIO DATA:
{context_str}
{f'Total Portfolio Value: ${portfolio_value:,.2f}' if portfolio_value else ''}

Generate exactly 5-6 insights in the following JSON format. Each insight must be a JSON object in an array:

```json
[
  {{
    "category": "overview|stock|risk|opportunity|action",
    "title": "Short title (max 60 chars)",
    "content": "Detailed explanation (2-3 sentences max)",
    "severity": "low|medium|high",
    "icon": "emoji icon",
    "ticker": "TICKER or null if portfolio-wide"
  }}
]
```

RULES:
1. Include at least one "risk" insight if any stock has high volatility (>40%) or is below SMA 50
2. Include at least one "opportunity" insight for stocks with positive momentum
3. Include one "overview" with a portfolio summary
4. Be specific with numbers and percentages from the data
5. Keep language professional but accessible
6. Each "content" should be actionable and concise
7. Return ONLY the JSON array, no other text"""

        return prompt
    
    def _parse_response(self, response_text: str) -> list:
        """Parse Gemini's response into structured insights"""
        try:
            # Clean markdown code blocks if present
            text = response_text.strip()
            if text.startswith('```'):
                text = text.split('\n', 1)[1]  # Remove first line
            if text.endswith('```'):
                text = text.rsplit('\n', 1)[0]  # Remove last line
            if text.startswith('json'):
                text = text[4:]
            
            insights = json.loads(text.strip())
            
            # Validate and clean
            valid_insights = []
            for insight in insights:
                valid_insights.append({
                    'category': insight.get('category', 'overview'),
                    'title': insight.get('title', 'Insight'),
                    'content': insight.get('content', ''),
                    'severity': insight.get('severity', 'medium'),
                    'icon': insight.get('icon', '📊'),
                    'ticker': insight.get('ticker', None)
                })
            
            return valid_insights
            
        except (json.JSONDecodeError, KeyError):
            # Return a basic insight if parsing fails
            return [{
                'category': 'overview',
                'title': 'Analysis Complete',
                'content': response_text[:200],
                'severity': 'medium',
                'icon': '📊',
                'ticker': None
            }]
    
    def _generate_rule_based_insights(self, stock_context: dict) -> list:
        """Fallback: Generate insights using rule-based logic"""
        insights = []
        
        # Portfolio overview
        tickers = list(stock_context.keys())
        avg_change = np.mean([v['month_change_pct'] for v in stock_context.values()])
        insights.append({
            'category': 'overview',
            'title': f'Portfolio Analysis: {len(tickers)} Stocks',
            'content': f'Your portfolio of {", ".join(tickers)} has an average monthly change of {avg_change:+.1f}%.',
            'severity': 'medium',
            'icon': '📊',
            'ticker': None
        })
        
        # Risk alerts for volatile stocks
        for ticker, data in stock_context.items():
            if data['volatility_annual_pct'] > 40:
                insights.append({
                    'category': 'risk',
                    'title': f'{ticker}: High Volatility Alert',
                    'content': f'{ticker} has {data["volatility_annual_pct"]:.1f}% annualized volatility. Consider position sizing.',
                    'severity': 'high',
                    'icon': '⚠️',
                    'ticker': ticker
                })
        
        # Opportunities - stocks above SMA 20
        for ticker, data in stock_context.items():
            if data['above_sma_20'] and data['above_sma_50'] and data['month_change_pct'] > 0:
                insights.append({
                    'category': 'opportunity',
                    'title': f'{ticker}: Positive Momentum',
                    'content': f'{ticker} is trading above both 20 & 50 day averages with {data["month_change_pct"]:+.1f}% monthly gain.',
                    'severity': 'low',
                    'icon': '🚀',
                    'ticker': ticker
                })
        
        # Trend warnings
        for ticker, data in stock_context.items():
            if not data['above_sma_50']:
                insights.append({
                    'category': 'risk',
                    'title': f'{ticker}: Below Key Support',
                    'content': f'{ticker} at ${data["current_price"]} is below its 50-day SMA of ${data["sma_50"]}.',
                    'severity': 'medium',
                    'icon': '📉',
                    'ticker': ticker
                })
        
        return insights[:6]  # Max 6 insights
