DROP POLICY IF EXISTS "Anyone can remove shortlist items" ON public.shortlist_items;
DROP POLICY IF EXISTS "Shortlist readable by brand key" ON public.shortlist_items;
DROP POLICY IF EXISTS "Anyone can submit requirements" ON public.requirement_submissions;
CREATE POLICY "Anyone can submit requirements" ON public.requirement_submissions
FOR INSERT TO anon, authenticated
WITH CHECK (
  length(trim(contact)) > 0 AND length(contact) <= 255
  AND length(trim(requirement)) > 0 AND length(requirement) <= 10000
  AND coalesce(array_length(images, 1), 0) <= 10
  AND jsonb_typeof(manufacturers) = 'array' AND jsonb_array_length(manufacturers) <= 50
);