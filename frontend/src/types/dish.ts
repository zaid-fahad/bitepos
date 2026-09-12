export type DishCategory = 'LOCAL_MEALS' | 'FAST_FOOD' | 'BAKERY' | 'DRINKS'

export interface Dish {
  id: string
  name: string
  category: DishCategory
  price: number
  stock_count: number
  shelf_life_hours: number | null
}

export interface CartItem extends Dish {
  quantity: number
}

export type PaymentMethod = 'bKash' | 'Nagad'

export interface PaymentConfirmedEvent {
  event: 'PAYMENT_CONFIRMED'
  amount: number
  method: PaymentMethod
  order_id: string
  reference: string
}

export type OrderChannel = 'IN_STORE' | 'FOODPANDA' | 'PATHAO' | 'FOODI'

export interface KdsOrder {
  id: string
  channel: OrderChannel
  status: 'PENDING' | 'PREPARING' | 'READY'
  customer_name: string
  driver_name: string | null
  driver_eta_minutes: number | null
  grand_total: number
  items: { name: string; quantity: number }[]
}
