import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Calendar } from 'lucide-react'

interface MealPlan {
  id: string
  name: string
  start_date: string
  end_date: string
  status: string
}

interface ClientMealPlansProps {
  clientId: string
  mealPlans: MealPlan[]
}

export function ClientMealPlans({ clientId, mealPlans }: ClientMealPlansProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Planos Alimentares</CardTitle>
          <CardDescription>Todos os planos deste paciente</CardDescription>
        </div>
        <Button asChild size="sm">
          <Link href={`/dashboard/meal-plans/new?client=${clientId}`}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Plano
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {mealPlans.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-4">Nenhum plano alimentar ainda</p>
            <Button asChild variant="outline" size="sm">
              <Link href={`/dashboard/meal-plans/new?client=${clientId}`}>
                Criar primeiro plano
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {mealPlans.map((plan) => (
              <Link
                key={plan.id}
                href={`/dashboard/meal-plans/${plan.id}`}
                className="block p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-foreground">{plan.name}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(plan.start_date).toLocaleDateString()} - {new Date(plan.end_date).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge
                    variant={plan.status === 'active' ? 'default' : 'secondary'}
                    className={plan.status === 'active' ? 'bg-primary/10 text-primary hover:bg-primary/20' : ''}
                  >
                    {plan.status === 'draft' ? 'Rascunho' : plan.status === 'active' ? 'Ativo' : plan.status === 'completed' ? 'Concluído' : plan.status}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
