import { useState } from 'react'

const INGREDIENTS = [
  { name: 'Broiler Chicken', unit: 'KG', emoji: '🐓' },
  { name: 'Deshi Onion', unit: 'KG', emoji: '🧅' },
  { name: 'Soybean Oil', unit: 'L', emoji: '🛢️' },
  { name: 'Eggs (Tray)', unit: 'PCS', emoji: '🥚' },
  { name: 'Rice (Miniket)', unit: 'KG', emoji: '🌾' },
  { name: 'Flour (Atta)', unit: 'KG', emoji: '🌾' },
  { name: 'Green Chilli', unit: 'KG', emoji: '🌶️' },
  { name: 'Milk (Fresh)', unit: 'L', emoji: '🥛' },
]

const currency = new Intl.NumberFormat('en-BD', {
  style: 'currency',
  currency: 'BDT',
  maximumFractionDigits: 0,
})

type MarginAlert = {
  ingredient_name: string
  logged_unit_cost_bdt: number
  city_median_unit_cost_bdt: number
  margin_warning: boolean
  affected_dishes: {
    dish_id: string
    dish_name: string
    old_margin_pct: number
    new_margin_pct: number
    recommended_price_bdt: number
    recommended_action_text: string
  }[]
}

type Step = 'select' | 'qty' | 'cost' | 'done'

export function StockInScreen() {
  const [step, setStep] = useState<Step>('select')
  const [selected, setSelected] = useState<(typeof INGREDIENTS)[0] | null>(null)
  const [qty, setQty] = useState('')
  const [totalCost, setTotalCost] = useState('')
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState<MarginAlert | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<{ name: string; unit: string; unitCost: number; loggedAt: string }[]>([])

  const unitCost = qty && totalCost ? Number(totalCost) / Number(qty) : 0

  const reset = () => {
    setStep('select')
    setSelected(null)
    setQty('')
    setTotalCost('')
    setAlert(null)
    setError(null)
  }

  const submit = async () => {
    if (!selected || !qty || !totalCost) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/stock-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredient_name: selected.name,
          quantity: Number(qty),
          unit: selected.unit,
          total_cost_bdt: Number(totalCost),
        }),
      })
      if (!res.ok) throw new Error('Stock-in failed')
      const data = (await res.json()) as { unit_cost_bdt: number; margin_analysis: MarginAlert }
      setAlert(data.margin_analysis)
      setHistory((prev) => [
        { name: selected.name, unit: selected.unit, unitCost: data.unit_cost_bdt, loggedAt: new Date().toISOString() },
        ...prev.slice(0, 9),
      ])
      setStep('done')
    } catch {
      setError('Could not save stock entry. Check your connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 px-4 pb-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">📦 Quick Stock-In</h2>
        <span className="rounded-full bg-stone-800 px-3 py-1 text-xs text-stone-400">
          Step {step === 'select' ? 1 : step === 'qty' ? 2 : step === 'cost' ? 3 : '✓'} / 3
        </span>
      </div>

      {/* Step 1 — Select Ingredient */}
      {step === 'select' && (
        <div className="grid grid-cols-2 gap-3">
          {INGREDIENTS.map((ing) => (
            <button
              className="min-h-20 rounded-2xl border border-stone-700 bg-stone-800 p-4 text-left transition hover:border-orange-400 active:scale-[0.97]"
              key={ing.name}
              onClick={() => { setSelected(ing); setStep('qty') }}
              type="button"
            >
              <span className="text-2xl">{ing.emoji}</span>
              <span className="mt-2 block text-sm font-bold leading-tight">{ing.name}</span>
              <span className="block text-xs text-stone-400">{ing.unit}</span>
            </button>
          ))}
        </div>
      )}

      {/* Step 2 — Enter Quantity */}
      {step === 'qty' && selected && (
        <div className="rounded-3xl border border-stone-700 bg-stone-800 p-5">
          <p className="text-sm text-stone-400">Ingredient selected</p>
          <p className="mt-1 text-xl font-bold">{selected.emoji} {selected.name}</p>
          <label className="mt-5 block">
            <span className="text-sm font-semibold text-stone-300">Quantity ({selected.unit})</span>
            <input
              autoFocus
              className="mt-2 min-h-14 w-full rounded-xl border border-stone-600 bg-stone-900 px-4 text-2xl font-bold outline-none focus:border-orange-400"
              inputMode="decimal"
              onChange={(e) => setQty(e.target.value)}
              placeholder="e.g. 20"
              type="number"
              value={qty}
            />
          </label>
          <div className="mt-4 flex gap-3">
            <button className="min-h-12 flex-1 rounded-xl bg-stone-700 font-bold" onClick={reset} type="button">← Back</button>
            <button
              className="min-h-12 flex-1 rounded-xl bg-orange-500 font-bold text-stone-950 disabled:opacity-40"
              disabled={!qty || Number(qty) <= 0}
              onClick={() => setStep('cost')}
              type="button"
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Step 3 — Enter Total Cost */}
      {step === 'cost' && selected && (
        <div className="rounded-3xl border border-stone-700 bg-stone-800 p-5">
          <p className="text-sm text-stone-400">{selected.name} · {qty} {selected.unit}</p>
          <label className="mt-4 block">
            <span className="text-sm font-semibold text-stone-300">Total Taka Paid (৳)</span>
            <input
              autoFocus
              className="mt-2 min-h-14 w-full rounded-xl border border-stone-600 bg-stone-900 px-4 text-2xl font-bold outline-none focus:border-orange-400"
              inputMode="decimal"
              onChange={(e) => setTotalCost(e.target.value)}
              placeholder="e.g. 3800"
              type="number"
              value={totalCost}
            />
          </label>
          {unitCost > 0 && (
            <p className="mt-3 rounded-xl bg-emerald-500/10 px-4 py-2 text-sm font-bold text-emerald-300">
              ৳{unitCost.toFixed(2)} / {selected.unit} — unit cost computed
            </p>
          )}
          {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
          <div className="mt-4 flex gap-3">
            <button className="min-h-12 flex-1 rounded-xl bg-stone-700 font-bold" onClick={() => setStep('qty')} type="button">← Back</button>
            <button
              className="min-h-12 flex-1 rounded-xl bg-orange-500 font-bold text-stone-950 disabled:opacity-40"
              disabled={!totalCost || Number(totalCost) <= 0 || loading}
              onClick={submit}
              type="button"
            >
              {loading ? 'Saving…' : 'Save & Analyse →'}
            </button>
          </div>
        </div>
      )}

      {/* Step 4 — Done + Margin Alert */}
      {step === 'done' && alert && (
        <div className="flex flex-col gap-3">
          <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-5">
            <p className="text-sm font-bold text-emerald-300">✓ Stock-In Saved</p>
            <p className="mt-1 text-base font-bold">{alert.ingredient_name}</p>
            <p className="text-sm text-stone-300">
              You paid <span className="font-bold text-white">৳{alert.logged_unit_cost_bdt.toFixed(2)}</span> / unit ·
              City median: <span className="font-bold text-white">৳{alert.city_median_unit_cost_bdt.toFixed(2)}</span>
            </p>
          </div>

          {alert.margin_warning && alert.affected_dishes.length > 0 && (
            <div className="rounded-3xl border border-amber-400/30 bg-amber-400/10 p-5">
              <p className="text-sm font-bold text-amber-300">⚠️ Margin Alert</p>
              {alert.affected_dishes.map((dish) => (
                <div className="mt-3 border-t border-amber-400/20 pt-3" key={dish.dish_id}>
                  <p className="font-bold">{dish.dish_name}</p>
                  <p className="text-sm text-stone-300">
                    Margin: <span className="text-red-300 line-through">{dish.old_margin_pct.toFixed(1)}%</span>
                    {' → '}
                    <span className="font-bold text-amber-200">{dish.new_margin_pct.toFixed(1)}%</span>
                  </p>
                  <p className="mt-1 text-sm text-stone-300">
                    Rec. price: <span className="font-bold text-white">{currency.format(dish.recommended_price_bdt)}</span>
                  </p>
                  <p className="mt-1 rounded-lg bg-stone-900 px-3 py-2 text-xs text-stone-300">{dish.recommended_action_text}</p>
                </div>
              ))}
            </div>
          )}

          <button className="min-h-14 w-full rounded-2xl bg-orange-500 font-bold text-stone-950" onClick={reset} type="button">
            + Log Another Purchase
          </button>
        </div>
      )}

      {/* Recent history strip */}
      {history.length > 0 && step === 'select' && (
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-stone-500">Recent Stock-Ins</p>
          <div className="flex flex-col gap-2">
            {history.slice(0, 3).map((h, i) => (
              <div className="flex items-center justify-between rounded-xl bg-stone-800 px-4 py-3" key={i}>
                <span className="text-sm font-semibold">{h.name}</span>
                <span className="text-sm text-orange-300">৳{h.unitCost.toFixed(2)}/{h.unit}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
