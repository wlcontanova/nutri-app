import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Plus, Search, Calendar, User } from 'lucide-react'

export default async function MealPlansPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: mealPlans } = await supabase
    .from('meal_plans')
    .select(`
      *,
      clients (
        id,
        full_name,
        email
      )
    `)
    .eq('nutritionist_id', user?.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Planos Alimentares</h1>
          <p className="text-muted-foreground">Crie e gerencie planos alimentares para seus pacientes</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/meal-plans/new">
            <Plus className="w-4 h-4 mr-2" />
            Novo Plano Alimentar
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Todos os Planos</CardTitle>
              <CardDescription>{mealPlans?.length || 0} planos no total</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Buscar planos..." className="pl-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!mealPlans || mealPlans.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">Nenhum plano ainda</h3>
              <p className="text-muted-foreground mb-4">
                Crie seu primeiro plano alimentar para começar
              </p>
              <Button asChild>
                <Link href="/dashboard/meal-plans/new">Criar primeiro plano</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {mealPlans.map((plan) => (
                <Link
                  key={plan.id}
                  href={`/dashboard/meal-plans/${plan.id}`}
                  className="block p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-foreground">{plan.name}</h3>
                        <Badge 
                          variant={plan.status === 'active' ? 'default' : 'secondary'}
                          className={plan.status === 'active' ? 'bg-primary/10 text-primary hover:bg-primary/20' : ''}
                        >
                          {plan.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {plan.clients?.full_name || 'Cliente desconhecido'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(plan.start_date).toLocaleDateString()} - {new Date(plan.end_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
