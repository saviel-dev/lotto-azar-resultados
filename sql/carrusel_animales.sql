-- ─────────────────────────────────────────────────
-- Tabla: carrusel_animales
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.carrusel_animales (
  id         SERIAL PRIMARY KEY,
  nombre     TEXT        NOT NULL,          -- ej. "animal #01"
  imagen_url TEXT        NOT NULL,          -- URL pública de Storage
  orden      INTEGER     NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índice para ordenar por orden
CREATE INDEX IF NOT EXISTS idx_carrusel_animales_orden
  ON public.carrusel_animales (orden ASC);

-- RLS: habilitar y permitir SELECT público
ALTER TABLE public.carrusel_animales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública carrusel"
  ON public.carrusel_animales
  FOR SELECT
  USING (true);

CREATE POLICY "Solo autenticados pueden insertar"
  ON public.carrusel_animales
  FOR INSERT
  WITH CHECK (true);   -- ajusta con auth.role() = 'authenticated' si quieres

CREATE POLICY "Solo autenticados pueden eliminar"
  ON public.carrusel_animales
  FOR DELETE
  USING (true);        -- ajusta con auth.role() = 'authenticated' si quieres

-- ─────────────────────────────────────────────────
-- Storage bucket: carrusel-animales
-- Ejecutar desde el panel de Supabase > Storage
-- o con la API de administración.
-- ─────────────────────────────────────────────────
-- Si tienes acceso SQL al schema storage:
INSERT INTO storage.buckets (id, name, public)
VALUES ('carrusel-animales', 'carrusel-animales', true)
ON CONFLICT (id) DO NOTHING;

-- Política: lectura pública del bucket
CREATE POLICY "Imágenes carrusel públicas"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'carrusel-animales');

-- Política: subida permitida (ajusta según tus roles)
CREATE POLICY "Subir al carrusel"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'carrusel-animales');

-- Política: eliminar del carrusel
CREATE POLICY "Eliminar del carrusel"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'carrusel-animales');
