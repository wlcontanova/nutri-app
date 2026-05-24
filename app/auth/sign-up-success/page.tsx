import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Leaf, Mail } from 'lucide-react'

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Leaf className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold text-foreground">Nume</span>
            </div>
          </div>
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Verifique seu e-mail</CardTitle>
          <CardDescription>
            Enviamos um link de confirmação. Por favor, verifique seu e-mail para ativar sua conta.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground mb-6">
            Após confirmar, você poderá entrar e começar a gerenciar seus pacientes.
          </p>
          <Button asChild variant="outline" className="w-full">
            <Link href="/auth/login">Voltar para login</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
