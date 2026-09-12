import { useEffect, useMemo, useState } from 'react'

import { bumpKdsOrder, fetchKdsOrders, orderSocketUrl, simulateKdsOrder } from '../services/api'
import type { KdsOrder, OrderChannel } from '../types/dish'

const channels: Array<OrderChannel | 'ALL'> = ['ALL', 'IN_STORE', 'FOODPANDA', 'PATHAO', 'FOODI']

function urgency(eta: number | null) {
  if (eta === null) return { label: 'Counter', tone: 'bg-sky-400/15 text-sky-200 border-sky-400/30' }
  if (eta < 2) return { label: `${eta} min`, tone: 'bg-red-500/20 text-red-200 border-red-400/40' }
  if (eta <= 10) return { label: `${eta} min`, tone: 'bg-amber-400/15 text-amber-100 border-amber-400/30' }
  return { label: `${eta} min`, tone: 'bg-emerald-500/15 text-emerald-200 border-emerald-400/30' }
}

export function KdsScreen() {
  const [orders, setOrders] = useState<KdsOrder[]>([])
  const [channel, setChannel] = useState<OrderChannel | 'ALL'>('ALL')
  const [error, setError] = useState<string | null>(null)

  const refresh = () => void fetchKdsOrders().then(setOrders).catch((issue: unknown) => setError(issue instanceof Error ? issue.message : 'Unable to load kitchen orders.'))

  useEffect(() => {
    refresh()
    const socket = new WebSocket(orderSocketUrl())
    socket.onmessage = (message) => {
      const event = JSON.parse(message.data) as { event: string; order?: KdsOrder; order_id?: string; driver_name?: string | null; channel?: string }
      if (event.event === 'ORDER_CREATED' && event.order) setOrders((current) => [...current, event.order!])
      if (event.event === 'ORDER_BUMPED' && event.order_id) setOrders((current) => current.filter((order) => order.id !== event.order_id))
    }
    return () => socket.close()
  }, [])

  const visibleOrders = useMemo(() => orders
    .filter((order) => channel === 'ALL' || order.channel === channel)
    .sort((a, b) => (a.driver_eta_minutes ?? 999) - (b.driver_eta_minutes ?? 999)), [channel, orders])

  const bump = (order: KdsOrder) => {
    void bumpKdsOrder(order.id).then(() => {
      if ('speechSynthesis' in window) window.speechSynthesis.speak(new SpeechSynthesisUtterance(`${order.driver_name ?? 'Counter'} er order ready`))
    }).catch((issue: unknown) => setError(issue instanceof Error ? issue.message : 'Unable to bump order.'))
  }

  return <section className="flex-1 px-4 pb-4" aria-labelledby="kds-heading">
    <div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-400">Auto Kitchen Display</p><h2 className="mt-1 text-xl font-bold" id="kds-heading">Live prep queue</h2></div><span className="rounded-full bg-emerald-500/15 px-3 py-2 text-xs font-bold text-emerald-200">● LIVE</span></div>
    <div className="mt-4 flex gap-2 overflow-x-auto pb-2" aria-label="Kitchen channel filter">{channels.map((item) => <button className={`min-h-11 shrink-0 rounded-xl px-3 text-xs font-bold ${channel === item ? 'bg-orange-500 text-stone-950' : 'border border-stone-700 bg-stone-800 text-stone-300'}`} key={item} onClick={() => setChannel(item)} type="button">{item === 'ALL' ? 'All orders' : item.replace('_', ' ')}</button>)}</div>
    <div className="mt-3 grid grid-cols-2 gap-2"><button className="min-h-12 rounded-xl border border-stone-600 bg-stone-800 text-sm font-bold" onClick={refresh} type="button">Refresh queue</button><button className="min-h-12 rounded-xl bg-orange-500 text-sm font-extrabold text-stone-950" onClick={() => void simulateKdsOrder('FOODPANDA').catch((issue: unknown) => setError(issue instanceof Error ? issue.message : 'Unable to stream a demo order.'))} type="button">+ Stream demo order</button></div>
    {error ? <p className="mt-3 rounded-xl bg-red-400/10 p-3 text-sm text-red-200">{error}</p> : null}
    <div className="mt-4 space-y-3">{visibleOrders.length === 0 ? <div className="rounded-2xl border border-dashed border-stone-700 p-8 text-center text-sm text-stone-400">No active tickets. Stream a demo delivery order to start.</div> : visibleOrders.map((order) => { const eta = urgency(order.driver_eta_minutes); return <article className="rounded-2xl border border-stone-700 bg-stone-950 p-4" key={order.id}><div className="flex items-start justify-between gap-3"><div><span className="rounded-lg bg-stone-800 px-2 py-1 text-[11px] font-bold text-orange-200">{order.channel.replace('_', ' ')}</span><p className="mt-2 font-bold">{order.customer_name}</p><p className="text-xs text-stone-400">{order.driver_name ?? 'Walk-in counter'}</p></div><span className={`rounded-lg border px-3 py-2 text-sm font-extrabold ${eta.tone}`}>ETA {eta.label}</span></div><ul className="mt-4 space-y-1 border-y border-stone-800 py-3 text-sm text-stone-200">{order.items.map((item) => <li key={item.name}>{item.quantity}× {item.name}</li>)}</ul><button className="mt-4 min-h-12 w-full rounded-xl bg-emerald-400 px-4 font-extrabold text-stone-950" onClick={() => bump(order)} type="button">BUMP • READY</button></article> })}</div>
  </section>
}
