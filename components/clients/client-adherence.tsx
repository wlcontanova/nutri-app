'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface ClientAdherenceProps {
  clientId: string
}

const recentAdherence = [
  { date: 'Hoje', completed: 4, total: 5, percentage: 80 },
  { date: 'Ontem', completed: 5, total: 5, percentage: 100 },
  { date: '2 dias atrás', completed: 3, total: 5, percentage: 60 },
  { date: '3 dias atrás', completed: 4, total: 5, percentage: 80 },
  { date: '4 dias atrás', completed: 5, total: 5, percentage: 100 },
]

export function ClientAdherence({ clientId }: ClientAdherenceProps) {
  const avgAdherence = Math.round(
    recentAdherence.reduce((sum, d) => sum + d.percentage, 0) / recentAdherence.length
  )

  void clientId

  return (
    <Card>
      <CardHeader>
        <CardTitle>Adesão Recente</CardTitle>
        <CardDescription>Percentual de cumprimento do plano nos últimos 5 dias</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl font-bold text-foreground">{avgAdherence}%</span>
            <span className="text-sm text-muted-foreground">Média de 5 dias</span>
          </div>
          <Progress value={avgAdherence} className="h-2" />
        </div>

        <div className="space-y-3">
          {recentAdherence.map((day, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div>
                <p className="text-sm font-medium text-foreground">{day.date}</p>
                <p className="text-xs text-muted-foreground">
                  {day.completed} de {day.total} refeições registradas
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Progress value={day.percentage} className="w-24 h-2" />
                <span className={`text-sm font-medium ${
                  day.percentage >= 80 ? 'text-primary' : day.percentage >= 60 ? 'text-warning' : 'text-destructive'
                }`}>
                  {day.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
