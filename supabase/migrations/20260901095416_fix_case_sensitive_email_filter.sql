-- Fix case-sensitive email filter in voter status functions
CREATE OR REPLACE FUNCTION public.get_voter_status()
RETURNS TABLE(user_email text, has_voted boolean, vote_count integer, has_voted_stage1 boolean, has_voted_stage2 boolean)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'auth', 'public'
AS $function$
SELECT
  u.email AS user_email,
  EXISTS (SELECT 1 FROM public.election_votes v WHERE v.user_id = u.id) AS has_voted,
  (SELECT COUNT(*) FROM public.election_votes v WHERE v.user_id = u.id)::int AS vote_count,
  EXISTS (SELECT 1 FROM public.election_votes v WHERE v.user_id = u.id AND v.rank_position BETWEEN 1 AND 5) AS has_voted_stage1,
  EXISTS (SELECT 1 FROM public.election_votes v WHERE v.user_id = u.id AND v.rank_position BETWEEN 6 AND 10) AS has_voted_stage2
FROM auth.users u
WHERE u.email ILIKE '%@hevre-hatovim.com'
  AND coalesce(u.raw_app_meta_data->>'is_admin', 'false') != 'true'
ORDER BY u.email;
$function$;

CREATE OR REPLACE FUNCTION public.get_detailed_voter_status()
RETURNS TABLE(user_email text, candidate_name text, rank_position integer, voted_at timestamp with time zone)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'auth', 'public'
AS $function$
SELECT
  u.email AS user_email,
  c.name AS candidate_name,
  v.rank_position::int AS rank_position,
  v.created_at AS voted_at
FROM auth.users u
JOIN public.election_votes v ON v.user_id = u.id
JOIN public.election_candidates c ON c.id = v.candidate_id
WHERE u.email ILIKE '%@hevre-hatovim.com'
  AND coalesce(u.raw_app_meta_data->>'is_admin', 'false') != 'true'
ORDER BY u.email, v.rank_position;
$function$;
