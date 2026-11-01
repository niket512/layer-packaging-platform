CREATE TABLE public.visitor_behaviour (
 id uuid PRIMARY KEY,
 write_token uuid NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 revision bigint NOT NULL DEFAULT 0,
 device text NOT NULL,
 source text NOT NULL,
 steps jsonb NOT NULL DEFAULT '{}'::jsonb,
 scroll_depth jsonb NOT NULL DEFAULT '{}'::jsonb,
 viewed_designs text[] NOT NULL DEFAULT '{}',
 opened_designs text[] NOT NULL DEFAULT '{}',
 selected_designs text[] NOT NULL DEFAULT '{}'
);
GRANT SELECT ON public.visitor_behaviour TO authenticated;
GRANT ALL ON public.visitor_behaviour TO service_role;
ALTER TABLE public.visitor_behaviour ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read visitor behaviour" ON public.visitor_behaviour FOR SELECT TO authenticated USING (public.is_admin());
CREATE INDEX visitor_behaviour_created_idx ON public.visitor_behaviour(created_at DESC);
CREATE OR REPLACE FUNCTION public.save_visitor_behaviour(_id uuid, _token uuid, _revision bigint, _snapshot jsonb) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE k text; v jsonb; a text;
BEGIN
 IF _id IS NULL OR _token IS NULL OR _revision IS NULL OR jsonb_typeof(_snapshot) IS DISTINCT FROM 'object' OR octet_length(_snapshot::text) > 100000 THEN RAISE EXCEPTION 'Invalid measurement'; END IF;
 IF _snapshot->>'device' NOT IN ('mobile','tablet','desktop') OR _snapshot->>'source' NOT IN ('direct','paid_search','organic_search','social','referral','email','other_campaign') THEN RAISE EXCEPTION 'Invalid category'; END IF;
 IF jsonb_typeof(_snapshot->'steps') IS DISTINCT FROM 'object' OR jsonb_typeof(_snapshot->'scroll_depth') IS DISTINCT FROM 'object' THEN RAISE EXCEPTION 'Invalid measurement'; END IF;
 FOR k,v IN SELECT * FROM jsonb_each(_snapshot->'steps') LOOP
 IF k NOT IN ('page_opened','first_message','questions_shown','questions_answered','questions_skipped','design_shown','design_answered','brief_shown','contact_shown','contact_submitted','request_saved') OR jsonb_typeof(v) <> 'number' OR (v::text)::numeric < 0 OR (v::text)::numeric > 9999999999999 THEN RAISE EXCEPTION 'Invalid step'; END IF;
 END LOOP;
 FOR k,v IN SELECT * FROM jsonb_each(_snapshot->'scroll_depth') LOOP
 IF k NOT IN ('/','/sourcing','/designs','/designs/flexible-pouches') OR jsonb_typeof(v) <> 'number' OR (v::text)::numeric < 0 OR (v::text)::numeric > 100 THEN RAISE EXCEPTION 'Invalid depth'; END IF;
 END LOOP;
 FOREACH a IN ARRAY ARRAY['viewed_designs','opened_designs','selected_designs'] LOOP
 IF jsonb_typeof(_snapshot->a) IS DISTINCT FROM 'array' OR jsonb_array_length(_snapshot->a) > 1000 THEN RAISE EXCEPTION 'Invalid catalogue count'; END IF;
 FOR v IN SELECT value FROM jsonb_array_elements(_snapshot->a) LOOP
 IF jsonb_typeof(v) <> 'string' OR length(v #>> '{}') > 100 OR (v #>> '{}') !~ '^[a-zA-Z0-9_-]+$' THEN RAISE EXCEPTION 'Invalid catalogue reference'; END IF;
 END LOOP;
 END LOOP;
 INSERT INTO public.visitor_behaviour(id,write_token,revision,device,source,steps,scroll_depth,viewed_designs,opened_designs,selected_designs)
 VALUES (_id,_token,_revision,_snapshot->>'device',_snapshot->>'source',_snapshot->'steps',_snapshot->'scroll_depth',ARRAY(SELECT jsonb_array_elements_text(_snapshot->'viewed_designs')),ARRAY(SELECT jsonb_array_elements_text(_snapshot->'opened_designs')),ARRAY(SELECT jsonb_array_elements_text(_snapshot->'selected_designs')))
 ON CONFLICT (id) DO UPDATE SET revision=excluded.revision,updated_at=now(),steps=excluded.steps,scroll_depth=excluded.scroll_depth,viewed_designs=excluded.viewed_designs,opened_designs=excluded.opened_designs,selected_designs=excluded.selected_designs
 WHERE visitor_behaviour.write_token = _token AND visitor_behaviour.revision < _revision;
END;
$$;
REVOKE ALL ON FUNCTION public.save_visitor_behaviour(uuid,uuid,bigint,jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.save_visitor_behaviour(uuid,uuid,bigint,jsonb) TO anon,authenticated;
CREATE OR REPLACE FUNCTION public.visitor_behaviour_report(_days integer DEFAULT 7) RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE result jsonb;
BEGIN
 IF NOT public.is_admin() THEN RAISE EXCEPTION 'Administrator access required'; END IF;
 IF _days NOT IN (7,30,90) THEN RAISE EXCEPTION 'Invalid period'; END IF;
 SELECT jsonb_build_object('sessions',coalesce(jsonb_agg(jsonb_build_object('id',id,'created_at',created_at,'updated_at',updated_at,'device',device,'source',source,'steps',steps,'scroll_depth',scroll_depth,'viewed',cardinality(viewed_designs),'opened',cardinality(opened_designs),'selected',cardinality(selected_designs)) ORDER BY created_at DESC),'[]'::jsonb)) INTO result FROM public.visitor_behaviour WHERE created_at >= now()-make_interval(days=>_days);
 RETURN result;
END;
$$;
REVOKE ALL ON FUNCTION public.visitor_behaviour_report(integer) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.visitor_behaviour_report(integer) TO authenticated;