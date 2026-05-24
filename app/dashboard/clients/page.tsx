import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { ClientStatusBadge } from '@/components/ui/client-status-badge'
import { ClientAlertBadge } from '@/components/ui/client-alert-badge'
import { WhatsAppButton } from '@/components/ui/whatsapp-button'
import { Plus, Search, Mail, Phone, FileText, BarChart3, Archive } from 'lucide-react'

export default async function ClientsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .eq('nutritionist_id', user?.id)
    .order('full_name', { ascending: true })

  // Buscar último log de cada cliente para alertas
  const clientIds = clients?.map((c) => c.id) || []
  const { data: recentLogs } = await supabase
    .from('meal_logs')
    .select('client_id, data, status, created_at')
    .in('client_id', clientIds)
    .order('created_at', { ascending: false })

  // Mapa do último log por cliente
  const lastLogMap = new Map<string, { data: string; status: string }>()
  // Contagem de puladas consecutivas
  const skipCountMap = new Map<string, number>()

  if (recentLogs) {
    const logsByClient = new Map<string, typeof recentLogs>()
    for (const log of recentLogs) {
      if (!logsByClient.has(log.client_id)) {
        logsByClient.set(log.client_id, [])
      }
      logsByClient.get(log.client_id)!.push(log)
    }

    for (const [clientId, logs] of logsByClient) {
      if (logs.length > 0) {
        lastLogMap.set(clientId, { data: logs[0].data, status: logs[0].status })
      }
      let consecSkip = 0
      for (const log of logs) {
        if (log.status === 'pulei') {
          consecSkip++
        } else {
          break
        }
      }
      if (consecSkip >= 3) {
        skipCountMap.set(clientId, consecSkip)
      }
    }
  }

  function getClientAlerts(clientId: string) {
    const alerts: { type: 'sem_refeicoes' | 'pulou_seguidas'; message: string }[] = []
    const lastLog = lastLogMap.get(clientId)

    if (!lastLog) {
      alerts.push({ type: 'sem_refeicoes', message: 'Nenhuma refeição registrada' })
    } else {
      const hoje = new Date().toISOString().split('T')[0]
      if (lastLog.data !== hoje) {
        const diffDays = Math.abs(
          new Date(hoje).getTime() - new Date(lastLog.data).getTime()
        ) / (1000 * 60 * 60 * 24)
        if (diffDays >= 1) {
          alerts.push({ type: 'sem_refeicoes', message: `Sem refeições há ${Math.floor(diffDays)} dia(s)` })
        }
      }
    }

    const skipped = skipCountMap.get(clientId)
    if (skipped) {
      alerts.push({ type: 'pulou_seguidas', message: `Pulou ${skipped} refeições seguidas` })
    }

    return alerts
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pacientes</h1>
          <p className="text-muted-foreground">Gerencie seus pacientes e acompanhe a adesão</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/clients/new">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Paciente
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Todos os Pacientes</CardTitle>
              <CardDescription>{clients?.length || 0} pacientes no total</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Buscar por nome ou WhatsApp..." className="pl-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!clients || clients.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">Nenhum paciente ainda</h3>
              <p className="text-muted-foreground mb-4">
                Adicione seu primeiro paciente para começar a acompanhar
              </p>
              <Button asChild>
                <Link href="/dashboard/clients/new">Adicionar primeiro paciente</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {clients.map((client) => {
                const alerts = getClientAlerts(client.id)
                return (
                  <Card key={client.id} className="hover:border-primary/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-primary/10 text-primary text-lg">
                            {client.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-semibold text-foreground truncate">
                              {client.full_name}
                            </h3>
                            <ClientStatusBadge
                              dataVencimento={client.data_vencimento}
                              status={client.status}
                            />
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 truncate">
                            {client.goal || 'Sem objetivo definido'}
                          </p>
                          {alerts.length > 0 && (
                            <div className="flex items-center gap-2 mt-2">
                              {alerts.map((alert, i) => (
                                <ClientAlertBadge key={i} alerts={[alert]} />
                              ))}
                            </div>
                          )}
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {client.email}
                              </span>
                              {client.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {client.phone}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1" onClick={(e) => e.preventDefault()}>
                              {client.whatsapp && (
                                <WhatsAppButton phone={client.whatsapp} />
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border" onClick={(e) => e.preventDefault()}>
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/dashboard/clients/${client.id}`}>
                                <FileText className="w-3.5 h-3.5 mr-1" />
                                Cardápio
                              </Link>
                            </Button>
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/dashboard/clients/${client.id}`}>
                                <BarChart3 className="w-3.5 h-3.5 mr-1" />
                                Adesão
                              </Link>
                            </Button>
                            {client.whatsapp && (
                              <WhatsAppButton phone={client.whatsapp} variant="full" />
                            )}
                            <Button variant="ghost" size="sm" className="text-muted-foreground">
                              <Archive className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
