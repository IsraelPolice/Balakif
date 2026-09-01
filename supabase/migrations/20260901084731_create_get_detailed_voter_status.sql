-- Create function for admin to see detailed vote info per user
CREATE OR REPLACE FUNCTION public.get_detailed_voter_status()
RETURNS TABLE(
  user_email text,
  candidate_name text,
  rank_position int,
  voted_at timestamptz
)
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
WHERE u.email LIKE '%@Hevre-Hatovim.com'
  AND coalesce(u.raw_app_meta_data->>'is_admin', 'false') != 'true'
ORDER BY u.email, v.rank_position;
$function$;
