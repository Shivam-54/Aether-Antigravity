"""
Business AI ML Module
Groq + Gemini powered AI for the Business module:
  - BusinessFinancialAnalyst   (Gemini — P&L insights)
  - BusinessBoardMember        (Groq  — conversational CFO)
  - BusinessScenarioPlanner    (Groq  — what-if scenario modelling)
  - BusinessGoalAnalyser       (Groq  — goal tracking + gap analysis)
"""

from google import genai  # type: ignore
import os
import json
from datetime import datetime
from typing import List, Dict, Any, Optional


class BusinessFinancialAnalyst:
    """
    AI Financial Analyst for the Business Portfolio.
    Generates structured P&L, cash flow, and risk insights using Groq.
    """

    MODEL = "llama-3.3-70b-versatile"

    def __init__(self) -> None:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError("GROQ_API_KEY not found in environment")
        from groq import Groq
        self.client = Groq(api_key=api_key)

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
            response = self.client.chat.completions.create(
                model=self.MODEL,
                messages=[
                    {"role": "system", "content": "You are a senior CFO-level financial advisor. Return ONLY valid JSON arrays, no markdown, no extra text."},
                    {"role": "user", "content": prompt},
                ],
                temperature=0.4,
                max_tokens=1500,
            )
            raw_text = str(response.choices[0].message.content or "")
            insights = self._parse_insights(raw_text)
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
            if final_insights:
                return final_insights
            return [{"category": "overview", "title": "No insights generated", "content": "The AI returned an empty result set.", "severity": "low", "icon": "◈"}]
        except Exception:
            error_text = str(text)[:200]
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
    AI Board Member — conversational agent powered by Groq (llama-3.3-70b-versatile).
    Groq provides ultra-fast inference at no cost on the free tier.
    """

    MODEL = "llama-3.3-70b-versatile"

    def __init__(self) -> None:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError("GROQ_API_KEY not found in environment")
        from groq import Groq
        self.client = Groq(api_key=api_key)

    def chat(
        self,
        user_message: str,
        businesses: List[Dict[str, Any]],
        transactions: List[Dict[str, Any]],
        history: Optional[List[Dict[str, Any]]] = None,
    ) -> str:
        """Send a message and return AI reply with business context injected."""
        context = self._build_context(businesses, transactions)

        system_prompt = (
            "You are an experienced AI Board Member and CFO advisor for a private investment portfolio. "
            "You have full access to the user's business data below. Use it precisely to answer their questions. "
            "Be concise, specific, and professional. Use ₹ for currency (Indian Rupees). "
            "If you reference numbers, use the exact data provided. Be conversational but executive-calibre.\n\n"
            f"BUSINESS PORTFOLIO CONTEXT:\n{context}"
        )

        # Build messages list: system + optional history + new user message
        messages = [{"role": "system", "content": system_prompt}]

        if history:
            for entry in history[-8:]:  # keep last 8 turns for context
                role = str(entry.get("role", "user"))
                content = str(entry.get("content", ""))
                if role in ("user", "assistant"):
                    messages.append({"role": role, "content": content})

        messages.append({"role": "user", "content": user_message})

        response = self.client.chat.completions.create(
            model=self.MODEL,
            messages=messages,
            temperature=0.7,
            max_tokens=1024,
        )
        return str(response.choices[0].message.content or "").strip()

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
            recent_tx = sorted(
                transactions,
                key=lambda t: str(t.get("date", "")),
                reverse=True
            )[:10]
            tx_lines = [
                f"- {t.get('date', '?')}: {t.get('type', '?')} ₹{float(t.get('amount', 0) or 0):,.0f} "
                f"[{t.get('category', '?')}] — {t.get('business_name', '?')}"
                for t in recent_tx
            ]
            summary += "\n\nRECENT TRANSACTIONS (last 10):\n" + "\n".join(tx_lines)

        return summary


# ─────────────────────────────────────────────────────────────────────────────
# Scenario Planner
# ─────────────────────────────────────────────────────────────────────────────

class BusinessScenarioPlanner:
    """
    Models the financial impact of a what-if scenario across the entire portfolio.
    Uses Groq llama-3.3-70b to return structured JSON impact analysis.
    """

    MODEL = "llama-3.3-70b-versatile"

    def __init__(self) -> None:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError("GROQ_API_KEY not found in environment")
        from groq import Groq
        self.client = Groq(api_key=api_key)

    def analyse(
        self,
        scenario: str,
        businesses: List[Dict[str, Any]],
        transactions: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """Run a what-if scenario and return structured impact analysis."""

        # Build compact portfolio context
        total_rev = sum(float(b.get("annual_revenue", 0) or 0) for b in businesses)
        total_prf = sum(float(b.get("annual_profit", 0) or 0) for b in businesses)

        biz_lines = [
            f"- {b.get('name','?')} | Revenue ₹{float(b.get('annual_revenue',0) or 0):,.0f} "
            f"| Profit ₹{float(b.get('annual_profit',0) or 0):,.0f} "
            f"| Cash Flow ₹{float(b.get('cash_flow',0) or 0):,.0f} "
            f"| Industry: {b.get('industry','?')}"
            for b in businesses
        ]
        portfolio_ctx = (
            f"PORTFOLIO: {len(businesses)} ventures | "
            f"Total Revenue ₹{total_rev:,.0f} | Total Profit ₹{total_prf:,.0f}\n\n"
            "VENTURES:\n" + "\n".join(biz_lines)
        )

        system = (
            "You are a CFO-level financial modeller. "
            "Given a portfolio and a what-if scenario, return ONLY a valid JSON object "
            "(no markdown, no extra text) with this exact structure:\n"
            "{\n"
            '  "scenario_summary": "One sentence restatement of the scenario",\n'
            '  "overall_impact": "positive|negative|neutral",\n'
            '  "impact_severity": "low|medium|high",\n'
            '  "projected_revenue_change_pct": <number>,\n'
            '  "projected_profit_change_pct": <number>,\n'
            '  "affected_ventures": [\n'
            '    { "name": "...", "impact": "...", "revenue_delta": <number>, "profit_delta": <number> }\n'
            "  ],\n"
            '  "key_risks": ["risk 1", "risk 2"],\n'
            '  "recommendations": ["action 1", "action 2", "action 3"]\n'
            "}\n"
            "CRITICAL: ALL numeric fields (revenue_delta, profit_delta, projected_*_pct) must be "
            "plain numbers WITHOUT currency symbols. Use ₹ only in string fields like impact text."
        )

        response = self.client.chat.completions.create(
            model=self.MODEL,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": f"PORTFOLIO DATA:\n{portfolio_ctx}\n\nSCENARIO: {scenario}"},
            ],
            temperature=0.4,
            max_tokens=1200,
        )

        raw = str(response.choices[0].message.content or "").strip()

        # Strip markdown fences if present
        if raw.startswith("```"):
            lines = raw.split("\n")
            raw = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])

        # Strip currency symbols that break JSON number parsing
        raw = raw.replace('₹', '')

        try:
            result: Dict[str, Any] = json.loads(raw)
            result["scenario"] = scenario
            result["analysed_at"] = datetime.now().isoformat()
            return result
        except json.JSONDecodeError:
            return {
                "scenario": scenario,
                "scenario_summary": scenario,
                "overall_impact": "unknown",
                "impact_severity": "medium",
                "projected_revenue_change_pct": 0,
                "projected_profit_change_pct": 0,
                "affected_ventures": [],
                "key_risks": [],
                "recommendations": [raw[:500]],
                "analysed_at": datetime.now().isoformat(),
            }


# ─────────────────────────────────────────────────────────────────────────────
# Goal Analyser
# ─────────────────────────────────────────────────────────────────────────────

class BusinessGoalAnalyser:
    """
    Compares user-defined revenue/profit goals against current portfolio performance.
    Uses Groq to generate structured progress analysis and actionable gap advice.
    """

    MODEL = "llama-3.3-70b-versatile"

    def __init__(self) -> None:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError("GROQ_API_KEY not found in environment")
        from groq import Groq
        self.client = Groq(api_key=api_key)

    def analyse(
        self,
        revenue_goal: float,
        profit_goal: float,
        months: int,
        businesses: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """Analyse goal progress and return structured advice."""

        total_rev = sum(float(b.get("annual_revenue", 0) or 0) for b in businesses)
        total_prf = sum(float(b.get("annual_profit", 0) or 0) for b in businesses)

        # Annualise goal if months != 12
        annual_rev_goal = revenue_goal * (12 / months) if months != 12 else revenue_goal
        annual_prf_goal = profit_goal * (12 / months) if months != 12 else profit_goal

        rev_progress = round((total_rev / annual_rev_goal * 100), 1) if annual_rev_goal > 0 else 0
        prf_progress = round((total_prf / annual_prf_goal * 100), 1) if annual_prf_goal > 0 else 0
        rev_gap = annual_rev_goal - total_rev
        prf_gap = annual_prf_goal - total_prf

        biz_lines = [
            f"- {b.get('name','?')}: Revenue ₹{float(b.get('annual_revenue',0) or 0):,.0f}, "
            f"Profit ₹{float(b.get('annual_profit',0) or 0):,.0f}"
            for b in businesses
        ]

        context = (
            f"CURRENT PERFORMANCE (annualised):\n"
            f"  Total Revenue: ₹{total_rev:,.0f} (goal: ₹{annual_rev_goal:,.0f}, {rev_progress}% achieved)\n"
            f"  Total Profit:  ₹{total_prf:,.0f} (goal: ₹{annual_prf_goal:,.0f}, {prf_progress}% achieved)\n"
            f"  Revenue Gap:   ₹{rev_gap:,.0f}\n"
            f"  Profit Gap:    ₹{prf_gap:,.0f}\n"
            f"  Timeframe:     {months} months\n\n"
            "VENTURES:\n" + "\n".join(biz_lines)
        )

        system = (
            "You are a CFO advising on business goal achievement. "
            "Return ONLY a valid JSON object (no markdown, no extra text) with:\n"
            "{\n"
            '  "overall_status": "on_track|at_risk|off_track",\n'
            '  "revenue_status": "on_track|at_risk|off_track",\n'
            '  "profit_status": "on_track|at_risk|off_track",\n'
            '  "revenue_progress_pct": <number>,\n'
            '  "profit_progress_pct": <number>,\n'
            '  "summary": "2-3 sentence executive summary of goal progress",\n'
            '  "top_actions": ["specific action 1", "specific action 2", "specific action 3"],\n'
            '  "months_to_goal_at_current_rate": <number or null if unreachable>\n'
            "}\n"
            "CRITICAL: ALL numeric fields must be plain numbers WITHOUT currency symbols. "
            "Use ₹ only in string fields like summary text. Be specific and reference actual numbers."
        )

        response = self.client.chat.completions.create(
            model=self.MODEL,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": context},
            ],
            temperature=0.3,
            max_tokens=800,
        )

        raw = str(response.choices[0].message.content or "").strip()
        if raw.startswith("```"):
            lines = raw.split("\n")
            raw = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])

        # Strip currency symbols that break JSON number parsing
        raw = raw.replace('₹', '')

        try:
            result: Dict[str, Any] = json.loads(raw)
        except json.JSONDecodeError:
            result = {
                "overall_status": "at_risk",
                "revenue_status": "at_risk",
                "profit_status": "at_risk",
                "revenue_progress_pct": rev_progress,
                "profit_progress_pct": prf_progress,
                "summary": raw[:400],
                "top_actions": [],
                "months_to_goal_at_current_rate": None,
            }

        # Always inject the computed metrics for frontend rendering
        result["revenue_progress_pct"] = rev_progress
        result["profit_progress_pct"] = prf_progress
        result["revenue_goal"] = annual_rev_goal
        result["profit_goal"] = annual_prf_goal
        result["current_revenue"] = total_rev
        result["current_profit"] = total_prf
        result["revenue_gap"] = rev_gap
        result["profit_gap"] = prf_gap
        result["analysed_at"] = datetime.now().isoformat()
        return result
