'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react'
import type { NutritionalGoals } from '@/lib/tipos'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function MetasPage({ params }: PageProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [metas, setMetas] = useState<NutritionalGoals | null>(null)
  const [clientId, setClientId] = useState<string>('')

  const [formData, setFormData] = useState({
    calorias: '',
    proteina_g: '',
    carboidrato_g: '',
    gordura_g: '',
    agua_ml: '',
  })

  useEffect(() => {
    const init = async () => {
      const { id } = await params
      setClientId(id)
      const supabase = createClient()
      const { data: existing } = await supabase
        .from('nutritional_goals')
        .select('*')
        .eq('client_id', id)
        .maybeSingle()

      if (existing) {
        setMetas(existing)
        setFormData({
          calorias: existing.calorias?.toString() || '',
          proteina_g: existing.proteina_g?.toString() || '',
          carboidrato_g: existing.carboidrato_g?.toString() || '',
          gordura_g: existing.gordura_g?.toString() || '',
          agua_ml: existing.agua_ml?.toString() || '',
        })
      }
    }
    init()
  }, [params])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const payload = {
      nutritionist_id: user.id,
      client_id: clientId,
      calorias: formData.calorias ? parseInt(formData.calorias) : null,
      proteina_g: formData.proteina_g ? parseInt(formData.proteina_g) : null,
      carboidrato_g: formData.carboidrato_g ? parseInt(formData.carboidrato_g) : null,
      gordura_g: formData.gordura_g ? parseInt(formData.gordura_g) : null,
      agua_ml: formData.agua_ml ? parseInt(formData.agua_ml) : null,
    }

    if (metas) {
      const { error: updateError } = await supabase
        .from('nutritional_goals')
        .update(payload)
        .eq('id', metas.id)

      if (updateError) {
        setError(updateError.message)
      } else {
        setSuccess('Metas atualizadas com sucesso!')
      }
    } else {
      const { data: newMetas, error: insertError } = await supabase
        .from('nutritional_goals')
        .insert(payload)
        .select()
        .single()

      if (insertError) {
        setError(insertError.message)
      } else {
        setMetas(newMetas)
        setSuccess('Metas criadas com sucesso!')
        router.refresh()
      }
    }

    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/clients/${clientId}`}>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Metas Nutricionais</h1>
          <p className="text-muted-foreground">Defina as metas diárias do paciente</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Metas Diárias</CardTitle>
          <CardDescription>Calorias e macronutrientes que o paciente deve atingir por dia</CardDescription>
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

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="calorias">Calorias (kcal)</Label>
                <Input
                  id="calorias"
                  type="number"
                  placeholder="2000"
                  value={formData.calorias}
                  onChange={(e) => setFormData({ ...formData, calorias: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="agua_ml">Água (ml)</Label>
                <Input
                  id="agua_ml"
                  type="number"
                  placeholder="2000"
                  value={formData.agua_ml}
                  onChange={(e) => setFormData({ ...formData, agua_ml: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="proteina_g">Proteína (g)</Label>
                <Input
                  id="proteina_g"
                  type="number"
                  placeholder="120"
                  value={formData.proteina_g}
                  onChange={(e) => setFormData({ ...formData, proteina_g: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="carboidrato_g">Carboidrato (g)</Label>
                <Input
                  id="carboidrato_g"
                  type="number"
                  placeholder="200"
                  value={formData.carboidrato_g}
                  onChange={(e) => setFormData({ ...formData, carboidrato_g: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gordura_g">Gordura (g)</Label>
                <Input
                  id="gordura_g"
                  type="number"
                  placeholder="60"
                  value={formData.gordura_g}
                  onChange={(e) => setFormData({ ...formData, gordura_g: e.target.value })}
                />
              </div>
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : metas ? 'Atualizar Metas' : 'Criar Metas'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {metas && (
        <Card>
          <CardHeader>
            <CardTitle>Resumo das Metas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="p-4 rounded-lg bg-primary/5 text-center">
                <p className="text-2xl font-bold text-primary">{metas.calorias || '-'}</p>
                <p className="text-sm text-muted-foreground">kcal/dia</p>
              </div>
              <div className="p-4 rounded-lg bg-primary/5 text-center">
                <p className="text-2xl font-bold text-primary">
                  {((metas.proteina_g || 0) + (metas.carboidrato_g || 0) + (metas.gordura_g || 0)) || '-'}
                </p>
                <p className="text-sm text-muted-foreground">g macros/dia</p>
              </div>
              <div className="p-4 rounded-lg bg-primary/5 text-center">
                <p className="text-2xl font-bold text-primary">{metas.agua_ml || '-'}</p>
                <p className="text-sm text-muted-foreground">ml água/dia</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
