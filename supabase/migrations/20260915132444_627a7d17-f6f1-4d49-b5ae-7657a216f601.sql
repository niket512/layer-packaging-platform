CREATE TABLE public.shortlist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand text NOT NULL,
  item_id text NOT NULL,
  kind text NOT NULL DEFAULT 'bottle',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (brand, item_id)
);

GRANT SELECT, INSERT, DELETE ON public.shortlist_items TO anon, authenticated;
GRANT ALL ON public.shortlist_items TO service_role;

ALTER TABLE public.shortlist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shortlist readable by brand key" ON public.shortlist_items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can add shortlist items" ON public.shortlist_items FOR INSERT TO anon, authenticated WITH CHECK (length(trim(brand)) > 0 AND length(brand) <= 100 AND length(trim(item_id)) > 0 AND length(item_id) <= 100 AND kind IN ('bottle','sachet'));
CREATE POLICY "Anyone can remove shortlist items" ON public.shortlist_items FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX shortlist_items_brand_idx ON public.shortlist_items (brand);