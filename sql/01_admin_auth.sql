-- Habilitar extensión pgcrypto para hash de contraseñas
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Crear tabla de administradores
CREATE TABLE IF NOT EXISTS public.admins (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insertar usuario admin con contraseña encriptada
INSERT INTO public.admins (email, password_hash)
VALUES (
  'whpj6436@gmail.com',
  crypt('azar1234', gen_salt('bf'))
)
ON CONFLICT (email) DO NOTHING;

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Denegar todo acceso directo a la tabla desde el frontend a través de la API anónima
DROP POLICY IF EXISTS "Denegar todo el acceso a usuarios anónimos o no autenticados" ON public.admins;
CREATE POLICY "Denegar todo el acceso a usuarios anónimos o no autenticados" 
ON public.admins FOR ALL
USING (false);

-- Crear función RPC para validar login de forma segura
CREATE OR REPLACE FUNCTION public.verify_admin_login(admin_email text, admin_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_valid boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM public.admins
    WHERE email = admin_email
    AND password_hash = crypt(admin_password, password_hash)
  ) INTO is_valid;
  
  RETURN coalesce(is_valid, false);
END;
$$;
