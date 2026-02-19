"""
Rental Yield Optimizer for Real Estate Portfolio
Compares actual vs estimated market-rate rent for each property,
flags under-priced rentals and vacant properties with suggested ranges.
"""

from datetime import datetime


# Estimated market rental yields by city + type (annual yield % of current value)
# Based on typical Indian real estate market data
MARKET_YIELD_BENCHMARKS: dict[str, dict[str, tuple[float, float]]] = {
    "Mumbai":     {"Residential": (2.0, 3.5), "Commercial": (6.0, 9.0), "Industrial": (7.0, 10.0), "Land": (0.5, 1.5)},
    "Pune":       {"Residential": (3.0, 5.0), "Commercial": (6.0, 8.5), "Industrial": (7.0,  9.0), "Land": (1.0, 2.0)},
    "Bangalore":  {"Residential": (3.0, 5.0), "Commercial": (6.5, 9.0), "Industrial": (7.0, 10.0), "Land": (1.0, 2.0)},
    "Hyderabad":  {"Residential": (3.0, 5.5), "Commercial": (7.0, 9.5), "Industrial": (8.0, 11.0), "Land": (1.0, 2.5)},
    "Delhi":      {"Residential": (2.5, 4.0), "Commercial": (6.0, 9.0), "Industrial": (6.5,  9.0), "Land": (0.5, 1.5)},
    "Chennai":    {"Residential": (3.0, 4.5), "Commercial": (6.0, 8.5), "Industrial": (7.0,  9.5), "Land": (1.0, 2.0)},
    "Nasik":      {"Residential": (3.5, 5.5), "Commercial": (5.5, 8.0), "Industrial": (6.0,  9.0), "Land": (1.5, 3.0)},
    "Nashik":     {"Residential": (3.5, 5.5), "Commercial": (5.5, 8.0), "Industrial": (6.0,  9.0), "Land": (1.5, 3.0)},
    "Ahmedabad":  {"Residential": (3.0, 5.0), "Commercial": (6.0, 8.5), "Industrial": (7.0,  9.5), "Land": (1.5, 2.5)},
    "Kolkata":    {"Residential": (3.0, 4.5), "Commercial": (5.5, 8.0), "Industrial": (6.5,  9.0), "Land": (1.0, 2.0)},
    "Jaipur":     {"Residential": (3.5, 5.5), "Commercial": (5.5, 8.0), "Industrial": (6.0,  8.5), "Land": (1.5, 3.0)},
    "DEFAULT":    {"Residential": (3.0, 5.0), "Commercial": (6.0, 8.5), "Industrial": (7.0,  9.5), "Land": (1.0, 2.5)},
}


def _get_yield_benchmark(location: str, prop_type: str) -> tuple[float, float]:
    """Find the closest matching city benchmark."""
    location_key = location.strip().split(",")[0].strip()
    # Try exact match first
    for city_key in MARKET_YIELD_BENCHMARKS:
        if city_key.lower() in location_key.lower() or location_key.lower() in city_key.lower():
            type_key = prop_type if prop_type in MARKET_YIELD_BENCHMARKS[city_key] else "Residential"
            return MARKET_YIELD_BENCHMARKS[city_key][type_key]
    # Fallback
    type_key = prop_type if prop_type in MARKET_YIELD_BENCHMARKS["DEFAULT"] else "Residential"
    return MARKET_YIELD_BENCHMARKS["DEFAULT"][type_key]


class RERentalYieldOptimizer:

    def analyze(self, properties: list) -> dict:
        """
        For each property:
        - If rented: compare actual yield vs market benchmark → flag under/over-priced
        - If vacant: suggest rent range based on market yield
        - Compute total portfolio rental income (actual vs potential)
        """
        if not properties:
            return {
                "summary": {"actual_monthly": 0, "potential_monthly": 0, "income_gap_monthly": 0},
                "properties": [],
                "generated_at": datetime.now().isoformat()
            }

        results = []
        total_actual_monthly = 0
        total_potential_monthly_mid = 0

        for p in properties:
            current_value = float(p.current_value or 0)
            rent_amount = float(p.rent_amount or 0)
            prop_type = (p.type or "Residential").strip()
            location = p.location or "Unknown"

            yield_lo, yield_hi = _get_yield_benchmark(location, prop_type)
            yield_mid = (yield_lo + yield_hi) / 2

            # Market-rate monthly rent (mid estimate)
            market_monthly_mid = round(current_value * yield_mid / 100 / 12)
            market_monthly_lo  = round(current_value * yield_lo  / 100 / 12)
            market_monthly_hi  = round(current_value * yield_hi  / 100 / 12)

            # Normalise actual rent to monthly
            if p.rent_status == "Rented" and rent_amount > 0:
                if p.rent_type == "Yearly":
                    actual_monthly = round(rent_amount / 12)
                else:
                    actual_monthly = round(rent_amount)
            else:
                actual_monthly = 0

            # Actual annual yield %
            actual_yield_pct = round(actual_monthly * 12 / current_value * 100, 2) if current_value > 0 and actual_monthly > 0 else 0

            # Gap analysis
            if p.rent_status == "Rented" and actual_monthly > 0:
                gap_monthly = market_monthly_mid - actual_monthly
                gap_pct = round((market_monthly_mid - actual_monthly) / market_monthly_mid * 100, 1) if market_monthly_mid > 0 else 0

                if gap_pct > 20:
                    status = "under_priced"
                    status_label = "Under-priced"
                    recommendation = f"Current rent is {gap_pct:.0f}% below market rate for {prop_type} in {location.split(',')[0]}. Consider revising to ₹{market_monthly_lo:,.0f}–₹{market_monthly_hi:,.0f}/mo at renewal."
                elif gap_pct < -15:
                    status = "above_market"
                    status_label = "Above Market"
                    recommendation = f"Excellent — your rent is above market rate. Ensure tenant retention to sustain this premium."
                else:
                    status = "at_market"
                    status_label = "At Market"
                    recommendation = f"Rent is aligned with market range (₹{market_monthly_lo:,.0f}–₹{market_monthly_hi:,.0f}/mo). Good positioning."
            else:
                actual_monthly = 0
                gap_monthly = market_monthly_mid
                gap_pct = 100
                status = "vacant"
                status_label = "Vacant"
                recommendation = f"This {prop_type} property in {location.split(',')[0]} could generate ₹{market_monthly_lo:,.0f}–₹{market_monthly_hi:,.0f}/mo based on {yield_lo:.1f}–{yield_hi:.1f}% market yield."

            total_actual_monthly += actual_monthly
            total_potential_monthly_mid += market_monthly_mid

            results.append({
                "name": p.name,
                "type": prop_type,
                "location": location,
                "rent_status": p.rent_status,
                "actual_monthly": actual_monthly,
                "market_monthly_lo": market_monthly_lo,
                "market_monthly_mid": market_monthly_mid,
                "market_monthly_hi": market_monthly_hi,
                "actual_yield_pct": actual_yield_pct,
                "market_yield_range": f"{yield_lo:.1f}–{yield_hi:.1f}%",
                "gap_monthly": gap_monthly,
                "gap_pct": gap_pct,
                "status": status,
                "status_label": status_label,
                "recommendation": recommendation,
            })

        # Sort: vacant first, then under-priced, then others
        status_order = {"vacant": 0, "under_priced": 1, "at_market": 2, "above_market": 3}
        results.sort(key=lambda x: status_order.get(x["status"], 9))

        income_gap = total_potential_monthly_mid - total_actual_monthly

        return {
            "summary": {
                "actual_monthly": round(total_actual_monthly),
                "potential_monthly": round(total_potential_monthly_mid),
                "income_gap_monthly": round(income_gap),
                "income_gap_annual": round(income_gap * 12),
            },
            "properties": results,
            "generated_at": datetime.now().isoformat()
        }
