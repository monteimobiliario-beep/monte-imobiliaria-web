-- 04_fleet.sql
-- Módulo de Frotas e Logística

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

-- Logs de Movimentação (Opcional para futuro)
CREATE TABLE IF NOT EXISTS fleet.vehicle_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES fleet.vehicles(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES hr.employees(id),
  action TEXT NOT NULL,
  km_start NUMERIC,
  km_end NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now()
);
