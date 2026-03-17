-- Función RPC para actualizar la pirámide de forma segura
-- (usa SECURITY DEFINER para saltarse el RLS, igual que verify_admin_login)
CREATE OR REPLACE FUNCTION public.update_pyramid(new_data jsonb)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.pyramid
  SET data = new_data, updated_at = timezone('utc', now())
  WHERE id = 1;
  
  RETURN FOUND;
END;
$$;
