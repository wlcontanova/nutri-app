import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',
  typescript: true,
})

export const PLANOS = [
  {
    id: 'gratuito',
    nome: 'Gratuito',
    preco: 0,
    descricao: 'Para clientes — acompanha a dieta',
    limites: { clientes: 0, ia: false, relatorios: false },
    stripe_price_id: null,
  },
  {
    id: 'pro',
    nome: 'Nutri Pro',
    preco: 29,
    descricao: 'Para nutricionistas — até 15 clientes',
    limites: { clientes: 15, ia: false, relatorios: true },
    stripe_price_id: process.env.STRIPE_PRICE_PRO,
  },
  {
    id: 'premium',
    nome: 'Nutri Premium',
    preco: 59,
    descricao: 'Clientes ilimitados, IA e relatórios completos',
    limites: { clientes: Infinity, ia: true, relatorios: true },
    stripe_price_id: process.env.STRIPE_PRICE_PREMIUM,
  },
] as const

export type PlanoId = (typeof PLANOS)[number]['id']
