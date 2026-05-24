'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts'

const data = [
  { day: 'Seg', adherence: 78 },
  { day: 'Ter', adherence: 82 },
  { day: 'Qua', adherence: 85 },
  { day: 'Qui', adherence: 79 },
  { day: 'Sex', adherence: 88 },
  { day: 'Sáb', adherence: 75 },
  { day: 'Dom', adherence: 80 },
]

export function AdherenceChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tendência Semanal de Adesão</CardTitle>
        <CardDescription>Média de adesão entre todos os pacientes esta semana</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="adherenceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="day" 
                className="text-muted-foreground"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis 
                domain={[0, 100]}
                className="text-muted-foreground"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                        <p className="text-sm font-medium text-foreground">
                          {payload[0].payload.day}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Adesão: <span className="text-primary font-medium">{payload[0].value}%</span>
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Area
                type="monotone"
                dataKey="adherence"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#adherenceGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
