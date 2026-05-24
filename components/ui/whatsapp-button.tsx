import { Button } from '@/components/ui/button'
import { MessageCircle } from 'lucide-react'

interface WhatsAppButtonProps {
  phone: string
  message?: string
  variant?: 'icon' | 'full'
}

export function WhatsAppButton({ phone, message, variant = 'icon' }: WhatsAppButtonProps) {
  const cleaned = phone.replace(/\D/g, '')
  const url = message
    ? `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`
    : `https://wa.me/${cleaned}`

  if (variant === 'full') {
    return (
      <Button variant="outline" size="sm" asChild>
        <a href={url} target="_blank" rel="noopener noreferrer">
          <MessageCircle className="w-4 h-4 mr-2" />
          WhatsApp
        </a>
      </Button>
    )
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-muted-foreground hover:text-primary transition-colors"
      title="Enviar mensagem no WhatsApp"
    >
      <MessageCircle className="w-4 h-4" />
    </a>
  )
}
