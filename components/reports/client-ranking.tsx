import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface Client {
  id: string
  full_name: string
  email: string
}

interface ClientRankingProps {
  clients: Client[]
}

const mockAdherenceData: Record<string, { adherence: number; trend: number }> = {}

export function ClientRanking({ clients }: ClientRankingProps) {
  const clientsWithAdherence = clients.map((client, index) => {
    const baseAdherence = 65 + (index * 7) % 30
    const trend = [-5, 3, 0, 8, -2][index % 5]
    return {
      ...client,
      adherence: baseAdherence,
      trend,
    }
  }).sort((a, b) => b.adherence - a.adherence)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ranking de Pacientes</CardTitle>
        <CardDescription>Desempenho de adesão por paciente</CardDescription>
      </CardHeader>
      <CardContent>
        {clientsWithAdherence.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Nenhum paciente ativo para exibir</p>
          </div>
        ) : (
          <div className="space-y-4">
            {clientsWithAdherence.map((client, index) => (
              <Link
                key={client.id}
                href={`/dashboard/clients/${client.id}`}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <span className="text-lg font-bold text-muted-foreground w-6">
                  {index + 1}
                </span>
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {client.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{client.full_name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Progress value={client.adherence} className="flex-1 h-2" />
                    <span className="text-sm font-medium text-foreground w-12 text-right">
                      {client.adherence}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {client.trend > 0 ? (
                    <>
                      <TrendingUp className="w-4 h-4 text-primary" />
                      <span className="text-xs text-primary">+{client.trend}%</span>
                    </>
                  ) : client.trend < 0 ? (
                    <>
                      <TrendingDown className="w-4 h-4 text-destructive" />
                      <span className="text-xs text-destructive">{client.trend}%</span>
                    </>
                  ) : (
                    <>
                      <Minus className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">0%</span>
                    </>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
