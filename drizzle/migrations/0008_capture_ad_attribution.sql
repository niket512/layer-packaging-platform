ALTER TABLE public.requirement_submissions ADD COLUMN IF NOT EXISTS attribution jsonb;
ALTER TABLE public.visitor_behaviour ADD COLUMN IF NOT EXISTS attribution jsonb;
DROP POLICY IF EXISTS "Anyone can submit requirements" ON public.requirement_submissions;
CREATE POLICY "Anyone can submit requirements" ON public.requirement_submissions
FOR INSERT TO anon, authenticated
WITH CHECK (
  length(trim(contact)) > 0 AND length(contact) <= 255
  AND length(trim(requirement)) > 0 AND length(requirement) <= 10000
  AND coalesce(array_length(images, 1), 0) <= 10
  AND jsonb_typeof(manufacturers) = 'array' AND jsonb_array_length(manufacturers) <= 50
  AND (attribution IS NULL OR (jsonb_typeof(attribution) = 'object' AND octet_length(attribution::text) <= 4000))
);
CREATE OR REPLACE FUNCTION public.save_visitor_attribution(_id uuid, _token uuid, _attribution jsonb) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF jsonb_typeof(_attribution) IS DISTINCT FROM 'object' OR octet_length(_attribution::text) > 4000 THEN RAISE EXCEPTION 'Invalid attribution'; END IF;
 UPDATE public.visitor_behaviour SET attribution = _attribution WHERE id = _id AND write_token = _token AND attribution IS NULL;
END; $$;
REVOKE ALL ON FUNCTION public.save_visitor_attribution(uuid,uuid,jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.save_visitor_attribution(uuid,uuid,jsonb) TO anon, authenticated;