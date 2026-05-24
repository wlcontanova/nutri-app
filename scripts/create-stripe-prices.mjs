import Stripe from 'stripe'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

async function main() {
  // Criar produto Nutri Pro
  const pro = await stripe.products.create({
    name: 'Nutri Pro',
    description: 'Para nutricionistas — até 15 clientes',
  })
  const proPrice = await stripe.prices.create({
    product: pro.id,
    unit_amount: 2900, // R$ 29,00
    currency: 'brl',
    recurring: { interval: 'month' },
  })
  console.log(`STRIPE_PRICE_PRO=${proPrice.id}`)

  // Criar produto Nutri Premium
  const premium = await stripe.products.create({
    name: 'Nutri Premium',
    description: 'Clientes ilimitados, IA e relatórios completos',
  })
  const premiumPrice = await stripe.prices.create({
    product: premium.id,
    unit_amount: 5900, // R$ 59,00
    currency: 'brl',
    recurring: { interval: 'month' },
  })
  console.log(`STRIPE_PRICE_PREMIUM=${premiumPrice.id}`)

  console.log('\nCole esses valores no .env.local')
}

main().catch(console.error)
