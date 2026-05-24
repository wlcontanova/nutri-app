import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { TrendingUp, TrendingDown, Minus, CheckCircle2, XCircle, FileDown } from 'lucide-react'
import { AdherenceChart } from '@/components/reports/adherence-chart'
import { ClientRanking } from '@/components/reports/client-ranking'
import { exportAdesaoPDF } from '@/lib/pdf-export'

export default async function ReportsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .eq('nutritionist_id', user?.id)
    .eq('status', 'active')

  const clientIds = clients?.map((c) => c.id) || []

  // Real data from meal_logs (últimos 7 dias)
  const seteDiasAtras = new Date()
  seteDiasAtras.setDate(seteDiasAtras.getDate() - 7)
  const desde = seteDiasAtras.toISOString().split('T')[0]

  const { data: logsRecentes } = await supabase
    .from('meal_logs')
    .select('*')
    .in('client_id', clientIds)
    .gte('data', desde)

  // Daily adherence data
  const { data: adesaoDiaria } = await supabase
    .from('daily_adherence')
    .select('*')
    .in('client_id', clientIds)
    .gte('data', desde)
    .order('data', { ascending: true })

  // Calcular métricas reais
  const totalLogs = logsRecentes?.length || 0
  const totalPlanejado = (clientIds.length * 5 * 7) // 5 refeições/dia × 7 dias
  const comiTudo = logsRecentes?.filter((l) => l.status === 'comi_tudo').length || 0
  const metade = logsRecentes?.filter((l) => l.status === 'metade').length || 0
  const puladas = logsRecentes?.filter((l) => l.status === 'pulei').length || 0
  const adesaoMedia = totalPlanejado > 0
    ? Math.round(((comiTudo + metade * 0.5) / totalPlanejado) * 100)
    : 0

  // Top performers (90%+)
  const adesaoPorCliente = new Map<string, number>()
  for (const clientId of clientIds) {
    const logs = logsRecentes?.filter((l) => l.client_id === clientId) || []
    const completas = logs.filter((l) => l.status === 'comi_tudo').length
    const meias = logs.filter((l) => l.status === 'metade').length
    const total = logs.length
    const pct = total > 0 ? Math.round(((completas + meias * 0.5) / total) * 100) : 0
    adesaoPorCliente.set(clientId, pct)
  }

  const topPerformers = clients?.filter((c) => (adesaoPorCliente.get(c.id) || 0) >= 90).length || 0
  const needsAttention = clients?.filter((c) => (adesaoPorCliente.get(c.id) || 0) < 60).length || 0

  // Tendência vs semana anterior
  const quinzeDiasAtras = new Date()
  quinzeDiasAtras.setDate(quinzeDiasAtras.getDate() - 14)
  const desdeAnterior = quinzeDiasAtras.toISOString().split('T')[0]

  const { data: logsAnteriores } = await supabase
    .from('meal_logs')
    .select('*')
    .in('client_id', clientIds)
    .gte('data', desdeAnterior)
    .lt('data', desde)

  const totalAnterior = logsAnteriores?.length || 0
  const totalPlanejadoAnterior = clientIds.length * 5 * 7
  const adesaoAnterior = totalPlanejadoAnterior > 0
    ? Math.round((totalAnterior / totalPlanejadoAnterior) * 100)
    : 0
  const trend = adesaoMedia - adesaoAnterior

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Relatórios</h1>
          <p className="text-muted-foreground">Acompanhe a adesão em tempo real</p>
        </div>
        <Button variant="outline" onClick={() => exportAdesaoPDF('todos-pacientes', {
          period: `${desde} - hoje`,
          averageAdherence: adesaoMedia,
          totalMeals: totalPlanejado,
          completedMeals: comiTudo,
          skippedMeals: puladas,
          macros: [],
          dailyData: [],
        })}>
          <FileDown className="w-4 h-4 mr-2" />
          Exportar PDF
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Adesão Média
            </CardTitle>
            {trend > 0 ? <TrendingUp className="w-4 h-4 text-primary" /> : trend < 0 ? <TrendingDown className="w-4 h-4 text-destructive" /> : <Minus className="w-4 h-4 text-muted-foreground" />}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{adesaoMedia}%</div>
            <Progress value={adesaoMedia} className="mt-2 h-2" />
            <p className={`text-xs mt-2 ${trend > 0 ? 'text-primary' : 'text-destructive'}`}>
              {trend > 0 ? '+' : ''}{trend}% vs semana anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Refeições Registradas
            </CardTitle>
            <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {totalLogs}<span className="text-sm font-normal text-muted-foreground"> / {totalPlanejado}</span>
            </div>
            <Progress value={totalPlanejado > 0 ? (totalLogs / totalPlanejado) * 100 : 0} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-2">Últimos 7 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Destaques
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{topPerformers}</div>
            <p className="text-xs text-muted-foreground mt-2">Pacientes com 90%+ de adesão</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Precisam de Atenção
            </CardTitle>
            <XCircle className="w-4 h-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{needsAttention}</div>
            <p className="text-xs text-muted-foreground mt-2">Pacientes abaixo de 60%</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AdherenceChart />
        <ClientRanking clients={clients || []} />
      </div>
    </div>
  )
}
