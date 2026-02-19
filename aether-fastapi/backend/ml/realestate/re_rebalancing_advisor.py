"""
Portfolio Rebalancing Advisor for Real Estate
Analyses current portfolio composition and recommends what to buy next
to improve diversification across city, type, and yield.
"""

from datetime import datetime
import google.generativeai as genai
import os
import json


# Target ideal distribution ranges (can be tuned)
IDEAL_TYPE_MIX = {
    "Residential": (30, 60),
    "Commercial":  (20, 45),
    "Industrial":  (0,  30),
    "Land":        (0,  25),
    "Other":       (0,  20),
}

CITY_CONCENTRATION_THRESHOLD = 50  # Flag if any city > 50% by value


class RERebalancingAdvisor:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY not found in environment")
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel("gemini-2.0-flash")

    def analyze(self, properties: list) -> dict:
        if not properties:
            return {
                "summary": "Add properties to your portfolio to get rebalancing advice.",
                "gaps": [],
                "suggestions": [],
                "generated_at": datetime.now().isoformat()
            }

        total_value = sum(float(p.current_value or 0) for p in properties) or 1

        # ── City distribution ──
        city_dist: dict[str, float] = {}
        for p in properties:
            city = (p.location or "Unknown").strip().split(",")[0].strip()
            city_dist[city] = city_dist.get(city, 0) + float(p.current_value or 0)
        city_pct = {c: round(v / total_value * 100, 1) for c, v in city_dist.items()}

        # ── Type distribution ──
        type_dist: dict[str, float] = {}
        for p in properties:
            t = (p.type or "Other").strip()
            type_dist[t] = type_dist.get(t, 0) + float(p.current_value or 0)
        type_pct = {t: round(v / total_value * 100, 1) for t, v in type_dist.items()}

        # ── Identify gaps ──
        gaps = []

        # City concentration
        for city, pct in city_pct.items():
            if pct > CITY_CONCENTRATION_THRESHOLD:
                gaps.append({
                    "type": "city",
                    "severity": "high" if pct > 70 else "medium",
                    "label": f"{city} over-weight",
                    "detail": f"{pct}% of your portfolio is in {city}. Target: <{CITY_CONCENTRATION_THRESHOLD}%.",
                    "action": f"Consider properties in a different city to reduce {city} concentration."
                })

        # Type gaps vs ideal mix
        for ptype, (lo, hi) in IDEAL_TYPE_MIX.items():
            current_pct = type_pct.get(ptype, 0)
            if current_pct < lo:
                gaps.append({
                    "type": "property_type",
                    "severity": "medium",
                    "label": f"Low {ptype} exposure",
                    "detail": f"You have {current_pct}% {ptype} vs ideal >{lo}%.",
                    "action": f"Adding a {ptype} property would improve type diversification."
                })
            elif current_pct > hi:
                gaps.append({
                    "type": "property_type",
                    "severity": "low",
                    "label": f"High {ptype} concentration",
                    "detail": f"You have {current_pct}% {ptype} vs ideal <{hi}%.",
                    "action": f"Future buys could favour non-{ptype} types."
                })

        # ── Gemini suggestions ──
        context = {
            "city_distribution_pct": city_pct,
            "type_distribution_pct": type_pct,
            "total_value_inr": total_value,
            "num_properties": len(properties),
            "gaps_identified": gaps,
        }

        suggestions = self._get_gemini_suggestions(context)

        return {
            "city_distribution": city_pct,
            "type_distribution": type_pct,
            "gaps": gaps,
            "suggestions": suggestions,
            "generated_at": datetime.now().isoformat()
        }

    def _get_gemini_suggestions(self, context: dict) -> list:
        prompt = f"""You are a real estate investment advisor for the Indian market.
Here is the current portfolio composition:

{json.dumps(context, indent=2)}

Generate 3-4 specific, actionable rebalancing suggestions as a JSON array:

```json
[
  {{
    "priority": "high|medium|low",
    "icon": "◈ or ✦ or ◇ or ⚡",
    "title": "Short suggestion title (max 60 chars)",
    "detail": "Why this makes sense — 2 sentences using Indian market context (e.g. Tier-2 cities, Commercial yields, etc.)"
  }}
]
```

RULES:
- Be specific: mention city names, property types, expected yield ranges
- Use Indian market knowledge (Mumbai premium, Pune IT demand, tier-2 growth, etc.)
- Reference the actual gaps from the data
- Return ONLY the JSON array, no other text
- Use minimal professional icons: ◈ ✦ ◇ ⚡"""

        try:
            response = self.model.generate_content(prompt)
            text = response.text.strip()
            if text.startswith("```"):
                text = text.split("\n", 1)[1]
            if text.endswith("```"):
                text = text.rsplit("\n", 1)[0]
            if text.startswith("json"):
                text = text[4:]
            return json.loads(text.strip())
        except Exception:
            # Fallback rule-based suggestions
            return [
                {
                    "priority": "high",
                    "icon": "◈",
                    "title": "Geographic diversification needed",
                    "detail": "Your portfolio is concentrated in fewer cities. Adding a property in Pune or Hyderabad, which are IT-driven markets with strong rental demand, can reduce city-specific risk."
                },
                {
                    "priority": "medium",
                    "icon": "✦",
                    "title": "Consider adding a Commercial property",
                    "detail": "Commercial real estate typically yields 6–10% annually vs 2–4% for residential. A small office or retail space can diversify your income streams."
                }
            ]
