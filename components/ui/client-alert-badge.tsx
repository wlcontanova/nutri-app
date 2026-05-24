import { AlertTriangle, Timer, SkipForward } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ClientAlert {
  type: 'sem_refeicoes' | 'pulou_seguidas'
  message: string
}

interface ClientAlertBadgeProps {
  alerts: ClientAlert[]
}

const alertConfig = {
  sem_refeicoes: { icon: Timer, label: 'Sem refeições hoje' },
  pulou_seguidas: { icon: SkipForward, label: 'Pulou 3+ seguidas' },
} as const

export function ClientAlertBadge({ alerts }: ClientAlertBadgeProps) {
  if (alerts.length === 0) return null

  const alert = alerts[0]
  const config = alertConfig[alert.type]

  return (
    <div
      title={alert.message}
      className={cn(
        'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
        'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      )}
    >
      <config.icon className="w-3 h-3" />
      <span className="truncate max-w-[140px]">{alert.message}</span>
    </div>
  )
}

export type { ClientAlert }
