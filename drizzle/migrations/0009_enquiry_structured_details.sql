ALTER TABLE public.requirement_submissions ADD COLUMN IF NOT EXISTS details jsonb;
COMMENT ON COLUMN public.requirement_submissions.details IS 'Structured enquiry answers (form variant, box types, products, quantity band, finishes, timeline, contact name/brand/email).';
DROP POLICY IF EXISTS "Anyone can submit requirements" ON public.requirement_submissions;
CREATE POLICY "Anyone can submit requirements" ON public.requirement_submissions
FOR INSERT TO anon, authenticated
WITH CHECK (
  length(trim(contact)) > 0 AND length(contact) <= 255
  AND length(trim(requirement)) > 0 AND length(requirement) <= 10000
  AND coalesce(array_length(images, 1), 0) <= 10
  AND jsonb_typeof(manufacturers) = 'array' AND jsonb_array_length(manufacturers) <= 50
  AND (attribution IS NULL OR (jsonb_typeof(attribution) = 'object' AND octet_length(attribution::text) <= 4000))
  AND (details IS NULL OR (jsonb_typeof(details) = 'object' AND octet_length(details::text) <= 6000))
);