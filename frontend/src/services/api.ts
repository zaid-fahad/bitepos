import type { CartItem, Dish, PaymentMethod } from '../types/dish'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

export async function fetchDishes(): Promise<Dish[]> {
  const response = await fetch(`${apiBaseUrl}/api/dishes`)

  if (!response.ok) {
    throw new Error('Unable to load the BiteOS menu.')
  }

  return response.json() as Promise<Dish[]>
}

export async function simulatePayment(input: {
  amount: number
  items: CartItem[]
  method: PaymentMethod
  reference: string
}): Promise<void> {
  const response = await fetch(`${apiBaseUrl}/api/payments/simulate`, {
    body: JSON.stringify({
      amount: input.amount,
      items: input.items.map((item) => ({
        dish_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
      })),
      method: input.method,
      reference: input.reference,
    }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  })

  if (!response.ok) {
    throw new Error('Unable to start the payment simulation.')
  }
}

export function paymentSocketUrl(): string {
  return apiBaseUrl.replace(/^http/, 'ws') + '/ws/payments'
}
