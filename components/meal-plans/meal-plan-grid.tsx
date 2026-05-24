'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Plus, Utensils, Coffee, Sandwich, Cookie, Moon, Copy, Image, ArrowRight } from 'lucide-react'
import { SubstituicaoModal } from './substituicao-modal'
import type { MealSubstitution } from '@/lib/tipos'

interface Meal {
  id: string
  meal_plan_id: string
  day_of_week: number
  meal_type: string
  name: string
  description?: string | null
  foto_url?: string | null
  calories?: number | null
  protein_g?: number | null
  carbs_g?: number | null
  fat_g?: number | null
}

interface MealPlanGridProps {
  mealPlanId: string
  meals: Meal[]
}

const DAYS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MEAL_TYPES = [
  { id: 'breakfast', label: 'Café', icon: Coffee },
  { id: 'morning_snack', label: 'Lanche 1', icon: Cookie },
  { id: 'lunch', label: 'Almoço', icon: Sandwich },
  { id: 'afternoon_snack', label: 'Lanche 2', icon: Cookie },
  { id: 'dinner', label: 'Janta', icon: Moon },
]

function SortableMeal({
  meal,
  onEdit,
  onDelete,
  onSubstitute,
  onUploadPhoto,
}: {
  meal: Meal
  onEdit: (meal: Meal) => void
  onDelete: (id: string) => void
  onSubstitute: (meal: Meal) => void
  onUploadPhoto: (meal: Meal) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: meal.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`min-h-[90px] rounded-lg border border-border bg-card p-2 group ${isDragging ? 'opacity-50 z-50' : ''}`}
    >
      <div className="flex items-start gap-1">
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing mt-0.5 shrink-0">
          <Utensils className="w-3 h-3 text-muted-foreground" />
        </button>
        <div className="min-w-0 flex-1">
          {meal.foto_url && (
            <div className="w-full h-16 rounded-md overflow-hidden mb-1 bg-muted">
              <img src={meal.foto_url} alt={meal.name} className="w-full h-full object-cover" />
            </div>
          )}
          <p className="text-xs font-medium text-foreground truncate">{meal.name}</p>
          {meal.calories && (
            <p className="text-xs text-muted-foreground">{meal.calories} kcal</p>
          )}
          <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
            {meal.protein_g && <span>P:{meal.protein_g}g</span>}
            {meal.carbs_g && <span>C:{meal.carbs_g}g</span>}
            {meal.fat_g && <span>G:{meal.fat_g}g</span>}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onEdit(meal)} className="text-xs text-primary hover:underline">editar</button>
        <span className="text-muted-foreground">·</span>
        <button onClick={() => onSubstitute(meal)} className="text-xs text-primary hover:underline">substituir</button>
        <span className="text-muted-foreground">·</span>
        <button onClick={() => onUploadPhoto(meal)} className="text-xs text-primary hover:underline">foto</button>
        <span className="text-muted-foreground">·</span>
        <button onClick={() => onDelete(meal.id)} className="text-xs text-destructive hover:underline">remover</button>
      </div>
    </div>
  )
}

export function MealPlanGrid({ mealPlanId, meals }: MealPlanGridProps) {
  const router = useRouter()
  const [isAddingMeal, setIsAddingMeal] = useState(false)
  const [isEditingMeal, setIsEditingMeal] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<{ day: number; mealType: string } | null>(null)
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null)
  const [loading, setLoading] = useState(false)

  const [substituindo, setSubstituindo] = useState<Meal | null>(null)
  const [substituicoes, setSubstituicoes] = useState<MealSubstitution[]>([])
  const [showSubModal, setShowSubModal] = useState(false)

  const [copiandoDe, setCopiandoDe] = useState<number | null>(null)

  const [mealForm, setMealForm] = useState({
    name: '',
    description: '',
    calories: '',
    protein_g: '',
    carbs_g: '',
    fat_g: '',
  })

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const getMealForSlot = (day: number, mealType: string) => {
    return meals.find((m) => m.day_of_week === day && m.meal_type === mealType)
  }

  const handleAddMeal = (day: number, mealType: string) => {
    setSelectedSlot({ day, mealType })
    setMealForm({ name: '', description: '', calories: '', protein_g: '', carbs_g: '', fat_g: '' })
    setIsAddingMeal(true)
    setIsEditingMeal(false)
  }

  const handleEditMeal = (meal: Meal) => {
    setEditingMeal(meal)
    setMealForm({
      name: meal.name,
      description: meal.description || '',
      calories: meal.calories?.toString() || '',
      protein_g: meal.protein_g?.toString() || '',
      carbs_g: meal.carbs_g?.toString() || '',
      fat_g: meal.fat_g?.toString() || '',
    })
    setIsEditingMeal(true)
    setIsAddingMeal(false)
  }

  const handleSaveMeal = async () => {
    if (!selectedSlot) return
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.from('meals').insert({
      meal_plan_id: mealPlanId,
      day_of_week: selectedSlot.day,
      meal_type: selectedSlot.mealType,
      name: mealForm.name,
      description: mealForm.description || null,
      calories: mealForm.calories ? parseInt(mealForm.calories) : null,
      protein_g: mealForm.protein_g ? parseFloat(mealForm.protein_g) : null,
      carbs_g: mealForm.carbs_g ? parseFloat(mealForm.carbs_g) : null,
      fat_g: mealForm.fat_g ? parseFloat(mealForm.fat_g) : null,
    })

    if (!error) {
      setIsAddingMeal(false)
      setSelectedSlot(null)
      router.refresh()
    }
    setLoading(false)
  }

  const handleUpdateMeal = async () => {
    if (!editingMeal) return
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase
      .from('meals')
      .update({
        name: mealForm.name,
        description: mealForm.description || null,
        calories: mealForm.calories ? parseInt(mealForm.calories) : null,
        protein_g: mealForm.protein_g ? parseFloat(mealForm.protein_g) : null,
        carbs_g: mealForm.carbs_g ? parseFloat(mealForm.carbs_g) : null,
        fat_g: mealForm.fat_g ? parseFloat(mealForm.fat_g) : null,
      })
      .eq('id', editingMeal.id)

    if (!error) {
      setIsEditingMeal(false)
      setEditingMeal(null)
      router.refresh()
    }
    setLoading(false)
  }

  const handleDeleteMeal = async (mealId: string) => {
    const supabase = createClient()
    await supabase.from('meals').delete().eq('id', mealId)
    router.refresh()
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const draggedMeal = meals.find((m) => m.id === active.id)
    const targetMeal = meals.find((m) => m.id === over.id)
    if (!draggedMeal || !targetMeal) return

    const supabase = createClient()
    await supabase
      .from('meals')
      .update({ day_of_week: targetMeal.day_of_week, meal_type: targetMeal.meal_type })
      .eq('id', draggedMeal.id)

    router.refresh()
  }

  const handleSubstitute = async (meal: Meal) => {
    setSubstituindo(meal)
    const supabase = createClient()
    const { data } = await supabase
      .from('meal_substitutions')
      .select('*')
      .eq('meal_id', meal.id)
      .order('ordem')
    setSubstituicoes(data || [])
    setShowSubModal(true)
  }

  const handleUploadPhoto = async (meal: Meal) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const path = `meal-photos/${mealPlanId}/${meal.id}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('nume')
        .upload(path, file, { upsert: true })

      if (uploadError) return

      const { data: urlData } = await supabase.storage
        .from('nume')
        .getPublicUrl(path)

      if (urlData) {
        await supabase.from('meals').update({ foto_url: urlData.publicUrl }).eq('id', meal.id)
        router.refresh()
      }
    }
    input.click()
  }

  const handleQuickCopy = async (fromDay: number, toDay: number) => {
    const supabase = createClient()
    const fromMeals = meals.filter((m) => m.day_of_week === fromDay)

    for (const meal of fromMeals) {
      const exists = meals.find((m) => m.day_of_week === toDay && m.meal_type === meal.meal_type)
      if (exists) {
        await supabase.from('meals').update({
          name: meal.name,
          description: meal.description,
          calories: meal.calories,
          protein_g: meal.protein_g,
          carbs_g: meal.carbs_g,
          fat_g: meal.fat_g,
          foto_url: meal.foto_url,
        }).eq('id', exists.id)
      } else {
        await supabase.from('meals').insert({
          meal_plan_id: mealPlanId,
          day_of_week: toDay,
          meal_type: meal.meal_type,
          name: meal.name,
          description: meal.description,
          calories: meal.calories,
          protein_g: meal.protein_g,
          carbs_g: meal.carbs_g,
          fat_g: meal.fat_g,
          foto_url: meal.foto_url,
        })
      }
    }

    router.refresh()
  }

  const sortableItems = meals.map((m) => m.id)

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Cardápio Semanal</CardTitle>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Copy className="w-3.5 h-3.5 mr-1" />
                    Copiar dia
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {copiandoDe === null ? (
                    DAYS_PT.map((day, i) => (
                      <DropdownMenuItem key={i} onClick={() => setCopiandoDe(i)}>
                        Copiar {day}
                      </DropdownMenuItem>
                    ))
                  ) : (
                    DAYS_PT.map((day, i) => {
                      if (i === copiandoDe) return null
                      return (
                        <DropdownMenuItem key={i} onClick={() => {
                          handleQuickCopy(copiandoDe, i)
                          setCopiandoDe(null)
                        }}>
                          <ArrowRight className="w-3.5 h-3.5 mr-2" />
                          Aplicar para {day}
                        </DropdownMenuItem>
                      )
                    })
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={sortableItems} strategy={rectSortingStrategy}>
              <div className="min-w-[800px]">
                <div className="grid grid-cols-8 gap-2 mb-4">
                  <div className="p-2" />
                  {DAYS_PT.map((day) => (
                    <div key={day} className="p-2 text-center">
                      <span className="font-medium text-foreground">{day}</span>
                    </div>
                  ))}
                </div>

                {MEAL_TYPES.map((mealType) => (
                  <div key={mealType.id} className="grid grid-cols-8 gap-2 mb-2">
                    <div className="p-2 flex items-center gap-2">
                      <mealType.icon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">{mealType.label}</span>
                    </div>
                    {DAYS_PT.map((_, dayIndex) => {
                      const meal = getMealForSlot(dayIndex, mealType.id)
                      return (
                        <div key={`${dayIndex}-${mealType.id}`} className="min-h-[90px]">
                          {meal ? (
                            <SortableMeal
                              meal={meal}
                              onEdit={handleEditMeal}
                              onDelete={handleDeleteMeal}
                              onSubstitute={handleSubstitute}
                              onUploadPhoto={handleUploadPhoto}
                            />
                          ) : (
                            <button
                              onClick={() => handleAddMeal(dayIndex, mealType.id)}
                              className="w-full h-full min-h-[90px] flex items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </CardContent>
      </Card>

      {/* Add Meal Dialog */}
      <Dialog open={isAddingMeal} onOpenChange={setIsAddingMeal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Refeição</DialogTitle>
            <DialogDescription>
              {selectedSlot && DAYS_PT[selectedSlot.day]} — {selectedSlot && MEAL_TYPES.find((t) => t.id === selectedSlot.mealType)?.label}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="meal-name">Nome do prato *</Label>
              <Input
                id="meal-name"
                placeholder="e.g., Omelete de frango"
                value={mealForm.name}
                onChange={(e) => setMealForm({ ...mealForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="meal-description">Modo de preparo</Label>
              <Textarea
                id="meal-description"
                placeholder="Instruções rápidas..."
                value={mealForm.description}
                onChange={(e) => setMealForm({ ...mealForm, description: e.target.value })}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="calories">Calorias</Label>
                <Input id="calories" type="number" placeholder="400" value={mealForm.calories} onChange={(e) => setMealForm({ ...mealForm, calories: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="protein">Proteína (g)</Label>
                <Input id="protein" type="number" placeholder="30" value={mealForm.protein_g} onChange={(e) => setMealForm({ ...mealForm, protein_g: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="carbs">Carboidrato (g)</Label>
                <Input id="carbs" type="number" placeholder="45" value={mealForm.carbs_g} onChange={(e) => setMealForm({ ...mealForm, carbs_g: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fat">Gordura (g)</Label>
                <Input id="fat" type="number" placeholder="15" value={mealForm.fat_g} onChange={(e) => setMealForm({ ...mealForm, fat_g: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsAddingMeal(false)}>Cancelar</Button>
              <Button onClick={handleSaveMeal} disabled={loading || !mealForm.name}>
                {loading ? 'Salvando...' : 'Adicionar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Meal Dialog */}
      <Dialog open={isEditingMeal} onOpenChange={setIsEditingMeal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Refeição</DialogTitle>
            <DialogDescription>Altere os dados da refeição</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-meal-name">Nome do prato *</Label>
              <Input
                id="edit-meal-name"
                value={mealForm.name}
                onChange={(e) => setMealForm({ ...mealForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-meal-description">Modo de preparo</Label>
              <Textarea
                id="edit-meal-description"
                value={mealForm.description}
                onChange={(e) => setMealForm({ ...mealForm, description: e.target.value })}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-calories">Calorias</Label>
                <Input id="edit-calories" type="number" value={mealForm.calories} onChange={(e) => setMealForm({ ...mealForm, calories: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-protein">Proteína (g)</Label>
                <Input id="edit-protein" type="number" value={mealForm.protein_g} onChange={(e) => setMealForm({ ...mealForm, protein_g: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-carbs">Carboidrato (g)</Label>
                <Input id="edit-carbs" type="number" value={mealForm.carbs_g} onChange={(e) => setMealForm({ ...mealForm, carbs_g: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-fat">Gordura (g)</Label>
                <Input id="edit-fat" type="number" value={mealForm.fat_g} onChange={(e) => setMealForm({ ...mealForm, fat_g: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsEditingMeal(false)}>Cancelar</Button>
              <Button onClick={handleUpdateMeal} disabled={loading || !mealForm.name}>
                {loading ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Substitutions Modal */}
      {substituindo && (
        <SubstituicaoModal
          open={showSubModal}
          onOpenChange={setShowSubModal}
          mealId={substituindo.id}
          mealName={substituindo.name}
          substituicoes={substituicoes}
        />
      )}
    </>
  )
}
