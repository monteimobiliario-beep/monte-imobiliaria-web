-- Adições e Correções ao ESQUEMA HR
ALTER TABLE hr.employees ADD COLUMN IF NOT EXISTS document_type TEXT;
ALTER TABLE hr.employees ADD COLUMN IF NOT EXISTS document_number TEXT;
ALTER TABLE hr.employees ADD COLUMN IF NOT EXISTS document_expiry DATE;
ALTER TABLE hr.employees ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE hr.employees ADD COLUMN IF NOT EXISTS contract_start DATE;
ALTER TABLE hr.employees ADD COLUMN IF NOT EXISTS niss TEXT;
ALTER TABLE hr.employees ADD COLUMN IF NOT EXISTS emergency_contact TEXT;
ALTER TABLE hr.employees ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('M', 'F', 'O'));

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

-- Adições e Correções ao ESQUEMA FINANCE
ALTER TABLE finance.transactions ADD COLUMN IF NOT EXISTS client_supplier_name TEXT;
ALTER TABLE finance.transactions ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false;
ALTER TABLE finance.transactions ADD COLUMN IF NOT EXISTS recurrence_period TEXT CHECK (recurrence_period IN ('Mensal', 'Anual', 'Semanal'));

-- Criação da Tabela tasks em CORE
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

-- Criação da Tabela strategic_plans em CORE
CREATE TABLE IF NOT EXISTS core.strategic_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal TEXT NOT NULL,
  kpi TEXT NOT NULL,
  progress NUMERIC DEFAULT 0,
  responsible TEXT NOT NULL,
  deadline DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Criação da Tabela marketing_posts em CORE (ou um schema marketing se quiser)
CREATE SCHEMA IF NOT EXISTS marketing;
DO $$
BEGIN
    EXECUTE 'GRANT USAGE ON SCHEMA marketing TO anon, authenticated, service_role';
    EXECUTE 'ALTER DEFAULT PRIVILEGES IN SCHEMA marketing GRANT ALL ON TABLES TO anon, authenticated, service_role';
    EXECUTE 'ALTER DEFAULT PRIVILEGES IN SCHEMA marketing GRANT ALL ON SEQUENCES TO anon, authenticated, service_role';
    EXECUTE 'ALTER DEFAULT PRIVILEGES IN SCHEMA marketing GRANT ALL ON FUNCTIONS TO anon, authenticated, service_role';
    EXECUTE 'GRANT ALL ON ALL TABLES IN SCHEMA marketing TO anon, authenticated, service_role';
END $$;

CREATE TABLE IF NOT EXISTS marketing.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  platform TEXT NOT NULL,
  status TEXT CHECK (status IN ('Published', 'Scheduled', 'Draft')),
  scheduled_date TIMESTAMPTZ,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Criação das Tabelas partners e real_estate_services em CATALOG
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

-- Correção nas Vagas (Adicionar image e description em hr.job_vacancies)
ALTER TABLE hr.job_vacancies ADD COLUMN IF NOT EXISTS image TEXT;

