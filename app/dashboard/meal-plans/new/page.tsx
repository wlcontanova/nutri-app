'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, AlertCircle } from 'lucide-react'

interface Client {
  id: string
  full_name: string
  email: string
}

export default function NewMealPlanPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedClient = searchParams.get('client')
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [clients, setClients] = useState<Client[]>([])

  const [formData, setFormData] = useState({
    name: '',
    client_id: preselectedClient || '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'draft',
  })

  useEffect(() => {
    const fetchClients = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data } = await supabase
          .from('clients')
          .select('id, full_name, email')
          .eq('nutritionist_id', user.id)
          .eq('status', 'active')
          .order('full_name')
        
        setClients(data || [])
      }
    }
    fetchClients()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError('Você precisa estar logado para criar um plano alimentar')
      setLoading(false)
      return
    }

    const { data: newPlan, error: insertError } = await supabase
      .from('meal_plans')
      .insert({
        ...formData,
        nutritionist_id: user.id,
      })
      .select()
      .single()

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
    } else if (newPlan) {
      router.push(`/dashboard/meal-plans/${newPlan.id}`)
      router.refresh()
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/meal-plans">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Criar Plano Alimentar</h1>
          <p className="text-muted-foreground">Configure um novo plano alimentar para seu paciente</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalhes do Plano</CardTitle>
          <CardDescription>Configure as informações básicas do plano alimentar</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Nome do Plano *</Label>
              <Input
                id="name"
                placeholder="Ex: Semana 1 - Plano de Emagrecimento"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client">Paciente *</Label>
              <Select
                value={formData.client_id}
                onValueChange={(value) => setFormData({ ...formData, client_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um paciente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {clients.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Nenhum paciente ativo encontrado.{' '}
                  <Link href="/dashboard/clients/new" className="text-primary hover:underline">
                    Adicione um paciente primeiro
                  </Link>
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="start_date">Data Início *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">Data Fim *</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading || !formData.client_id}>
                {loading ? 'Criando...' : 'Criar e Editar Refeições'}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard/meal-plans">Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
