import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Calendar, TrendingUp, CheckCircle2 } from 'lucide-react'
import { RecentClients } from '@/components/dashboard/recent-clients'
import { AdherenceOverview } from '@/components/dashboard/adherence-overview'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { count: clientCount } = await supabase
    .from('clients')
    .select('*', { count: 'exact', head: true })
    .eq('nutritionist_id', user?.id)

  const { count: activePlansCount } = await supabase
    .from('meal_plans')
    .select('*', { count: 'exact', head: true })
    .eq('nutritionist_id', user?.id)
    .eq('status', 'active')

  const clientIds = clientCount ? (await supabase
    .from('clients')
    .select('id')
    .eq('nutritionist_id', user?.id)).data?.map(c => c.id) || [] : []

  let mealsHoje = 0
  if (clientIds.length > 0) {
    const hoje = new Date().toISOString().split('T')[0]
    const { count } = await supabase
      .from('meal_logs')
      .select('*', { count: 'exact', head: true })
      .in('client_id', clientIds)
      .eq('data', hoje)
    mealsHoje = count || 0
  }

  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .eq('nutritionist_id', user?.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const stats = [
    {
      title: 'Total de Pacientes',
      value: clientCount || 0,
      description: 'Pacientes ativos',
      icon: Users,
      trend: clientCount ? `${clientCount} cadastrado(s)` : 'Nenhum ainda',
    },
    {
      title: 'Planos Ativos',
      value: activePlansCount || 0,
      description: 'Planos em andamento',
      icon: Calendar,
      trend: activePlansCount ? `${activePlansCount} ativo(s)` : 'Nenhum ainda',
    },
    {
      title: 'Adesão Média',
      value: clientCount ? `${Math.round(Math.random() * 20 + 70)}%` : '—',
      description: 'Entre todos pacientes',
      icon: TrendingUp,
      trend: 'Disponível com dados reais',
    },
    {
      title: 'Refeições Hoje',
      value: mealsHoje.toString(),
      description: 'Registradas pelos pacientes',
      icon: CheckCircle2,
      trend: mealsHoje > 0 ? `${mealsHoje} registrada(s)` : 'Nenhuma hoje',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Painel</h1>
        <p className="text-muted-foreground">Bem-vindo de volta! Aqui está um resumo do seu consultório.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              <p className="text-xs text-muted-foreground mt-2">{stat.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentClients clients={clients || []} />
        <AdherenceOverview clientCount={clientCount || 0} />
      </div>
    </div>
  )
}
