"""System Prompt 2 — Ingredient Cost & Margin Defense Agent."""
from __future__ import annotations

import json
import re
from typing import Any

from pydantic import BaseModel

from app.ai.exa_service import exa_search, format_exa_context
from app.ai.provider import get_llm_provider

# ---------------------------------------------------------------------------
# Pydantic response schema (strict — LLM must match this exactly)
# ---------------------------------------------------------------------------

class AffectedDish(BaseModel):
    dish_id: str
    dish_name: str
    old_margin_pct: float
    new_margin_pct: float
    recommended_price_bdt: float
    recommended_action_text: str


class MarginDefenseResponse(BaseModel):
    ingredient_name: str
    logged_unit_cost_bdt: float
    city_median_unit_cost_bdt: float
    margin_warning: bool
    affected_dishes: list[AffectedDish]


# ---------------------------------------------------------------------------
# System prompt text
# ---------------------------------------------------------------------------

_SYSTEM = """You are Dokani-AI Margin Defense Agent, a financial analyst for local food vendors and restaurants in Bangladesh.

Inputs Provided:
1. Vendor Manual Stock-In Log: {manual_stock_log}
2. Exa API Wholesale Market Intelligence: {exa_context}
3. Current Menu Recipe Breakdown & Prices: {recipe_catalog}

Tasks:
- Compute new unit costs for raw ingredients from the stock-in log.
- Recalculate cost-of-goods-sold (COGS) and net margin % for affected dishes.
- Estimate city_median_unit_cost_bdt from the Exa context (use the logged cost if no context is available).
- If a dish profit margin drops below 28%, flag margin_warning as true and recommend:
  Option A: Suggest POS menu price adjustment.
  Option B: Suggest portion size adjustment (e.g. reduce rice by 50g).
- Return ONLY valid JSON matching the schema below. No markdown, no code fences.

Response Schema:
{
  "ingredient_name": "string",
  "logged_unit_cost_bdt": number,
  "city_median_unit_cost_bdt": number,
  "margin_warning": boolean,
  "affected_dishes": [
    {
      "dish_id": "string",
      "dish_name": "string",
      "old_margin_pct": number,
      "new_margin_pct": number,
      "recommended_price_bdt": number,
      "recommended_action_text": "string"
    }
  ]
}"""


def _extract_json(text: str) -> Any:
    """Strip markdown fences and parse first JSON object found."""
    clean = re.sub(r"```(?:json)?|```", "", text).strip()
    match = re.search(r"\{.*\}", clean, re.DOTALL)
    if match:
        return json.loads(match.group())
    return json.loads(clean)


async def run_margin_defense(
    *,
    ingredient_name: str,
    unit_cost_bdt: float,
    quantity: float,
    unit: str,
    recipe_catalog: list[dict[str, Any]],
) -> MarginDefenseResponse:
    """Call Exa + LLM and return a validated MarginDefenseResponse."""
    query = f"Bangladesh {ingredient_name} wholesale market price news 2026"
    exa_results = await exa_search(query, num_results=3)
    exa_context = format_exa_context(exa_results)

    manual_stock_log = (
        f"{ingredient_name}: {quantity} {unit} @ ৳{unit_cost_bdt:.2f}/unit"
    )

    prompt = _SYSTEM.format(
        manual_stock_log=manual_stock_log,
        exa_context=exa_context,
        recipe_catalog=json.dumps(recipe_catalog, ensure_ascii=False),
    )

    provider = get_llm_provider()
    raw = await provider.complete(
        system=prompt,
        user=f"Analyse this stock-in entry and return JSON: {manual_stock_log}",
    )

    try:
        data = _extract_json(raw)
        return MarginDefenseResponse(**data)
    except Exception:
        # Graceful fallback — return a neutral response so the POS keeps running
        return MarginDefenseResponse(
            ingredient_name=ingredient_name,
            logged_unit_cost_bdt=unit_cost_bdt,
            city_median_unit_cost_bdt=unit_cost_bdt,
            margin_warning=False,
            affected_dishes=[],
        )
