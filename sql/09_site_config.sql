-- Tabla de configuración general del sitio
-- Ejecutar en Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.site_config (
  key   text PRIMARY KEY,
  value text NOT NULL DEFAULT '',
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Valores iniciales
INSERT INTO public.site_config (key, value)
VALUES
  ('hero_banner_url',    '/images/banner.png'),
  ('hero_particle_theme', 'loteria')
ON CONFLICT (key) DO NOTHING;

-- Habilitar RLS
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

-- Lectura pública (el sitio necesita leer la config en cada visita)
DROP POLICY IF EXISTS "Lectura publica de site_config" ON public.site_config;
CREATE POLICY "Lectura publica de site_config"
ON public.site_config FOR SELECT
USING (true);

-- Escritura permitida (admin usa sessionStorage auth, igual que bet_config)
DROP POLICY IF EXISTS "Admin puede escribir site_config" ON public.site_config;
CREATE POLICY "Admin puede escribir site_config"
ON public.site_config FOR ALL
USING (true)
WITH CHECK (true);
