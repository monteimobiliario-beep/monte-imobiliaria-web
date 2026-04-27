
-- SQL para base de dados robusta da Monte Hub v15.0
-- Copie e cole este código no SQL Editor do Supabase

-- 1. Tabela de Imóveis (Extensão de Catálogo)
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL CHECK (price >= 0),
  location TEXT NOT NULL,
  bathrooms INTEGER DEFAULT 1,
  bedrooms INTEGER DEFAULT 1,
  area NUMERIC DEFAULT 0,
  image TEXT,
  gallery TEXT[] DEFAULT '{}',
  type TEXT CHECK (type IN ('Casa', 'Apartamento', 'Guest House', 'Hotel', 'Condomínio', 'Terreno')),
  deal_type TEXT CHECK (deal_type IN ('Venda', 'Aluguel')),
  status TEXT DEFAULT 'Disponível' CHECK (status IN ('Disponível', 'Reservado', 'Vendido', 'Arrendado')),
  featured BOOLEAN DEFAULT false,
  amenities TEXT[] DEFAULT '{}',
  video_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabela de Beneficiários e Fornecedores
CREATE TABLE IF NOT EXISTS beneficiaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'Funcionário', 'Fornecedor', 'Parceiro', 'Outro'
  phone TEXT,
  email TEXT,
  nuit TEXT,
  bank_account TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabela de Funcionários (Staff & RH)
CREATE TABLE IF NOT EXISTS employees (
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
  niss TEXT,
  address TEXT,
  permissions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Tabela de Projetos (Engenharia & Obras)
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'Planejado' CHECK (status IN ('Planejado', 'Em Andamento', 'Concluído')),
  budget NUMERIC DEFAULT 0,
  spent NUMERIC DEFAULT 0,
  deadline DATE,
  team UUID[] DEFAULT '{}', -- Array de IDs de funcionários
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Tabela de Transações Financeiras (Contabilidade)
CREATE TABLE IF NOT EXISTS transactions (
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
  beneficiary_id UUID REFERENCES beneficiaries(id),
  project_id UUID REFERENCES projects(id),
  receipt_url TEXT,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_period TEXT CHECK (recurrence_period IN ('Mensal', 'Anual', 'Semanal')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Tabela de Gestão de Frota (Veículos)
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  plate TEXT UNIQUE NOT NULL,
  year INTEGER,
  type TEXT,
  status TEXT DEFAULT 'Disponível' CHECK (status IN ('Disponível', 'Em Serviço', 'Manutenção', 'Lavagem')),
  current_driver UUID REFERENCES employees(id),
  last_maintenance DATE,
  fuel_level INTEGER DEFAULT 100,
  odometer NUMERIC DEFAULT 0,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Plano Estratégico (Metas Corporativas)
CREATE TABLE IF NOT EXISTS strategic_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal TEXT NOT NULL,
  kpi TEXT,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  responsible UUID REFERENCES employees(id),
  deadline DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Tabela de Contactos e Leads
CREATE TABLE IF NOT EXISTS contact_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  property_id UUID REFERENCES properties(id),
  status TEXT DEFAULT 'Novo' CHECK (status IN ('Novo', 'Em Contacto', 'Fechado', 'Perdido')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Tabela de Candidaturas e Vagas (Recrutamento)
CREATE TABLE IF NOT EXISTS job_vacancies (
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

CREATE TABLE IF NOT EXISTS job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vacancy_id UUID REFERENCES job_vacancies(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  status TEXT DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Aprovado', 'Rejeitado')),
  resume_url TEXT,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. Tabela de Logs de Auditoria
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID,
  admin_name TEXT,
  target_user_name TEXT,
  action_type TEXT NOT NULL,
  change_details TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 11. Tabela de Cargos e Permissões Base
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  permissions JSONB DEFAULT '[]'::jsonb,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Dados Iniciais sugeridos
INSERT INTO roles (name, permissions) VALUES 
('Administrador', '["dashboard.view", "catalog.view", "catalog.manage", "finance.view", "finance.manage", "projects.view", "projects.manage", "hr.view", "hr.manage", "fleet.view", "fleet.manage", "plans.view", "plans.manage", "admin.access", "system.repair"]'),
('Gestor', '["dashboard.view", "catalog.view", "catalog.manage", "finance.view", "projects.view", "hr.view"]'),
('Consultor', '["dashboard.view", "catalog.view"]');
