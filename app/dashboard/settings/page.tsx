'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    specialty: '',
  })

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: nutritionist } = await supabase
          .from('nutritionists')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (nutritionist) {
          setFormData({
            full_name: nutritionist.full_name || '',
            email: nutritionist.email || '',
            specialty: nutritionist.specialty || '',
          })
        }
      }
    }
    fetchProfile()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError('Você precisa estar logado para atualizar as configurações')
      setLoading(false)
      return
    }

    const { error: updateError } = await supabase
      .from('nutritionists')
      .update({
        full_name: formData.full_name,
        specialty: formData.specialty,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (updateError) {
      setError(updateError.message)
    } else {
      setSuccess('Configurações atualizadas com sucesso')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
          <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground">Gerencie as configurações da sua conta</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Perfil</CardTitle>
          <CardDescription>Atualize suas informações pessoais</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="border-primary/50 bg-primary/5">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <AlertDescription className="text-primary">{success}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
                <Label htmlFor="full_name">Nome Completo</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  O e-mail não pode ser alterado
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialty">Especialidade</Label>
                <Input
                  id="specialty"
                  placeholder="Ex: Nutrição Esportiva, Emagrecimento"
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
              />
            </div>

            <Button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
