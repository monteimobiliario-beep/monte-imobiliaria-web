-- 03_finance.sql
-- Módulo Financeiro e de Projetos

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
