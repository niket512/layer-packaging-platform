REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
DROP POLICY "Public sees approved stores" ON public.stores;
CREATE POLICY "Public sees approved stores" ON public.stores FOR SELECT TO anon, authenticated USING (status = 'approved');