/*
# Allow public read access to election candidates

Updates the RLS policy on election_candidates to allow anon access,
so the elections page can display the candidate list before login.
*/

DROP POLICY IF EXISTS "select_candidates_authenticated" ON election_candidates;
CREATE POLICY "select_candidates_public"
ON election_candidates FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "select_status_authenticated" ON election_status;
CREATE POLICY "select_status_public"
ON election_status FOR SELECT
TO anon, authenticated USING (true);
