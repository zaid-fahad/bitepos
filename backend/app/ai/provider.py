"""
Abstract LLM Provider interface + pluggable adapters.

Usage:
    provider = get_llm_provider()          # reads LLM_PROVIDER env var
    result = await provider.complete(system_prompt, user_message)

Add a new adapter by subclassing LLMProvider and registering it in _REGISTRY.
"""
from __future__ import annotations

import os
from abc import ABC, abstractmethod

import httpx


class LLMProvider(ABC):
    """Pluggable LLM backend. Swap without rewriting prompts."""

    @abstractmethod
    async def complete(self, system: str, user: str) -> str:
        """Return raw LLM text response."""


# ---------------------------------------------------------------------------
# Gemini adapter
# ---------------------------------------------------------------------------

class GeminiAdapter(LLMProvider):
    _BASE = "https://generativelanguage.googleapis.com/v1beta/models"
    _MODEL = "gemini-2.0-flash"

    async def complete(self, system: str, user: str) -> str:
        api_key = os.environ["GEMINI_API_KEY"]
        url = f"{self._BASE}/{self._MODEL}:generateContent?key={api_key}"
        payload = {
            "system_instruction": {"parts": [{"text": system}]},
            "contents": [{"role": "user", "parts": [{"text": user}]}],
            "generationConfig": {"temperature": 0.2, "maxOutputTokens": 1024},
        }
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(url, json=payload)
            resp.raise_for_status()
            return resp.json()["candidates"][0]["content"]["parts"][0]["text"]


# ---------------------------------------------------------------------------
# Claude (Anthropic) adapter
# ---------------------------------------------------------------------------

class ClaudeAdapter(LLMProvider):
    _URL = "https://api.anthropic.com/v1/messages"
    _MODEL = "claude-sonnet-4-5"

    async def complete(self, system: str, user: str) -> str:
        api_key = os.environ["ANTHROPIC_API_KEY"]
        headers = {
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        }
        payload = {
            "model": self._MODEL,
            "max_tokens": 1024,
            "system": system,
            "messages": [{"role": "user", "content": user}],
        }
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(self._URL, json=payload, headers=headers)
            resp.raise_for_status()
            return resp.json()["content"][0]["text"]


# ---------------------------------------------------------------------------
# OpenAI adapter
# ---------------------------------------------------------------------------

class OpenAIAdapter(LLMProvider):
    _URL = "https://api.openai.com/v1/chat/completions"
    _MODEL = "gpt-4o-mini"

    async def complete(self, system: str, user: str) -> str:
        api_key = os.environ["OPENAI_API_KEY"]
        headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
        payload = {
            "model": self._MODEL,
            "temperature": 0.2,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
        }
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(self._URL, json=payload, headers=headers)
            resp.raise_for_status()
            return resp.json()["choices"][0]["message"]["content"]


# ---------------------------------------------------------------------------
# Mock adapter (no API key needed — for local dev / tests)
# ---------------------------------------------------------------------------

class MockAdapter(LLMProvider):
    """Returns a canned JSON string. Useful for local dev without API keys."""

    async def complete(self, system: str, user: str) -> str:  # noqa: ARG002
        return '{"mock": true, "note": "Set LLM_PROVIDER env var to gemini/claude/openai for real responses."}'


# ---------------------------------------------------------------------------
# Registry + factory
# ---------------------------------------------------------------------------

_REGISTRY: dict[str, type[LLMProvider]] = {
    "gemini": GeminiAdapter,
    "claude": ClaudeAdapter,
    "openai": OpenAIAdapter,
    "mock": MockAdapter,
}


def get_llm_provider() -> LLMProvider:
    """Instantiate the correct adapter from the LLM_PROVIDER env var."""
    name = os.environ.get("LLM_PROVIDER", "mock").lower()
    cls = _REGISTRY.get(name, MockAdapter)
    return cls()
