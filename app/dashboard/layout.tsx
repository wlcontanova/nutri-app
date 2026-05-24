import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: nutritionist } = await supabase
    .from('nutritionists')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen flex bg-background">
      <DashboardSidebar user={user} nutritionist={nutritionist} />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader user={user} nutritionist={nutritionist} />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
