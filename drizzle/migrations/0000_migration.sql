CREATE TABLE public.requirement_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact text NOT NULL CHECK (char_length(contact) BETWEEN 3 AND 200),
  requirement text NOT NULL CHECK (char_length(requirement) BETWEEN 5 AND 4000),
  images text[] NOT NULL DEFAULT '{}' CHECK (cardinality(images) <= 4),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.requirement_submissions TO anon, authenticated;
GRANT ALL ON public.requirement_submissions TO service_role;
ALTER TABLE public.requirement_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit requirements" ON public.requirement_submissions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins read requirements" ON public.requirement_submissions FOR SELECT TO authenticated USING (public.is_admin());