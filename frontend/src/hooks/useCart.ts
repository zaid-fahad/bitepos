import { useMemo, useState } from 'react'

import type { CartItem, Dish } from '../types/dish'

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([])

  const addDish = (dish: Dish) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.id === dish.id)

      if (existingItem) {
        return currentItems.map((item) =>
          item.id === dish.id ? { ...item, quantity: Math.min(item.quantity + 1, dish.stock_count) } : item,
        )
      }

      return [...currentItems, { ...dish, quantity: 1 }]
    })
  }

  const changeQuantity = (dishId: string, delta: number) => {
    setItems((currentItems) =>
      currentItems
        .map((item) => ({
          ...item,
          quantity: Math.max(0, Math.min(item.quantity + delta, item.stock_count)),
        }))
        .filter((item) => item.quantity > 0),
    )
  }

  const removeDish = (dishId: string) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== dishId))
  }

  const clearCart = () => setItems([])

  const subtotal = useMemo(
    () => items.reduce((total, item) => total + item.price * item.quantity, 0),
    [items],
  )

  return { items, addDish, changeQuantity, removeDish, clearCart, subtotal }
}
