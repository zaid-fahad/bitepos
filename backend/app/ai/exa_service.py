"""
Exa API neural search wrapper.

Docs: https://docs.exa.ai/reference/search
"""
from __future__ import annotations

import os
from dataclasses import dataclass

import httpx

_EXA_URL = "https://api.exa.ai/search"


@dataclass
class ExaResult:
    title: str
    url: str
    highlight: str


async def exa_search(query: str, num_results: int = 3) -> list[ExaResult]:
    """
    Query Exa API and return a list of ExaResult highlights.

    Falls back to an empty list when EXA_API_KEY is missing (local dev).
    """
    api_key = os.environ.get("EXA_API_KEY", "")
    if not api_key:
        return [
            ExaResult(
                title="[Mock Exa Result — set EXA_API_KEY]",
                url="https://exa.ai",
                highlight=f"No Exa API key set. Query was: {query}",
            )
        ]

    headers = {"x-api-key": api_key, "Content-Type": "application/json"}
    payload = {
        "query": query,
        "numResults": num_results,
        "highlights": {"numSentences": 2, "highlightsPerUrl": 1},
        "type": "neural",
    }
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.post(_EXA_URL, json=payload, headers=headers)
        resp.raise_for_status()
        data = resp.json()

    results = []
    for item in data.get("results", []):
        highlight = ""
        highlights = item.get("highlights", [])
        if highlights:
            highlight = highlights[0]
        results.append(ExaResult(title=item.get("title", ""), url=item.get("url", ""), highlight=highlight))
    return results


def format_exa_context(results: list[ExaResult]) -> str:
    """Serialise Exa results into a compact string for LLM context injection."""
    lines = []
    for i, r in enumerate(results, 1):
        lines.append(f"[{i}] {r.title}\n    {r.highlight}\n    Source: {r.url}")
    return "\n\n".join(lines) if lines else "No external context available."
