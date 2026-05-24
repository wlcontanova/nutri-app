import type { NutritionalGoals, Meal, MealLog } from './tipos'

export function calcularPercentualMacro(atual: number, meta: number): number {
  if (meta <= 0) return 0
  return Math.min(Math.round((atual / meta) * 100), 100)
}

export function calcularProgressoMacros(
  refeicoes: Meal[],
  logs: MealLog[],
  metas: NutritionalGoals | null
): { label: string; atual: number; meta: number; percentual: number; cor: string }[] {
  if (!metas) return []

  const refeicoesPorId = new Map(refeicoes.map((r) => [r.id, r]))

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

export function coposDeAgua(aguaMl: number): number {
  return Math.floor(aguaMl / 200)
}

export function progressoAgua(aguaMl: number, metaMl: number): number {
  return calcularPercentualMacro(aguaMl, metaMl)
}
