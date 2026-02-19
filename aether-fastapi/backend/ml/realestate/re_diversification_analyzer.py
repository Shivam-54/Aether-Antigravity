"""
Real Estate Portfolio Diversification Analyzer
Uses concentration analysis across city, property type, and status dimensions.
(Properties lack daily price timeseries, so we use concentration-based scoring
instead of Pearson correlation like the shares module.)
"""

from datetime import datetime


class REDiversificationAnalyzer:

    def analyze(self, properties: list) -> dict:
        """
        Compute a diversification score (0–100) for a real estate portfolio.

        Dimensions:
          - City/Location concentration   (weight 40%)
          - Property type concentration   (weight 35%)
          - Value concentration           (weight 25%)

        Returns: score, grade, breakdown, recommendations
        """
        if not properties:
            return {
                "score": 0,
                "grade": "N/A",
                "avg_concentration": 0,
                "breakdown": [],
                "recommendations": ["Add properties to your portfolio to get a diversification analysis."],
                "generated_at": datetime.now().isoformat()
            }

        if len(properties) == 1:
            return {
                "score": 10,
                "grade": "D",
                "avg_concentration": 1.0,
                "breakdown": [
                    {"dimension": "City", "label": "Single Location", "concentration_pct": 100, "entries": []},
                    {"dimension": "Type", "label": "Single Type", "concentration_pct": 100, "entries": []},
                    {"dimension": "Value", "label": "Single Asset", "concentration_pct": 100, "entries": []},
                ],
                "recommendations": [
                    "You have only one property. Adding properties in different cities or of different types will improve diversification."
                ],
                "generated_at": datetime.now().isoformat()
            }

        total_value = sum(float(p.current_value or 0) for p in properties) or 1

        # --- Dimension 1: City concentration ---
        city_values: dict[str, float] = {}
        for p in properties:
            city = (p.location or "Unknown").strip().split(",")[0].strip()  # Take first part of address
            city_values[city] = city_values.get(city, 0) + float(p.current_value or 0)

        city_entries = [
            {"label": city, "value_pct": round(val / total_value * 100, 1)}
            for city, val in sorted(city_values.items(), key=lambda x: -x[1])
        ]
        city_hhi = sum((val / total_value) ** 2 for val in city_values.values())
        city_concentration_pct = round(city_hhi * 100, 1)

        # --- Dimension 2: Property type concentration ---
        type_values: dict[str, float] = {}
        for p in properties:
            ptype = (p.type or "Other").strip()
            type_values[ptype] = type_values.get(ptype, 0) + float(p.current_value or 0)

        type_entries = [
            {"label": t, "value_pct": round(val / total_value * 100, 1)}
            for t, val in sorted(type_values.items(), key=lambda x: -x[1])
        ]
        type_hhi = sum((val / total_value) ** 2 for val in type_values.values())
        type_concentration_pct = round(type_hhi * 100, 1)

        # --- Dimension 3: Single-asset value concentration ---
        max_single_asset_pct = max(
            float(p.current_value or 0) / total_value * 100
            for p in properties
        )
        value_entries = [
            {"label": p.name, "value_pct": round(float(p.current_value or 0) / total_value * 100, 1)}
            for p in sorted(properties, key=lambda x: -(x.current_value or 0))
        ]
        value_concentration_pct = round(max_single_asset_pct, 1)

        # --- Weighted diversification score ---
        # HHI of 1.0 = fully concentrated, 1/n = fully diversified
        # We map concentration penalty → score penalty
        city_penalty = city_concentration_pct * 0.40
        type_penalty = type_concentration_pct * 0.35
        value_penalty = (max_single_asset_pct / 100) ** 2 * 100 * 0.25

        total_penalty = city_penalty + type_penalty + value_penalty
        score = max(0, min(100, round(100 - total_penalty)))

        avg_concentration = round((city_concentration_pct + type_concentration_pct + value_concentration_pct) / 3, 1)

        # Grade
        if score >= 75:
            grade = "A"
        elif score >= 55:
            grade = "B"
        elif score >= 35:
            grade = "C"
        else:
            grade = "D"

        # Recommendations
        recommendations = []
        top_city = max(city_values, key=city_values.get)
        top_city_pct = city_values[top_city] / total_value * 100
        if top_city_pct > 60:
            recommendations.append(
                f"{top_city_pct:.0f}% of your portfolio value is in {top_city}. Consider properties in other cities to reduce geographic risk."
            )

        top_type = max(type_values, key=type_values.get)
        top_type_pct = type_values[top_type] / total_value * 100
        if top_type_pct > 70:
            recommendations.append(
                f"Your portfolio is {top_type_pct:.0f}% {top_type}. Adding Commercial or Land can improve type diversity."
            )

        if max_single_asset_pct > 50:
            single_name = max(properties, key=lambda p: float(p.current_value or 0)).name
            recommendations.append(
                f"'{single_name}' represents {max_single_asset_pct:.0f}% of your total portfolio value — high single-asset concentration risk."
            )

        if not recommendations:
            recommendations.append(
                f"Your portfolio has a healthy diversification score of {score}/100. Maintain variety across cities and property types."
            )

        return {
            "score": score,
            "grade": grade,
            "avg_concentration": avg_concentration,
            "breakdown": [
                {
                    "dimension": "City / Location",
                    "icon": "📍",
                    "concentration_pct": city_concentration_pct,
                    "entries": city_entries[:5],
                    "note": f"Top city: {max(city_values, key=city_values.get)}"
                },
                {
                    "dimension": "Property Type",
                    "icon": "🏠",
                    "concentration_pct": type_concentration_pct,
                    "entries": type_entries[:5],
                    "note": f"Dominant type: {max(type_values, key=type_values.get)}"
                },
                {
                    "dimension": "Asset Value",
                    "icon": "₹",
                    "concentration_pct": value_concentration_pct,
                    "entries": value_entries[:5],
                    "note": f"Largest asset: {max_single_asset_pct:.0f}% of portfolio"
                }
            ],
            "recommendations": recommendations,
            "generated_at": datetime.now().isoformat()
        }
