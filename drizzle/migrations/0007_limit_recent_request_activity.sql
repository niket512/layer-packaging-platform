CREATE OR REPLACE FUNCTION public.recent_request_activity()
 RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
  select jsonb_build_object(
    'today', (select count(*) from requirement_submissions where created_at > now() - interval '24 hours'),
    'week', (select count(*) from requirement_submissions where created_at > now() - interval '7 days'),
    'recent', coalesce(
      (select jsonb_agg(jsonb_build_object('at', date_trunc('hour', r.created_at)) order by r.created_at desc)
       from (select created_at from requirement_submissions where created_at > now() - interval '7 days' order by created_at desc limit 2) r),
      '[]'::jsonb)
  );
$function$;