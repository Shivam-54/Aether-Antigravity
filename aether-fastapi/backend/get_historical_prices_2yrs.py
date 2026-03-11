import yfinance as yf
from datetime import datetime

tickers = ["TITAN.NS", "ASIANPAINT.NS", "RELIANCE.NS", "ITC.NS", "PIDILITIND.NS", "HDFCBANK.NS", "LT.NS"]

for ticker in tickers:
    data = yf.download(ticker, start="2024-02-01", end="2024-04-30", progress=False)
    if not data.empty:
        df = data['Close']
        if len(df.columns) > 0:
            df = df.iloc[:, 0]
        min_idx = df.idxmin()
        min_price = df.loc[min_idx]
        print(f"{ticker}: ₹{min_price:.2f} (around {min_idx.strftime('%Y-%m-%d')})")
