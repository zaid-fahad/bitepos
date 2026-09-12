import { useEffect, useState } from 'react'
import { fetchDishes, setDishAvailability } from '../services/api'
import type { Dish } from '../types/dish'

export function ItemAvailability() {
  const [dishes, setDishes] = useState<Dish[]>([])
  const [error, setError] = useState<string | null>(null)
  const load = () => void fetchDishes().then(setDishes).catch(() => setError('Unable to load menu availability.'))
  useEffect(load, [])
  const toggle = (dish: Dish) => void setDishAvailability(dish.id, dish.stock_count === 0).then(load).catch(() => setError('Update failed.'))
  return <section className="px-5 pb-8"><p className="text-sm font-semibold text-teal-700">MENU CONTROL</p><h2 className="mt-1 text-2xl font-bold text-slate-900">Item availability</h2><p className="mt-1 text-sm text-slate-500">Control counter and delivery availability.</p>{error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}<div className="mt-5 space-y-3">{dishes.map((dish) => { const active = dish.stock_count > 0; return <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" key={dish.id}><div><p className="font-semibold text-slate-900">{dish.name}</p><p className="text-sm text-slate-500">{active ? `${dish.stock_count} portions available` : 'Sold out'}</p></div><button className={`rounded-xl px-4 py-2 text-sm font-bold ${active ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-700'}`} onClick={() => toggle(dish)} type="button">{active ? 'Active' : 'Sold out'}</button></div>})}</div></section>
}
