'use client'

import { Bell, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { User } from '@supabase/supabase-js'

interface Nutritionist {
  id: string
  full_name: string
  email: string
  specialty?: string | null
  avatar_url?: string | null
}

interface DashboardHeaderProps {
  user: User
  nutritionist: Nutritionist | null
}

export function DashboardHeader({ nutritionist }: DashboardHeaderProps) {
  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar pacientes, planos..."
            className="pl-9 bg-muted/50"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
        </Button>
        
        <div className="hidden sm:block text-right">
          <p className="text-sm font-medium text-foreground">
            {nutritionist?.full_name || 'Nutricionista'}
          </p>
          {nutritionist?.specialty && (
            <p className="text-xs text-muted-foreground">
              {nutritionist.specialty}
            </p>
          )}
        </div>
      </div>
    </header>
  )
}
