
-- SQL PARA ARQUITETURA MULTI-SCHEMA - MONTE HUB v19.0
-- INSTRUÇÕES:
-- 1. Execute este script no SQL Editor do Supabase.
-- 2. Vá em Settings > API > Exposed Schemas e adicione: hr, finance, fleet, catalog, core.

-- 0. CRIAÇÃO DOS ESQUEMAS
CREATE SCHEMA IF NOT EXISTS hr;
CREATE SCHEMA IF NOT EXISTS fleet;
CREATE SCHEMA IF NOT EXISTS finance;
CREATE SCHEMA IF NOT EXISTS catalog;
CREATE SCHEMA IF NOT EXISTS core;

-- 1. PERMISSÕES DE ACESSO (CRITICAL PARA SUPABASE)
DO $$
DECLARE
    schema_name TEXT;
BEGIN
    FOR schema_name IN SELECT unnest(ARRAY['hr', 'fleet', 'finance', 'catalog', 'core'])
    LOOP
        EXECUTE format('GRANT USAGE ON SCHEMA %I TO anon, authenticated, service_role', schema_name);
        EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA %I GRANT ALL ON TABLES TO anon, authenticated, service_role', schema_name);
        EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA %I GRANT ALL ON SEQUENCES TO anon, authenticated, service_role', schema_name);
        EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA %I GRANT ALL ON FUNCTIONS TO anon, authenticated, service_role', schema_name);
        EXECUTE format('GRANT ALL ON ALL TABLES IN SCHEMA %I TO anon, authenticated, service_role', schema_name);
    END LOOP;
END $$;

-- 2. ESQUEMA: CORE (Gestão)
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

-- 3. ESQUEMA: HR
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

-- RLS PARA HR (MUITO IMPORTANTE PARA FUNCIONAMENTO PÚBLICO)
ALTER TABLE hr.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr.job_vacancies ENABLE ROW LEVEL SECURITY;

-- Candidaturas: Qualquer pessoa pode submeter (Public Insert)
CREATE POLICY "Public insert applications" ON hr.job_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated select applications" ON hr.job_applications FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated update applications" ON hr.job_applications FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated delete applications" ON hr.job_applications FOR DELETE TO authenticated USING (true);

-- Vagas: Qualquer pessoa pode ver (Public Read)
CREATE POLICY "Public read vacancies" ON hr.job_vacancies FOR SELECT USING (true);
CREATE POLICY "Authenticated all vacancies" ON hr.job_vacancies FOR ALL TO authenticated USING (true);

-- 4. ESQUEMA: FINANCE
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
  receipt_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. ESQUEMA: FLEET
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

-- 6. ESQUEMA: CATALOG
CREATE TABLE IF NOT EXISTS catalog.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL CHECK (price >= 0),
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

-- REPARAÇÃO: Caso a tabela já exista mas colunas específicas faltem
ALTER TABLE catalog.properties ADD COLUMN IF NOT EXISTS gallery JSONB DEFAULT '[]'::jsonb;
ALTER TABLE catalog.properties ADD COLUMN IF NOT EXISTS amenities JSONB DEFAULT '[]'::jsonb;
ALTER TABLE catalog.properties ADD COLUMN IF NOT EXISTS nearby JSONB DEFAULT '[]'::jsonb;
ALTER TABLE catalog.properties ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE catalog.properties ADD COLUMN IF NOT EXISTS map_coords JSONB;
ALTER TABLE catalog.properties ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;

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

-- DADOS INICIAIS
INSERT INTO core.roles (name, permissions) VALUES 
('Administrador', '["*"]'),
('Gestor RH', '["hr.*", "dashboard.view"]'),
('Gestor Financeiro', '["finance.*", "dashboard.view"]')
ON CONFLICT (name) DO NOTHING;
