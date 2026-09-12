# bitePOS Restaurant OS — Project Overview & Delivery Plan

**Planning baseline:** September 2026  
**Initial market:** Bangladesh; begin with Dhaka-based independent restaurants, food stalls, cloud kitchens, bakeries, and sweet shops.

## 1. Product Summary

bitePOS is a single-device restaurant operating system for Android POS terminals with a touchscreen, thermal printer, and speaker. It replaces separate delivery tablets, static payment QR codes, paper kitchen tickets, and basic registers with one operational surface for counter sales, kitchen flow, delivery orders, stock visibility, and proactive operational prompts.

The first release should prove one clear outcome: a small food vendor can take an order, receive and confirm a digital payment, print a receipt, and route the order to the kitchen quickly from one device—even during unreliable connectivity.

## 2. Customer Problem, Promise, and Scope

| Customer problem | bitePOS response | Release priority |
| --- | --- | --- |
| Multiple tablets and fragmented counter workflow | Unified POS, order stream, and kitchen display | P0 |
| Slow or uncertain QR payment confirmation | Dynamic BanglaQR, confirmation feedback, receipt | P0 |
| Kitchen rush and missed delivery handoffs | ETA-aware KDS and ready-state announcement | P1 |
| Selling items that have run out | Dish-level stock and Auto-86 sync | P1 |
| Ingredient cost spikes eroding margins | Fast manual stock-in and margin alerts | P2 |
| Perishable food waste | Near-expiry, off-peak discount prompts | P2 |
| Weather-driven demand changes | Prep recommendations | P3 |

### Primary users

- **Cashier:** fast item ringing, payment certainty, and receipt printing.
- **Cook / kitchen staff:** a readable prioritized queue and one-tap order completion.
- **Owner / manager:** stock cost, margin, waste, and daily operating signals.

### Out of scope for the prototype

- Live money movement, production payment certification, or storing payment credentials.
- Contracted, production integrations with Foodpanda, Pathao Food, Foodi, or MFS providers.
- A predictive model based on city-wide anonymized data.
- Multi-country localization and compliance.

These can be represented with realistic adapters and simulators until commercial API access, data-sharing terms, and compliance requirements are confirmed.

## 3. Product Strategy

Build in two tracks so a polished demonstration does not get mistaken for a production-ready financial and delivery platform.

| Track | Goal | Technology / proof |
| --- | --- | --- |
| **Interactive prototype** | Validate counter flow, kitchen usability, and the ambient-agent experience with vendors. | HTML/CSS/vanilla JavaScript, local persistence, simulated QR payment and printer/audio events. |
| **Production discovery** | De-risk platform access, offline behavior, security, settlement, and hardware support before committing to a production build. | API partner validation, Android device evaluation, threat model, integration spikes, pilot requirements. |

## 4. Release Plan

### Milestone 0 — Foundation and validation (Weeks 1–2)

**Objective:** make the prototype navigable and validate the real-world constraints.

- Create the 720×1280 handheld POS shell with clear online/offline state.
- Establish representative menus, order states, inventory/recipe data, and seeded delivery orders.
- Define a local state model and persistence approach.
- Interview or observe 3–5 target vendors to validate tap targets, kitchen environment, language, and busiest workflows.
- Confirm which payment and delivery providers offer merchant APIs, webhooks, sandbox access, and stock-status endpoints.

**Exit criteria:** a vendor can complete the intended happy-path walkthrough without explanation; integration feasibility is documented as confirmed, unknown, or blocked for each provider.

### Milestone 1 — Core counter POS and payment experience (Weeks 3–4)

**Objective:** demonstrate fast in-store sale completion.

- Item grid, cart changes, modifiers, taxes, discounts, totals, and cash/digital payment selection.
- Dynamic QR payment modal using a non-production payment simulator.
- Payment confirmation state, chime/Bangla voice announcement, and animated thermal receipt.
- Offline cash-sale behavior and a visible queue for actions awaiting reconnection.

**Acceptance checks:** cart actions feel immediate; a cashier can ring a sample sale, simulate payment, hear confirmation, and obtain a receipt without leaving the ringing screen.

### Milestone 2 — Unified orders and KDS (Weeks 5–6)

**Objective:** make kitchen execution the second complete workflow.

- Merged and channel-filtered order queues for in-store, Foodpanda, Pathao, and Foodi.
- Order states: received, preparing, ready, completed/cancelled.
- ETA badges and deterministic priority sorting using seeded rider data.
- One-tap **BUMP / READY** action with audible rider announcement.
- Adapter interfaces that isolate each delivery platform from the UI and domain logic.

**Acceptance checks:** a cook can identify the next order, mark it ready, and see the status change reflected in the relevant channel view.

### Milestone 3 — Stock and margin protection (Weeks 7–8)

**Objective:** prove the operational intelligence loop.

- Dish stock decrement at checkout and stock-out state.
- Simulated Auto-86 commands with retry/error indicators; do not claim the 500 ms production target until partner APIs are tested.
- Three-step stock-in entry: ingredient, quantity, total paid.
- Unit-cost calculation, recipe cost recalculation, and a >5% cost-increase margin alert.

**Acceptance checks:** a checkout can exhaust a dish and produce an Auto-86 event; entering a higher ingredient cost updates affected dish margins.

### Milestone 4 — WasteLess and AI co-pilot (Weeks 9–10)

**Objective:** layer guidance onto reliable operational data rather than building a standalone chat interface.

- Batch prep/shelf-life records and near-expiry status.
- Configurable off-peak window with one-tap discount suggestions.
- Weather/demand cards and price benchmark views driven by clearly labeled sample data.
- Daily recap view: sales, payment mix, stock-outs, margin alerts, and waste offers.

**Acceptance checks:** the system recommends a discount only for eligible near-expiry stock and explains its reason to the cashier.

### Milestone 5 — Pilot readiness decision (Weeks 11–12)

**Objective:** choose the responsible next build path.

- Usability session with target merchants and kitchen staff.
- Prototype QA across typical Android viewport sizes and poor-network scenarios.
- Pilot brief defining venue, supported hardware, support process, success metrics, and fallbacks.
- Production gap assessment covering integrations, security/privacy, data retention, printer SDKs, offline sync conflict rules, and observability.

**Decision:** proceed to a limited pilot only if live provider access, payment responsibilities, data protection controls, and operational support are resolved. Otherwise continue as a validated prototype while closing those gaps.

## 5. Architecture Boundaries

Keep these parts separate from the start:

1. **Presentation:** POS, KDS, stock, and co-pilot screens.
2. **Domain state:** orders, carts, payments, menu items, dish stock, ingredient costs, recipes, and promotions.
3. **Operational rules:** totals, order prioritization, Auto-86 eligibility, margin thresholds, and expiry discounts.
4. **Integrations:** payment, delivery platform, weather, printer, and audio adapters. The prototype uses simulated implementations; production substitutes authenticated provider adapters.
5. **Persistence and sync:** local-first transaction storage, an outbound retry queue, idempotent event identifiers, and conflict rules for reconnecting devices.

This boundary is important because payment and delivery APIs will vary by provider, while core restaurant workflows should remain stable.

## 6. Key Risks and Mitigations

| Risk | Impact | Mitigation / decision needed |
| --- | --- | --- |
| Delivery platforms may not expose needed APIs or ETA data | Auto-86 and live KDS priority may be unavailable | Validate API access early; retain manual channel status as a fallback. |
| Dynamic BanglaQR/webhook flow has commercial and regulatory prerequisites | Cannot process real payments as shown in prototype | Use a simulator until a licensed/accredited integration path is approved. |
| 500 ms Auto-86 target depends on external network/platform latency | Requirement may be unattainable end-to-end | Measure client dispatch separately from provider acknowledgement; make retries and staff visibility reliable. |
| Offline edits and online delivery orders can conflict | Lost or duplicated orders/stock updates | Use append-only local events, idempotency keys, and explicit sync status. |
| Shared price prediction data creates trust/privacy risk | Weak recommendations or compliance issues | Begin with each merchant's own entries; add anonymized aggregation only with consent, governance, and sufficient data. |
| Handheld device constraints | Kitchen usability/performance failures | Test early on target Sunmi/iMin hardware and optimize for touch, glare, speaker volume, and printer behavior. |

## 7. Measures of Success

### Prototype validation

- Cashier completes a standard sale and payment simulation in under 30 seconds.
- Kitchen staff correctly identifies and completes the next priority ticket in moderated testing.
- At least 80% of observed users finish the core sale-to-KDS flow without facilitator help.
- All core flows work after a browser/device restart using local persistence.

### Production pilot targets

- POS interaction response under 50 ms for local cart operations.
- Payment confirmation feedback within 1 second after a verified webhook arrives.
- Zero lost in-store orders during offline/reconnect tests.
- Measured reduction in delivery cancellations and near-expiry waste versus the venue baseline.

## 8. Immediate Next Actions

1. Build the interactive POS shell and seed realistic restaurant data.
2. Write the domain model and order/payment/stock state transitions before implementing screens in depth.
3. Obtain written API and webhook capability confirmation from target payment and delivery partners.
4. Recruit a small Bangladesh-based design-partner group for workflow testing.
5. Decide whether the immediate deliverable is strictly a browser prototype or an Android pilot; this determines hardware SDK, backend, and security work.
