import type { Dish } from '../types/dish'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

export async function fetchDishes(): Promise<Dish[]> {
  const response = await fetch(`${apiBaseUrl}/api/dishes`)

  if (!response.ok) {
    throw new Error('Unable to load the BiteOS menu.')
  }

  return response.json() as Promise<Dish[]>
}
