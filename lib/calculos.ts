// ============================================================
// NUME — Engine de Metas e Adesão
// ============================================================

import type { NutritionalGoals, PorRefeicao, Meal, MealLog, DailyAdherence } from './tipos'

// --- Cálculo de percentual de macros ---
export function calcularPercentualMacro(
  atual: number,
  meta: number
): number {
  if (meta <= 0) return 0
  return Math.min(Math.round((atual / meta) * 100), 100)
}

// --- Adesão por refeição ---
export function calcularAdesaoRefeicoes(
  total: number,
  cumpridas: number,
  metade: number
): number {
  if (total <= 0) return 0
  return Math.round(((cumpridas + metade * 0.5) / total) * 100)
}

// --- Resumo de adesão a partir de logs ---
export interface ResumoAdesao {
  total: number
  cumpridas: number
  metade: number
  puladas: number
  percentual: number
  proteina: number
  carbo: number
  gordura: number
  agua: number
}

export function calcularResumoAdesao(
  logs: MealLog[],
  refeicoesPlanejadas: number
): ResumoAdesao {
  const cumpridas = logs.filter((l) => l.status === 'comi_tudo').length
  const metade = logs.filter((l) => l.status === 'metade').length
  const puladas = logs.filter((l) => l.status === 'pulei').length

  return {
    total: logs.length,
    cumpridas,
    metade,
    puladas,
    percentual: calcularAdesaoRefeicoes(refeicoesPlanejadas, cumpridas, metade),
    proteina: 0,
    carbo: 0,
    gordura: 0,
    agua: 0,
  }
}

// --- Progresso de macros contra metas ---
export interface MacroProgress {
  label: string
  atual: number
  meta: number
  percentual: number
  cor: string
}

export function calcularProgressoMacros(
  refeicoes: Meal[],
  logs: MealLog[],
  metas: NutritionalGoals | null
): MacroProgress[] {
  if (!metas) return []

  const refeicoesPorId = new Map(refeicoes.map((r) => [r.id, r]))
  const logPorRefeicao = new Set(logs.map((l) => l.meal_id))

  let proteina = 0
  let carbo = 0
  let gordura = 0

  for (const log of logs) {
    if (log.status === 'pulei') continue
    if (!log.meal_id) continue

    const ref = refeicoesPorId.get(log.meal_id)
    if (!ref) continue

    const fator = log.status === 'metade' ? 0.5 : 1
    proteina += (ref.protein_g || 0) * fator
    carbo += (ref.carbs_g || 0) * fator
    gordura += (ref.fat_g || 0) * fator
  }

  return [
    { label: 'Proteína', atual: proteina, meta: metas.proteina_g || 0, percentual: calcularPercentualMacro(proteina, metas.proteina_g || 0), cor: '#7EB89A' },
    { label: 'Carboidrato', atual: carbo, meta: metas.carboidrato_g || 0, percentual: calcularPercentualMacro(carbo, metas.carboidrato_g || 0), cor: '#D4936A' },
    { label: 'Gordura', atual: gordura, meta: metas.gordura_g || 0, percentual: calcularPercentualMacro(gordura, metas.gordura_g || 0), cor: '#E8A87C' },
  ]
}

// --- Geração de daily_adherence a partir dos logs ---
export async function gerarAdesaoDiaria(
  clientId: string,
  data: string,
  logs: MealLog[],
  totalRefeicoes: number
): Promise<Omit<DailyAdherence, 'client_id' | 'data'>> {
  const resumo = calcularResumoAdesao(logs, totalRefeicoes)

  return {
    total_refeicoes: totalRefeicoes,
    cumpridas: resumo.cumpridas,
    metade: resumo.metade,
    puladas: resumo.puladas,
    proteina_atingida_g: resumo.proteina,
    carbo_atingido_g: resumo.carbo,
    gordura_atingida_g: resumo.gordura,
    agua_ml: 0,
  }
}

// --- Verifica se metas por refeição foram atingidas ---
export function verificarMetaRefeicao(
  refeicao: Meal,
  metasPorRefeicao: PorRefeicao | undefined
): { proteina: boolean; carbo: boolean; gordura: boolean; calorias: boolean } {
  if (!metasPorRefeicao) {
    return { proteina: true, carbo: true, gordura: true, calorias: true }
  }

  return {
    proteina: (refeicao.protein_g || 0) >= (metasPorRefeicao.proteina || 0),
    carbo: (refeicao.carbs_g || 0) >= (metasPorRefeicao.carboidrato || 0),
    gordura: (refeicao.fat_g || 0) >= (metasPorRefeicao.gordura || 0),
    calorias: (refeicao.calories || 0) >= (metasPorRefeicao.calorias || 0),
  }
}

// --- Status do cliente baseado na data de vencimento ---
export function calcularStatusCliente(
  dataVencimento: string | null | undefined
): 'active' | 'expiring_week' | 'expired' {
  if (!dataVencimento) return 'active'

  const hoje = new Date()
  const venc = new Date(dataVencimento)
  const diffMs = venc.getTime() - hoje.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'expired'
  if (diffDays <= 7) return 'expiring_week'
  return 'active'
}

// --- Sugestão de substituição (placeholder para IA) ---
export function sugerirSubstituicao(
  refeicao: Meal,
  ingredienteFaltando: string
): string {
  // Placeholder — futuramente chamará Gemini API
  return `Substitua ${ingredienteFaltando} por uma opção equivalente em proteína e calorias.`
}

// --- Água: copos de 200ml ---
export function coposDeAgua(aguaMl: number): number {
  return Math.floor(aguaMl / 200)
}

export function progressoAgua(aguaMl: number, metaMl: number): number {
  return calcularPercentualMacro(aguaMl, metaMl)
}
