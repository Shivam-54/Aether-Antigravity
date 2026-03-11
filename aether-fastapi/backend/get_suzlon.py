import yfinance as yf
from datetime import datetime

data = yf.download("SUZLON.NS", start="2024-02-01", end="2024-04-30", progress=False)
if not data.empty:
    df = data['Close']
    if len(df.columns) > 0:
        df = df.iloc[:, 0]
    min_idx = df.idxmin()
    min_price = df.loc[min_idx]
    print(f"SUZLON.NS: ₹{min_price:.2f} (around {min_idx.strftime('%Y-%m-%d')})")
else:
    print("No data found for SUZLON.NS")
