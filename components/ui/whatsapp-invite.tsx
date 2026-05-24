'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { MessageCircle, Check, Copy } from 'lucide-react'

interface WhatsAppInviteProps {
  clientName: string
  clientPhone: string
  nutritionistName: string
}

export function WhatsAppInvite({ clientName, clientPhone, nutritionistName }: WhatsAppInviteProps) {
  const [copied, setCopied] = useState(false)

  const appLink = process.env.NEXT_PUBLIC_APP_LINK || 'https://nume.app/download'
  const mensagem = `Olá ${clientName}! 👋\n\nSeu nutricionista ${nutritionistName} te convidou para acompanhar seu plano alimentar no Nume.\n\nBaixe o app e comece hoje: ${appLink}\n\nÉ gratuito!`

  const whatsappUrl = `https://wa.me/${clientPhone.replace(/\D/g, '')}?text=${encodeURIComponent(mensagem)}`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(mensagem)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">Convide o paciente para baixar o app</p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" asChild>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="w-4 h-4 mr-2" />
            Enviar convite
          </a>
        </Button>
        <Button variant="ghost" size="sm" onClick={handleCopy}>
          {copied ? (
            <><Check className="w-4 h-4 mr-2" />Copiado</>
          ) : (
            <><Copy className="w-4 h-4 mr-2" />Copiar</>
          )}
        </Button>
      </div>
    </div>
  )
}
