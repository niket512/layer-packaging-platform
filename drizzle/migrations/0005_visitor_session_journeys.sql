ALTER TABLE public.visitor_behaviour ADD COLUMN journey jsonb NOT NULL DEFAULT '[]'::jsonb;
CREATE OR REPLACE FUNCTION public.save_visitor_behaviour(_id uuid, _token uuid, _revision bigint, _snapshot jsonb) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE k text; v jsonb; a text; e jsonb;
BEGIN
 IF _id IS NULL OR _token IS NULL OR _revision IS NULL OR jsonb_typeof(_snapshot) IS DISTINCT FROM 'object' OR octet_length(_snapshot::text)>500000 THEN RAISE EXCEPTION 'Invalid measurement'; END IF;
 IF coalesce(_snapshot->>'device','') NOT IN ('mobile','tablet','desktop') OR coalesce(_snapshot->>'source','') NOT IN ('direct','paid_search','organic_search','social','referral','email','other_campaign') THEN RAISE EXCEPTION 'Invalid category'; END IF;
 IF jsonb_typeof(_snapshot->'steps') IS DISTINCT FROM 'object' OR jsonb_typeof(_snapshot->'scroll_depth') IS DISTINCT FROM 'object' THEN RAISE EXCEPTION 'Invalid measurement'; END IF;
 FOR k,v IN SELECT * FROM jsonb_each(_snapshot->'steps') LOOP
 IF k NOT IN ('page_opened','category_selected','composer_focused','first_message','questions_shown','questions_answered','questions_skipped','design_shown','design_answered','brief_shown','contact_shown','contact_submitted','request_saved') OR jsonb_typeof(v)<>'number' OR (v::text)::numeric<0 OR (v::text)::numeric>9999999999999 THEN RAISE EXCEPTION 'Invalid step'; END IF;
 END LOOP;
 FOR k,v IN SELECT * FROM jsonb_each(_snapshot->'scroll_depth') LOOP
 IF k NOT IN ('/','/request-form','/sourcing','/designs','/designs/flexible-pouches','/designs/corrugated-boxes') OR jsonb_typeof(v)<>'number' OR (v::text)::numeric<0 OR (v::text)::numeric>100 THEN RAISE EXCEPTION 'Invalid depth'; END IF;
 END LOOP;
 FOREACH a IN ARRAY ARRAY['viewed_designs','opened_designs','selected_designs'] LOOP
 IF jsonb_typeof(_snapshot->a) IS DISTINCT FROM 'array' OR jsonb_array_length(_snapshot->a)>1000 THEN RAISE EXCEPTION 'Invalid catalogue count'; END IF;
 FOR v IN SELECT value FROM jsonb_array_elements(_snapshot->a) LOOP
 IF jsonb_typeof(v)<>'string' OR length(v #>> '{}')>100 OR (v #>> '{}') !~ '^[a-zA-Z0-9_-]+$' THEN RAISE EXCEPTION 'Invalid catalogue reference'; END IF;
 END LOOP;
 END LOOP;
 IF _snapshot ? 'journey' THEN
 IF jsonb_typeof(_snapshot->'journey') IS DISTINCT FROM 'array' OR jsonb_array_length(_snapshot->'journey')>1000 THEN RAISE EXCEPTION 'Invalid journey'; END IF;
 FOR e IN SELECT value FROM jsonb_array_elements(_snapshot->'journey') LOOP
 IF jsonb_typeof(e) IS DISTINCT FROM 'object' OR coalesce(e->>'kind','') NOT IN ('page','funnel','viewed','opened','selected','form_step','field','form_error') OR coalesce(e->>'path','') NOT IN ('/','/request-form','/sourcing','/designs','/designs/flexible-pouches','/designs/corrugated-boxes') OR jsonb_typeof(e->'at') IS DISTINCT FROM 'number' THEN RAISE EXCEPTION 'Invalid journey event'; END IF;
 IF (e->>'at')::numeric<0 OR (e->>'at')::numeric>9999999999999 THEN RAISE EXCEPTION 'Invalid time'; END IF;
 FOR k,v IN SELECT * FROM jsonb_each(e) LOOP
 IF k NOT IN ('kind','path','at','design','position','family','category','step','field','filled','reason') THEN RAISE EXCEPTION 'Invalid property'; END IF;
 IF k IN ('design','category') AND (jsonb_typeof(v)<>'string' OR (v #>> '{}') !~ '^[a-zA-Z0-9_-]{1,100}$') THEN RAISE EXCEPTION 'Invalid reference'; END IF;
 IF k='family' AND (v #>> '{}') NOT IN ('boxes','pouches') THEN RAISE EXCEPTION 'Invalid family'; END IF;
 IF k='position' AND (jsonb_typeof(v)<>'number' OR (v::text)::numeric<1 OR (v::text)::numeric>100000 OR (v::text)::numeric<>trunc((v::text)::numeric)) THEN RAISE EXCEPTION 'Invalid position'; END IF;
 IF k='step' AND (v #>> '{}') NOT IN ('1','2','3','4','page_opened','category_selected','composer_focused','first_message','questions_shown','questions_answered','questions_skipped','design_shown','design_answered','brief_shown','contact_shown','contact_submitted','request_saved') THEN RAISE EXCEPTION 'Invalid stage'; END IF;
 IF k='field' AND (v #>> '{}') NOT IN ('family','format','quantity','size','printing','material','wall','closure','finishing','delivery','notes','phone','photos') THEN RAISE EXCEPTION 'Invalid field'; END IF;
 IF k='filled' AND jsonb_typeof(v)<>'boolean' THEN RAISE EXCEPTION 'Invalid completion'; END IF;
 IF k='reason' AND (v #>> '{}') NOT IN ('format_required','phone_invalid','save_failed') THEN RAISE EXCEPTION 'Invalid reason'; END IF;
 END LOOP;
 END LOOP;
 END IF;
 INSERT INTO public.visitor_behaviour(id,write_token,revision,device,source,steps,scroll_depth,viewed_designs,opened_designs,selected_designs,journey)
 VALUES (_id,_token,_revision,_snapshot->>'device',_snapshot->>'source',_snapshot->'steps',_snapshot->'scroll_depth',ARRAY(SELECT jsonb_array_elements_text(_snapshot->'viewed_designs')),ARRAY(SELECT jsonb_array_elements_text(_snapshot->'opened_designs')),ARRAY(SELECT jsonb_array_elements_text(_snapshot->'selected_designs')),coalesce(_snapshot->'journey','[]'::jsonb))
 ON CONFLICT(id) DO UPDATE SET revision=excluded.revision,updated_at=now(),steps=excluded.steps,scroll_depth=excluded.scroll_depth,viewed_designs=excluded.viewed_designs,opened_designs=excluded.opened_designs,selected_designs=excluded.selected_designs,journey=CASE WHEN _snapshot ? 'journey' THEN excluded.journey ELSE visitor_behaviour.journey END
 WHERE visitor_behaviour.write_token=_token AND visitor_behaviour.revision<_revision;
END; $$;
REVOKE ALL ON FUNCTION public.save_visitor_behaviour(uuid,uuid,bigint,jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.save_visitor_behaviour(uuid,uuid,bigint,jsonb) TO anon,authenticated;
CREATE OR REPLACE FUNCTION public.visitor_behaviour_report(_days integer DEFAULT 7) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE result jsonb;
BEGIN
 IF NOT public.is_admin() THEN RAISE EXCEPTION 'Administrator access required'; END IF;
 IF _days NOT IN (7,30,90) THEN RAISE EXCEPTION 'Invalid period'; END IF;
 SELECT jsonb_build_object('sessions',coalesce(jsonb_agg(jsonb_build_object('id',id,'created_at',created_at,'updated_at',updated_at,'device',device,'source',source,'steps',steps,'scroll_depth',scroll_depth,'viewed',cardinality(viewed_designs),'opened',cardinality(opened_designs),'selected',cardinality(selected_designs),'journey',journey) ORDER BY created_at DESC),'[]'::jsonb)) INTO result FROM public.visitor_behaviour WHERE created_at>=now()-make_interval(days=>_days);
 RETURN result;
END; $$;
REVOKE ALL ON FUNCTION public.visitor_behaviour_report(integer) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.visitor_behaviour_report(integer) TO authenticated;