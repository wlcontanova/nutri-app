'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface AdherenceOverviewProps {
  clientCount: number
}

export function AdherenceOverview({ clientCount }: AdherenceOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Adesão Semanal</CardTitle>
        <CardDescription>Média de adesão aos planos alimentares de todos os pacientes</CardDescription>
      </CardHeader>
      <CardContent>
        {clientCount === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">Adicione pacientes para ver a adesão semanal</p>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">Dados de adesão aparecerão aqui conforme os pacientes registrarem refeições</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
