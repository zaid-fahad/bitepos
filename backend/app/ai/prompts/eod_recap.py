"""System Prompt 5 — End-of-Day Financial & Operational Summariser."""
from __future__ import annotations

import re
from typing import Any

from app.ai.provider import get_llm_provider

# ---------------------------------------------------------------------------
# System prompt text
# ---------------------------------------------------------------------------

_SYSTEM = """You are Dokani-AI End-of-Day Reporting Agent for a small restaurant POS in Bangladesh.

Inputs Provided:
1. Total Daily Transactions: {transactions_summary}
2. Total KDS Orders Prepared: {kds_total_count}
3. Ingredient Manual Purchases Logged Today: {manual_purchases}
4. Waste Prevented (Taka): {waste_prevented_bdt}

Tasks:
- Format a 1-page receipt slip layout summarising total revenue, channel breakdown, estimated net profit (assume 28% margin on delivery, 32% on in-store), waste prevented, and AI ingredient cost warnings for tomorrow.
- Use ৳ for currency. Keep all lines under 48 characters wide.
- Output plain-text ASCII only — no JSON, no markdown, no code fences.

Output starts with the header line and ends with the footer line."""


async def run_eod_recap(
    *,
    transactions_summary: dict[str, Any],
    kds_total_count: int,
    manual_purchases: list[dict[str, Any]],
    waste_prevented_bdt: float,
) -> str:
    """Call LLM and return a formatted 48-char-wide ASCII thermal slip string."""
    prompt = _SYSTEM.format(
        transactions_summary=str(transactions_summary),
        kds_total_count=kds_total_count,
        manual_purchases=str(manual_purchases),
        waste_prevented_bdt=waste_prevented_bdt,
    )

    provider = get_llm_provider()
    raw = await provider.complete(
        system=prompt,
        user="Generate the end-of-day receipt slip now.",
    )

    # Strip any accidental markdown fences
    clean = re.sub(r"```(?:\w+)?|```", "", raw).strip()
    return clean
