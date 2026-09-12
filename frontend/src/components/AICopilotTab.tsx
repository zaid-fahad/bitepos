import { useEffect, useState } from 'react'

type Promotion = {
  item_id: string
  item_name: string
  expiring_in_hours: number
  recommended_discount_pct: number
  discounted_price_bdt: number
  pos_action_banner: string
}

type EODData = {
  slip_text: string
  generated_at: string
}

const currency = new Intl.NumberFormat('en-BD', {
  style: 'currency',
  currency: 'BDT',
  maximumFractionDigits: 0,
})

export function AICopilotTab() {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [eodData, setEodData] = useState<EODData | null>(null)
  const [loadingWaste, setLoadingWaste] = useState(false)
  const [loadingEod, setLoadingEod] = useState(false)
  const [wasteSavedBdt] = useState(850)

  const fetchWasteless = async () => {
    setLoadingWaste(true)
    try {
      const res = await fetch('/api/wasteless/suggestions')
      if (!res.ok) throw new Error()
      const data = (await res.json()) as { promotions_suggested: Promotion[] }
      setPromotions(data.promotions_suggested)
    } finally {
      setLoadingWaste(false)
    }
  }

  const fetchEod = async () => {
    setLoadingEod(true)
    try {
      const res = await fetch('/api/reports/eod', { method: 'POST' })
      if (!res.ok) throw new Error()
      const data = (await res.json()) as EODData
      setEodData(data)
      if ('speechSynthesis' in window) {
        window.speechSynthesis.speak(new SpeechSynthesisUtterance('End of day report is ready. Check your daily recap.'))
      }
    } finally {
      setLoadingEod(false)
    }
  }

  // Auto-fetch WasteLess on mount
  useEffect(() => { void fetchWasteless() }, [])

  return (
    <div className="flex flex-col gap-4 px-4 pb-6">
      <h2 className="text-lg font-bold">🤖 AI Co-Pilot</h2>

      {/* WasteLess Promotions */}
      <section className="rounded-3xl border border-stone-700 bg-stone-800 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-emerald-300">🥦 WasteLess Agent</p>
            <p className="text-xs text-stone-400 mt-0.5">Off-peak discount suggestions</p>
          </div>
          <button
            className="min-h-10 rounded-xl bg-emerald-500/20 px-4 text-xs font-bold text-emerald-300 disabled:opacity-50"
            disabled={loadingWaste}
            onClick={fetchWasteless}
            type="button"
          >
            {loadingWaste ? 'Scanning…' : 'Refresh'}
          </button>
        </div>

        {promotions.length === 0 ? (
          <p className="mt-4 text-sm text-stone-400">
            {loadingWaste ? 'Scanning perishable inventory…' : 'No items near expiry right now. ✓'}
          </p>
        ) : (
          <div className="mt-4 flex flex-col gap-3">
            {promotions.map((promo) => (
              <WastelessPromoCard key={promo.item_id} promo={promo} />
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between rounded-xl bg-stone-900 px-4 py-3">
          <span className="text-xs text-stone-400">Waste saved today</span>
          <span className="font-bold text-emerald-300">{currency.format(wasteSavedBdt)}</span>
        </div>
      </section>

      {/* End of Day Recap */}
      <section className="rounded-3xl border border-stone-700 bg-stone-800 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-amber-300">🌙 End-of-Day Recap</p>
            <p className="text-xs text-stone-400 mt-0.5">AI financial summary + thermal slip</p>
          </div>
          <button
            className="min-h-10 rounded-xl bg-amber-500/20 px-4 text-xs font-bold text-amber-300 disabled:opacity-50"
            disabled={loadingEod}
            onClick={fetchEod}
            type="button"
          >
            {loadingEod ? 'Generating…' : 'Generate'}
          </button>
        </div>

        {eodData && <ThermalSlip slip={eodData} />}
      </section>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function WastelessPromoCard({ promo }: { promo: Promotion }) {
  const [applied, setApplied] = useState(false)
  return (
    <div className="rounded-2xl border border-amber-400/25 bg-amber-400/10 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-bold">{promo.item_name}</p>
          <p className="mt-0.5 text-xs text-amber-200">
            Expires in {promo.expiring_in_hours}h · {promo.recommended_discount_pct}% off
          </p>
          <p className="mt-1 text-sm text-stone-300">{promo.pos_action_banner}</p>
        </div>
        <span className="shrink-0 text-lg font-bold text-white">{currency.format(promo.discounted_price_bdt)}</span>
      </div>
      <button
        className={`mt-3 min-h-10 w-full rounded-xl text-sm font-bold transition ${
          applied
            ? 'bg-emerald-500/20 text-emerald-300'
            : 'bg-amber-500 text-stone-950 hover:bg-amber-400'
        }`}
        onClick={() => {
          setApplied(true)
          if ('speechSynthesis' in window) {
            window.speechSynthesis.speak(
              new SpeechSynthesisUtterance(`${promo.item_name} discount applied at ${promo.recommended_discount_pct} percent off`)
            )
          }
        }}
        type="button"
      >
        {applied ? '✓ Discount Applied on POS' : `Apply ${promo.recommended_discount_pct}% Deal on POS`}
      </button>
    </div>
  )
}

function ThermalSlip({ slip }: { slip: EODData }) {
  return (
    <div className="mt-5 overflow-hidden rounded-2xl border-y-4 border-dashed border-stone-600 bg-stone-950">
      {/* Animated paper feed effect */}
      <div className="h-3 animate-pulse bg-stone-800" />
      <pre className="overflow-x-auto px-5 py-5 font-mono text-xs leading-5 text-stone-200 whitespace-pre-wrap">
        {slip.slip_text}
      </pre>
      <div className="h-3 animate-pulse bg-stone-800" />
      <p className="px-4 pb-3 text-center text-xs text-stone-600">
        Generated {new Date(slip.generated_at).toLocaleTimeString()} · BiteOS AI
      </p>
    </div>
  )
}
