"""
AI-Powered Bond Portfolio Insights Generator using Google Gemini
Generates real, actionable insights based on the user's actual bond holdings
"""

import google.generativeai as genai
import os
import json
from datetime import datetime, date
from typing import List, Dict, Any, Optional
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer


class BondInsightsGenerator:
    def __init__(self):
        """Initialize Gemini AI for bond insight generation"""
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY not found in environment")

        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-2.0-flash')

    def build_portfolio_context(self, bonds: List[Dict]) -> Dict[str, Any]:
        """Derive key portfolio-level metrics from raw bond data"""
        today = date.today()
        total_value = sum(b.get("face_value", 0) for b in bonds)
        total_annual_income = sum(
            b.get("face_value", 0) * (b.get("coupon_rate", 0) / 100)
            for b in bonds
        )
        avg_ytm = (
            sum(b.get("yield_to_maturity", b.get("coupon_rate", 0)) * b.get("face_value", 0) for b in bonds)
            / max(total_value, 1)
        )

        # Maturity analysis
        maturity_details = []
        for b in bonds:
            if b.get("maturity_date"):
                try:
                    mat = b["maturity_date"] if isinstance(b["maturity_date"], date) else date.fromisoformat(str(b["maturity_date"]))
                    days_to_maturity = (mat - today).days
                    months_to_maturity = round(days_to_maturity / 30)
                    maturity_details.append({
                        "issuer": b.get("issuer", b.get("ticker", "Unknown")),
                        "ticker": b.get("ticker", ""),
                        "face_value": b.get("face_value", 0),
                        "coupon_rate": b.get("coupon_rate", 0),
                        "ytm": b.get("yield_to_maturity", b.get("coupon_rate", 0)),
                        "type": b.get("type", "Unknown"),
                        "maturity_date": str(mat),
                        "days_to_maturity": days_to_maturity,
                        "months_to_maturity": months_to_maturity,
                    })
                except Exception:
                    pass

        # Type allocation
        type_alloc = {}
        for b in bonds:
            t = b.get("type", "Other")
            type_alloc[t] = type_alloc.get(t, 0) + b.get("face_value", 0)

        # Concentration percentages
        type_alloc_pct = {t: round(v / max(total_value, 1) * 100, 1) for t, v in type_alloc.items()}

        return {
            "total_bonds": len(bonds),
            "total_face_value": round(total_value, 2),
            "total_annual_income": round(total_annual_income, 2),
            "avg_ytm_pct": round(avg_ytm, 2),
            "type_allocation": type_alloc_pct,
            "bond_details": maturity_details,
        }

    def generate_insights(self, bonds: List[Dict]) -> Dict[str, Any]:
        """Generate Gemini-powered insights for the user's bond portfolio"""
        if not bonds:
            return {
                "insights": [],
                "generated_at": datetime.now().isoformat(),
            }

        context = self.build_portfolio_context(bonds)
        prompt = self._build_prompt(context)

        try:
            response = self.model.generate_content(prompt)
            insights = self._parse_response(response.text)
        except Exception:
            insights = self._fallback_insights(context)

        return {
            "insights": insights,
            "portfolio_summary": context,
            "generated_at": datetime.now().isoformat(),
        }

    def _build_prompt(self, context: Dict) -> str:
        context_str = json.dumps(context, indent=2)
        return f"""You are a professional fixed-income portfolio analyst. Analyze the following bond portfolio data and generate actionable insights.

BOND PORTFOLIO DATA:
{context_str}

Generate exactly 5–7 insights as a JSON array. RULES:
1. Include one "overview" insight with total portfolio summary (face value, annual income, avg YTM)
2. Flag upcoming maturities (< 6 months) as "risk" — suggest reinvestment planning
3. Flag concentration > 50% in one bond type as "risk"
4. Flag any bond with coupon_rate < 6% as "action" (below-market rate risk in rising rate environment)
5. Flag any bond with ytm > 9% as "opportunity" — note credit quality consideration
6. Be specific — use actual numbers from the data
7. Return ONLY a JSON array, no other text

JSON format for each insight:
{{
  "category": "overview|risk|opportunity|action",
  "title": "Short title max 60 chars",
  "content": "2-3 sentences with specific numbers from the data",
  "severity": "low|medium|high",
  "icon": "use only: ◈ ✦ ⚡ ◎ ↗ ↘",
  "ticker": "issuer name or null if portfolio-wide"
}}"""

    def _parse_response(self, text: str) -> List[Dict]:
        text = text.strip()
        if text.startswith("```"):
            text = "\n".join(text.split("\n")[1:])
        if text.endswith("```"):
            text = "\n".join(text.split("\n")[:-1])
        if text.startswith("json"):
            text = text[4:]
        try:
            raw = json.loads(text.strip())
            return [
                {
                    "category": i.get("category", "overview"),
                    "title": i.get("title", "Insight"),
                    "content": i.get("content", ""),
                    "severity": i.get("severity", "medium"),
                    "icon": i.get("icon", "◈"),
                    "ticker": i.get("ticker"),
                }
                for i in raw
            ]
        except Exception:
            return [{"category": "overview", "title": "Analysis Complete", "content": text[:200], "severity": "medium", "icon": "◈", "ticker": None}]

    def _fallback_insights(self, context: Dict) -> List[Dict]:
        """Rule-based fallback if Gemini fails"""
        insights = []
        insights.append({
            "category": "overview",
            "title": f"Portfolio: {context['total_bonds']} Bonds",
            "content": f"Face value ₹{context['total_face_value']:,.0f}, generating ₹{context['total_annual_income']:,.0f} annual income at avg YTM of {context['avg_ytm_pct']:.2f}%.",
            "severity": "low", "icon": "◈", "ticker": None
        })
        today = date.today()
        for b in context.get("bond_details", []):
            if 0 <= b["months_to_maturity"] <= 6:
                insights.append({
                    "category": "risk",
                    "title": f"{b['issuer']}: Matures in {b['months_to_maturity']}M",
                    "content": f"This bond (₹{b['face_value']:,.0f}) matures on {b['maturity_date']}. Plan reinvestment of principal now.",
                    "severity": "high" if b["months_to_maturity"] <= 2 else "medium",
                    "icon": "⚡", "ticker": b["issuer"]
                })
            if b["coupon_rate"] > 0 and b["coupon_rate"] < 6:
                insights.append({
                    "category": "action",
                    "title": f"{b['issuer']}: Below-Market Coupon",
                    "content": f"Coupon of {b['coupon_rate']:.2f}% is below market avg ~7%. May underperform in rising rate environment.",
                    "severity": "medium", "icon": "↘", "ticker": b["issuer"]
                })
            if b["ytm"] > 9:
                insights.append({
                    "category": "opportunity",
                    "title": f"{b['issuer']}: High Yield",
                    "content": f"YTM of {b['ytm']:.2f}% is above market. Verify credit quality before adding more.",
                    "severity": "low", "icon": "↗", "ticker": b["issuer"]
                })
        for t, pct in context.get("type_allocation", {}).items():
            if pct > 50:
                insights.append({
                    "category": "risk",
                    "title": f"High Concentration: {t} ({pct:.0f}%)",
                    "content": f"{pct:.0f}% of your portfolio is in {t} bonds. Diversify across Government, Corporate, and PSU instruments.",
                    "severity": "medium", "icon": "◎", "ticker": t
                })
        return insights[:7]


class BondSentimentAnalyzer:
    """Analyze bond market sentiment using VADER on bond-related news keywords"""

    BOND_NEWS_HEADLINES = [
        # These are representative; in production hook into NewsAPI/RBI data feeds
        ("RBI holds repo rate at 6.5% — 10Y G-Sec yields dip 5 bps", "RBI Monetary Policy", 6, True),
        ("India fiscal deficit at 4.9% of GDP — below 5.1% target", "Ministry of Finance", 14, True),
        ("AA-rated corporate bond spreads widen 15 bps on global risk-off", "Bloomberg India", 21, False),
        ("SEBI bond market reporting framework boosts price transparency", "SEBI", 38, True),
        ("Inflation expectations ease — real yields improve for bond investors", "RBI Survey", 48, True),
        ("FII bond inflows surge ₹12,000 Cr as India joins EM bond index", "NSDL Data", 72, True),
    ]

    def __init__(self):
        self.vader = SentimentIntensityAnalyzer()

    def analyze(self) -> Dict[str, Any]:
        """Return bond market sentiment based on fixed-income news"""
        news_items = []
        scores = []

        for headline, source, hours_ago, positive in self.BOND_NEWS_HEADLINES:
            vs = self.vader.polarity_scores(headline)
            score = round(vs["compound"], 2)
            scores.append(score)
            news_items.append({
                "title": headline,
                "source": source,
                "hours_ago": hours_ago,
                "sentiment": score,
                "positive": positive,
            })

        avg_score = round(sum(scores) / len(scores), 2) if scores else 0
        classification = (
            "Bullish" if avg_score >= 0.2 else
            "Slightly Bullish" if avg_score >= 0.05 else
            "Neutral" if avg_score >= -0.05 else
            "Bearish"
        )

        return {
            "overall_score": avg_score,
            "classification": classification,
            "news": news_items,
            "analyzed_at": datetime.now().isoformat(),
        }
