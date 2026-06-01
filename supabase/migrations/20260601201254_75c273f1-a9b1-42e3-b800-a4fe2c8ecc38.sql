
CREATE TABLE public.access_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand TEXT NOT NULL,
  email TEXT NOT NULL,
  requirement TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT INSERT ON public.access_requests TO anon, authenticated;
GRANT ALL ON public.access_requests TO service_role;

ALTER TABLE public.access_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit access requests"
  ON public.access_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(trim(brand)) > 0 AND length(brand) <= 100
    AND length(trim(email)) > 0 AND length(email) <= 255
    AND length(trim(requirement)) > 0 AND length(requirement) <= 1000
  );
