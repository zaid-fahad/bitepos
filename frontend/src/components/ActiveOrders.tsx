import { useEffect, useState } from 'react'
import { fetchKdsOrders } from '../services/api'
import type { KdsOrder } from '../types/dish'

export function ActiveOrders() {
  const [orders, setOrders] = useState<KdsOrder[]>([])
  useEffect(() => { void fetchKdsOrders().then(setOrders) }, [])
  return <section className="px-5 pb-8"><h2 className="text-2xl font-bold text-slate-900">Active orders</h2><p className="mt-1 text-sm text-slate-500">Current orders across counter and delivery channels.</p><div className="mt-5 space-y-3">{orders.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">No active orders</div> : orders.map((order) => <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" key={order.id}><div className="flex justify-between"><strong>{order.customer_name}</strong><span className="text-sm font-semibold text-teal-700">{order.status}</span></div><p className="mt-1 text-sm text-slate-500">{order.channel.replace('_', ' ')} · {order.driver_name ?? 'Counter pickup'}</p><p className="mt-3 text-sm">{order.items.map((item) => `${item.quantity}× ${item.name}`).join(', ')}</p></article>)}</div></section>
}
