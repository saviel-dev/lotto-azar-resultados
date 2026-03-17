-- Crear tabla de pronósticos
CREATE TABLE IF NOT EXISTS public.pronosticos (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  hora text NOT NULL,
  loteria text NOT NULL,
  animal text NOT NULL,
  numero integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT pronosticos_hora_unique UNIQUE (hora)
);

-- Habilitar RLS
ALTER TABLE public.pronosticos ENABLE ROW LEVEL SECURITY;

-- Lectura pública (cualquier visitante puede ver los pronósticos)
DROP POLICY IF EXISTS "Lectura publica de pronosticos" ON public.pronosticos;
CREATE POLICY "Lectura publica de pronosticos"
ON public.pronosticos FOR SELECT
USING (true);

-- Escritura bloqueada (solo por RPC con SECURITY DEFINER)
DROP POLICY IF EXISTS "Bloquear escritura directa" ON public.pronosticos;
CREATE POLICY "Bloquear escritura directa"
ON public.pronosticos FOR ALL
USING (false);

-- ─── RPC: Insertar o actualizar pronóstico por hora ───────────────────────────
CREATE OR REPLACE FUNCTION public.upsert_pronostico(
  p_hora text,
  p_loteria text,
  p_animal text,
  p_numero integer
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  INSERT INTO public.pronosticos (hora, loteria, animal, numero)
  VALUES (p_hora, p_loteria, p_animal, p_numero)
  ON CONFLICT (hora) DO UPDATE
    SET loteria = EXCLUDED.loteria,
        animal = EXCLUDED.animal,
        numero = EXCLUDED.numero
  RETURNING to_json(pronosticos.*) INTO result;

  RETURN result;
END;
$$;

-- ─── RPC: Eliminar pronóstico por ID ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.delete_pronostico(p_id bigint)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.pronosticos WHERE id = p_id;
  RETURN FOUND;
END;
$$;
