-- =============================================
-- CRYSTALPYME — Setup inicial Supabase
-- Ejecutar en: Supabase → SQL Editor
-- =============================================

-- 1. Crear tenant principal
INSERT INTO public.tenant (nombre, descripcion, plan, activo)
VALUES ('CrystalPyme', 'Tenant principal', 'enterprise', true)
ON CONFLICT DO NOTHING;

-- 2. Trigger: auto-crear usuario en public.usuario al registrarse en Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.usuario WHERE id = NEW.id) THEN
    INSERT INTO public.usuario (id, nombre, rol, tenant_id, activo)
    SELECT NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'nombre', split_part(NEW.email, '@', 1)),
      'cliente',
      (SELECT id FROM public.tenant WHERE nombre = 'CrystalPyme' LIMIT 1),
      true;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. DESPUES de crear tu usuario en Supabase Auth (Authentication → Users),
--    copiá tu UUID y ejecutá esto para hacerlo superadmin:

-- INSERT INTO public.usuario (id, nombre, username, rol, tenant_id, activo)
-- SELECT 'PEGA-TU-UUID-AQUI'::uuid, 'Tu Nombre', 'superadmin', 'superadmin', id, true
-- FROM public.tenant WHERE nombre = 'CrystalPyme'
-- ON CONFLICT (id) DO UPDATE SET rol = 'superadmin', activo = true;
