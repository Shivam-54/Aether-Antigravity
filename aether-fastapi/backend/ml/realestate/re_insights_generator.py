"""
AI-Powered Real Estate Portfolio Insights Generator using Google Gemini
Generates actionable insights based on property data, ROI, and rental metrics
"""

import google.generativeai as genai
import os
import json
from datetime import datetime


class REInsightsGenerator:
    def __init__(self):
        """Initialize Gemini AI for real estate insight generation"""
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY not found in environment")

        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-2.0-flash')

    def _build_property_context(self, properties: list) -> dict:
        """Build a rich context dict from property ORM objects"""
        property_list = []
        total_value = 0
        total_invested = 0

        for p in properties:
            current_value = float(p.current_value or 0)
            purchase_price = float(p.purchase_price or 0)
            rent_amount = float(p.rent_amount or 0)

            roi_pct = 0
            if purchase_price > 0:
                roi_pct = round((current_value - purchase_price) / purchase_price * 100, 2)

            annual_rent = rent_amount * 12 if p.rent_type == "Monthly" else rent_amount
            rental_yield_pct = 0
            if current_value > 0 and annual_rent > 0:
                rental_yield_pct = round(annual_rent / current_value * 100, 2)

            total_value += current_value
            total_invested += purchase_price

            property_list.append({
                "name": p.name,
                "type": p.type,
                "location": p.location or "Unknown",
                "current_value_inr": current_value,
                "purchase_price_inr": purchase_price,
                "roi_pct": roi_pct,
                "rent_status": p.rent_status,
                "rent_amount_monthly": rent_amount if p.rent_type == "Monthly" else round(rent_amount / 12, 2),
                "rental_yield_pct": rental_yield_pct,
                "property_status": p.status,
            })

        portfolio_roi = 0
        if total_invested > 0:
            portfolio_roi = round((total_value - total_invested) / total_invested * 100, 2)

        return {
            "properties": property_list,
            "portfolio_summary": {
                "total_properties": len(properties),
                "total_current_value_inr": total_value,
                "total_invested_inr": total_invested,
                "total_equity_inr": total_value - total_invested,
                "portfolio_roi_pct": portfolio_roi,
                "rented_count": sum(1 for p in properties if p.rent_status == "Rented"),
                "vacant_count": sum(1 for p in properties if p.rent_status == "Not Rented"),
            }
        }

    def generate_summary(self, properties: list) -> dict:
        """
        Generate AI-powered insights for the real estate portfolio.
        Returns structured insights array + portfolio snapshot.
        """
        if not properties:
            return {
                "insights": [{
                    "category": "overview",
                    "title": "No Properties Found",
                    "content": "Add properties to your portfolio to get AI-generated insights.",
                    "severity": "low",
                    "icon": "◈"
                }],
                "portfolio_snapshot": {},
                "generated_at": datetime.now().isoformat()
            }

        context = self._build_property_context(properties)
        prompt = self._build_prompt(context)

        try:
            response = self.model.generate_content(prompt)
            insights = self._parse_response(response.text)
        except Exception as e:
            insights = self._rule_based_insights(context)

        return {
            "insights": insights,
            "portfolio_snapshot": context["portfolio_summary"],
            "generated_at": datetime.now().isoformat()
        }

    def _build_prompt(self, context: dict) -> str:
        context_str = json.dumps(context, indent=2)
        return f"""You are an expert real estate investment analyst AI for Indian property markets.
Analyze the following real estate portfolio and generate actionable insights in INR (₹) context.

PORTFOLIO DATA:
{context_str}

Generate exactly 5-6 insights as a JSON array. Use this format:

```json
[
  {{
    "category": "overview|property|risk|opportunity|action",
    "title": "Short title (max 60 chars)",
    "content": "Detailed explanation with numbers (2-3 sentences max)",
    "severity": "low|medium|high",
    "icon": "◈ or ✦ or ⚡ or ◎ or ◇"
  }}
]
```

RULES:
1. Always include one "overview" insight summarizing the full portfolio performance
2. Flag any property with ROI below 5% as a risk
3. Highlight the top-performing property by ROI as an opportunity
4. If any property is vacant (Not Rented), flag it as a risk with action advice
5. Include one "action" insight with a specific recommendation
6. Use ₹ for amounts, format large numbers as Cr or L (e.g., ₹1.5 Cr, ₹45 L)
7. Return ONLY the JSON array, no other text
8. Use professional symbols: ◈ ✦ ⚡ ◎ ◇. Do NOT use childish emojis."""

    def _parse_response(self, response_text: str) -> list:
        try:
            text = response_text.strip()
            if text.startswith('```'):
                text = text.split('\n', 1)[1]
            if text.endswith('```'):
                text = text.rsplit('\n', 1)[0]
            if text.startswith('json'):
                text = text[4:]

            insights = json.loads(text.strip())
            return [
                {
                    "category": i.get("category", "overview"),
                    "title": i.get("title", "Insight"),
                    "content": i.get("content", ""),
                    "severity": i.get("severity", "medium"),
                    "icon": i.get("icon", "◈"),
                }
                for i in insights
            ]
        except (json.JSONDecodeError, KeyError):
            return [{
                "category": "overview",
                "title": "Analysis Complete",
                "content": response_text[:200],
                "severity": "medium",
                "icon": "◈"
            }]

    def _rule_based_insights(self, context: dict) -> list:
        """Fallback rule-based insights if Gemini fails"""
        insights = []
        summary = context["portfolio_summary"]
        properties = context["properties"]

        insights.append({
            "category": "overview",
            "title": f"Portfolio: {summary['total_properties']} Properties",
            "content": f"Total portfolio value is ₹{summary['total_current_value_inr']:,.0f} with an overall ROI of {summary['portfolio_roi_pct']:+.1f}%.",
            "severity": "medium",
            "icon": "◈"
        })

        # Vacant properties
        if summary["vacant_count"] > 0:
            insights.append({
                "category": "risk",
                "title": f"{summary['vacant_count']} Vacant Propert{'y' if summary['vacant_count'] == 1 else 'ies'}",
                "content": f"You have {summary['vacant_count']} unrented propert{'y' if summary['vacant_count'] == 1 else 'ies'}. Consider listing to improve rental yield.",
                "severity": "high",
                "icon": "⚡"
            })

        # Best ROI property
        if properties:
            best = max(properties, key=lambda x: x["roi_pct"])
            if best["roi_pct"] > 0:
                insights.append({
                    "category": "opportunity",
                    "title": f"{best['name']} — Top Performer",
                    "content": f"{best['name']} in {best['location']} leads with {best['roi_pct']:+.1f}% ROI. Consider leveraging equity for further investment.",
                    "severity": "low",
                    "icon": "✦"
                })

            # Underperformers
            for p in properties:
                if p["roi_pct"] < 5 and p["roi_pct"] >= 0:
                    insights.append({
                        "category": "risk",
                        "title": f"{p['name']}: Low ROI",
                        "content": f"{p['name']} has only {p['roi_pct']:.1f}% ROI. Review if current valuation reflects market rate.",
                        "severity": "medium",
                        "icon": "◇"
                    })

        return insights[:6]
