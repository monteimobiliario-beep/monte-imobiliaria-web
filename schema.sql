-- ==============================================================================
-- MONTE IMOBILIÁRIA ERP & PORTAL - ESQUEMA COMPLETO DO BANCO DE DADOS SUPABASE
-- ==============================================================================
-- INSTRUÇÕES DE EXECUÇÃO:
-- 1. Abra o painel do Supabase: https://supabase.com/dashboard/project/vazhjvigorytfuebfdca
-- 2. Vá no menu lateral esquerdo em "SQL Editor" -> "+ New query".
-- 3. Cole todo este código SQL e clique em "Run" (ou pressione Ctrl+Enter / Cmd+Enter).
-- 4. Vá em "Project Settings" -> "API" (Data API) -> "Exposed Schemas"
--    e certifique-se de adicionar os schemas: public, catalog, hr, finance, fleet, core, marketing
-- ==============================================================================

-- 1. CRIAÇÃO DOS ESQUEMAS
CREATE SCHEMA IF NOT EXISTS hr;
CREATE SCHEMA IF NOT EXISTS fleet;
CREATE SCHEMA IF NOT EXISTS finance;
CREATE SCHEMA IF NOT EXISTS catalog;
CREATE SCHEMA IF NOT EXISTS core;
CREATE SCHEMA IF NOT EXISTS marketing;

-- 2. CONCESSÃO DE PERMISSÕES GLOBAIS (anon, authenticated, service_role)
DO $$
DECLARE
    schema_name TEXT;
BEGIN
    FOR schema_name IN SELECT unnest(ARRAY['public', 'hr', 'fleet', 'finance', 'catalog', 'core', 'marketing'])
    LOOP
        EXECUTE format('GRANT USAGE ON SCHEMA %I TO anon, authenticated, service_role', schema_name);
        EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA %I GRANT ALL ON TABLES TO anon, authenticated, service_role', schema_name);
        EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA %I GRANT ALL ON SEQUENCES TO anon, authenticated, service_role', schema_name);
        EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA %I GRANT ALL ON FUNCTIONS TO anon, authenticated, service_role', schema_name);
        EXECUTE format('GRANT ALL ON ALL TABLES IN SCHEMA %I TO anon, authenticated, service_role', schema_name);
    END LOOP;
END $$;

-- ==============================================================================
-- 3. ESQUEMA: CORE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS core.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  permissions JSONB DEFAULT '[]'::jsonb,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS core.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID,
  admin_name TEXT,
  target_user_name TEXT,
  action_type TEXT NOT NULL,
  change_details TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS core.strategic_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal TEXT NOT NULL,
  kpi TEXT NOT NULL,
  progress NUMERIC DEFAULT 0,
  responsible TEXT NOT NULL,
  deadline DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 4. ESQUEMA: HR (Recursos Humanos)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS hr.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL,
  department TEXT,
  salary NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Férias', 'Inativo', 'Suspenso')),
  avatar TEXT,
  phone TEXT,
  join_date DATE DEFAULT CURRENT_DATE,
  nuit TEXT,
  address TEXT,
  permissions JSONB DEFAULT '[]'::jsonb,
  document_type TEXT,
  document_number TEXT,
  document_expiry DATE,
  payment_method TEXT,
  contract_start DATE,
  niss TEXT,
  emergency_contact TEXT,
  gender TEXT CHECK (gender IN ('M', 'F', 'O')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hr.attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES hr.employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  check_in TIME,
  check_out TIME,
  status TEXT,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hr.contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES hr.employees(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  salary_base NUMERIC NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hr.job_vacancies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  area TEXT,
  type TEXT,
  location TEXT,
  salary TEXT,
  description TEXT,
  image TEXT,
  status TEXT DEFAULT 'Open' CHECK (status IN ('Open', 'Closed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hr.job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES hr.job_vacancies(id) ON DELETE CASCADE,
  job_title TEXT,
  applicant_name TEXT NOT NULL,
  applicant_email TEXT NOT NULL,
  applicant_phone TEXT,
  applicant_linkedin TEXT,
  cv_url TEXT,
  cover_letter_url TEXT,
  message TEXT,
  status TEXT DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Aprovado', 'Rejeitado')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 5. ESQUEMA: FINANCE (Finanças e Projetos)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS finance.beneficiaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  nuit TEXT,
  bank_account TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS finance.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'Planejado' CHECK (status IN ('Planejado', 'Em Andamento', 'Concluído')),
  budget NUMERIC DEFAULT 0,
  spent NUMERIC DEFAULT 0,
  deadline DATE,
  team UUID[] DEFAULT '{}',
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS finance.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  type TEXT CHECK (type IN ('RECEITA', 'DESPESA')),
  category TEXT,
  date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  payment_date DATE,
  status TEXT DEFAULT 'Pendente' CHECK (status IN ('Pago', 'Pendente', 'Vencido', 'Cancelado')),
  payment_method TEXT CHECK (payment_method IN ('Banco', 'M-Pesa', 'e-Mola', 'Dinheiro', 'Cartão', 'Cheque')),
  beneficiary_id UUID REFERENCES finance.beneficiaries(id) ON DELETE SET NULL,
  project_id UUID REFERENCES finance.projects(id) ON DELETE SET NULL,
  client_supplier_name TEXT,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_period TEXT CHECK (recurrence_period IN ('Mensal', 'Anual', 'Semanal')),
  receipt_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS core.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT false,
  priority TEXT CHECK (priority IN ('Baixa', 'Média', 'Alta')),
  due_date DATE,
  beneficiary_id UUID REFERENCES finance.beneficiaries(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 6. ESQUEMA: FLEET (Frotas)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS fleet.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  plate TEXT UNIQUE NOT NULL,
  year INTEGER,
  status TEXT DEFAULT 'Disponível' CHECK (status IN ('Disponível', 'Em Serviço', 'Manutenção', 'Lavagem')),
  current_driver_id UUID REFERENCES hr.employees(id) ON DELETE SET NULL,
  last_maintenance DATE,
  fuel_level INTEGER DEFAULT 100,
  odometer NUMERIC DEFAULT 0,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 7. ESQUEMA: CATALOG (Imóveis e Conteúdo do Portal)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS catalog.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL CHECK (price >= 0),
  old_price NUMERIC DEFAULT NULL,
  is_promo BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  location TEXT NOT NULL,
  bathrooms INTEGER DEFAULT 1,
  bedrooms INTEGER DEFAULT 1,
  area NUMERIC DEFAULT 0,
  image TEXT,
  type TEXT CHECK (type IN ('Casa', 'Apartamento', 'Guest House', 'Hotel', 'Condomínio', 'Terreno')),
  deal_type TEXT CHECK (deal_type IN ('Venda', 'Aluguel')),
  status TEXT DEFAULT 'Disponível' CHECK (status IN ('Disponível', 'Reservado', 'Vendido', 'Arrendado')),
  featured BOOLEAN DEFAULT false,
  gallery JSONB DEFAULT '[]'::jsonb,
  amenities JSONB DEFAULT '[]'::jsonb,
  nearby JSONB DEFAULT '[]'::jsonb,
  video_url TEXT,
  map_coords JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS catalog.contact_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  property_id UUID REFERENCES catalog.properties(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'Novo' CHECK (status IN ('Novo', 'Em Contacto', 'Fechado', 'Perdido')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS catalog.partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS catalog.real_estate_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 8. ESQUEMA: MARKETING
-- ==============================================================================
CREATE TABLE IF NOT EXISTS marketing.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  platform TEXT NOT NULL,
  status TEXT CHECK (status IN ('Published', 'Scheduled', 'Draft')),
  scheduled_date TIMESTAMPTZ,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 9. COMPATIBILIDADE / TABELAS NO ESQUEMA PUBLIC (Caso chamado sem prefixo)
-- ==============================================================================
CREATE OR REPLACE VIEW public.properties AS SELECT * FROM catalog.properties;
CREATE OR REPLACE VIEW public.services AS SELECT * FROM catalog.real_estate_services;
CREATE OR REPLACE VIEW public.contact_requests AS SELECT * FROM catalog.contact_requests;
CREATE OR REPLACE VIEW public.partners AS SELECT * FROM catalog.partners;
CREATE OR REPLACE VIEW public.tasks AS SELECT * FROM core.tasks;
CREATE OR REPLACE VIEW public.beneficiaries AS SELECT * FROM finance.beneficiaries;
CREATE OR REPLACE VIEW public.transactions AS SELECT * FROM finance.transactions;
CREATE OR REPLACE VIEW public.employees AS SELECT * FROM hr.employees;
CREATE OR REPLACE VIEW public.job_applications AS SELECT * FROM hr.job_applications;
CREATE OR REPLACE VIEW public.job_vacancies AS SELECT * FROM hr.job_vacancies;

-- ==============================================================================
-- 10. POLÍTICAS RLS (Row Level Security)
-- ==============================================================================
-- Habilitar RLS nas tabelas principais
ALTER TABLE hr.job_vacancies ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog.contact_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog.real_estate_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance.beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE fleet.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE core.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE core.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE core.strategic_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE core.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing.posts ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso Público & Autenticado (Permite leitura pública do portal e gestão via app)
DO $$
BEGIN
  -- Catálogo de Imóveis
  DROP POLICY IF EXISTS "Public read properties" ON catalog.properties;
  DROP POLICY IF EXISTS "All access properties" ON catalog.properties;
  CREATE POLICY "Public read properties" ON catalog.properties FOR SELECT USING (true);
  CREATE POLICY "All access properties" ON catalog.properties FOR ALL USING (true);

  -- Contact Requests
  DROP POLICY IF EXISTS "Public insert contacts" ON catalog.contact_requests;
  DROP POLICY IF EXISTS "All access contacts" ON catalog.contact_requests;
  CREATE POLICY "Public insert contacts" ON catalog.contact_requests FOR INSERT WITH CHECK (true);
  CREATE POLICY "All access contacts" ON catalog.contact_requests FOR ALL USING (true);

  -- Vagas e Candidaturas
  DROP POLICY IF EXISTS "Public read vacancies" ON hr.job_vacancies;
  DROP POLICY IF EXISTS "All access vacancies" ON hr.job_vacancies;
  CREATE POLICY "Public read vacancies" ON hr.job_vacancies FOR SELECT USING (true);
  CREATE POLICY "All access vacancies" ON hr.job_vacancies FOR ALL USING (true);

  DROP POLICY IF EXISTS "Public insert applications" ON hr.job_applications;
  DROP POLICY IF EXISTS "All access applications" ON hr.job_applications;
  CREATE POLICY "Public insert applications" ON hr.job_applications FOR INSERT WITH CHECK (true);
  CREATE POLICY "All access applications" ON hr.job_applications FOR ALL USING (true);

  -- Parceiros e Serviços
  DROP POLICY IF EXISTS "Public read partners" ON catalog.partners;
  DROP POLICY IF EXISTS "All access partners" ON catalog.partners;
  CREATE POLICY "Public read partners" ON catalog.partners FOR SELECT USING (true);
  CREATE POLICY "All access partners" ON catalog.partners FOR ALL USING (true);

  DROP POLICY IF EXISTS "Public read services" ON catalog.real_estate_services;
  DROP POLICY IF EXISTS "All access services" ON catalog.real_estate_services;
  CREATE POLICY "Public read services" ON catalog.real_estate_services FOR SELECT USING (true);
  CREATE POLICY "All access services" ON catalog.real_estate_services FOR ALL USING (true);

  -- Demais módulos internos
  DROP POLICY IF EXISTS "All access employees" ON hr.employees;
  CREATE POLICY "All access employees" ON hr.employees FOR ALL USING (true);

  DROP POLICY IF EXISTS "All access attendance" ON hr.attendance_records;
  CREATE POLICY "All access attendance" ON hr.attendance_records FOR ALL USING (true);

  DROP POLICY IF EXISTS "All access contracts" ON hr.contracts;
  CREATE POLICY "All access contracts" ON hr.contracts FOR ALL USING (true);

  DROP POLICY IF EXISTS "All access transactions" ON finance.transactions;
  CREATE POLICY "All access transactions" ON finance.transactions FOR ALL USING (true);

  DROP POLICY IF EXISTS "All access beneficiaries" ON finance.beneficiaries;
  CREATE POLICY "All access beneficiaries" ON finance.beneficiaries FOR ALL USING (true);

  DROP POLICY IF EXISTS "All access projects" ON finance.projects;
  CREATE POLICY "All access projects" ON finance.projects FOR ALL USING (true);

  DROP POLICY IF EXISTS "All access vehicles" ON fleet.vehicles;
  CREATE POLICY "All access vehicles" ON fleet.vehicles FOR ALL USING (true);

  DROP POLICY IF EXISTS "All access roles" ON core.roles;
  CREATE POLICY "All access roles" ON core.roles FOR ALL USING (true);

  DROP POLICY IF EXISTS "All access tasks" ON core.tasks;
  CREATE POLICY "All access tasks" ON core.tasks FOR ALL USING (true);

  DROP POLICY IF EXISTS "All access strategic_plans" ON core.strategic_plans;
  CREATE POLICY "All access strategic_plans" ON core.strategic_plans FOR ALL USING (true);

  DROP POLICY IF EXISTS "All access audit_logs" ON core.audit_logs;
  CREATE POLICY "All access audit_logs" ON core.audit_logs FOR ALL USING (true);

  DROP POLICY IF EXISTS "All access posts" ON marketing.posts;
  CREATE POLICY "All access posts" ON marketing.posts FOR ALL USING (true);
END $$;

-- ==============================================================================
-- 11. DADOS INICIAIS (SEED)
-- ==============================================================================
INSERT INTO core.roles (name, permissions) VALUES 
('Administrador', '["*"]'),
('Gestor RH', '["hr.*", "dashboard.view"]'),
('Gestor Financeiro', '["finance.*", "dashboard.view"]'),
('Gestor de Catálogo', '["catalog.*", "dashboard.view"]')
ON CONFLICT (name) DO NOTHING;

-- Notificar PostgREST para recarregar o schema cache imediatamente
NOTIFY pgrst, reload_schema;
