CREATE TABLE public.sourcing_chats (
 id uuid PRIMARY KEY,
 write_token_hash text NOT NULL,
 title text NOT NULL,
 transcript jsonb NOT NULL DEFAULT '[]'::jsonb,
 brief jsonb NOT NULL DEFAULT '[]'::jsonb,
 status text NOT NULL DEFAULT 'ongoing' CHECK (status IN ('ongoing','submitted')),
 contact text,
 submission_id uuid REFERENCES public.requirement_submissions(id),
 revision bigint NOT NULL DEFAULT 0,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.sourcing_chats TO authenticated;
GRANT ALL ON public.sourcing_chats TO service_role;
ALTER TABLE public.sourcing_chats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read sourcing chats" ON public.sourcing_chats FOR SELECT TO authenticated USING (public.is_admin());
CREATE INDEX sourcing_chats_updated_idx ON public.sourcing_chats(updated_at DESC);
CREATE OR REPLACE FUNCTION public.save_sourcing_chat(_id uuid, _token uuid, _snapshot jsonb, _revision bigint) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 IF _id IS NULL OR _token IS NULL OR _revision IS NULL OR jsonb_typeof(_snapshot) IS DISTINCT FROM 'object'
 OR length(_snapshot::text) > 8000000 OR length(coalesce(_snapshot->>'title','')) NOT BETWEEN 1 AND 200
 OR jsonb_typeof(_snapshot->'transcript') IS DISTINCT FROM 'array'
 OR jsonb_typeof(_snapshot->'brief') IS DISTINCT FROM 'array'
 OR coalesce(_snapshot->>'status','') NOT IN ('ongoing','submitted')
 OR length(coalesce(_snapshot->>'contact','')) > 100 THEN
 RAISE EXCEPTION 'Invalid chat snapshot';
 END IF;
 IF jsonb_array_length(_snapshot->'transcript') NOT BETWEEN 1 AND 200 OR jsonb_array_length(_snapshot->'brief') > 40 THEN RAISE EXCEPTION 'Invalid chat length'; END IF;
 INSERT INTO public.sourcing_chats(id,write_token_hash,title,transcript,brief,status,contact,submission_id,revision)
 VALUES (_id,md5(_token::text),_snapshot->>'title',_snapshot->'transcript',_snapshot->'brief',_snapshot->>'status',nullif(_snapshot->>'contact',''),nullif(_snapshot->>'submission_id','')::uuid,_revision)
 ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title,transcript=EXCLUDED.transcript,brief=EXCLUDED.brief,status=EXCLUDED.status,contact=EXCLUDED.contact,submission_id=EXCLUDED.submission_id,revision=EXCLUDED.revision,updated_at=now()
 WHERE sourcing_chats.write_token_hash=md5(_token::text) AND sourcing_chats.revision < _revision;
END;
$$;
REVOKE ALL ON FUNCTION public.save_sourcing_chat(uuid,uuid,jsonb,bigint) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.save_sourcing_chat(uuid,uuid,jsonb,bigint) TO anon,authenticated,service_role;