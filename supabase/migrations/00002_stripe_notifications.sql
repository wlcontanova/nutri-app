-- ============================================================
-- NUME — Stripe + Notificações
-- ============================================================

-- Adicionar campos de Stripe na tabela nutritionists
ALTER TABLE nutritionists
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text;

-- Tabela de notificações
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nutritionist_id uuid REFERENCES nutritionists(id) ON DELETE CASCADE,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  tipo text NOT NULL CHECK (tipo IN ('alerta_refeicoes', 'adesao_baixa', 'vencimento', 'convite')),
  titulo text NOT NULL,
  mensagem text NOT NULL,
  lida boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY notifications_nutritionist ON notifications
  FOR ALL USING (nutritionist_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_notifications_nutritionist ON notifications(nutritionist_id);
CREATE INDEX IF NOT EXISTS idx_notifications_lida ON notifications(lida);

-- Função para criar notificação de alerta
CREATE OR REPLACE FUNCTION public.criar_notificacao_alerta()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_nutritionist_id uuid;
  v_client_name text;
BEGIN
  SELECT nutritionist_id, full_name INTO v_nutritionist_id, v_client_name
  FROM public.clients WHERE id = NEW.client_id;

  IF NEW.status = 'pulei' THEN
    INSERT INTO public.notifications (nutritionist_id, client_id, tipo, titulo, mensagem)
    VALUES (
      v_nutritionist_id,
      NEW.client_id,
      'alerta_refeicoes',
      'Refeição pulada',
      v_client_name || ' pulou uma refeição'
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_meal_log_alert ON public.meal_logs;
CREATE TRIGGER on_meal_log_alert
  AFTER INSERT ON public.meal_logs
  FOR EACH ROW
  WHEN (NEW.status = 'pulei')
  EXECUTE FUNCTION public.criar_notificacao_alerta();
