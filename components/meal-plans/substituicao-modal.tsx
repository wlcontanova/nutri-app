'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, X, Leaf } from 'lucide-react'
import type { MealSubstitution } from '@/lib/tipos'

interface SubstituicaoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mealId: string
  mealName: string
  substituicoes: MealSubstitution[]
}

export function SubstituicaoModal({
  open,
  onOpenChange,
  mealId,
  mealName,
  substituicoes,
}: SubstituicaoModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    calories: '',
    protein_g: '',
    carbs_g: '',
    fat_g: '',
  })

  const handleAdd = async () => {
    if (!formData.name) return
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.from('meal_substitutions').insert({
      meal_id: mealId,
      name: formData.name,
      nome: formData.name,
      modo_preparo: formData.description || null,
      calories: formData.calories ? parseInt(formData.calories) : null,
      protein_g: formData.protein_g ? parseFloat(formData.protein_g) : null,
      carbs_g: formData.carbs_g ? parseFloat(formData.carbs_g) : null,
      fat_g: formData.fat_g ? parseFloat(formData.fat_g) : null,
    })

    if (!error) {
      setShowForm(false)
      setFormData({ name: '', description: '', calories: '', protein_g: '', carbs_g: '', fat_g: '' })
      router.refresh()
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    const supabase = createClient()
    await supabase.from('meal_substitutions').delete().eq('id', id)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Substituições — {mealName}</DialogTitle>
          <DialogDescription>
            Até 3 opções equivalentes para esta refeição
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {substituicoes.length === 0 && !showForm && (
            <div className="text-center py-8 text-muted-foreground">
              <Leaf className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma substituição cadastrada</p>
              <p className="text-xs">Adicione opções equivalentes para o cliente</p>
            </div>
          )}

          <div className="space-y-3">
            {substituicoes.map((sub, index) => (
              <Card key={sub.id} className="relative">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                        #{index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-foreground text-sm">{sub.name}</p>
                        {sub.calories && (
                          <p className="text-xs text-muted-foreground">
                            {sub.calories} kcal | P: {sub.protein_g || '-'}g | C: {sub.carbs_g || '-'}g | G: {sub.fat_g || '-'}g
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(sub.id)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {substituicoes.length < 3 && !showForm && (
            <Button variant="outline" size="sm" className="w-full" onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar substituição ({substituicoes.length}/3)
            </Button>
          )}

          {showForm && (
            <div className="space-y-4 p-4 rounded-lg border border-border bg-muted/30">
              <div className="space-y-2">
                <Label htmlFor="sub-name">Nome do prato *</Label>
                <Input
                  id="sub-name"
                  placeholder="e.g., Frango grelhado com legumes"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sub-desc">Modo de preparo</Label>
                <Textarea
                  id="sub-desc"
                  placeholder="Instruções rápidas..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sub-cal">Calorias</Label>
                  <Input id="sub-cal" type="number" placeholder="350" value={formData.calories} onChange={(e) => setFormData({ ...formData, calories: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sub-prot">Proteína (g)</Label>
                  <Input id="sub-prot" type="number" placeholder="30" value={formData.protein_g} onChange={(e) => setFormData({ ...formData, protein_g: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sub-carbs">Carboidrato (g)</Label>
                  <Input id="sub-carbs" type="number" placeholder="40" value={formData.carbs_g} onChange={(e) => setFormData({ ...formData, carbs_g: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sub-fat">Gordura (g)</Label>
                  <Input id="sub-fat" type="number" placeholder="15" value={formData.fat_g} onChange={(e) => setFormData({ ...formData, fat_g: e.target.value })} />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
                <Button size="sm" onClick={handleAdd} disabled={loading || !formData.name}>
                  {loading ? 'Salvando...' : 'Adicionar'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
