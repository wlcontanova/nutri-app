import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ClientStatusBadge } from '@/components/ui/client-status-badge'
import { WhatsAppButton } from '@/components/ui/whatsapp-button'
import { WhatsAppInvite } from '@/components/ui/whatsapp-invite'
import { ArrowLeft, Mail, Phone, Target, Calendar, Plus, UtensilsCrossed, BarChart3, MessageCircle } from 'lucide-react'
import { ClientMealPlans } from '@/components/clients/client-meal-plans'
import { ClientAdherence } from '@/components/clients/client-adherence'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ClientDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .eq('nutritionist_id', user?.id)
    .single()

  if (!client) {
    notFound()
  }

  const { data: nutritionist } = await supabase
    .from('nutritionists')
    .select('full_name')
    .eq('id', user?.id)
    .single()

  const { data: mealPlans } = await supabase
    .from('meal_plans')
    .select('*')
    .eq('client_id', id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/clients">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{client.full_name}</h1>
          <p className="text-muted-foreground">Perfil do paciente</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/clients/${id}/metas`}>
              <UtensilsCrossed className="w-4 h-4 mr-2" />
              Metas
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/dashboard/meal-plans/new?client=${id}`}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Plano
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarFallback className="bg-primary/10 text-primary text-xl">
                  {client.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{client.full_name}</CardTitle>
                <div className="mt-1">
                  <ClientStatusBadge
                    dataVencimento={client.data_vencimento}
                    status={client.status}
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground">{client.email}</span>
            </div>
            {client.phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">{client.phone}</span>
              </div>
            )}
            {client.whatsapp && (
              <div className="flex items-center gap-3 text-sm">
                <MessageCircle className="w-4 h-4 text-muted-foreground" />
                <WhatsAppButton phone={client.whatsapp} variant="full" />
              </div>
            )}
            {client.goal && (
              <div className="flex items-start gap-3 text-sm">
                <Target className="w-4 h-4 text-muted-foreground mt-0.5" />
                <span className="text-foreground">{client.goal}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                Cliente desde {new Date(client.created_at).toLocaleDateString()}
              </span>
            </div>
            {client.notes && (
              <div className="pt-4 border-t border-border">
                <h4 className="text-sm font-medium text-foreground mb-2">Anotações</h4>
                <p className="text-sm text-muted-foreground">{client.notes}</p>
              </div>
            )}

            <div className="pt-4 border-t border-border space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                <Link href={`/dashboard/clients/${id}/metas`}>
                  <UtensilsCrossed className="w-4 h-4 mr-2" />
                  Metas Nutricionais
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                <Link href={`/dashboard/reports?client=${id}`}>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Relatório de Adesão
                </Link>
              </Button>
              {client.whatsapp && (
                <WhatsAppButton phone={client.whatsapp} variant="full" />
              )}
              {client.whatsapp && nutritionist && (
                <WhatsAppInvite
                  clientName={client.full_name}
                  clientPhone={client.whatsapp}
                  nutritionistName={nutritionist.full_name}
                />
              )}
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <ClientMealPlans clientId={id} mealPlans={mealPlans || []} />
          <ClientAdherence clientId={id} />
        </div>
      </div>
    </div>
  )
}
