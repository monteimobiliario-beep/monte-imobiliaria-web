-- 02_hr.sql
-- Módulo de Recursos Humanos

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
  vacancy_id UUID REFERENCES hr.job_vacancies(id) ON DELETE CASCADE,
  applicant_name TEXT NOT NULL,
  applicant_email TEXT NOT NULL,
  applicant_phone TEXT,
  status TEXT DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Em Análise', 'Entrevistado', 'Aceite', 'Rejeitado')),
  resume_url TEXT,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
