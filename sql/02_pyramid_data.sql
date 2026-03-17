-- Crear tabla de pirámide
CREATE TABLE IF NOT EXISTS public.pyramid (
  id integer PRIMARY KEY DEFAULT 1,
  data jsonb NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT pyramid_id_check CHECK (id = 1) -- Asegura que solo exista la fila con ID 1
);

-- Insertar datos iniciales (mockData)
INSERT INTO public.pyramid (id, data)
VALUES (
  1,
  '[
    [0, 8, 0, 3, 2, 0, 2, 6],
    [8, 8, 3, 5, 2, 2, 8],
    [6, 1, 8, 7, 4, 0],
    [7, 9, 5, 1, 4],
    [6, 4, 6, 5],
    [0, 0, 1],
    [0, 1],
    [1]
  ]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.pyramid ENABLE ROW LEVEL SECURITY;

-- Permitir lectura pública de la pirámide (cualquiera puede verla en la página principal)
DROP POLICY IF EXISTS "Permitir lectura publica de la piramide" ON public.pyramid;
CREATE POLICY "Permitir lectura publica de la piramide"
ON public.pyramid FOR SELECT
USING (true);

-- Permitir que solo usuarios autenticados puedan actualizar la pirámide
DROP POLICY IF EXISTS "Permitir actualizacion solo a administradores" ON public.pyramid;
CREATE POLICY "Permitir actualizacion solo a administradores"
ON public.pyramid FOR UPDATE
USING (auth.role() = 'authenticated');
