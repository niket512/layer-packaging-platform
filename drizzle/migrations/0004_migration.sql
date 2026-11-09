alter table public.sourcing_chats add column if not exists session_id uuid;

create or replace function public.save_sourcing_chat(_id uuid, _token uuid, _snapshot jsonb, _revision bigint)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
 if _id is null or _token is null or _revision is null or jsonb_typeof(_snapshot) is distinct from 'object'
 or length(_snapshot::text) > 8000000 or length(coalesce(_snapshot->>'title','')) not between 1 and 200
 or jsonb_typeof(_snapshot->'transcript') is distinct from 'array'
 or jsonb_typeof(_snapshot->'brief') is distinct from 'array'
 or coalesce(_snapshot->>'status','') not in ('ongoing','submitted')
 or length(coalesce(_snapshot->>'contact','')) > 100 then
 raise exception 'Invalid chat snapshot';
 end if;
 if jsonb_array_length(_snapshot->'transcript') not between 1 and 200 or jsonb_array_length(_snapshot->'brief') > 40 then raise exception 'Invalid chat length'; end if;
 insert into public.sourcing_chats(id,write_token_hash,title,transcript,brief,status,contact,submission_id,revision,session_id)
 values (_id,md5(_token::text),_snapshot->>'title',_snapshot->'transcript',_snapshot->'brief',_snapshot->>'status',nullif(_snapshot->>'contact',''),nullif(_snapshot->>'submission_id','')::uuid,_revision,nullif(_snapshot->>'session_id','')::uuid)
 on conflict (id) do update set title=excluded.title,transcript=excluded.transcript,brief=excluded.brief,status=excluded.status,contact=excluded.contact,submission_id=excluded.submission_id,revision=excluded.revision,session_id=excluded.session_id,updated_at=now()
 where sourcing_chats.write_token_hash=md5(_token::text) and sourcing_chats.revision < _revision;
end;
$function$;