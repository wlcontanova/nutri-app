-- ============================================================
-- NUME — Initial Schema
-- ============================================================

-- 1. NUTRICIONISTAS (profissionais)
CREATE TABLE IF NOT EXISTS nutritionists (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  full_name text NOT NULL,
  email text NOT NULL UNIQUE,
  whatsapp text,
  registro text, -- CRN
  specialty text,
  avatar_url text,
  plano text DEFAULT 'gratuito',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE nutritionists ENABLE ROW LEVEL SECURITY;

-- 2. METAS NUTRICIONAIS
CREATE TABLE IF NOT EXISTS nutritional_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nutritionist_id uuid NOT NULL REFERENCES nutritionists(id) ON DELETE CASCADE,
  client_id uuid,
  calorias integer,
  proteina_g integer,
  carboidrato_g integer,
  gordura_g integer,
  agua_ml integer,
  por_refeicao jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE nutritional_goals ENABLE ROW LEVEL SECURITY;

-- 3. CLIENTES
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nutritionist_id uuid NOT NULL REFERENCES nutritionists(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  whatsapp text,
  phone text,
  foto_url text,
  plano text,
  goal text,
  notes text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'paused')),
  ativo boolean DEFAULT true,
  data_inicio date DEFAULT CURRENT_DATE,
  data_vencimento date,
  metas_id uuid REFERENCES nutritional_goals(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- 4. PLANOS ALIMENTARES (cardapios)
CREATE TABLE IF NOT EXISTS meal_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nutritionist_id uuid NOT NULL REFERENCES nutritionists(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name text NOT NULL,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'archived')),
  semana_inicio date,
  start_date date NOT NULL,
  end_date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;

-- 5. REFEIÇÕES DO CARDÁPIO
CREATE TABLE IF NOT EXISTS meals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_plan_id uuid NOT NULL REFERENCES meal_plans(id) ON DELETE CASCADE,
  dia_semana text,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  tipo text,
  meal_type text NOT NULL,
  nome text,
  name text NOT NULL,
  description text,
  foto_url text,
  ingredientes jsonb DEFAULT '[]',
  modo_preparo text,
  calories integer,
  protein_g numeric,
  carbs_g numeric,
  fat_g numeric,
  ordem integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE meals ENABLE ROW LEVEL SECURITY;

-- 6. SUBSTITUIÇÕES
CREATE TABLE IF NOT EXISTS meal_substitutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_id uuid NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
  nome text NOT NULL,
  name text NOT NULL,
  foto_url text,
  ingredientes jsonb DEFAULT '[]',
  modo_preparo text,
  calories integer,
  protein_g numeric,
  carbs_g numeric,
  fat_g numeric,
  ordem integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE meal_substitutions ENABLE ROW LEVEL SECURITY;

-- 7. REGISTROS DIÁRIOS (o que o cliente realmente comeu)
CREATE TABLE IF NOT EXISTS meal_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  meal_id uuid REFERENCES meals(id) ON DELETE SET NULL,
  data date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL CHECK (status IN ('comi_tudo', 'metade', 'pulei')),
  substituicao_id uuid REFERENCES meal_substitutions(id) ON DELETE SET NULL,
  foto_registro text,
  registrado_em timestamptz DEFAULT now()
);

ALTER TABLE meal_logs ENABLE ROW LEVEL SECURITY;

-- 8. ADESÃO DIÁRIA (métricas calculadas)
CREATE TABLE IF NOT EXISTS daily_adherence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  data date NOT NULL,
  total_refeicoes integer DEFAULT 0,
  cumpridas integer DEFAULT 0,
  metade integer DEFAULT 0,
  puladas integer DEFAULT 0,
  proteina_atingida_g numeric DEFAULT 0,
  carbo_atingido_g numeric DEFAULT 0,
  gordura_atingida_g numeric DEFAULT 0,
  agua_ml integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE (client_id, data)
);

ALTER TABLE daily_adherence ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_clients_nutritionist ON clients(nutritionist_id);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_vencimento ON clients(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_meal_plans_client ON meal_plans(client_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_nutritionist ON meal_plans(nutritionist_id);
CREATE INDEX IF NOT EXISTS idx_meals_plan ON meals(meal_plan_id);
CREATE INDEX IF NOT EXISTS idx_meals_day ON meals(day_of_week);
CREATE INDEX IF NOT EXISTS idx_meal_logs_client ON meal_logs(client_id);
CREATE INDEX IF NOT EXISTS idx_meal_logs_data ON meal_logs(data);
CREATE INDEX IF NOT EXISTS idx_daily_adherence_client ON daily_adherence(client_id);
CREATE INDEX IF NOT EXISTS idx_daily_adherence_data ON daily_adherence(data);
CREATE INDEX IF NOT EXISTS idx_nutritional_goals_client ON nutritional_goals(client_id);

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- Nutritionists: próprio registro
CREATE POLICY nutritionists_self ON nutritionists
  FOR ALL USING (id = auth.uid());

-- Clients: nutricionista vê apenas seus clientes
CREATE POLICY clients_nutritionist ON clients
  FOR ALL USING (nutritionist_id = auth.uid());

-- Nutritional goals: nutricionista vê apenas as metas que criou
CREATE POLICY nutritional_goals_nutritionist ON nutritional_goals
  FOR ALL USING (nutritionist_id = auth.uid());

-- Meal plans: nutricionista vê apenas os seus
CREATE POLICY meal_plans_nutritionist ON meal_plans
  FOR ALL USING (nutritionist_id = auth.uid());

-- Meals: via meal_plan → nutritionist
CREATE POLICY meals_nutritionist ON meals
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM meal_plans
      WHERE meal_plans.id = meals.meal_plan_id
      AND meal_plans.nutritionist_id = auth.uid()
    )
  );

-- Substitutions: via meal → meal_plan → nutritionist
CREATE POLICY meal_substitutions_nutritionist ON meal_substitutions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM meals
      JOIN meal_plans ON meal_plans.id = meals.meal_plan_id
      WHERE meals.id = meal_substitutions.meal_id
      AND meal_plans.nutritionist_id = auth.uid()
    )
  );

-- Meal logs: nutricionista vê logs dos seus clientes
CREATE POLICY meal_logs_nutritionist ON meal_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = meal_logs.client_id
      AND clients.nutritionist_id = auth.uid()
    )
  );

-- Daily adherence: nutricionista vê adesão dos seus clientes
CREATE POLICY daily_adherence_nutritionist ON daily_adherence
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = daily_adherence.client_id
      AND clients.nutritionist_id = auth.uid()
    )
  );

-- ============================================================
-- AUTO-CREATE NUTRITIONIST PROFILE ON SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.nutritionists (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    NEW.email
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
