ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'manufacturer';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'admin';

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role::text = 'admin')
$$;

DROP POLICY IF EXISTS "Pick own role once" ON public.user_roles;
CREATE POLICY "Pick own role once" ON public.user_roles FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid() AND role::text <> 'admin'
  AND NOT EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid()));

CREATE TABLE public.stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL UNIQUE DEFAULT auth.uid(),
  name text NOT NULL,
  location text,
  description text,
  categories text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.stores TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stores TO authenticated;
GRANT ALL ON public.stores TO service_role;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public sees approved stores" ON public.stores FOR SELECT TO anon, authenticated USING (status = 'approved');
CREATE POLICY "Owner reads own store" ON public.stores FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Owner creates store" ON public.stores FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid() AND status = 'pending');
CREATE POLICY "Owner edits store" ON public.stores FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid() AND status = 'pending');
CREATE POLICY "Admin manages stores" ON public.stores FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER stores_updated BEFORE UPDATE ON public.stores FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.catalogue_uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL DEFAULT auth.uid(),
  file_path text NOT NULL,
  file_name text NOT NULL,
  status text NOT NULL DEFAULT 'uploaded' CHECK (status IN ('uploaded','processing','done','failed')),
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.catalogue_uploads TO authenticated;
GRANT ALL ON public.catalogue_uploads TO service_role;
ALTER TABLE public.catalogue_uploads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner manages uploads" ON public.catalogue_uploads FOR ALL TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid() AND EXISTS (SELECT 1 FROM public.stores s WHERE s.id = store_id AND s.owner_id = auth.uid()));
CREATE POLICY "Admin reads uploads" ON public.catalogue_uploads FOR SELECT TO authenticated USING (public.is_admin());

CREATE TABLE public.market_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL DEFAULT auth.uid(),
  upload_id uuid REFERENCES public.catalogue_uploads(id) ON DELETE SET NULL,
  name text NOT NULL,
  category text,
  material text,
  capacity text,
  dimensions text,
  moq text,
  description text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','pending','approved','rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.market_products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.market_products TO authenticated;
GRANT ALL ON public.market_products TO service_role;
ALTER TABLE public.market_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public sees approved products" ON public.market_products FOR SELECT TO anon, authenticated
  USING (status = 'approved' AND EXISTS (SELECT 1 FROM public.stores s WHERE s.id = store_id AND s.status = 'approved'));
CREATE POLICY "Owner reads products" ON public.market_products FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Owner adds products" ON public.market_products FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid() AND status IN ('draft','pending') AND EXISTS (SELECT 1 FROM public.stores s WHERE s.id = store_id AND s.owner_id = auth.uid()));
CREATE POLICY "Owner edits products" ON public.market_products FOR UPDATE TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid() AND status IN ('draft','pending'));
CREATE POLICY "Owner deletes products" ON public.market_products FOR DELETE TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Admin manages products" ON public.market_products FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER market_products_updated BEFORE UPDATE ON public.market_products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Manufacturers upload own pdfs" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'catalogue-pdfs' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Manufacturers read own pdfs" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'catalogue-pdfs' AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_admin()));
CREATE POLICY "Manufacturers delete own pdfs" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'catalogue-pdfs' AND (storage.foldername(name))[1] = auth.uid()::text);