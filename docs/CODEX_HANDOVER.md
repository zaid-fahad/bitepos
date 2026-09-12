# 🤖 Codex Handover Brief — BiteOS / Dokani-AI Restaurant POS

## Repo
**GitHub:** https://github.com/zaid-fahad/bitepos  
**Local Workspace:** `/Users/gm-ict/Documents/agents everywhere`  
**Git Branch:** `main`

---

## Project Summary
**BiteOS** (Dokani-AI) is an all-in-one Android POS Operating System for small and medium restaurants, cloud kitchens, bakeries, and food stalls — primarily targeting Bangladesh and emerging markets. It runs as a **React PWA** on a single affordable Android POS handheld device (Sunmi V2 / iMin) replacing:
- Multiple food delivery tablets (Foodpanda, Pathao, Foodi)
- Laminated QR payment stands (bKash, Nagad, Rocket)
- Paper kitchen order spikes
- Manual billing registers

The AI Agent is **ambient** — it lives on the billing screen, kitchen display, speaker, and payment pipeline. NOT in a chatbox.

---

## Tech Stack (Locked In)

### Frontend
- **React 18 + Vite** (TypeScript)
- **Tailwind CSS v4**
- **MVC pattern** (hooks as controllers)
- **WebSocket** (native browser) — real-time KDS orders, payment events
- **Web Speech API** (`speechSynthesis`) — Bangla + English TTS, zero dependencies, offline
- **`qrcode.react`** — dynamic EMVCo BanglaQR code rendering
- **`vite-plugin-pwa`** — installable PWA on Android Chrome homescreen

### Backend
- **FastAPI** (Python 3.12)
- **PostgreSQL 16**
- **Prisma ORM** (`prisma-client-py`) — type-safe schema + migrations
- **FastAPI native WebSocket** — broadcasts order events, payment confirmations, AI alerts
- **FastAPI BackgroundTasks** — scheduled morning Exa forecast, WasteLess checks, EOD recap

### AI & Intelligence
- **Exa API** (`api.exa.ai/search`) — Neural web search for weather, traffic, commodity price news
- **LLM-Agnostic Provider Interface** — abstract `LLMProvider` base class with pluggable adapters (Gemini, Claude, GPT-4o). No prompts should be rewritten when switching models.
- **Pydantic v2** — strict JSON schema validation for all LLM outputs

### Dev & Deployment
- **Docker Compose** — spins up `postgres` + `backend` + `frontend` in one command
- **Target hardware:** Android POS (Sunmi V2 / iMin) — portrait 720x1280 touchscreen

---

## GitHub Issues (Build Order)

Work these in order. Each issue has full acceptance criteria on GitHub:

| Priority | Issue | URL |
|---|---|---|
| 1st | 📦 [INFRA] Project scaffold: Docker Compose + FastAPI + React Vite + PostgreSQL | https://github.com/zaid-fahad/bitepos/issues/1 |
| 2nd | 🗄️ [BACKEND] Prisma schema: Orders, Dishes, Ingredients, StockIn, KDS models | https://github.com/zaid-fahad/bitepos/issues/2 |
| 3rd | 🛒 [FRONTEND] POS Ringing screen: Product grid, cart, discount & tax | https://github.com/zaid-fahad/bitepos/issues/3 |
| 4th | 💳 [FRONTEND+BACKEND] BanglaQR payment modal + webhook simulation + audio chime | https://github.com/zaid-fahad/bitepos/issues/4 |
| 5th | 🍳 [FRONTEND+BACKEND] Auto KDS Queue + Driver ETA sorting + Bump bar | https://github.com/zaid-fahad/bitepos/issues/5 |
| 6th | 🔴 [BACKEND] Auto-86 Stock Sync across Foodpanda/Pathao/Foodi | https://github.com/zaid-fahad/bitepos/issues/6 |
| 7th | 🤖 [AI] Morning Forecaster Agent: Exa API weather + LLM prep banner | https://github.com/zaid-fahad/bitepos/issues/7 |
| 8th | 📦 [FRONTEND+BACKEND] Manual Stock-In + Margin Defense Agent | https://github.com/zaid-fahad/bitepos/issues/8 |
| 9th | 🥦 [AI] WasteLess Discounting Agent + Shelf-life tracker | https://github.com/zaid-fahad/bitepos/issues/9 |
| 10th | 🌙 [BACKEND+FRONTEND] EOD Financial Recap Agent + Thermal Slip | https://github.com/zaid-fahad/bitepos/issues/10 |

---

## Proposed Project Directory Structure

```
bitepos/
├── docker-compose.yml
├── .env.example
├── README.md
├── docs/                          # All spec & planning docs (already exists)
│   ├── PROJECT_OVERVIEW.md
│   ├── SRS.md
│   ├── bitepos_architecture_spec.md
│   ├── SYSTEM_PROMPTS.md
│   └── implementation_plan.md
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── main.py                    # FastAPI app entry point
│   ├── prisma/
│   │   └── schema.prisma          # PostgreSQL schema
│   ├── app/
│   │   ├── routers/               # FastAPI route controllers
│   │   │   ├── orders.py
│   │   │   ├── payments.py
│   │   │   ├── stock.py
│   │   │   ├── ai.py
│   │   │   └── ws.py              # WebSocket endpoint
│   │   ├── services/              # Business logic
│   │   │   ├── order_service.py
│   │   │   ├── payment_service.py
│   │   │   ├── stock_service.py
│   │   │   ├── auto86_service.py
│   │   │   └── ai_service.py
│   │   ├── ai/
│   │   │   ├── provider.py        # Abstract LLMProvider interface
│   │   │   ├── adapters/
│   │   │   │   ├── gemini.py
│   │   │   │   ├── claude.py
│   │   │   │   └── openai.py
│   │   │   ├── exa_service.py     # Exa API wrapper
│   │   │   └── prompts/           # System prompt implementations
│   │   │       ├── morning_forecast.py    # Prompt 1
│   │   │       ├── margin_defense.py      # Prompt 2
│   │   │       ├── wasteless.py           # Prompt 3
│   │   │       ├── voice_announcement.py  # Prompt 4
│   │   │       └── eod_recap.py           # Prompt 5
│   │   └── models/                # Pydantic v2 schemas
│   │       ├── order.py
│   │       ├── payment.py
│   │       ├── stock.py
│   │       └── ai_responses.py
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.ts
    ├── index.html
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── components/
        │   ├── pos/               # Ringing screen components
        │   ├── kds/               # Kitchen Display components
        │   ├── stock/             # Stock-In components
        │   ├── ai/                # AI Co-Pilot dashboard
        │   ├── payment/           # BanglaQR modal
        │   └── shared/            # Common UI components
        ├── hooks/                 # Controller layer (useWebSocket, useCart, etc.)
        ├── services/              # API client functions
        └── types/                 # TypeScript interfaces
```

---

## Key Design Rules (DO NOT BREAK)

1. **Agents leave the chatbox** — AI agent outputs always surface as contextual POS banners, audio chimes, or thermal receipt slips. NEVER as a chat interface.
2. **Portrait-first UI** — All screens designed for 720x1280 handheld Android POS. Touch targets minimum 48x48px.
3. **Manual Stock-In is sacred** — Vendors type their own wholesale market purchase data. No OCR, no scraping. Just 3 simple fields: Item, Qty, Total Taka Paid.
4. **Offline resilience** — In-store billing, cash transactions, and thermal printing must work without internet. Queue failed API calls for retry on reconnection.
5. **LLM outputs are always Pydantic-validated** — Never pass raw LLM string responses to the frontend. Always parse through response schemas.
6. **BanglaQR is the primary payment method** — Integrates bKash, Nagad, Rocket, CellFin, Upay, Bank Apps. Do NOT simplify to a generic QR.

---

## Environment Variables Required

```env
# Database
DATABASE_URL=postgresql://bitepos:bitepos@postgres:5432/bitepos

# AI Services
EXA_API_KEY=your_exa_api_key
LLM_PROVIDER=gemini                    # gemini | claude | openai
GEMINI_API_KEY=your_gemini_api_key
ANTHROPIC_API_KEY=your_claude_key
OPENAI_API_KEY=your_openai_key

# Payment (BanglaQR Sandbox)
BANGLA_QR_MERCHANT_ID=your_merchant_id
BKASH_SANDBOX_API_KEY=your_bkash_key
NAGAD_SANDBOX_API_KEY=your_nagad_key

# Delivery App Sandbox APIs
FOODPANDA_API_KEY=your_foodpanda_key
PATHAO_API_KEY=your_pathao_key
FOODI_API_KEY=your_foodi_key
```

---

## System Prompts
Full prompt definitions (including Exa API query templates, input variable schemas, and strict Pydantic output schemas) are documented in:  
📄 `docs/SYSTEM_PROMPTS.md`

## Full Architecture & SRS
📐 `docs/bitepos_architecture_spec.md`  
📑 `docs/SRS.md`

---

## Working Rules
- **Before modifying any existing file or creating new code**, show the user a clear diff/plan of what will change and ask for permission.
- **Commit per issue** using conventional commits: `feat(#1): scaffold docker compose and project structure`
- **Close GitHub issues** as each one is completed: `gh issue close N --repo zaid-fahad/bitepos`
- **Start with Issue #1** — Docker Compose scaffold. Nothing else until that is approved and merged.
