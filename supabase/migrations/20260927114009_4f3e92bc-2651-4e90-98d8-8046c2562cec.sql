CREATE TYPE public.app_role AS ENUM ('founder', 'supplier');

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  display_name text,
  company text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own profile read" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "Own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "Own profile update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- roles
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT, INSERT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own roles read" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
-- a user may pick one role for themselves once (founder or supplier; no admin role exists)
CREATE POLICY "Pick own role once" ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND NOT EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid()));

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- suppliers (founder's directory)
CREATE TABLE public.suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid(),
  name text NOT NULL,
  category text,
  location text,
  contact_name text,
  email text,
  phone text,
  rating int,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.suppliers TO authenticated;
GRANT ALL ON public.suppliers TO service_role;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER suppliers_updated BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.is_supplier_contact(_supplier_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.suppliers s
    WHERE s.id = _supplier_id AND s.email IS NOT NULL
      AND lower(s.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      AND public.has_role(auth.uid(), 'supplier'))
$$;

CREATE POLICY "Founder manages own suppliers" ON public.suppliers FOR ALL TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid() AND public.has_role(auth.uid(), 'founder'));
CREATE POLICY "Supplier sees own listing" ON public.suppliers FOR SELECT TO authenticated
  USING (public.is_supplier_contact(id));

-- rfqs
CREATE TABLE public.rfqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid(),
  title text NOT NULL,
  category text,
  description text,
  specs text,
  quantity numeric,
  unit text DEFAULT 'units',
  target_price numeric,
  due_date date,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rfqs TO authenticated;
GRANT ALL ON public.rfqs TO service_role;
ALTER TABLE public.rfqs ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER rfqs_updated BEFORE UPDATE ON public.rfqs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.rfq_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_id uuid NOT NULL REFERENCES public.rfqs(id) ON DELETE CASCADE,
  supplier_id uuid NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (rfq_id, supplier_id)
);
GRANT SELECT, INSERT, DELETE ON public.rfq_invites TO authenticated;
GRANT ALL ON public.rfq_invites TO service_role;
ALTER TABLE public.rfq_invites ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.owns_rfq(_rfq_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.rfqs WHERE id = _rfq_id AND owner_id = auth.uid())
$$;
CREATE OR REPLACE FUNCTION public.invited_to_rfq(_rfq_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.rfq_invites i WHERE i.rfq_id = _rfq_id AND public.is_supplier_contact(i.supplier_id))
$$;

CREATE POLICY "Founder manages own rfqs" ON public.rfqs FOR ALL TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid() AND public.has_role(auth.uid(), 'founder'));
CREATE POLICY "Invited supplier reads rfq" ON public.rfqs FOR SELECT TO authenticated USING (public.invited_to_rfq(id));

CREATE POLICY "Founder manages invites" ON public.rfq_invites FOR ALL TO authenticated
  USING (public.owns_rfq(rfq_id))
  WITH CHECK (public.owns_rfq(rfq_id) AND EXISTS (SELECT 1 FROM public.suppliers s WHERE s.id = supplier_id AND s.owner_id = auth.uid()));
CREATE POLICY "Supplier reads own invites" ON public.rfq_invites FOR SELECT TO authenticated USING (public.is_supplier_contact(supplier_id));

-- quotes
CREATE TABLE public.quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_id uuid NOT NULL REFERENCES public.rfqs(id) ON DELETE CASCADE,
  supplier_id uuid NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  submitted_by uuid DEFAULT auth.uid(),
  unit_price numeric NOT NULL,
  moq numeric,
  lead_time_days int,
  terms text,
  notes text,
  status text NOT NULL DEFAULT 'submitted',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (rfq_id, supplier_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quotes TO authenticated;
GRANT ALL ON public.quotes TO service_role;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER quotes_updated BEFORE UPDATE ON public.quotes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "Founder manages quotes on own rfqs" ON public.quotes FOR ALL TO authenticated
  USING (public.owns_rfq(rfq_id)) WITH CHECK (public.owns_rfq(rfq_id));
CREATE POLICY "Supplier reads own quotes" ON public.quotes FOR SELECT TO authenticated USING (public.is_supplier_contact(supplier_id));
CREATE POLICY "Supplier submits quote" ON public.quotes FOR INSERT TO authenticated
  WITH CHECK (public.is_supplier_contact(supplier_id) AND status = 'submitted'
    AND EXISTS (SELECT 1 FROM public.rfq_invites i WHERE i.rfq_id = quotes.rfq_id AND i.supplier_id = quotes.supplier_id));
CREATE POLICY "Supplier revises quote" ON public.quotes FOR UPDATE TO authenticated
  USING (public.is_supplier_contact(supplier_id) AND status = 'submitted')
  WITH CHECK (public.is_supplier_contact(supplier_id) AND status = 'submitted');

-- purchase orders
CREATE TABLE public.purchase_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid(),
  rfq_id uuid REFERENCES public.rfqs(id) ON DELETE SET NULL,
  quote_id uuid REFERENCES public.quotes(id) ON DELETE SET NULL,
  supplier_id uuid NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  po_number text NOT NULL,
  title text NOT NULL,
  quantity numeric,
  unit_price numeric,
  total numeric,
  status text NOT NULL DEFAULT 'draft',
  expected_ship_date date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.purchase_orders TO authenticated;
GRANT ALL ON public.purchase_orders TO service_role;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER po_updated BEFORE UPDATE ON public.purchase_orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "Founder manages own POs" ON public.purchase_orders FOR ALL TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid() AND public.has_role(auth.uid(), 'founder'));
CREATE POLICY "Supplier reads sent POs" ON public.purchase_orders FOR SELECT TO authenticated
  USING (status <> 'draft' AND public.is_supplier_contact(supplier_id));

CREATE OR REPLACE FUNCTION public.can_access_po(_po_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.purchase_orders p WHERE p.id = _po_id
    AND (p.owner_id = auth.uid() OR (p.status <> 'draft' AND public.is_supplier_contact(p.supplier_id))))
$$;

-- supplier status change goes through a checked function (only allowed forward statuses)
CREATE OR REPLACE FUNCTION public.supplier_update_po(_po_id uuid, _status text, _note text, _ship date)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE p public.purchase_orders;
BEGIN
  SELECT * INTO p FROM public.purchase_orders WHERE id = _po_id;
  IF p.id IS NULL OR p.status = 'draft' OR NOT public.is_supplier_contact(p.supplier_id) THEN
    RAISE EXCEPTION 'Not allowed';
  END IF;
  IF _status NOT IN ('accepted','in_production','shipped','delivered') THEN
    RAISE EXCEPTION 'Invalid status';
  END IF;
  UPDATE public.purchase_orders SET status = _status, expected_ship_date = coalesce(_ship, expected_ship_date) WHERE id = _po_id;
  INSERT INTO public.po_updates (po_id, author_id, status, note) VALUES (_po_id, auth.uid(), _status, left(coalesce(_note,''), 1000));
END; $$;

CREATE TABLE public.po_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  po_id uuid NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  author_id uuid DEFAULT auth.uid(),
  status text,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.po_updates TO authenticated;
GRANT ALL ON public.po_updates TO service_role;
ALTER TABLE public.po_updates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read updates of accessible POs" ON public.po_updates FOR SELECT TO authenticated USING (public.can_access_po(po_id));
CREATE POLICY "Post updates on accessible POs" ON public.po_updates FOR INSERT TO authenticated
  WITH CHECK (author_id = auth.uid() AND public.can_access_po(po_id));

GRANT EXECUTE ON FUNCTION public.supplier_update_po(uuid, text, text, date) TO authenticated;