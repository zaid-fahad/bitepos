# Implementation Plan: bitePOS Restaurant OS Interactive Prototype

Build a complete, high-fidelity interactive HTML5 web prototype simulating a handheld touchscreen Android POS terminal (Sunmi V2 / iMin style portrait frame) with built-in thermal receipt printer, Auto Kitchen Display System (KDS), dynamic BanglaQR payments, and ambient AI operational agent.

## Core Features & Components

### 1. POS Frame & Layout (`index.html` & `style.css`)
- **Handheld Android POS Device Frame**: 720x1280 portrait ratio frame with top status bar, speaker grille, and bottom virtual thermal printer paper output slot.
- **Top Contextual AI Banner**: Displays real-time operational advice (e.g. *"Rain at 1 PM ➔ Foodpanda/Pathao delivery prep +20% recommended"*).
- **Navigation Tabs**:
  - `🛒 Ringing`: Product grid (Chicken Tehari, Beef Kacchi, Paratha, Sweets), cart manager, and dynamic BanglaQR checkout modal.
  - `🍳 KDS Queue`: Merged omnichannel kitchen order list + dedicated channel tabs (`In-Store`, `Foodpanda`, `Pathao`, `Foodi`). Sorted by Rider ETA with 1-tap "BUMP / READY" button.
  - `📦 Manual Stock-In`: 5-second raw ingredient cost logging screen (`Chicken`, `Onion`, `Oil`) with instant dish margin recalculation alerts.
  - `🤖 AI Co-Pilot`: Dashboard showing weather prep forecasts, city wholesale price benchmarks, and afternoon waste-less flash deals.

### 2. Audio & Printer Engine (`app.js`)
- **Native Voice Synthesis (Web Speech API)**: Speaks alerts when orders are ready (e.g. *"Pathao Order #402 ready for Rider Rahul"*) and when payments complete (e.g. *"bKash-e ৳350 taka received"*).
- **BanglaQR Payment Webhook Simulator**: Renders EMVCo-compliant QR codes, simulates instant bKash/Nagad payments, plays audio confirmation, and prints receipt automatically.
- **Virtual Thermal Printer**: Animated paper slip printing with transaction breakdown.

## Verification Plan

### Automated & Manual Tests
1. **Interactive Prototype Server**: Serve locally and open in browser.
2. **Order Ringing & BanglaQR Payment**: Select items ➔ Tap BanglaQR ➔ Simulate bKash Payment ➔ Verify voice chime and receipt printing.
3. **Omnichannel KDS & Driver ETA**: Switch to KDS tab ➔ Verify merged & channel views ➔ Tap "BUMP" ➔ Verify audio rider announcement.
4. **Manual Stock-In & Margin Defense**: Enter raw chicken purchase cost ➔ Verify dish margin alert on POS screen.
