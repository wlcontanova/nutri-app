import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe, PLANOS } from '@/lib/stripe'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { planoId } = await req.json()
    const plano = PLANOS.find((p) => p.id === planoId)
    if (!plano || !plano.stripe_price_id) {
      return NextResponse.json({ error: 'Plano inválido' }, { status: 400 })
    }

    // Busca ou cria customer no Stripe
    const { data: nutritionist } = await supabase
      .from('nutritionists')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    let customerId = nutritionist?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: { supabase_id: user.id },
      })
      customerId = customer.id
      await supabase
        .from('nutritionists')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: plano.stripe_price_id, quantity: 1 }],
      success_url: `${req.headers.get('origin')}/dashboard/planos?sucesso=true`,
      cancel_url: `${req.headers.get('origin')}/dashboard/planos?cancelado=true`,
      metadata: { supabase_id: user.id, plano: planoId },
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json({ error: 'Erro ao criar checkout' }, { status: 500 })
  }
}
