# bitePOS — 3–4 Hour Hackathon Execution Plan

## Goal

Deliver a polished browser demo of **bitePOS**, a single-device POS for a Dhaka street-food stall with delivery orders and a small dine-in area. The demo proves that one affordable terminal can replace fragmented ordering, payment, kitchen, and stock workflows.

## Judge-Facing Story

> A busy Dhaka food stall takes a mixed dine-in/delivery order, accepts BanglaQR, prints a receipt, routes the ticket to the kitchen, prevents a stock-out from reaching delivery customers, and receives explainable guidance on waste, ingredient price hikes, and rainy-day demand.

### Primary demo journey (90–120 seconds)

1. Ring a customer order from the **Ringing** screen.
2. Select **BanglaQR** and show the dynamic payment QR.
3. Simulate a successful payment: bilingual confirmation, audible chime, and receipt animation.
4. Show the new order in the **KDS Queue**; mark it ready.
5. Trigger **Auto-86**: the final serving of a dish sells out and delivery channels show a simulated paused state.
6. Open the **AI Co-Pilot**: show four explainable cards—WasteLess, Auto-86, a chicken price-hike margin alert, and a rainy-day delivery prep recommendation.

## Scope

### Build

- Responsive browser POS styled as a 720×1280 handheld terminal.
- PostgreSQL-backed sample data served through a local FastAPI API, with Exa Search supplying optional source context for AI insights; no live payment or delivery APIs.
- Cart with category filtering, quantity controls, totals, and cash/BanglaQR checkout.
- Simulated dynamic BanglaQR confirmation, Bangla/English status text, chime, and receipt.
- KDS with in-store/delivery tabs, ETA badges, ready action, and seeded delivery tickets.
- Simulated Auto-86 delivery-channel status update after a stock-out.
- AI Co-Pilot cards for WasteLess, stock-out prevention, margin defense, and weather-based prep guidance.
- Seven-slide pitch deck and a screen-recorded demo video.

### Do not build

- Real money movement, QR settlement, provider webhooks, or API credentials.
- Live Foodpanda, Pathao, Foodi, bKash, or Nagad integrations.
- Authentication, multi-user accounts, cloud deployment, external sync, or analytics.
- Full inventory, recipe management, forecasting, or Android-native printer support.

## Visual and Content Rules

- **Palette:** warm red/orange, cream, and charcoal; high-contrast, large touchscreen controls.
- **Language:** English interface labels with Bangla payment/operational messages.
- **Venue:** one fictional Dhaka street-food stall with delivery and limited dine-in seating.
- **Menu:** Tehari, kacchi, paratha, lassi, burgers, and fried chicken—organized into simple categories.
- **Market references:** Burger Lab, BFC, and Chillox may appear as clearly labeled illustrative market/competitor data. Do not use their logos, copy their design, or imply partnerships.

## Build Order and Timebox

| Time | Outcome | Tasks |
| --- | --- | --- |
| 0:00–0:30 | Runnable foundation | Scaffold Vite/React/Tailwind v4 and FastAPI; configure PostgreSQL, schema, and a deterministic seed script. |
| 0:30–1:20 | Complete checkout flow | Build menu/cart UI; fetch menu data; create orders through the API; implement cash/BanglaQR selector, QR modal, simulated success, chime, and receipt. |
| 1:20–1:55 | Kitchen moment | Build KDS queue from API orders, ETA badges, and **Ready** action; persist the order-state transition. |
| 1:55–2:35 | AI moments | Persist one low-stock dish and Auto-86 state; expose seeded WasteLess, Margin Guard, and weather-prep insights through the API. |
| 2:35–2:55 | Polish and rehearsal | Fix touch targets, verify API state transitions, and add only visible loading/error states. |
| 2:55–3:25 | Pitch deck | Create seven slides using the structure below. |
| 3:25–4:00 | Capture and contingency | Rehearse once, screen-record the demo, export/check the deck, and reserve remaining time for bugs. |

If time is short, protect the checkout-to-KDS path. Keep all four AI cards as polished, deterministic state changes; do not build live integrations, forecasting models, or extra dashboards.

## Technical Architecture

```text
bitepos/
├── frontend/                         # Vite + React + Tailwind CSS v4 (View)
│   └── src/
│       ├── components/                # POS frame, cart, payment, KDS, AI cards
│       ├── features/                  # ringing, kds, inventory, copilot
│       ├── services/api.ts            # typed FastAPI client
│       └── App.tsx
├── backend/
│   └── app/
│       ├── controllers/               # FastAPI routers: menu, orders, insights
│       ├── models/                    # SQLAlchemy ORM entities (Model)
│       ├── schemas/                   # Pydantic request/response contracts
│       ├── services/                  # checkout, insight rules, and Exa retrieval
│       ├── integrations/exa_client.py # server-only Exa Search adapter
│       ├── database.py                # session/connection setup
│       ├── seed.py                    # deterministic hackathon data
│       └── main.py
└── docker-compose.yml                 # local PostgreSQL only
```

### MVC Responsibilities

- **Model:** SQLAlchemy entities and PostgreSQL state for menu items, stock, orders, order items, delivery sync state, and seeded AI insights.
- **View:** React components render the handheld POS experience; Tailwind v4 supplies the responsive visual system.
- **Controller:** FastAPI routers accept requests and return Pydantic contracts. Controllers call services rather than embedding checkout or AI rules.
- **Service layer:** Owns checkout, stock decrement, order-status transition, deterministic insight calculations, and optional Exa retrieval. This preserves a clean seam between the demo UI and later live integrations.
- **Exa adapter:** Fetches source-backed research context for weather and ingredient-price signals. It is called only by FastAPI; `EXA_API_KEY` is never exposed to React.

### Minimal persisted state

```ts
menu_items(id, name, category, price_bdt, stock_qty)
orders(id, channel, status, payment_method, grand_total_bdt, eta_minutes)
order_items(order_id, menu_item_id, quantity, unit_price_bdt)
delivery_sync(menu_item_id, platform, status)
ai_insights(id, kind, title, detail, recommended_action, severity)
insight_sources(insight_id, title, url, excerpt, retrieved_at)
```

Seed Tehari with one serving. Its scripted checkout decrements stock, creates an order, and changes the simulated delivery-sync records to `paused`, making the Auto-86 state causally connected rather than purely visual.

## Screen Checklist

### Ringing

- Category chips: Local Meals, Fast Food, Drinks.
- Menu cards with price, stock badge, and one-tap add button.
- Cart drawer/panel with quantity controls, subtotal, discount, and total.
- Cash and BanglaQR checkout actions.

### BanglaQR Payment

- A decorative, clearly simulated QR code and exact amount.
- “Waiting for payment” state, then one explicit **Simulate bKash payment** action.
- Confirmation: `Payment received / পেমেন্ট গ্রহণ করা হয়েছে`.
- Brief chime using Web Audio; speech is optional and must not block the demo.
- Receipt panel showing order, amount, payment method, and order number.

### KDS

- Merged queue plus In-Store, Delivery, and Ready filters.
- One newly paid order visibly enters the queue.
- ETA/priority badges and a clear **BUMP / READY** button.

### AI Co-Pilot

- **Auto-86:** `Chicken Tehari sold out` → mock Foodpanda/Pathao/Foodi labels change from **Live** to **Paused**.
- **WasteLess:** `Lassi expires in 45 minutes` → suggest a 15% off-peak discount and provide an **Apply deal** button.
- **Margin Guard:** `Chicken price up from ৳190/kg to ৳220/kg` → show the Tehari margin declining (for example, 37% to 29%) and recommend a price review.
- **Weather prep:** `Rain forecast at 1:00 PM` → show a 20% expected delivery-demand increase and recommend preparing 12 additional Tehari portions.
- **Exa source context:** add a non-blocking **Refresh sources** action that calls FastAPI, retrieves a small set of relevant Exa Search highlights, and displays source links beneath the price-hike and weather cards. If Exa is unavailable, keep the seeded insight and label it `Demo data`.
- A small card titled **Market signals** can list Burger Lab, BFC, and Chillox as illustrative market-reference data with a visible `Demo data` label.

## Pitch Deck — Seven Slides

1. **Problem:** tablet overload, payment uncertainty, kitchen chaos, stock-outs, and food waste for Dhaka food vendors.
2. **Solution:** bitePOS as one affordable restaurant operating terminal.
3. **Live flow:** order → BanglaQR → receipt → KDS, supported by a screenshot or simple flow diagram.
4. **AI impact:** Auto-86 prevents cancellations, WasteLess helps sell near-expiry inventory, Margin Guard protects profit, and weather guidance improves prep planning.
5. **Business model:** monthly POS SaaS subscription, optional premium delivery/inventory modules, and hardware reseller/lease margin.
6. **TAM / SAM / SOM:** use clearly sourced or explicitly illustrative estimates; show the narrowing from global/SEA food vendors to reachable Dhaka independent vendors.
7. **Roadmap and ask:** pilot with local vendors, validate payment/delivery partners, and expand after proving operational impact.

## Demo Reliability Checklist

- Start in a clean browser state and use a fixed viewport.
- Seed every order, stock count, and AI alert in PostgreSQL. Exa context is additive: the demo must still work when the external network is unavailable.
- Put obvious fallback buttons on each critical transition: **Simulate payment**, **Add to KDS**, **Mark ready**, **Pause channels**, and **Apply deal**.
- Verify all text is readable at presentation scale and every button is easy to click.
- Keep one screenshot/video backup of the completed payment and AI states.
- State plainly in the pitch that payment and delivery integrations are simulated for the hackathon; Exa is used only to retrieve source context for AI recommendations.

## Definition of Done

- The six-step demo runs end-to-end in under 120 seconds against the local API and database.
- The visual identity is consistent across POS, QR confirmation, KDS, and AI screens.
- All four AI interventions visibly explain the signal, recommendation, and expected operating impact.
- The pitch deck has seven slides and aligns with the live demo.
- A short screen-recorded walkthrough exists as a fallback.
