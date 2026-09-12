"""System Prompt 1 — Morning Shift Weather & Exa Intelligence Forecaster."""
from __future__ import annotations

import json
import re
from typing import Literal

from pydantic import BaseModel, Field

from app.ai.exa_service import exa_search, format_exa_context
from app.ai.provider import get_llm_provider


class MorningBrief(BaseModel):
    banner_text: str = Field(max_length=140)
    weather_summary: str
    delivery_delta_pct: int = Field(ge=-30, le=60)
    weather_kind: Literal["rain", "sun", "storm"]


SYSTEM_PROMPT = """You are Dokani-AI's Morning Shift Forecaster for a Dhaka street-food restaurant.
Use the supplied Exa weather and traffic intelligence to give one short, practical delivery-prep recommendation.
Return ONLY JSON with banner_text, weather_summary, delivery_delta_pct, weather_kind (rain, sun, or storm)."""


async def run_morning_forecast() -> MorningBrief:
    results = await exa_search("Dhaka Bangladesh weather today rain traffic delivery conditions", num_results=3)
    context = format_exa_context(results)
    raw = await get_llm_provider().complete(SYSTEM_PROMPT, f"Exa intelligence:\n{context}\nReturn validated JSON.")
    try:
        clean = re.sub(r"```(?:json)?|```", "", raw).strip()
        match = re.search(r"\{.*\}", clean, re.DOTALL)
        return MorningBrief.model_validate(json.loads(match.group() if match else clean))
    except Exception:
        return MorningBrief(banner_text="Rain expected at lunch — prepare 20% more delivery portions.", weather_summary="Rainy Dhaka lunch window", delivery_delta_pct=20, weather_kind="rain")
