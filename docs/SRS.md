# 📄 Software Requirements Specification (SRS)
## Dokani-AI / BiteOS Restaurant OS
*Version 1.1 | Date: September 2026*

---

## 1. Introduction

### 1.1 Purpose
This Software Requirements Specification (SRS) specifies the functional, non-functional, and interface requirements for **Dokani-AI (BiteOS)**, an all-in-one handheld Android Point of Sale (POS), Auto Kitchen Display System (KDS), and ambient AI operational agent powered by **Exa API Neural Search** for small and medium food vendors.

### 1.2 Scope
Dokani-AI Restaurant OS operates on single-screen Android handheld POS terminals (e.g., Sunmi V2, iMin) equipped with touchscreen displays, thermal printers, and speakers. The software manages:
* In-store order ringing and ticket management.
* Dynamic **BanglaQR** generation and instant payment verification webhooks.
* Omnichannel delivery order consolidation (Foodpanda, Pathao Food, Foodi).
* Automated kitchen queueing sorted by driver GPS ETA.
* Automated item deactivation ("Auto-86") across delivery aggregators.
* **Exa API Web Intelligence** for weather, traffic, and wholesale commodity price trend forecasting.
* 100% manual raw ingredient purchase logging and real-time dish margin calculation.
* Ambient WasteLess dynamic discounting recommendations for perishable goods.

---

## 2. Specific System Requirements

### 2.1 Functional Requirements

#### FR-1: Point of Sale & Billing
* **FR-1.1:** The system SHALL display a visual grid of menu items categorized by food types.
* **FR-1.2:** The system SHALL allow one-tap cart addition, quantity modification, and item removal.
* **FR-1.3:** The system SHALL compute subtotal, applied discounts, taxes, and final payable amount in real-time.

#### FR-2: Exa API Web Intelligence & Operational Forecaster
* **FR-2.1:** The system SHALL query the **Exa API** (`https://api.exa.ai`) at morning shift initialization for local weather, traffic gridlock news, and market supply alerts.
* **FR-2.2:** The AI agent SHALL synthesize Exa search context into an automated POS banner alert advising the kitchen on prep volume shifts (e.g. rain forecast -> +20% delivery prep).
* **FR-2.3:** The system SHALL query Exa API for wholesale agricultural commodity trends to benchmark against vendor manual stock-in entries.

#### FR-3: Universal BanglaQR & Payment Processing
* **FR-3.1:** The system SHALL generate a dynamic EMVCo-compliant BanglaQR code on screen encoding the merchant ID and exact transaction bill total.
* **FR-3.2:** The system SHALL listen for incoming payment verification webhooks from MFS providers (bKash, Nagad, etc.).
* **FR-3.3:** Upon payment confirmation, the system SHALL play a native audio chime and Bangla voice announcement (e.g., *"bKash-e ৳350 taka received"*).
* **FR-3.4:** Upon payment confirmation, the system SHALL automatically trigger the physical/virtual thermal receipt printer.

#### FR-4: Omnichannel Order Aggregation & Auto Kitchen Display (KDS)
* **FR-4.1:** The system SHALL ingest orders from Foodpanda, Pathao Food, and Foodi APIs into a unified order queue.
* **FR-4.2:** The system SHALL provide a merged queue view and tabbed channel views (`In-Store`, `Foodpanda`, `Pathao`, `Foodi`).
* **FR-4.3:** The KDS SHALL dynamically sort order tickets based on assigned driver ETA (closest driver ETA placed at top of queue).
* **FR-4.4:** Tapping "BUMP / READY" on the KDS SHALL trigger a voice announcement (e.g., *"Pathao Order #402 ready for Rider Rahul"*) and update the delivery aggregator order status to "Ready".

#### FR-5: Delivery Inventory Auto-Sync ("Auto-86")
* **FR-5.1:** The system SHALL track real-time stock levels of prepped dishes.
* **FR-5.2:** When an in-store transaction reduces a dish stock balance to zero, the system SHALL automatically send API commands to Foodpanda, Pathao Food, and Foodi to pause/hide the item within 500 milliseconds.

#### FR-6: Manual Stock-In & Recipe Margin Defense
* **FR-6.1:** The system SHALL provide a 3-step manual touchscreen entry interface (`Select Ingredient`, `Enter Qty`, `Enter Total Taka Paid`).
* **FR-6.2:** The system SHALL compute unit cost per kg/liter (`Total Taka / Quantity`).
* **FR-6.3:** If an ingredient unit cost increases by >5%, the system SHALL recalculate affected recipe margins and display a margin defense alert on the POS billing screen.

#### FR-7: WasteLess Dynamic Discounting
* **FR-7.1:** The system SHALL track shelf-life timestamps for perishable goods (pastries, sweets, prepped meats).
* **FR-7.2:** During configured off-peak hours (e.g., 3:00 PM – 5:00 PM), the system SHALL prompt the cashier with 1-tap discount banners for items approaching expiry.

---

## 3. External Interface Requirements

### 3.1 Software Interfaces
* **Exa API:** HTTPS REST API (`https://api.exa.ai/search`) for neural web search queries powering all 5 AI system prompt agents.
* **BanglaQR Payment Gateway Webhooks:** HTTPS REST Endpoints receiving JSON payment confirmations (bKash, Nagad, Rocket, CellFin).
* **Food Delivery Aggregator APIs:** OAuth2 / REST APIs for Foodpanda, Pathao Food, and Foodi order ingestion and Auto-86 stock status sync.
* **FastAPI WebSocket:** `ws://` persistent connection from React PWA to FastAPI backend for live KDS order push and payment event streaming.
* **LLM Provider Interface (Pluggable):** Abstract `LLMProvider` adapter in Python accepting Gemini, Claude, or GPT-4o backends without modifying system prompts.

---

## 4. Finalized Technology Stack

### Frontend (React PWA)
| Layer | Technology |
| :--- | :--- |
| Framework | React 18 + Vite |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Pattern | MVC (Model/View/Controller via hooks) |
| Real-Time | WebSocket (native browser) |
| Audio / TTS | Web Speech API (`speechSynthesis`) |
| QR Rendering | `qrcode.react` |
| PWA | `vite-plugin-pwa` |

### Backend (FastAPI)
| Layer | Technology |
| :--- | :--- |
| Framework | FastAPI (Python 3.12) |
| Database | PostgreSQL 16 |
| ORM | Prisma (`prisma-client-py`) |
| Background Tasks | FastAPI `BackgroundTasks` |
| Real-Time | FastAPI native WebSocket |
| Pattern | MVC (Routers → Services → Repositories) |

### AI & Intelligence Layer
| Layer | Technology |
| :--- | :--- |
| Web Intelligence | Exa API (`api.exa.ai`) |
| LLM Engine | LLM-Agnostic Provider Interface |
| Output Validation | Pydantic v2 JSON Schemas |

### Dev & Deployment
| Layer | Technology |
| :--- | :--- |
| Local Dev | Docker Compose |
| Containerization | Docker |
| Target Hardware | Android POS (Sunmi V2 / iMin) via Chrome PWA |
