import { calcularStatusCliente } from '@/lib/calculos'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface ClientStatusBadgeProps {
  dataVencimento?: string | null
  status?: string
}

export function ClientStatusBadge({ dataVencimento, status }: ClientStatusBadgeProps) {
  if (status === 'inactive') {
    return <Badge variant="secondary">Inativo</Badge>
  }

  const badgeStatus = calcularStatusCliente(dataVencimento)

  const config = {
    active: {
      label: 'Ativo',
      className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    },
    expiring_week: {
      label: 'Vence essa semana',
      className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    },
    expired: {
      label: 'Vencido',
      className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    },
  } as const

  const { label, className } = config[badgeStatus]

  return (
    <Badge variant="outline" className={cn('border-0', className)}>
      <span className={cn(
        'w-1.5 h-1.5 rounded-full mr-1.5 inline-block',
        badgeStatus === 'active' && 'bg-green-500',
        badgeStatus === 'expiring_week' && 'bg-yellow-500',
        badgeStatus === 'expired' && 'bg-red-500',
      )} />
      {label}
    </Badge>
  )
}
