# Project Glossary

## Hackathon edition

The bitePOS version built for a 3–4 hour hackathon window. It is a scripted, browser-based product demonstration with local sample data and simulated external events; it is not a production payment or delivery integration.

## Hackathon builder

One person using Codex and Antigravity as implementation assistants. The scope must therefore favor a single complete demo journey over separate independently built features.

## Core demo journey

The judge-facing bitePOS flow: a cashier adds menu items to a cart, completes a simulated QR payment, receives an audible confirmation and printed receipt, and routes the order to the kitchen queue.

## Simulated integration

A local, deterministic stand-in for a payment or delivery provider. It produces realistic status updates but never sends money or alters a third-party marketplace.

## AI co-pilot

Ambient, explainable operational guidance surfaced in the POS interface—not a chat screen. For the hackathon edition, it highlights food-waste reduction and delivery stock-out prevention using local sample data.

## AI magic moments

The hackathon demo includes four short, simulated operational interventions after the core journey: Auto-86 pauses a sold-out dish on delivery channels, WasteLess proposes a discount for near-expiry food, Margin Guard flags an ingredient price hike that weakens a dish margin, and a weather card recommends a delivery-prep adjustment.

## Bilingual interface

The interface pairs English labels with Bangla payment and operational content so the demo remains accessible to judges while signaling Bangladesh-market readiness.

## Submission package

The hackathon deliverables are the working browser app, a short pitch deck, and a short screen-recorded demo video. The video is a recording of the completed app, not a separate product feature.

## Demo venue

A Dhaka street-food stall with delivery orders and a small dine-in area. It is the sole sample business for the hackathon edition, allowing one coherent menu, kitchen queue, inventory state, and customer story.

## Demo menu

A hybrid Dhaka quick-service menu: local meals such as tehari, kacchi, paratha, and lassi alongside familiar burgers and fried chicken. The menu is organized into clear categories so it remains fast to ring at the POS.

## Payment methods

The demo supports cash and a simulated dynamic BanglaQR payment. The scripted digital-payment journey uses BanglaQR and produces a bilingual confirmation, receipt, and kitchen ticket.

## Visual direction

A warm street-food visual system using red/orange, cream, and dark charcoal. It favors large touch targets and high-contrast status colors over dense restaurant-management UI.

## Pitch content

The pitch must cover the problem, solution, live demo flow, AI and impact, business model, TAM/SAM/SOM, and roadmap or call to action.

## Market-reference demo data

Burger Lab, BFC, and Chillox may appear as clearly labeled sample market or competitor references in the hackathon app and pitch. They are not integrations, customers, endorsements, or copied branded experiences; bitePOS uses its own generic menu data and visual identity.

## Pitch deck

A seven-slide presentation: problem, solution, live flow, AI/impact, business model, TAM/SAM/SOM, and roadmap/call to action.

## Margin Guard

An explainable AI co-pilot card driven by local sample data. A simulated ingredient unit-cost increase recalculates the impacted dish margin and recommends a price review; it does not claim live wholesale-price data.

## Weather prep suggestion

An explainable AI co-pilot card driven by a seeded weather scenario. A simulated rain forecast increases expected delivery demand and recommends a specific additional prep quantity; it does not claim a live weather integration.

## Primary demo venue

A Dhaka street-food stall with delivery orders and a small dine-in area. The core story is moving paid counter orders into a clear, prioritized kitchen queue; delivery stock-out prevention and near-expiry discounting are supporting operational moments.

## Hackathon technology stack

The bitePOS hackathon edition uses a Vite + React frontend styled with Tailwind CSS v4, a FastAPI backend organized in MVC layers, and PostgreSQL for seeded operational data. Exa Search is the source-retrieval layer for AI feature context; payment and delivery integrations remain simulated, while seeded data guarantees a deterministic demo fallback.

## Exa research layer

FastAPI calls Exa Search only from the server, using a stored API key. Exa returns relevant web sources and extracted highlights for the price-hike and weather-prep cards; bitePOS shows those sources as context and never treats an unverified search result as a payment, inventory, or delivery action.
