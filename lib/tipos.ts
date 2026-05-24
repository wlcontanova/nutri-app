// ============================================================
// NUME — Tipos compartilhados (Web + Mobile)
// ============================================================

// --- Nutricionista ---
export interface Nutritionist {
  id: string
  full_name: string
  email: string
  whatsapp?: string | null
  registro?: string | null
  specialty?: string | null
  avatar_url?: string | null
  plano: string
  created_at: string
  updated_at: string
}

// --- Metas Nutricionais ---
export interface NutritionalGoals {
  id: string
  nutritionist_id: string
  client_id?: string | null
  calorias?: number | null
  proteina_g?: number | null
  carboidrato_g?: number | null
  gordura_g?: number | null
  agua_ml?: number | null
  por_refeicao: Record<string, PorRefeicao>
  created_at: string
  updated_at: string
}

export interface PorRefeicao {
  proteina: number
  carboidrato: number
  gordura: number
  calorias?: number
}

// --- Cliente ---
export type ClientStatus = 'active' | 'inactive' | 'paused'

export interface Client {
  id: string
  nutritionist_id: string
  full_name: string
  email: string
  whatsapp?: string | null
  phone?: string | null
  foto_url?: string | null
  plano?: string | null
  goal?: string | null
  notes?: string | null
  status: ClientStatus
  ativo: boolean
  data_inicio: string
  data_vencimento?: string | null
  metas_id?: string | null
  created_at: string
  updated_at: string
}

export type ClientStatusBadge = 'active' | 'expiring_week' | 'expired'

// --- Plano Alimentar ---
export type MealPlanStatus = 'draft' | 'active' | 'completed' | 'archived'

export interface MealPlan {
  id: string
  nutritionist_id: string
  client_id: string
  name: string
  status: MealPlanStatus
  semana_inicio?: string | null
  start_date: string
  end_date: string
  created_at: string
  updated_at: string
  clients?: Pick<Client, 'id' | 'full_name' | 'email'>
}

// --- Refeição ---
export type MealType = 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner'
export type MealTypePT = 'cafe' | 'lanche1' | 'almoco' | 'lanche2' | 'janta'

export interface Ingrediente {
  nome: string
  quantidade: string
}

export interface Meal {
  id: string
  meal_plan_id: string
  dia_semana?: string | null
  day_of_week: number
  tipo?: string | null
  meal_type: string
  nome?: string | null
  name: string
  description?: string | null
  foto_url?: string | null
  ingredientes: Ingrediente[]
  modo_preparo?: string | null
  calories?: number | null
  protein_g?: number | null
  carbs_g?: number | null
  fat_g?: number | null
  ordem: number
  created_at: string
}

// --- Substituição ---
export interface MealSubstitution {
  id: string
  meal_id: string
  nome: string
  name: string
  foto_url?: string | null
  ingredientes: Ingrediente[]
  modo_preparo?: string | null
  calories?: number | null
  protein_g?: number | null
  carbs_g?: number | null
  fat_g?: number | null
  ordem: number
  created_at: string
}

// --- Registro Diário ---
export type MealLogStatus = 'comi_tudo' | 'metade' | 'pulei'

export interface MealLog {
  id: string
  client_id: string
  meal_id?: string | null
  data: string
  status: MealLogStatus
  substituicao_id?: string | null
  foto_registro?: string | null
  registrado_em: string
}

// --- Adesão Diária ---
export interface DailyAdherence {
  client_id: string
  data: string
  total_refeicoes: number
  cumpridas: number
  metade: number
  puladas: number
  proteina_atingida_g: number
  carbo_atingido_g: number
  gordura_atingida_g: number
  agua_ml: number
}

// --- Helpers de dia/refeição ---
export const DAYS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'] as const

export const MEAL_TYPES: { id: MealType; labelPT: string }[] = [
  { id: 'breakfast', labelPT: 'Café' },
  { id: 'morning_snack', labelPT: 'Lanche 1' },
  { id: 'lunch', labelPT: 'Almoço' },
  { id: 'afternoon_snack', labelPT: 'Lanche 2' },
  { id: 'dinner', labelPT: 'Janta' },
]
