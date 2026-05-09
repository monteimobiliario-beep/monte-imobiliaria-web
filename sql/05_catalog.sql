-- 05_catalog.sql
-- Módulo de Imóveis e Catálogo

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
  gallery JSONB DEFAULT '[]'::jsonb, -- COLUNA CRITICAL
  amenities JSONB DEFAULT '[]'::jsonb,
  nearby JSONB DEFAULT '[]'::jsonb,
  video_url TEXT,
  map_coords JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Reparação garantida (caso a tabela já exista sem a galeria)
ALTER TABLE catalog.properties ADD COLUMN IF NOT EXISTS gallery JSONB DEFAULT '[]'::jsonb;
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
