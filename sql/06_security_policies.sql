-- 06_security_policies.sql
-- Rode este para libertar o acesso às tabelas

-- 1. Ativar RLS em todas as tabelas
ALTER TABLE catalog.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog.contact_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr.job_vacancies ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance.beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE fleet.vehicles ENABLE ROW LEVEL SECURITY;

-- 2. Criar Políticas de Acesso (Exemplo Permissivo para Desenvolvimento)
-- NOTA: Em produção, você deve restringir 'insert/update' apenas a 'authenticated'

-- Políticas para CATALOG (Imóveis)
CREATE POLICY "Permitir leitura pública de imóveis" ON catalog.properties FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de imóveis" ON catalog.properties FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de imóveis" ON catalog.properties FOR UPDATE USING (true);
CREATE POLICY "Permitir delete de imóveis" ON catalog.properties FOR DELETE USING (true);

-- Políticas para HR (Funcionários)
CREATE POLICY "Acesso total HR" ON hr.employees FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total Vagas" ON hr.job_vacancies FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total Candidaturas" ON hr.job_applications FOR ALL USING (true) WITH CHECK (true);

-- Políticas para FINANCE
CREATE POLICY "Acesso total Financeiro" ON finance.transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total Projetos" ON finance.projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total Beneficiários" ON finance.beneficiaries FOR ALL USING (true) WITH CHECK (true);

-- Políticas para FLEET
CREATE POLICY "Acesso total Frota" ON fleet.vehicles FOR ALL USING (true) WITH CHECK (true);

-- Políticas para CONTACT REQUESTS
CREATE POLICY "Permitir envio de contactos" ON catalog.contact_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir leitura de contactos" ON catalog.contact_requests FOR SELECT USING (true);
