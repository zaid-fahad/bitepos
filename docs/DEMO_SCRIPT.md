# BiteOS — Current Product Demo Script

**Length:** 3:30–4:00 · **Format:** screen recording with English voiceover · **POS:** `http://localhost:5173` · **Kitchen TV:** `http://localhost:5173/kds`

## Before recording

Run `docker compose up`. Use a 720×1280 portrait POS window and a second, wide `/kds` window. Create three demo kitchen orders before recording. Move the pointer slowly and pause 1–2 seconds after actions.

## 1. One workspace — 0:00–0:25

**Voice:** “Rahim Bhai runs a busy Dhanmondi food stall. Before BiteOS, every order meant switching between delivery apps, paper tickets, messages, and a calculator. BiteOS brings the operation into one simple workspace.”

**Screen:** Fade into the light BitePOS home screen. Hold on the header and Menu button.

## 2. Explainable morning recommendation — 0:25–0:50

**Voice:** “Before lunch, BiteOS turns weather and delivery context into a clear prep recommendation. The team can also see the evidence, assumptions, and confidence behind it.”

**Screen:** Hold on the Prep recommendation banner. Open **Menu → Intelligence**. Show the XAI panel: Evidence, Assumption, Confidence. Return to Point of sale.

## 3. Counter order, QR, cash, and receipt — 0:50–1:35

**Voice:** “Orders are tapped in seconds. Totals, discount, and VAT update instantly. Digital payments get a payment-specific QR; cash uses the same fast confirmation flow.”

**Screen:** Select Biryani; add Chicken Tehari twice. Select Burgers; add Classic Beef Burger. Show cart total. Tap Charge, hold on the bKash QR, tap Simulate bKash payment, and hold on the paper-feed receipt and ‘Printing receipt…’ status. Optional second take: select Cash to show the counter-payment panel.

**Voice:** “Payment is confirmed aloud in English, and the receipt visibly feeds from the printer simulation. No manual SMS checking.”

## 4. Active Orders and kitchen TV — 1:35–2:05

**Voice:** “The counter stays focused. Active delivery tickets are one tap away; the kitchen gets a dedicated TV display with the most urgent ticket first.”

**Screen:** Tap the round bottom-right Active Orders button, show the bottom sheet, then close it. Switch to `/kds`; show channel labels, ETA ordering, and large tickets. Tap Mark ready on one ticket.

## 5. Availability and Auto-86 — 2:05–2:25

**Voice:** “When a dish is unavailable, staff control it once and keep the counter and delivery channels aligned.”

**Screen:** Open **Menu → Item availability**. Toggle Classic Beef Burger to Sold out, pause, then restore Active. Return to POS stock labels.

## 6. Stock-in and margin defense — 2:25–2:55

**Voice:** “A market purchase takes seconds to log. BiteOS calculates unit cost and highlights the margin impact before a price problem becomes a loss.”

**Screen:** Open **Menu → Inventory**. Choose Broiler Chicken; enter quantity `20`, total cost `3800`, then Save & Analyse. Show calculation and recommendation.

## 7. WasteLess and closing recap — 2:55–3:30

**Voice:** “BiteOS surfaces expiring-item promotions to reduce waste. At closing, it produces one clear recap of sales, channels, and tomorrow’s decisions.”

**Screen:** Open **Menu → Intelligence**. Show WasteLess, apply a promotion, then generate the End-of-day recap. Hold on the recap slip.

## 8. Closing — 3:30–3:50

**Voice:** “BiteOS gives a small food business the clarity of an enterprise operation: orders, payments, kitchen flow, stock control, and explainable intelligence in one system. Built for Dhaka. Ready to scale.”

**Screen:** Return to the light POS home screen. Slowly zoom out to the device frame, then fade to a BitePOS wordmark.

## Voiceover prompt

“Create a confident, warm English narration from this script. The speaker understands Bangladesh’s small restaurant workflow. Use ‘Rahim Bhai’ naturally where it adds authenticity. Keep the delivery grounded and practical, not like a generic technology advertisement.”
