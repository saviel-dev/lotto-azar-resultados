-- Corregir politica RLS: eliminar "FOR ALL" que puede interferir con SELECT
DROP POLICY IF EXISTS "Bloquear escritura directa" ON public.pronosticos;

-- Agregar función RPC para leer pronósticos de forma segura (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.get_pronosticos()
RETURNS SETOF public.pronosticos
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY SELECT * FROM public.pronosticos ORDER BY created_at ASC;
END;
$$;
