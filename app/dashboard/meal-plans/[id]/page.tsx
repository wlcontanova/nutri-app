import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, User, Calendar } from 'lucide-react'
import { MealPlanGrid } from '@/components/meal-plans/meal-plan-grid'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function MealPlanDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: mealPlan } = await supabase
    .from('meal_plans')
    .select(`
      *,
      clients (
        id,
        full_name,
        email
      )
    `)
    .eq('id', id)
    .eq('nutritionist_id', user?.id)
    .single()

  if (!mealPlan) {
    notFound()
  }

  const { data: meals } = await supabase
    .from('meals')
    .select('*')
    .eq('meal_plan_id', id)
    .order('day_of_week')
    .order('meal_type')

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/meal-plans">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">{mealPlan.name}</h1>
            <Badge 
              variant={mealPlan.status === 'active' ? 'default' : 'secondary'}
              className={mealPlan.status === 'active' ? 'bg-primary/10 text-primary hover:bg-primary/20' : ''}
            >
              {mealPlan.status}
            </Badge>
          </div>
          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {mealPlan.clients?.full_name}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(mealPlan.start_date).toLocaleDateString()} até {new Date(mealPlan.end_date).toLocaleDateString()}
                </span>
          </div>
        </div>
      </div>

      <MealPlanGrid mealPlanId={id} meals={meals || []} />
    </div>
  )
}
