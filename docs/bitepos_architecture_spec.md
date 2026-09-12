# 🍳 Dokani-AI / BiteOS: Master Architectural & Product Specification

---

## Executive Overview

**Dokani-AI (BiteOS)** is an all-in-one operating system designed specifically for **restaurants, cloud kitchens, fast-food stalls, bakeries, and food vendors** in Bangladesh and emerging markets (with built-in multi-currency & multi-payment expansion for SEA, EU, and US). 

It replaces $1,500+ worth of fragmented hardware—multiple food delivery tablets, laminated payment QR codes, paper ticket spikes, and manual cash registers—with a **single affordable Android POS terminal ($100–$150)** running an **ambient AI operational agent powered by Exa API Neural Search**.

```
+---------------------------------------------------------------------------------+
|                       SINGLE HANDHELD ANDROID POS TERMINAL                      |
|                 (Touchscreen + Built-in Thermal Printer + Speaker)              |
|                                                                                 |
|  [ In-Store Billing ]  [ Universal BanglaQR ]  [ Foodpanda/Pathao Integration ]   |
|           │                     │                             │                 |
|           └─────────────────────┼─────────────────────────────┘                 |
|                                 │                                               |
|                                 ▼                                               |
|               [ AMBIENT DOKANI-AI AGENT (EXA API POWERED) ]                     |
|        • Exa Search Real-Time Web Intelligence (Weather, Traffic, Market News) |
|        • Auto-Routes Orders to Auto Kitchen Display System (KDS)                |
|        • Morning Weather & Delivery Demand Forecast (Rain -> Prep 20% more)     |
|        • Driver ETA Priority Queueing & Hands-Free Rider Announcement           |
|        • Auto-86 / Stock Sync Across Apps when Dish Sells Out In-Store          |
|        • WasteLess Dynamic Discounts on Perishable Prepped Food                 |
|        • Dish Margin Recalculation from Manual Wholesale Ingredient Inputs      |
|        • Audio Payment Confirmation Chimes ("bKash ৳350 Received")              |
|                                 │                                               |
|                   ┌─────────────┴──────────────┐                                |
|                   ▼                            ▼                                |
|     [ AUTO KITCHEN DISPLAY (KDS) ]   [ THERMAL RECEIPT & RECAP PRINT ]          |
+---------------------------------------------------------------------------------+
```

---

## System Architecture & Data Flow (Featuring Exa API)

```mermaid
graph TD
    subgraph External Drivers & Web Services
        FP[Foodpanda API]
        PF[Pathao Food API]
        FI[Foodi API]
        MFS[BanglaQR Payment Webhooks\nbKash / Nagad / Banks]
        EXA[Exa API Neural Search Engine\nLive Weather, Commodity News & Local Signals]
    end

    subgraph Dokani-AI POS Core Runtime (Handheld Android Device)
        OR[Omnichannel Order Ingestion Engine]
        KDS[Auto Kitchen Display System]
        POS[Point of Sale Billing & Dynamic BanglaQR Generator]
        PRT[Thermal Receipt Printer Controller]
        AUD[Native Audio Voice Synthesizer / Speaker]
        INV[Inventory & Auto-86 Sync Engine]
        STK[Manual Stock-In & Cost Tracker]
    end

    subgraph AI Co-Pilot Core (Exa API + LLM Engine)
        WAI[Weather & Event Demand Forecaster\nVia Exa Search API]
        MAI[Margin Defense & Price Predictor\nVia Exa Commodity Intelligence]
        WAI2[WasteLess Perishable Discount Engine]
        ETA[Driver ETA Priority Engine]
    end

    FP --> OR
    PF --> OR
    FI --> OR
    EXA --> WAI
    EXA --> MAI

    OR --> KDS
    KDS --> ETA
    ETA --> AUD
    POS --> MFS
    POS --> INV
    INV --> FP
    INV --> PF
    INV --> FI
    STK --> MAI
    MAI --> POS
    WAI2 --> POS
    POS --> PRT
```

---

## Core System Modules & Functional Specs

### 1. 🔍 Exa API Real-Time Web Intelligence Integration
* **Neural Web Search:** Queries **Exa API** (`api.exa.ai/search`) for hyper-local Dhaka, Kuala Lumpur, and emerging market signals.
* **Weather & Traffic Signals:** Fetches live weather warnings (rain, waterlogging), monsoon alerts, and local traffic gridlocks to forecast delivery app order spikes vs in-store foot traffic drops.
* **Commodity Price Benchmarking:** Cross-checks vendor manual stock-in purchase prices against recent web news on wholesale market price shifts (e.g. egg/poultry price surges or onion tariff changes).

### 2. 💳 Universal BanglaQR & Payment Module
* **Interoperable Standard:** Generates EMVCo-compliant **BanglaQR** codes on the POS screen. Supports bKash, Nagad, Rocket, CellFin, Upay, Bank Apps (Citytouch, EBL, BRAC), and Visa/Mastercard.
* **Instant Payment Webhook Sync:** Listening service receives digital payment webhooks instantly.
* **Audio Voice Chime:** POS speaker triggers native Bangla voice synthesis:
  > 🔊 *"bKash-e ৳350 taka porishodh kora hoyeche."*
* **Auto-Printing:** Automatically outputs thermal receipt ticket upon payment completion.

### 3. 🛵 Delivery App Co-Pilot & "Auto-86" Stock Sync
* **Aggregator Ingestion:** Single webhook receiver for Foodpanda, Pathao Food, and Foodi APIs.
* **Auto-86 Stock Sync:** When an in-store checkout reduces a dish stock count to `0`, the POS dispatches an emergency API pause to all delivery aggregators within 500ms, preventing order cancellation penalties.

### 4. 🍳 Auto Kitchen Display System (KDS) & Driver ETA Queue
* **Unified Feed & Tabbed Channel Views:** Cashiers/cooks can view a single merged priority feed or toggle between `In-Store`, `Foodpanda`, `Pathao`, and `Foodi` tabs.
* **Rider ETA Prioritization:** Sorts kitchen prep tickets dynamically based on live driver GPS distance (e.g., Pathao rider 2m away takes priority over Foodpanda rider 15m away).
* **Hands-Free Rider Voice Announcement:** Tapping "Ready" triggers POS speaker:
  > 🔊 *"Pathao Order #402 is ready for Rider Rahul."*

### 5. 📝 100% Manual Stock-In & Dish Margin Defense
* **5-Second Touchscreen Entry:** Vendors log raw ingredient market buys:
  * Input: `Broiler Chicken` | `20 kg` | `৳3,800` ➔ Auto-logs `৳190/kg`.
* **Recipe Margin Calculation:** Instantly updates dish production costs. Flags margin drops on menu items when ingredient costs spike.
* **Predictive Price Model:** Uses historical manual entry logs + Exa API market intelligence to forecast price surges (Fridays, Ramadan, monsoons).

### 6. 🥦 WasteLess Dynamic Discounting Engine
* **Shelf-Life Tracker:** Monitors prep timestamp vs. expiry window for prepped food (sweets, pastries, pre-cooked combo bases).
* **Contextual POS Promotion:** Prompts cashier during slow hours (3 PM – 5 PM) to offer 15% discounts on near-expiry batches.

---

## Technical Stack

### Frontend
| Layer | Technology | Notes |
| :--- | :--- | :--- |
| **Framework** | React 18 + Vite | Fast HMR dev server, optimized PWA bundling |
| **Language** | TypeScript | Full type safety across components and API contracts |
| **Styling** | Tailwind CSS v4 | Utility-first CSS. Handheld POS portrait frame design. |
| **Architecture** | MVC Pattern | Model (data/API state), View (React components), Controller (hooks/services) |
| **Real-Time** | WebSocket (native browser) | Live KDS order push, payment confirmations, Auto-86 stock events |
| **Audio / TTS** | Web Speech API (`speechSynthesis`) | Built-in Android Chrome. Zero dependencies. Bangla + English TTS. Offline capable. |
| **QR Rendering** | `qrcode.react` | Generates dynamic EMVCo BanglaQR codes from live bill totals |
| **PWA** | `vite-plugin-pwa` | Service Worker, offline cache, installable on Android POS homescreen |

### Backend
| Layer | Technology | Notes |
| :--- | :--- | :--- |
| **Framework** | FastAPI (Python 3.12) | Async-first REST + WebSocket server |
| **Language** | Python 3.12 | Type-annotated with Pydantic v2 schemas |
| **Database** | PostgreSQL 16 | Relational schema for Orders, Dishes, Ingredients, Stock-In Logs |
| **ORM** | Prisma (`prisma-client-py`) | Type-safe schema + migrations |
| **Background Tasks** | FastAPI `BackgroundTasks` | Morning Exa forecast, WasteLess shelf checks, EOD recap generator |
| **Real-Time** | FastAPI native WebSocket | Broadcasts live order events and payment webhooks to React frontend |
| **Architecture** | MVC Pattern | Routers (Controller) → Services (Business Logic) → Prisma Repositories (Model) |

### AI & Intelligence Layer
| Layer | Technology | Notes |
| :--- | :--- | :--- |
| **Web Intelligence** | **Exa API** (`api.exa.ai/search`) | Neural Search for weather, traffic, commodity price news |
| **LLM Engine** | LLM-Agnostic Provider Interface | Abstract `LLMProvider` interface. Adapters for Gemini, Claude, GPT-4o without rewriting prompts. |
| **Output Schema** | Pydantic v2 Models | All LLM outputs validated against strict JSON response schemas |

### Deployment & Dev Environment
| Layer | Technology | Notes |
| :--- | :--- | :--- |
| **Local Dev** | Docker Compose | Spins up FastAPI + PostgreSQL + React Vite dev server in one command |
| **Containerization** | Docker | `Dockerfile` for FastAPI backend + PostgreSQL image |
| **Target Hardware** | Android POS (Sunmi V2 / iMin) | PWA installed on Android Chrome, 720x1280 portrait touchscreen layout |
