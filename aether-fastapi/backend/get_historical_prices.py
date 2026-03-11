import yfinance as yf
from datetime import datetime

tickers = ["TITAN.NS", "ASIANPAINT.NS", "RELIANCE.NS", "ITC.NS"]

for ticker in tickers:
    data = yf.download(ticker, start="2024-07-01", end="2024-10-31", progress=False)
    if not data.empty:
        df = data['Close']
        if len(df.columns) > 0:
            df = df.iloc[:, 0]
        min_idx = df.idxmin()
        min_price = df.loc[min_idx]
        print(f"{ticker}: ₹{min_price:.2f} (around {min_idx.strftime('%Y-%m-%d')})")
