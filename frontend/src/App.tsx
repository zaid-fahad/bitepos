import { useEffect, useMemo, useState } from 'react'

import { useCart } from './hooks/useCart'
import { fetchDishes } from './services/api'
import type { Dish, DishCategory } from './types/dish'

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

function App() {
  const [dishes, setDishes] = useState<Dish[]>([])
  const [activeCategory, setActiveCategory] = useState<CategoryTab['category']>('LOCAL_MEALS')
  const [discountPercent, setDiscountPercent] = useState(0)
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const { items, addDish, changeQuantity, removeDish, subtotal } = useCart()

  useEffect(() => {
    void fetchDishes()
      .then(setDishes)
      .catch((error: unknown) => {
        setLoadError(error instanceof Error ? error.message : 'Unable to load the BiteOS menu.')
      })
  }, [])

  const visibleDishes = useMemo(
    () => dishes.filter((dish) => dish.category === activeCategory),
    [activeCategory, dishes],
  )
  const discount = subtotal * (discountPercent / 100)
  const vat = (subtotal - discount) * 0.15
  const grandTotal = subtotal - discount + vat

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

        <nav className="flex gap-2 overflow-x-auto px-4 pb-4" aria-label="Menu categories">
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
              onClick={() => setIsPaymentOpen(true)}
              type="button"
            >
              Charge {currency.format(grandTotal)}
            </button>
          </section>
        </div>

        <footer className="h-12 border-t-4 border-dashed border-stone-700 bg-stone-950 text-center text-xs font-semibold tracking-[0.25em] text-stone-500">
          THERMAL PRINTER SLOT
        </footer>
      </section>

      {isPaymentOpen && (
        <div className="fixed inset-0 z-10 grid place-items-end bg-black/70 p-4 sm:place-items-center" role="dialog" aria-modal="true" aria-label="BanglaQR payment">
          <section className="w-full max-w-md rounded-3xl border border-orange-400/30 bg-stone-900 p-6 shadow-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-400">BanglaQR</p>
            <h2 className="mt-2 text-2xl font-bold">Ready to charge {currency.format(grandTotal)}</h2>
            <p className="mt-3 text-sm leading-6 text-stone-300">The dynamic BanglaQR, payment confirmation, audio chime, and receipt flow are delivered in Issue #4.</p>
            <button className="mt-6 min-h-12 w-full rounded-xl bg-stone-100 px-4 font-bold text-stone-950" onClick={() => setIsPaymentOpen(false)} type="button">Back to order</button>
          </section>
        </div>
      )}
    </main>
  )
}

export default App
