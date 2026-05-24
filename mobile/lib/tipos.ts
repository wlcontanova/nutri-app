export interface Client {
  id: string
  nutritionist_id: string
  full_name: string
  email: string
  whatsapp?: string | null
  foto_url?: string | null
  plano?: string | null
  goal?: string | null
  status: string
  metas_id?: string | null
}

export interface NutritionalGoals {
  id: string
  calorias?: number
  proteina_g?: number
  carboidrato_g?: number
  gordura_g?: number
  agua_ml?: number
  por_refeicao: Record<string, PorRefeicao>
}

export interface PorRefeicao {
  proteina: number
  carboidrato: number
  gordura: number
  calorias?: number
}

export interface MealPlan {
  id: string
  client_id: string
  name: string
  status: string
  start_date: string
  end_date: string
}

export interface Ingrediente {
  nome: string
  quantidade: string
}

export interface Meal {
  id: string
  meal_plan_id: string
  day_of_week: number
  meal_type: string
  name: string
  description?: string | null
  foto_url?: string | null
  ingredientes: Ingrediente[]
  modo_preparo?: string | null
  calories?: number
  protein_g?: number
  carbs_g?: number
  fat_g?: number
}

export interface MealSubstitution {
  id: string
  meal_id: string
  name: string
  foto_url?: string | null
  ingredientes: Ingrediente[]
  modo_preparo?: string | null
  calories?: number
  protein_g?: number
  carbs_g?: number
  fat_g?: number
}

export type MealLogStatus = 'comi_tudo' | 'metade' | 'pulei'

export interface MealLog {
  id: string
  client_id: string
  meal_id?: string
  data: string
  status: MealLogStatus
  substituicao_id?: string
  foto_registro?: string
}

export const MEAL_TYPES = [
  { id: 'breakfast', label: 'Café', icon: '☕' },
  { id: 'morning_snack', label: 'Lanche 1', icon: '🥨' },
  { id: 'lunch', label: 'Almoço', icon: '🥪' },
  { id: 'afternoon_snack', label: 'Lanche 2', icon: '🥨' },
  { id: 'dinner', label: 'Janta', icon: '🌙' },
] as const
