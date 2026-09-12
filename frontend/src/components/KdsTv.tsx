import { useEffect, useMemo, useState } from 'react'

import { bumpKdsOrder, fetchKdsOrders, orderSocketUrl } from '../services/api'
import type { KdsOrder } from '../types/dish'

function etaClass(eta: number | null) {
  if (eta === null) return 'bg-slate-100 text-slate-700'
  if (eta < 2) return 'bg-red-100 text-red-700'
  if (eta <= 10) return 'bg-amber-100 text-amber-700'
  return 'bg-emerald-100 text-emerald-700'
}

export function KdsTv() {
  const [orders, setOrders] = useState<KdsOrder[]>([])
  useEffect(() => {
    void fetchKdsOrders().then(setOrders)
    const socket = new WebSocket(orderSocketUrl())
    socket.onmessage = (message) => {
      const event = JSON.parse(message.data) as { event: string; order?: KdsOrder; order_id?: string }
      if (event.event === 'ORDER_CREATED' && event.order) setOrders((current) => [...current, event.order!])
      if (event.event === 'ORDER_BUMPED' && event.order_id) setOrders((current) => current.filter((order) => order.id !== event.order_id))
    }
    return () => socket.close()
  }, [])
  const queue = useMemo(() => [...orders].sort((a, b) => (a.driver_eta_minutes ?? 999) - (b.driver_eta_minutes ?? 999)), [orders])
  return <main className="min-h-screen bg-slate-100 p-8 text-slate-900"><header className="mb-8 flex items-center justify-between"><div><p className="text-sm font-semibold tracking-wide text-teal-700">BITEPOS KITCHEN</p><h1 className="text-4xl font-bold">Live order queue</h1></div><div className="rounded-full bg-emerald-100 px-5 py-3 font-semibold text-emerald-700">Kitchen online</div></header><section className="grid grid-cols-1 gap-5 lg:grid-cols-3">{queue.length === 0 ? <div className="col-span-full rounded-3xl bg-white p-16 text-center text-xl text-slate-500 shadow-sm">No active kitchen tickets</div> : queue.map((order) => <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200" key={order.id}><div className="flex justify-between"><span className="text-sm font-bold text-teal-700">{order.channel.replace('_', ' ')}</span><span className={`rounded-full px-3 py-1 text-sm font-bold ${etaClass(order.driver_eta_minutes)}`}>{order.driver_eta_minutes === null ? 'Counter' : `${order.driver_eta_minutes} min`}</span></div><h2 className="mt-5 text-2xl font-bold">{order.customer_name}</h2><p className="mt-1 text-slate-500">{order.driver_name ?? 'Counter collection'}</p><ul className="my-6 space-y-2 border-y border-slate-100 py-5 text-lg">{order.items.map((item) => <li key={item.name}>{item.quantity} × {item.name}</li>)}</ul><button className="w-full rounded-2xl bg-teal-600 py-4 text-lg font-bold text-white" onClick={() => void bumpKdsOrder(order.id)} type="button">Mark ready</button></article>)}</section></main>
}
