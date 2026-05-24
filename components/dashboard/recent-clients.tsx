import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ClientStatusBadge } from '@/components/ui/client-status-badge'
import { Plus } from 'lucide-react'

interface Client {
  id: string
  full_name: string
  email: string
  goal?: string | null
  status: string
  data_vencimento?: string | null
  created_at: string
}

interface RecentClientsProps {
  clients: Client[]
}

export function RecentClients({ clients }: RecentClientsProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Pacientes Recentes</CardTitle>
          <CardDescription>Seus pacientes adicionados recentemente</CardDescription>
        </div>
        <Button asChild size="sm">
          <Link href="/dashboard/clients/new">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {clients.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">Nenhum paciente ainda</p>
            <Button asChild variant="outline">
              <Link href="/dashboard/clients/new">Adicione seu primeiro paciente</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {clients.map((client) => (
              <Link
                key={client.id}
                href={`/dashboard/clients/${client.id}`}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <Avatar>
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {client.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{client.full_name}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {client.goal || 'Sem objetivo definido'}
                  </p>
                </div>
                <ClientStatusBadge
                  dataVencimento={client.data_vencimento}
                  status={client.status}
                />
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
