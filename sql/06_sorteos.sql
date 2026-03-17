-- Crear tabla de resultados de sorteos
CREATE TABLE IF NOT EXISTS public.sorteos (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  animal text NOT NULL,
  numero integer NOT NULL DEFAULT 0,
  hora text NOT NULL,
  fecha date NOT NULL,
  emoji text NOT NULL DEFAULT '🐾',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT sorteos_fecha_hora_unique UNIQUE (fecha, hora)
);

-- Habilitar RLS
ALTER TABLE public.sorteos ENABLE ROW LEVEL SECURITY;

-- Lectura pública (la página principal muestra resultados)
DROP POLICY IF EXISTS "Lectura publica de sorteos" ON public.sorteos;
CREATE POLICY "Lectura publica de sorteos"
ON public.sorteos FOR SELECT
USING (true);

-- ─── RPC: Insertar nuevo sorteo ───────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.upsert_sorteo(
  p_animal text,
  p_numero integer,
  p_hora text,
  p_fecha date,
  p_emoji text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  INSERT INTO public.sorteos (animal, numero, hora, fecha, emoji)
  VALUES (p_animal, p_numero, p_hora, p_fecha, p_emoji)
  ON CONFLICT (fecha, hora) DO UPDATE
    SET animal = EXCLUDED.animal,
        numero = EXCLUDED.numero,
        emoji = EXCLUDED.emoji
  RETURNING to_json(sorteos.*) INTO result;

  RETURN result;
END;
$$;

-- ─── RPC: Actualizar sorteo existente por ID ──────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_sorteo(
  p_id bigint,
  p_animal text,
  p_numero integer,
  p_hora text,
  p_fecha date,
  p_emoji text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.sorteos
  SET animal = p_animal,
      numero = p_numero,
      hora = p_hora,
      fecha = p_fecha,
      emoji = p_emoji
  WHERE id = p_id;

  RETURN FOUND;
END;
$$;

-- ─── RPC: Eliminar sorteo por ID ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.delete_sorteo(p_id bigint)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.sorteos WHERE id = p_id;
  RETURN FOUND;
END;
$$;
