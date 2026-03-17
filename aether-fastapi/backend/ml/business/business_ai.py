"""
Business AI ML Module
Gemini-powered financial analysis and board member chat for the Business module
"""

from google import genai  # type: ignore
import os
import json
from datetime import datetime
from typing import List, Dict, Any, Optional


class BusinessFinancialAnalyst:
    """
    AI Financial Analyst for the Business Portfolio.
    Generates structured P&L, cash flow, and risk insights using Google Gemini.
    """

    def __init__(self) -> None:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY not found in environment")
        self.client = genai.Client(api_key=api_key)

    def generate_analysis(
        self,
        businesses: List[Dict[str, Any]],
        transactions: List[Dict[str, Any]],
        period_months: int,
        focus: str,
    ) -> Dict[str, Any]:
        """Main entry — compute metrics and query Gemini for insights."""
        if not businesses:
            res: Dict[str, Any] = {
                "insights": [],
                "snapshot": None,
                "generated_at": datetime.now().isoformat(),
                "message": "No business ventures found in portfolio",
            }
            return res

        # ── Compute portfolio-level snapshot ──────────────────────
        total_revenue = float(sum(float(b.get("annual_revenue", 0.0) or 0.0) for b in businesses))
        total_profit  = float(sum(float(b.get("annual_profit",  0.0) or 0.0) for b in businesses))
        total_cash    = float(sum(float(b.get("cash_flow",       0.0) or 0.0) for b in businesses))
        margin        = float((total_profit / total_revenue * 100.0) if total_revenue > 0 else 0.0)

        snapshot: Dict[str, Any] = {
            "total_ventures":    len(businesses),
            "total_revenue":     float(f"{total_revenue:.2f}"),
            "net_profit":        float(f"{total_profit:.2f}"),
            "total_cash_flow":   float(f"{total_cash:.2f}"),
            "profit_margin_pct": float(f"{margin:.2f}"),
        }

        # ── Build Gemini prompt ───────────────────────────────────
        biz_summary: List[Dict[str, Any]] = [
            {
                "name":           str(b.get("name", "Unknown")),
                "industry":       str(b.get("industry", "—")),
                "annual_revenue": float(b.get("annual_revenue", 0.0) or 0.0),
                "annual_profit":  float(b.get("annual_profit", 0.0) or 0.0),
                "monthly_revenue": float(b.get("monthly_revenue", 0.0) or 0.0),
                "monthly_profit": float(b.get("monthly_profit", 0.0) or 0.0),
                "cash_flow":      float(b.get("cash_flow", 0.0) or 0.0),
                "status":         str(b.get("status", "—")),
            }
            for b in businesses
        ]

        prompt = self._build_prompt(snapshot, biz_summary, period_months, focus)

        try:
            response = self.client.models.generate_content(
                model="gemini-2.0-flash", contents=prompt
            )
            insights = self._parse_insights(response.text or "")
        except Exception:
            insights = self._fallback_insights(businesses, focus)

        final_res: Dict[str, Any] = {
            "snapshot":       snapshot,
            "insights":       insights,
            "generated_at":   datetime.now().isoformat(),
        }
        return final_res

    def _build_prompt(
        self,
        snapshot: Dict[str, Any],
        biz_list: List[Dict[str, Any]],
        period_months: int,
        focus: str,
    ) -> str:
        focus_opts: Dict[str, str] = {
            "overall":       "Provide a broad overview covering revenue, profitability, cash flow, and risk.",
            "revenue":       "Focus specifically on revenue growth, venture-level revenue drivers, and concentration risk.",
            "profitability": "Focus on profit margins, which ventures are most/least profitable, and margin improvement opportunities.",
            "cashflow":      "Focus on cash flow health, ventures with negative cash flow, and liquidity risks.",
            "risk":          "Focus on business risks: industry concentration, underperforming ventures, cash flow issues, and strategic weaknesses.",
        }
        focus_instruction = focus_opts.get(focus, "Provide a broad overview.")

        context_data: Dict[str, Any] = {
            "portfolio_summary": snapshot,
            "ventures":          biz_list,
            "analysis_period_months": period_months,
        }
        context = json.dumps(context_data, indent=2)

        return f"""You are a senior CFO-level financial advisor reviewing a private business portfolio. 
Analyse the data below and generate 5–7 concise, data-driven financial insights.

ANALYSIS FOCUS: {focus_instruction}

PORTFOLIO DATA:
{context}

RULES:
1. Always include one "overview" insight summarising the portfolio as a whole.
2. Use actual figures from the data (revenues, margins, profit numbers).
3. Focus areas: revenue trends, profit margins, cash flow health, venture performance comparison, risk factors.
4. Be specific — call out venture names when relevant.
5. Return ONLY a valid JSON array, no other text or markdown.

JSON format for each insight:
{{
  "category": "overview|revenue|profitability|cash_flow|risk|opportunity",
  "title": "Concise title max 70 chars",
  "content": "2–3 sentences with specific numbers from the data. Be actionable.",
  "severity": "low|medium|high",
  "icon": "use one of: ◈ ✦ ⚡ ◎ ↗ ↘ 📊 💰 ⚠️"
}}"""

    def _parse_insights(self, text: str) -> List[Dict[str, Any]]:
        text = text.strip()
        # Strip markdown code fences
        if text.startswith("```"):
            lines = text.split("\n")
            lines.pop(0)
            text = "\n".join(lines)
        if text.endswith("```"):
            lines = text.split("\n")
            lines.pop()
            text = "\n".join(lines)
        if text.lower().startswith("json"):
            text = text.lower().replace("json", "", 1).strip()
        
        try:
            parsed_json: Any = json.loads(text.strip())
            
            # Defensive cast to list
            raw_list: List[Dict[str, Any]] = []
            if isinstance(parsed_json, list):
                raw_list = [item for item in parsed_json if isinstance(item, dict)]
            elif isinstance(parsed_json, dict):
                raw_list = [parsed_json]
                
            final_insights: List[Dict[str, Any]] = []
            for item in raw_list:
                final_insights.append({
                    "category": str(item.get("category", "overview")),
                    "title":    str(item.get("title", "Insight")),
                    "content":  str(item.get("content", "")),
                    "severity": str(item.get("severity", "medium")),
                    "icon":     str(item.get("icon", "◈")),
                })
            error_text = str(text)
            if len(error_text) > 200:
                short_text = ""
                for char in error_text:
                    if len(short_text) >= 200:
                        break
                    short_text += char
                error_text = short_text
            return [{"category": "overview", "title": "Analysis ready", "content": error_text, "severity": "low", "icon": "◈"}]
        except Exception:
            error_text = str(text)
            if len(error_text) > 200:
                short_text = ""
                for char in error_text:
                    if len(short_text) >= 200:
                        break
                    short_text += char
                error_text = short_text
            return [{"category": "overview", "title": "Analysis ready", "content": error_text, "severity": "low", "icon": "◈"}]

    def _fallback_insights(self, businesses: List[Dict[str, Any]], focus: str) -> List[Dict[str, Any]]:
        """Rule-based fallback if Gemini is unavailable."""
        insights: List[Dict[str, Any]] = []
        total_rev = float(sum(float(b.get("annual_revenue", 0.0) or 0.0) for b in businesses))
        total_prf = float(sum(float(b.get("annual_profit", 0.0) or 0.0) for b in businesses))
        margin    = float((total_prf / total_rev * 100.0) if total_rev > 0 else 0.0)

        insights.append({
            "category": "overview",
            "title":    f"Portfolio: {len(businesses)} Active Ventures",
            "content":  f"Combined annual revenue ₹{total_rev:,.0f} with net profit ₹{total_prf:,.0f} ({margin:.1f}% margin).",
            "severity": "low", "icon": "◈",
        })

        for b in businesses:
            rev = float(b.get("annual_revenue", 0.0) or 0.0)
            prf = float(b.get("annual_profit",  0.0) or 0.0)
            cf  = float(b.get("cash_flow",      0.0) or 0.0)
            m   = float((prf / rev * 100.0) if rev > 0 else 0.0)

            if cf < 0:
                insights.append({
                    "category": "risk",
                    "title":    f"{b.get('name', 'Unknown')}: Negative Cash Flow",
                    "content":  f"Cash flow of ₹{cf:,.0f} is negative. Monitor liquidity closely.",
                    "severity": "high", "icon": "⚡",
                })
            if m < 5 and rev > 0:
                insights.append({
                    "category": "profitability",
                    "title":    f"{b.get('name', 'Unknown')}: Thin Margin ({m:.1f}%)",
                    "content":  f"Profit margin of {m:.1f}% leaves little buffer. Review operating costs.",
                    "severity": "medium", "icon": "↘",
                })
        
        return [insights[i] for i in range(min(7, len(insights)))]


class BusinessBoardMember:
    """
    AI Board Member — conversational Gemini agent with full business context.
    """

    def __init__(self) -> None:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY not found in environment")
        self.client = genai.Client(api_key=api_key)

    def chat(
        self,
        user_message: str,
        businesses: List[Dict[str, Any]],
        transactions: List[Dict[str, Any]],
        history: Optional[List[Dict[str, Any]]] = None,
    ) -> str:
        """Send a message and return AI reply with business context injected."""
        context = self._build_context(businesses, transactions)
        system_prompt = f"""You are an experienced AI Board Member and CFO advisor for a private investment portfolio.
You have full access to the user's business data below. Use it precisely to answer their questions.
Be concise, specific, and professional. Use ₹ for currency (Indian Rupees). 
If you reference numbers, use the exact data provided. Be conversational but executive-calibre.

BUSINESS PORTFOLIO CONTEXT:
{context}"""

        # Build the contents list for Gemini
        contents = [system_prompt]
        if history:
            start_idx = max(0, len(history) - 8)
            for i in range(start_idx, len(history)):
                entry = history[i]
                role = str(entry.get("role", "user"))
                content = str(entry.get("content", ""))
                prefix = "USER: " if role == "user" else "ASSISTANT: "
                contents.append(f"{prefix}{content}")
        contents.append(f"USER: {user_message}")

        full_prompt = "\n\n".join(contents)

        response = self.client.models.generate_content(
            model="gemini-2.0-flash",
            contents=full_prompt,
        )
        return str(response.text or "").strip()

    def _build_context(self, businesses: List[Dict[str, Any]], transactions: List[Dict[str, Any]]) -> str:
        total_rev = float(sum(float(b.get("annual_revenue", 0.0) or 0.0) for b in businesses))
        total_prf = float(sum(float(b.get("annual_profit",  0.0) or 0.0) for b in businesses))
        total_val = float(sum(float(b.get("valuation",       0.0) or 0.0) for b in businesses))

        biz_lines: List[str] = []
        for b in businesses:
            rev_val = float(b.get("annual_revenue", 0.0) or 0.0)
            prf_val = float(b.get("annual_profit", 0.0) or 0.0)
            cf_val = float(b.get("cash_flow", 0.0) or 0.0)
            biz_lines.append(
                f"- {b.get('name', '?')} | {b.get('industry', '?')} | "
                f"Revenue ₹{rev_val:,.0f} | "
                f"Profit ₹{prf_val:,.0f} | "
                f"Cash Flow ₹{cf_val:,.0f} | "
                f"Status: {b.get('status', '?')}"
            )

        summary = (
            f"TOTAL VENTURES: {len(businesses)}\n"
            f"COMBINED REVENUE: ₹{total_rev:,.0f}/yr\n"
            f"COMBINED PROFIT: ₹{total_prf:,.0f}/yr\n"
            f"TOTAL PORTFOLIO VALUATION: ₹{total_val:,.0f}\n\n"
            "INDIVIDUAL VENTURES:\n" + "\n".join(biz_lines)
        )

        if transactions:
            all_tx: List[Dict[str, Any]] = sorted(
                transactions,
                key=lambda t: str(t.get("date", "")),
                reverse=True
            )
            
            recent_tx: List[Dict[str, Any]] = []
            for tx in all_tx:
                if len(recent_tx) >= 10:
                    break
                recent_tx.append(tx)
                
            tx_lines: List[str] = []
            for t in recent_tx:
                amt = float(t.get("amount", 0.0) or 0.0)
                tx_lines.append(
                    f"- {t.get('date', '?')}: {t.get('type', '?')} ₹{amt:,.0f} [{t.get('category', '?')}] — {t.get('business_name', '?')}"
                )
            summary += "\n\nRECENT TRANSACTIONS (last 10):\n" + "\n".join(tx_lines)

        return summary
