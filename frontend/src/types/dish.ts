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
