ALTER TABLE public.requirement_submissions ADD COLUMN landing_version text CHECK (landing_version IS NULL OR landing_version IN ('a','b'));
ALTER TABLE public.visitor_behaviour ADD COLUMN landing_version text CHECK (landing_version IS NULL OR landing_version IN ('a','b')),
  ADD COLUMN internal boolean NOT NULL DEFAULT false,
  ADD COLUMN lp_events jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN perf jsonb;

CREATE OR REPLACE FUNCTION public.save_lp_behaviour(_id uuid, _token uuid, _revision bigint, _snapshot jsonb)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE k text; v jsonb; e jsonb;
BEGIN
 IF _id IS NULL OR _token IS NULL OR _revision IS NULL OR jsonb_typeof(_snapshot) IS DISTINCT FROM 'object' OR octet_length(_snapshot::text) > 300000 THEN RAISE EXCEPTION 'Invalid measurement'; END IF;
 IF coalesce(_snapshot->>'version','') NOT IN ('a','b') THEN RAISE EXCEPTION 'Invalid version'; END IF;
 IF coalesce(_snapshot->>'device','') NOT IN ('mobile','tablet','desktop') OR coalesce(_snapshot->>'source','') NOT IN ('direct','paid_search','organic_search','social','referral','email','other_campaign') THEN RAISE EXCEPTION 'Invalid category'; END IF;
 IF jsonb_typeof(_snapshot->'internal') IS DISTINCT FROM 'boolean' THEN RAISE EXCEPTION 'Invalid flag'; END IF;
 IF jsonb_typeof(_snapshot->'steps') IS DISTINCT FROM 'object' THEN RAISE EXCEPTION 'Invalid steps'; END IF;
 FOR k,v IN SELECT * FROM jsonb_each(_snapshot->'steps') LOOP
  IF k NOT IN ('page_opened','brief_shown','contact_shown','contact_submitted','request_saved') OR jsonb_typeof(v)<>'number' THEN RAISE EXCEPTION 'Invalid step'; END IF;
 END LOOP;
 IF jsonb_typeof(_snapshot->'events') IS DISTINCT FROM 'array' OR jsonb_array_length(_snapshot->'events') > 1500 THEN RAISE EXCEPTION 'Invalid events'; END IF;
 FOR e IN SELECT value FROM jsonb_array_elements(_snapshot->'events') LOOP
  IF jsonb_typeof(e) IS DISTINCT FROM 'object' OR coalesce(e->>'name','') NOT IN ('page_view','first_interaction','scroll_depth','section_viewed','cta_click','box_selected','step_viewed','field_focus','field_done','field_error','submit_attempt','submit_success','submit_fail','whatsapp_click','call_click','heartbeat','page_hidden') OR jsonb_typeof(e->'t') IS DISTINCT FROM 'number' OR coalesce(e->>'v','') NOT IN ('a','b') OR octet_length(e::text) > 600 THEN RAISE EXCEPTION 'Invalid event'; END IF;
 END LOOP;
 IF _snapshot ? 'perf' AND jsonb_typeof(_snapshot->'perf') IS DISTINCT FROM 'object' THEN RAISE EXCEPTION 'Invalid perf'; END IF;
 IF _snapshot ? 'attribution' AND (jsonb_typeof(_snapshot->'attribution') IS DISTINCT FROM 'object' OR octet_length((_snapshot->'attribution')::text) > 4000) THEN RAISE EXCEPTION 'Invalid attribution'; END IF;
 INSERT INTO public.visitor_behaviour(id,write_token,revision,device,source,steps,scroll_depth,viewed_designs,opened_designs,selected_designs,journey,landing_version,internal,lp_events,perf,attribution)
 VALUES (_id,_token,_revision,_snapshot->>'device',_snapshot->>'source',_snapshot->'steps','{}'::jsonb,'{}','{}','{}','[]'::jsonb,_snapshot->>'version',(_snapshot->>'internal')::boolean,_snapshot->'events',_snapshot->'perf',_snapshot->'attribution')
 ON CONFLICT(id) DO UPDATE SET revision=excluded.revision, updated_at=now(), steps=excluded.steps, lp_events=excluded.lp_events, perf=coalesce(excluded.perf, visitor_behaviour.perf), internal=visitor_behaviour.internal OR excluded.internal, attribution=coalesce(visitor_behaviour.attribution, excluded.attribution)
 WHERE visitor_behaviour.write_token=_token AND visitor_behaviour.revision<_revision;
END; $$;
REVOKE ALL ON FUNCTION public.save_lp_behaviour(uuid,uuid,bigint,jsonb) FROM public;
GRANT EXECUTE ON FUNCTION public.save_lp_behaviour(uuid,uuid,bigint,jsonb) TO anon, authenticated, service_role;