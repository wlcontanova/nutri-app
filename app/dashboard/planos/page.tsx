'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Leaf, Zap, Crown } from 'lucide-react'
import { PLANOS } from '@/lib/stripe'

export default function PlanosPage() {
  const [loading, setLoading] = useState<string | null>(null)

  const handleAssinar = async (planoId: string) => {
    setLoading(planoId)
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()

    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planoId }),
    })

    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    }
    setLoading(null)
  }

  const icons = {
    gratuito: Leaf,
    pro: Zap,
    premium: Crown,
  }

  const cores = {
    gratuito: 'bg-gray-100 text-gray-700 border-gray-200',
    pro: 'bg-primary/10 text-primary border-primary/20',
    premium: 'bg-amber-100 text-amber-700 border-amber-200',
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">Planos</h1>
        <p className="text-muted-foreground mt-1">Escolha o plano ideal para seu consultório</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {PLANOS.map((plano) => {
          const Icon = icons[plano.id]
          return (
            <Card key={plano.id} className={`relative border-2 ${plano.id === 'pro' ? 'border-primary' : 'border-border'}`}>
              {plano.id === 'pro' && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">Mais popular</Badge>
                </div>
              )}
              <CardHeader className="text-center pb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${cores[plano.id]}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <CardTitle className="text-xl">{plano.nome}</CardTitle>
                <CardDescription>{plano.descricao}</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="mb-6">
                  <span className="text-4xl font-bold text-foreground">
                    {plano.preco === 0 ? 'Grátis' : `R$ ${plano.preco}`}
                  </span>
                  {plano.preco > 0 && <span className="text-muted-foreground text-sm">/mês</span>}
                </div>

                <ul className="text-left space-y-3 mb-6">
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>
                      {plano.limites.clientes === Infinity
                        ? 'Clientes ilimitados'
                        : `Até ${plano.limites.clientes} clientes`}
                    </span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${plano.limites.relatorios ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className={plano.limites.relatorios ? '' : 'text-muted-foreground'}>Relatórios de adesão</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${plano.limites.ia ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className={plano.limites.ia ? '' : 'text-muted-foreground'}>Substituição por IA</span>
                  </li>
                </ul>

                {plano.preco === 0 ? (
                  <Button variant="outline" className="w-full" disabled>
                    Plano atual
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    onClick={() => handleAssinar(plano.id)}
                    disabled={loading === plano.id}
                  >
                    {loading === plano.id ? 'Redirecionando...' : 'Assinar'}
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
