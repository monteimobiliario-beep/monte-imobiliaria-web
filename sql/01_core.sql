-- 01_core.sql
-- Módulo Core: Cargos, Permissões e Auditoria

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

-- Inserção de Cargos Padrão
INSERT INTO core.roles (name, permissions) VALUES 
('Administrador', '["*"]'),
('Gestor RH', '["hr.view", "hr.manage", "dashboard.view"]'),
('Gestor Financeiro', '["finance.view", "finance.manage", "dashboard.view"]'),
('Agente Imobiliário', '["catalog.view", "catalog.manage", "dashboard.view"]')
ON CONFLICT (name) DO NOTHING;
