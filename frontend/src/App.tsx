import { useEffect, useMemo, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'

import { KdsScreen } from './components/KdsScreen'
import { useCart } from './hooks/useCart'
import { fetchDishes, paymentSocketUrl, simulatePayment, stockSocketUrl } from './services/api'
import type { Dish, DishCategory, PaymentConfirmedEvent, PaymentMethod } from './types/dish'

type CategoryTab = {
  label: string
  category: DishCategory | 'SWEETS'
}

const categoryTabs: CategoryTab[] = [
  { label: 'Biryani', category: 'LOCAL_MEALS' },
  { label: 'Burgers', category: 'FAST_FOOD' },
  { label: 'Bakery', category: 'BAKERY' },
  { label: 'Sweets', category: 'SWEETS' },
  { label: 'Drinks', category: 'DRINKS' },
]

const currency = new Intl.NumberFormat('en-BD', {
  style: 'currency',
  currency: 'BDT',
  maximumFractionDigits: 0,
})

function buildBanglaQrPayload(amount: number, reference: string) {
  const amountText = amount.toFixed(2)
  return `00020101021226340010BD.BANGLAQR0114BITEOS-DEMO-QR52045812530370454${amountText.length}${amountText}5802BD5914Dhanmondi POS6005Dhaka6212${reference.length}${reference}`
}

function App() {
  const [dishes, setDishes] = useState<Dish[]>([])
  const [activeCategory, setActiveCategory] = useState<CategoryTab['category']>('LOCAL_MEALS')
  const [activeView, setActiveView] = useState<'POS' | 'KDS'>('POS')
  const [discountPercent, setDiscountPercent] = useState(0)
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bKash')
  const [paymentStatus, setPaymentStatus] = useState<'ready' | 'waiting' | 'confirmed' | 'error'>('ready')
  const [paymentReference, setPaymentReference] = useState('')
  const [paidReceipt, setPaidReceipt] = useState<PaymentConfirmedEvent | null>(null)
  const [auto86Message, setAuto86Message] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const { items, addDish, changeQuantity, removeDish, clearCart, subtotal } = useCart()

  useEffect(() => {
    void fetchDishes()
      .then(setDishes)
      .catch((error: unknown) => {
        setLoadError(error instanceof Error ? error.message : 'Unable to load the BiteOS menu.')
      })
  }, [])

  useEffect(() => {
    const socket = new WebSocket(paymentSocketUrl())
    socket.onmessage = (message) => {
      const event = JSON.parse(message.data) as PaymentConfirmedEvent
      if (event.event !== 'PAYMENT_CONFIRMED' || event.reference !== paymentReference) return

      setPaymentStatus('confirmed')
      setPaidReceipt(event)
      if ('speechSynthesis' in window) {
        window.speechSynthesis.speak(new SpeechSynthesisUtterance(`${event.method}-e ${event.amount} taka porishodh kora hoyeche`))
      }
      window.setTimeout(clearCart, 900)
    }
    return () => socket.close()
  }, [clearCart, paymentReference])

  useEffect(() => {
    const socket = new WebSocket(stockSocketUrl())
    socket.onmessage = (message) => {
      const event = JSON.parse(message.data) as { event: string; dish_name: string; platforms: string[] }
      if (event.event !== 'ITEM_AUTO86') return
      setAuto86Message(`⚠️ ${event.dish_name} sold out — auto-paused on ${event.platforms.join(', ')}`)
      window.setTimeout(() => setAuto86Message(null), 6000)
      void fetchDishes().then(setDishes)
    }
    return () => socket.close()
  }, [])

  const visibleDishes = useMemo(
    () => dishes.filter((dish) => dish.category === activeCategory),
    [activeCategory, dishes],
  )
  const discount = subtotal * (discountPercent / 100)
  const vat = (subtotal - discount) * 0.15
  const grandTotal = subtotal - discount + vat
  const qrPayload = buildBanglaQrPayload(grandTotal, paymentReference || 'BITEOSDEMO')

  const openPayment = () => {
    setPaymentReference(`BITE${Date.now().toString().slice(-8)}`)
    setPaymentStatus('ready')
    setPaidReceipt(null)
    setIsPaymentOpen(true)
  }

  const startPaymentSimulation = () => {
    setPaymentStatus('waiting')
    void simulatePayment({ amount: grandTotal, items, method: paymentMethod, reference: paymentReference })
      .catch(() => setPaymentStatus('error'))
  }

  return (
    <main className="min-h-screen bg-stone-950 p-0 text-stone-50 sm:p-6">
      <section className="mx-auto flex min-h-[1280px] w-full max-w-[720px] flex-col overflow-hidden bg-stone-900 shadow-2xl sm:rounded-[2.5rem] sm:border sm:border-orange-500/25">
        <header className="border-b border-stone-700/80 bg-stone-950 px-5 pb-4 pt-3">
          <div className="flex items-center justify-between text-xs text-stone-400">
            <span>9:41</span>
            <div className="h-1.5 w-16 rounded-full bg-stone-700" aria-label="Speaker grille" />
            <span>Wi-Fi&nbsp;&nbsp;100%</span>
          </div>
          <div className="mt-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-400">BiteOS POS</p>
              <h1 className="mt-1 text-xl font-bold">Dhanmondi Street Kitchen</h1>
            </div>
            <span className="rounded-full bg-emerald-500/15 px-3 py-2 text-xs font-bold text-emerald-300">● Online</span>
          </div>
        </header>

        <aside className="m-4 rounded-2xl border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-sm leading-5 text-amber-100">
          <span className="font-bold">AI prep alert:</span> Rain at 1 PM — prepare 20% more delivery portions.
        </aside>

        <div className="mx-4 mb-4 grid grid-cols-2 rounded-xl bg-stone-800 p-1" aria-label="POS view switcher"><button className={`min-h-11 rounded-lg text-sm font-bold ${activeView === 'POS' ? 'bg-orange-500 text-stone-950' : 'text-stone-300'}`} onClick={() => setActiveView('POS')} type="button">POS</button><button className={`min-h-11 rounded-lg text-sm font-bold ${activeView === 'KDS' ? 'bg-orange-500 text-stone-950' : 'text-stone-300'}`} onClick={() => setActiveView('KDS')} type="button">Kitchen KDS</button></div>

        {activeView === 'POS' ? <><nav className="flex gap-2 overflow-x-auto px-4 pb-4" aria-label="Menu categories">
          {categoryTabs.map((tab) => (
            <button
              className={`min-h-12 shrink-0 rounded-xl px-4 text-sm font-bold transition ${
                activeCategory === tab.category
                  ? 'bg-orange-500 text-stone-950'
                  : 'border border-stone-700 bg-stone-800 text-stone-300'
              }`}
              key={tab.category}
              onClick={() => setActiveCategory(tab.category)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="grid flex-1 gap-4 px-4 pb-4">
          <section aria-labelledby="menu-heading">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold" id="menu-heading">Quick add</h2>
              <span className="text-xs text-stone-400">Tap an item to add</span>
            </div>

            {loadError ? (
              <p className="rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-200">{loadError}</p>
            ) : visibleDishes.length === 0 ? (
              <p className="rounded-xl border border-dashed border-stone-700 p-6 text-center text-sm text-stone-400">No items in this category yet.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {visibleDishes.map((dish) => (
                  <button
                    className="min-h-32 rounded-2xl border border-stone-700 bg-stone-800 p-4 text-left transition hover:border-orange-400 active:scale-[0.98] disabled:opacity-45"
                    disabled={dish.stock_count === 0}
                    key={dish.id}
                    onClick={() => addDish(dish)}
                    type="button"
                  >
                    <span className="block text-base font-bold">{dish.name}</span>
                    <span className="mt-2 block text-sm font-semibold text-orange-300">{currency.format(dish.price)}</span>
                    <span className="mt-3 block text-xs text-stone-400">{dish.stock_count} portions left</span>
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-orange-500/25 bg-stone-950 p-4" aria-labelledby="cart-heading">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold" id="cart-heading">Current order</h2>
              <span className="rounded-full bg-stone-800 px-3 py-1 text-xs font-bold text-stone-300">{items.length} items</span>
            </div>

            <div className="mt-4 space-y-3">
              {items.length === 0 ? (
                <p className="py-4 text-center text-sm text-stone-500">Your cart is ready for the next order.</p>
              ) : (
                items.map((item) => (
                  <div className="flex items-center gap-3" key={item.id}>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{item.name}</p>
                      <p className="text-xs text-stone-400">{currency.format(item.price)} each</p>
                    </div>
                    <div className="flex items-center rounded-xl border border-stone-700">
                      <button className="grid size-12 place-items-center text-lg" onClick={() => changeQuantity(item.id, -1)} type="button">−</button>
                      <span className="w-7 text-center text-sm font-bold">{item.quantity}</span>
                      <button className="grid size-12 place-items-center text-lg" onClick={() => changeQuantity(item.id, 1)} type="button">+</button>
                    </div>
                    <button className="grid size-12 place-items-center rounded-xl text-stone-400 hover:bg-red-400/10 hover:text-red-300" onClick={() => removeDish(item.id)} type="button" aria-label={`Remove ${item.name}`}>×</button>
                  </div>
                ))
              )}
            </div>

            <div className="mt-5 border-t border-stone-800 pt-4">
              <label className="flex min-h-12 items-center justify-between gap-3 text-sm font-semibold">
                Discount
                <span className="flex items-center gap-2 rounded-xl border border-stone-700 bg-stone-900 px-3">
                  <input
                    className="h-11 w-14 bg-transparent text-right outline-none"
                    max="100"
                    min="0"
                    onChange={(event) => setDiscountPercent(Math.max(0, Math.min(100, Number(event.target.value))))}
                    type="number"
                    value={discountPercent}
                  />
                  <span className="text-stone-400">%</span>
                </span>
              </label>
              <div className="mt-4 space-y-2 text-sm text-stone-300">
                <div className="flex justify-between"><span>Subtotal</span><span>{currency.format(subtotal)}</span></div>
                <div className="flex justify-between"><span>Discount</span><span>−{currency.format(discount)}</span></div>
                <div className="flex justify-between"><span>VAT (15%)</span><span>{currency.format(vat)}</span></div>
                <div className="flex justify-between border-t border-stone-800 pt-3 text-lg font-bold text-stone-50"><span>Total</span><span>{currency.format(grandTotal)}</span></div>
              </div>
            </div>

            <button
              className="mt-5 min-h-14 w-full rounded-2xl bg-orange-500 px-5 text-base font-extrabold text-stone-950 transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={items.length === 0}
              onClick={openPayment}
              type="button"
            >
              Charge {currency.format(grandTotal)}
            </button>
          </section>
        </div></> : <KdsScreen />}

        <footer className="h-12 border-t-4 border-dashed border-stone-700 bg-stone-950 text-center text-xs font-semibold tracking-[0.25em] text-stone-500">
          THERMAL PRINTER SLOT
        </footer>
      </section>

      {isPaymentOpen && (
        <div className="fixed inset-0 z-10 grid place-items-end bg-black/70 p-4 sm:place-items-center" role="dialog" aria-modal="true" aria-label="BanglaQR payment">
          <section className="w-full max-w-md rounded-3xl border border-orange-400/30 bg-stone-900 p-6 shadow-2xl">
            {paymentStatus === 'confirmed' && paidReceipt ? (
              <div className="text-center">
                <span className="grid mx-auto size-16 place-items-center rounded-full bg-emerald-500/20 text-3xl text-emerald-300">✓</span>
                <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Payment confirmed</p>
                <h2 className="mt-2 text-2xl font-bold">{currency.format(paidReceipt.amount)} received</h2>
                <div className="mt-6 border-y-2 border-dashed border-stone-600 bg-stone-950 px-5 py-6 text-left font-mono text-xs text-stone-300 animate-[pulse_1s_ease-in-out_2]">
                  <p className="font-bold text-stone-50">BITEOS • THERMAL RECEIPT</p>
                  <p className="mt-3">{paidReceipt.method} / BanglaQR</p>
                  <p>Order {paidReceipt.order_id.slice(-6).toUpperCase()}</p>
                  <p>Ref {paidReceipt.reference}</p>
                  <p className="mt-4 border-t border-dashed border-stone-700 pt-3 text-sm font-bold text-stone-50">PAID {currency.format(paidReceipt.amount)}</p>
                </div>
                <button className="mt-6 min-h-12 w-full rounded-xl bg-stone-100 px-4 font-bold text-stone-950" onClick={() => setIsPaymentOpen(false)} type="button">New order</button>
              </div>
            ) : (
              <>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-400">BanglaQR • Demo payment</p>
                <h2 className="mt-2 text-2xl font-bold">Pay {currency.format(grandTotal)}</h2>
                <div className="mx-auto mt-6 grid aspect-square w-56 place-items-center rounded-3xl bg-white p-4">
                  <QRCodeSVG aria-label={`BanglaQR for ${currency.format(grandTotal)}`} bgColor="#ffffff" fgColor="#171717" level="M" size={192} value={qrPayload} />
                </div>
                <p className="mt-4 text-center text-xs text-stone-400">Dynamic EMVCo-style demo payload • Ref {paymentReference}</p>
                <div className="mt-5 grid grid-cols-2 gap-2" aria-label="Payment method">
                  {(['bKash', 'Nagad'] as PaymentMethod[]).map((method) => (
                    <button className={`min-h-12 rounded-xl font-bold ${paymentMethod === method ? 'bg-orange-500 text-stone-950' : 'border border-stone-700 text-stone-300'}`} key={method} onClick={() => setPaymentMethod(method)} type="button">{method}</button>
                  ))}
                </div>
                {paymentStatus === 'waiting' ? <p className="mt-4 text-center text-sm font-semibold text-amber-200">Waiting for {paymentMethod} confirmation…</p> : null}
                {paymentStatus === 'error' ? <p className="mt-4 text-center text-sm font-semibold text-red-200">Could not start payment. Try again.</p> : null}
                <button className="mt-5 min-h-14 w-full rounded-2xl bg-orange-500 px-5 text-base font-extrabold text-stone-950 disabled:opacity-50" disabled={paymentStatus === 'waiting'} onClick={startPaymentSimulation} type="button">
                  {paymentStatus === 'waiting' ? 'Confirming in 3 seconds…' : `Simulate ${paymentMethod} payment`}
                </button>
                <button className="mt-3 min-h-12 w-full rounded-xl bg-stone-800 px-4 font-bold text-stone-200" disabled={paymentStatus === 'waiting'} onClick={() => setIsPaymentOpen(false)} type="button">Back to order</button>
              </>
            )}
          </section>
        </div>
      )}
      {auto86Message ? <div className="fixed bottom-5 left-1/2 z-20 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl border border-red-400/40 bg-stone-900 p-4 text-sm font-bold text-red-100 shadow-2xl" role="status">{auto86Message}</div> : null}
    </main>
  )
}

export default App
