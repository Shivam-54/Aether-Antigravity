"""
Patches backend/routes/crypto.py:
1. Adds coingecko_service import
2. Replaces the sync get_portfolio_history (random-walk) with async live CoinGecko version
3. Replaces the sync get_metrics (hardcoded 2.85%) with async live CoinGecko version
4. Adds _add_flat_fallback helper
"""

NEW_IMPORT = "from services import coingecko_service\n"

NEW_PORTFOLIO_HISTORY = '''
# --- Portfolio History Route ---

class PortfolioDataPoint(BaseModel):
    date: str
    value: float

@router.get("/portfolio-history", response_model=List[PortfolioDataPoint])
async def get_portfolio_history(
    period: str = "1mo",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Real portfolio value history using live CoinGecko price data.
    Falls back to linear interpolation if CoinGecko is unavailable.
    """
    import aiohttp, ssl, certifi
    holdings = db.query(CryptoHolding).filter(CryptoHolding.user_id == current_user.id).all()

    if not holdings:
        return []

    today = date.today()
    now_time = datetime.now()
    timeline_values: dict = {}

    period_to_days = {
        "1d": 1, "1D": 1,
        "1w": 7,  "1W": 7,
        "1mo": 30, "1m": 30,
        "3mo": 90, "3m": 90,
        "6mo": 180, "6m": 180,
        "1y": 365, "1Y": 365,
        "all": 365,
    }
    days = period_to_days.get(period, 30)
    is_intraday = period in ["1d", "1D"]

    for holding in holdings:
        symbol = holding.symbol.upper()
        qty = holding.quantity or 0.0
        if qty <= 0:
            continue

        coin_id = coingecko_service.get_coin_id(symbol)
        if not coin_id:
            _add_flat_fallback(timeline_values, holding, today, now_time, is_intraday)
            continue

        try:
            ssl_ctx = ssl.create_default_context(cafile=certifi.where())
            url = f"{coingecko_service.COINGECKO_BASE_URL}/coins/{coin_id}/market_chart"
            params = {
                "vs_currency": "inr",
                "days": str(days),
                "interval": "hourly" if is_intraday else "daily",
            }
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params,
                                       timeout=aiohttp.ClientTimeout(total=15),
                                       ssl=ssl_ctx) as resp:
                    resp.raise_for_status()
                    data = await resp.json()

            for ts_ms, price_inr in data.get("prices", []):
                pt = datetime.fromtimestamp(ts_ms / 1000)
                if is_intraday:
                    if pt.date() != today:
                        continue
                    key = pt.strftime('%Y-%m-%d %H:%M')
                else:
                    key = pt.strftime('%Y-%m-%d')
                timeline_values[key] = timeline_values.get(key, 0.0) + round(qty * price_inr, 2)

        except Exception as e:
            print(f"[CoinGecko] History failed for {symbol}: {e}. Fallback.")
            _add_flat_fallback(timeline_values, holding, today, now_time, is_intraday)

    return [
        PortfolioDataPoint(date=k, value=round(v, 2))
        for k, v in sorted(timeline_values.items())
    ]


def _add_flat_fallback(timeline_values, holding, today, now_time, is_intraday):
    """Linear interpolation fallback when CoinGecko is unavailable."""
    buy_price = holding.purchase_price_avg or 0.0
    cur_price = holding.current_price or buy_price
    qty = holding.quantity or 0.0
    start_date = (holding.purchase_date
                  or (holding.created_at.date() if holding.created_at else today))
    if start_date > today:
        start_date = today
    start_val = qty * buy_price
    end_val = qty * cur_price

    if is_intraday:
        for hour in range(now_time.hour + 1):
            key = now_time.replace(hour=hour, minute=0, second=0,
                                   microsecond=0).strftime('%Y-%m-%d %H:%M')
            timeline_values[key] = timeline_values.get(key, 0.0) + end_val
    else:
        num_days = max((today - start_date).days, 0)
        for d in range(num_days + 1):
            day = start_date + timedelta(days=d)
            t = d / num_days if num_days > 0 else 1.0
            val = start_val + t * (end_val - start_val)
            timeline_values[day.isoformat()] = timeline_values.get(day.isoformat(), 0.0) + val

'''

NEW_METRICS = '''
# --- Metrics Route ---

class CryptoMetrics(BaseModel):
    total_value: float
    change_24h_value: float
    change_24h_percent: float
    total_assets_count: int
    avg_portfolio_return: float

@router.get("/metrics", response_model=CryptoMetrics)
async def get_metrics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Aggregated crypto portfolio metrics with real-time 24h change from CoinGecko."""
    holdings = db.query(CryptoHolding).filter(CryptoHolding.user_id == current_user.id).all()

    total_value = sum(h.quantity * h.current_price for h in holdings)
    total_invested = sum(h.quantity * h.purchase_price_avg for h in holdings)
    avg_portfolio_return = ((total_value - total_invested) / total_invested * 100
                            if total_invested > 0 else 0.0)

    change_24h_percent = 0.0
    change_24h_value = 0.0

    if holdings:
        try:
            symbols = list(set(h.symbol.upper() for h in holdings))
            live_prices = await coingecko_service.fetch_current_prices(symbols, vs_currency="inr")
            if live_prices:
                weighted_change = 0.0
                weights_sum = 0.0
                for h in holdings:
                    sym = h.symbol.upper()
                    coin_val = h.quantity * h.current_price
                    if coin_val > 0 and sym in live_prices:
                        coin_24h = live_prices[sym].get("change_24h", 0.0) or 0.0
                        weighted_change += coin_24h * coin_val
                        weights_sum += coin_val
                if weights_sum > 0:
                    change_24h_percent = round(weighted_change / weights_sum, 2)
                    change_24h_value = round(total_value * change_24h_percent / 100, 2)
        except Exception as e:
            print(f"[CoinGecko] Metrics 24h fetch failed: {e}")

    return {
        "total_value": round(total_value, 2),
        "change_24h_value": change_24h_value,
        "change_24h_percent": change_24h_percent,
        "total_assets_count": len(holdings),
        "avg_portfolio_return": round(avg_portfolio_return, 2),
    }
'''

def patch():
    path = "backend/routes/crypto.py"
    with open(path, "r") as f:
        src = f.read()

    # 1. Add import after existing routes.auth import line
    old_import = "from routes.auth import get_current_user\n"
    if "from services import coingecko_service" not in src:
        src = src.replace(old_import, old_import + NEW_IMPORT)
        print("✓ Added coingecko_service import")

    # 2. Replace portfolio history section (from the comment to before the metrics section)
    ph_start = "\n\n# --- Portfolio History Route ---"
    ph_end = "\n\n# --- Metrics Route ---"
    ph_s = src.find(ph_start)
    ph_e = src.find(ph_end)
    if ph_s != -1 and ph_e != -1:
        src = src[:ph_s] + NEW_PORTFOLIO_HISTORY + src[ph_e:]
        print("✓ Replaced portfolio-history with async CoinGecko version")
    else:
        print(f"✗ Could not locate portfolio history section (ph_s={ph_s}, ph_e={ph_e})")

    # 3. Replace metrics section (from the comment to end of file)
    m_start = "\n# --- Metrics Route ---"
    m_s = src.find(m_start)
    if m_s != -1:
        src = src[:m_s] + NEW_METRICS
        print("✓ Replaced metrics with async CoinGecko version")
    else:
        print("✗ Could not locate metrics section")

    with open(path, "w") as f:
        f.write(src)
    print("Done.")

if __name__ == "__main__":
    patch()
