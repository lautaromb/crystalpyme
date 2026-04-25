-- =============================================
-- CrystalPyme — Detalle de venta + ajustes
-- Correr en Supabase SQL Editor
-- =============================================

-- DETALLEVENTA -----------------------------------
CREATE TABLE IF NOT EXISTS public.detalleventa (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venta_id uuid NOT NULL REFERENCES public.venta(id) ON DELETE CASCADE,
  articulo_id uuid REFERENCES public.articulo(id) ON DELETE SET NULL,
  nombre text NOT NULL,
  precio numeric NOT NULL,
  cantidad integer NOT NULL DEFAULT 1 CHECK (cantidad > 0),
  subtotal numeric NOT NULL
);

CREATE INDEX IF NOT EXISTS detalleventa_venta_idx ON public.detalleventa(venta_id);
CREATE INDEX IF NOT EXISTS detalleventa_articulo_idx ON public.detalleventa(articulo_id);

ALTER TABLE public.detalleventa ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth all detalleventa" ON public.detalleventa;
CREATE POLICY "auth all detalleventa" ON public.detalleventa
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Decrementa stock del articulo cuando se agrega un detalle de venta
CREATE OR REPLACE FUNCTION public.detalleventa_decr_stock()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.articulo_id IS NOT NULL THEN
    UPDATE public.articulo
       SET stock = COALESCE(stock, 0) - NEW.cantidad,
           updated_at = NOW()
     WHERE id = NEW.articulo_id;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_detalleventa_decr_stock ON public.detalleventa;
CREATE TRIGGER trg_detalleventa_decr_stock
  AFTER INSERT ON public.detalleventa
  FOR EACH ROW EXECUTE FUNCTION public.detalleventa_decr_stock();

-- Re-incrementa stock si se elimina un detalle
CREATE OR REPLACE FUNCTION public.detalleventa_incr_stock()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.articulo_id IS NOT NULL THEN
    UPDATE public.articulo
       SET stock = COALESCE(stock, 0) + OLD.cantidad,
           updated_at = NOW()
     WHERE id = OLD.articulo_id;
  END IF;
  RETURN OLD;
END $$;

DROP TRIGGER IF EXISTS trg_detalleventa_incr_stock ON public.detalleventa;
CREATE TRIGGER trg_detalleventa_incr_stock
  AFTER DELETE ON public.detalleventa
  FOR EACH ROW EXECUTE FUNCTION public.detalleventa_incr_stock();

-- CAMPANIA (Marketing) ---------------------------
CREATE TABLE IF NOT EXISTS public.campania (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  negocio_id uuid NOT NULL REFERENCES public.negocio(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  canal text NOT NULL CHECK (canal IN ('email','whatsapp','sms','redes','otro')),
  estado text NOT NULL DEFAULT 'borrador'
    CHECK (estado IN ('borrador','activa','pausada','finalizada')),
  alcance integer NOT NULL DEFAULT 0,
  conversiones integer NOT NULL DEFAULT 0,
  notas text,
  fecha_inicio timestamptz,
  fecha_fin timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS campania_negocio_idx ON public.campania(negocio_id, created_at DESC);

ALTER TABLE public.campania ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth all campania" ON public.campania;
CREATE POLICY "auth all campania" ON public.campania
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP TRIGGER IF EXISTS trg_campania_updated ON public.campania;
CREATE TRIGGER trg_campania_updated BEFORE UPDATE ON public.campania
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
