
-- SQL para recriar a estrutura da Monte Imobiliária no seu novo banco Supabase
-- Copie e cole este código no SQL Editor do Supabase (https://supabase.com/dashboard/project/xhtgkvwtxmhsgifpewqv/sql)

-- 1. Tabela de Imóveis
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  location TEXT NOT NULL,
  bathrooms INTEGER DEFAULT 1,
  bedrooms INTEGER DEFAULT 1,
  area NUMERIC DEFAULT 0,
  image TEXT,
  type TEXT CHECK (type IN ('Venda', 'Aluguel')),
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabela de Funcionários (Staff)
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL,
  avatar TEXT,
  permissions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabela de Pedidos de Contacto
CREATE TABLE IF NOT EXISTS contact_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  property_id UUID REFERENCES properties(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Tabela de Candidaturas de Emprego
CREATE TABLE IF NOT EXISTS job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  status TEXT DEFAULT 'Pendente',
  resume_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Tabela de Logs de Auditoria
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID,
  admin_name TEXT,
  target_user_name TEXT,
  action_type TEXT NOT NULL,
  change_details TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Tabela de Cargos e Permissões Base
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  permissions JSONB DEFAULT '[]'::jsonb,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Tabela de Transações Financeiras
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  type TEXT CHECK (type IN ('RECEITA', 'DESPESA')),
  category TEXT,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Dados Iniciais sugeridos (Opcional)
INSERT INTO roles (name, permissions) VALUES 
('Administrador', '["dashboard.view", "catalog.view", "catalog.manage", "finance.view", "finance.manage", "projects.view", "projects.manage", "hr.view", "hr.manage", "fleet.view", "fleet.manage", "plans.view", "plans.manage", "admin.access", "system.repair"]'),
('Gestor', '["dashboard.view", "catalog.view", "catalog.manage", "finance.view", "projects.view", "hr.view"]'),
('Consultor', '["dashboard.view", "catalog.view"]');
