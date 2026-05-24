import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export async function POST(req: Request) {
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe não configurado' }, { status: 500 })
  }

  const body = await req.text()
  const signature = req.headers.get('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: 'Configuração inválida' }, { status: 400 })
  }

  let event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch {
    return NextResponse.json({ error: 'Assinatura inválida' }, { status: 400 })
  }

  const supabase = await createClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object
      const supabaseId = session.metadata?.supabase_id
      const plano = session.metadata?.plano || 'pro'

      if (supabaseId) {
        await supabase
          .from('nutritionists')
          .update({
            plano,
            stripe_subscription_id: session.subscription as string,
            stripe_customer_id: session.customer as string,
            updated_at: new Date().toISOString(),
          })
          .eq('id', supabaseId)
      }
      break
    }

    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const subscription = event.data.object
      const customerId = subscription.customer as string

      const { data: nutritionist } = await supabase
        .from('nutritionists')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single()

      if (nutritionist) {
        const status = subscription.status
        const plano = status === 'active' ? 'pro' : 'gratuito'

        await supabase
          .from('nutritionists')
          .update({ plano, updated_at: new Date().toISOString() })
          .eq('id', nutritionist.id)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
