-- Tabla de configuración de apuestas
-- Ejecutar en Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.bet_config (
  id integer PRIMARY KEY DEFAULT 1,
  monto_minimo numeric NOT NULL DEFAULT 1,
  monto_maximo numeric NOT NULL DEFAULT 10000,
  multiplicador_normal numeric NOT NULL DEFAULT 70,
  multiplicador_comodin numeric NOT NULL DEFAULT 140,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT bet_config_single_row CHECK (id = 1)
);

-- Insertar fila inicial con valores por defecto
INSERT INTO public.bet_config (id, monto_minimo, monto_maximo, multiplicador_normal, multiplicador_comodin)
VALUES (1, 1, 10000, 70, 140)
ON CONFLICT (id) DO NOTHING;

-- Habilitar RLS
ALTER TABLE public.bet_config ENABLE ROW LEVEL SECURITY;

-- Lectura pública (el sitio público necesita leer la config)
DROP POLICY IF EXISTS "Lectura publica de bet_config" ON public.bet_config;
CREATE POLICY "Lectura publica de bet_config"
ON public.bet_config FOR SELECT
USING (true);

-- Solo administradores pueden escribir (via service_role desde el admin)
-- La escritura del admin usa .upsert() con la clave service role o rpc si se necesita
-- Por ahora permitimos inserción anónima para el panel de admin autenticado por sessionStorage
-- (ajustar si se requiere auth real de Supabase)
DROP POLICY IF EXISTS "Admin puede escribir bet_config" ON public.bet_config;
CREATE POLICY "Admin puede escribir bet_config"
ON public.bet_config FOR ALL
USING (true)
WITH CHECK (true);
