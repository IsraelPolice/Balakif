/*
# Create Elections 2026 System

## Overview
Creates a complete elections system for "Hevre Hatovim 2026" with:
- 20 candidates that users rank (positions 1-5 required, 6-10 optional)
- Ranked-choice voting with Eurovision-style point scoring
- Admin controls to open/close the election
- Real-time dashboard for admin with detailed breakdowns
- 22 pre-created auth users (1 admin + 21 voters) with shared password

## Scoring System (Eurovision-style)
- Position 1: 12 points, 2: 10, 3: 8, 4: 7, 5: 6, 6: 5, 7: 4, 8: 3, 9: 2, 10: 1

## New Tables
1. `election_candidates` - The 20 people users can vote for
2. `election_votes` - Individual rank assignments (one row per user per candidate)
3. `election_status` - Singleton (id=1) controlling election open/close state

## Security (RLS)
- `election_candidates`: SELECT for authenticated
- `election_votes`: SELECT/INSERT/UPDATE/DELETE own votes only
- `election_status`: SELECT for authenticated; UPDATE only by admin

## Functions
- `is_election_admin()` - returns true if current user is the admin
- `is_election_open()` - returns true if election is currently open
- `submit_ballot(p_rankings jsonb)` - SECURITY DEFINER: validates and submits a user's ballot
- `has_user_voted()` - returns true if current user has submitted any votes
- `get_election_results()` - returns aggregated results with points and vote breakdowns
- `get_voter_status()` - returns list of all voters with whether they've voted

## Auth Users
Creates 22 users in auth.users with password "Hevre222026":
- 1 admin: Admin@Hevre-Hatovim.com (with is_admin flag in raw_app_meta_data)
- 21 voters with @Hevre-Hatovim.com emails
*/

-- ============================================
-- 1. TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS election_candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS election_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  candidate_id uuid NOT NULL REFERENCES election_candidates(id) ON DELETE CASCADE,
  rank_position int NOT NULL CHECK (rank_position >= 1 AND rank_position <= 10),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, candidate_id),
  UNIQUE(user_id, rank_position)
);

CREATE TABLE IF NOT EXISTS election_status (
  id int PRIMARY KEY DEFAULT 1,
  is_open boolean NOT NULL DEFAULT false,
  opened_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  opened_at timestamptz,
  closed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  closed_at timestamptz,
  CONSTRAINT single_row CHECK (id = 1)
);

INSERT INTO election_status (id, is_open) VALUES (1, false)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 2. CANDIDATES (20 people)
-- ============================================

INSERT INTO election_candidates (name, display_order) VALUES
  ('עמית לסרי', 1),
  ('יוסף קחלר', 2),
  ('דביר אוחנה', 3),
  ('אור דהן', 4),
  ('איציק מור יוסף', 5),
  ('איתי אוחנה', 6),
  ('ג''ורדן בוחבוט', 7),
  ('דור אביכזר', 8),
  ('חיים מרקס', 9),
  ('יוגב שבתאי', 10),
  ('יעקב שוורץ', 11),
  ('מיכה גורלובסקי', 12),
  ('נתנאל יוסילביץ', 13),
  ('ליאב בן יעקב', 14),
  ('אריאל עין גל', 15),
  ('קורן בן משה', 16),
  ('קורן נאגר', 17),
  ('אלי יגורוב', 18),
  ('רפי אלגרבלי', 19),
  ('אריאל שרביט', 20)
ON CONFLICT DO NOTHING;

-- ============================================
-- 3. FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION is_election_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = auth, public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND coalesce(raw_app_meta_data->>'is_admin', 'false') = 'true'
  );
$$;

CREATE OR REPLACE FUNCTION is_election_open()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT is_open FROM election_status WHERE id = 1;
$$;

CREATE OR REPLACE FUNCTION has_user_voted()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM election_votes WHERE user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION submit_ballot(p_rankings jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rank_count int;
  v_has_ranks_1_to_5 boolean;
  v_candidate_id uuid;
  v_rank int;
  v_item jsonb;
BEGIN
  IF NOT is_election_open() THEN
    RETURN jsonb_build_object('success', false, 'error', 'הבחירות עדיין לא נפתחו');
  END IF;

  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'לא מחובר');
  END IF;

  v_rank_count := jsonb_array_length(p_rankings);
  IF v_rank_count < 5 THEN
    RETURN jsonb_build_object('success', false, 'error', 'חובה לדרג לפחות 5 מועמדים');
  END IF;

  IF v_rank_count > 10 THEN
    RETURN jsonb_build_object('success', false, 'error', 'ניתן לדרג עד 10 מועמדים');
  END IF;

  SELECT NOT EXISTS (
    SELECT 1 FROM generate_series(1, 5) AS req_rank
    WHERE NOT EXISTS (
      SELECT 1 FROM jsonb_array_elements(p_rankings) AS elem
      WHERE (elem->>'rank')::int = req_rank
    )
  ) INTO v_has_ranks_1_to_5;

  IF NOT v_has_ranks_1_to_5 THEN
    RETURN jsonb_build_object('success', false, 'error', 'חובה למלא את המקומות 1-5');
  END IF;

  DELETE FROM election_votes WHERE user_id = auth.uid();

  FOR v_item IN SELECT jsonb_array_elements(p_rankings) LOOP
    v_candidate_id := (v_item->>'candidate_id')::uuid;
    v_rank := (v_item->>'rank')::int;

    IF NOT EXISTS (SELECT 1 FROM election_candidates WHERE id = v_candidate_id) THEN
      RETURN jsonb_build_object('success', false, 'error', 'מועמד לא תקין');
    END IF;

    BEGIN
      INSERT INTO election_votes (user_id, candidate_id, rank_position)
      VALUES (auth.uid(), v_candidate_id, v_rank);
    EXCEPTION WHEN unique_violation THEN
      RETURN jsonb_build_object('success', false, 'error', 'לא ניתן לדרג את אותו מועמד פעמיים או להשתמש באותו מיקום פעמיים');
    END;
  END LOOP;

  RETURN jsonb_build_object('success', true, 'votes_count', v_rank_count);
END;
$$;

CREATE OR REPLACE FUNCTION get_election_results()
RETURNS TABLE (
  candidate_id uuid,
  candidate_name text,
  total_points numeric,
  rank1_votes int,
  rank2_votes int,
  rank3_votes int,
  rank4_votes int,
  rank5_votes int,
  rank6_votes int,
  rank7_votes int,
  rank8_votes int,
  rank9_votes int,
  rank10_votes int,
  total_ballots int
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  WITH vote_points AS (
    SELECT
      candidate_id,
      rank_position,
      CASE rank_position
        WHEN 1 THEN 12
        WHEN 2 THEN 10
        WHEN 3 THEN 8
        WHEN 4 THEN 7
        WHEN 5 THEN 6
        WHEN 6 THEN 5
        WHEN 7 THEN 4
        WHEN 8 THEN 3
        WHEN 9 THEN 2
        WHEN 10 THEN 1
        ELSE 0
      END AS points
    FROM election_votes
  ),
  aggregated AS (
    SELECT
      c.id AS candidate_id,
      c.name AS candidate_name,
      COALESCE(SUM(vp.points), 0) AS total_points,
      COALESCE(SUM(CASE WHEN vp.rank_position = 1 THEN 1 ELSE 0 END), 0) AS r1,
      COALESCE(SUM(CASE WHEN vp.rank_position = 2 THEN 1 ELSE 0 END), 0) AS r2,
      COALESCE(SUM(CASE WHEN vp.rank_position = 3 THEN 1 ELSE 0 END), 0) AS r3,
      COALESCE(SUM(CASE WHEN vp.rank_position = 4 THEN 1 ELSE 0 END), 0) AS r4,
      COALESCE(SUM(CASE WHEN vp.rank_position = 5 THEN 1 ELSE 0 END), 0) AS r5,
      COALESCE(SUM(CASE WHEN vp.rank_position = 6 THEN 1 ELSE 0 END), 0) AS r6,
      COALESCE(SUM(CASE WHEN vp.rank_position = 7 THEN 1 ELSE 0 END), 0) AS r7,
      COALESCE(SUM(CASE WHEN vp.rank_position = 8 THEN 1 ELSE 0 END), 0) AS r8,
      COALESCE(SUM(CASE WHEN vp.rank_position = 9 THEN 1 ELSE 0 END), 0) AS r9,
      COALESCE(SUM(CASE WHEN vp.rank_position = 10 THEN 1 ELSE 0 END), 0) AS r10,
      COUNT(DISTINCT vp.candidate_id) AS tb
    FROM election_candidates c
    LEFT JOIN vote_points vp ON vp.candidate_id = c.id
    GROUP BY c.id, c.name
  )
  SELECT
    candidate_id,
    candidate_name,
    total_points,
    r1 AS rank1_votes,
    r2 AS rank2_votes,
    r3 AS rank3_votes,
    r4 AS rank4_votes,
    r5 AS rank5_votes,
    r6 AS rank6_votes,
    r7 AS rank7_votes,
    r8 AS rank8_votes,
    r9 AS rank9_votes,
    r10 AS rank10_votes,
    tb AS total_ballots
  FROM aggregated
  ORDER BY total_points DESC, r1 DESC, r2 DESC;
$$;

CREATE OR REPLACE FUNCTION get_voter_status()
RETURNS TABLE (
  user_email text,
  has_voted boolean,
  vote_count int
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = auth, public
AS $$
  SELECT
    u.email AS user_email,
    EXISTS (SELECT 1 FROM public.election_votes v WHERE v.user_id = u.id) AS has_voted,
    (SELECT COUNT(*) FROM public.election_votes v WHERE v.user_id = u.id)::int AS vote_count
  FROM auth.users u
  WHERE u.email LIKE '%@Hevre-Hatovim.com'
  AND coalesce(u.raw_app_meta_data->>'is_admin', 'false') != 'true'
  ORDER BY u.email;
$$;

-- ============================================
-- 4. RLS POLICIES
-- ============================================

ALTER TABLE election_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE election_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE election_status ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_candidates_authenticated" ON election_candidates;
CREATE POLICY "select_candidates_authenticated"
ON election_candidates FOR SELECT
TO authenticated USING (true);

DROP POLICY IF EXISTS "select_own_votes" ON election_votes;
CREATE POLICY "select_own_votes"
ON election_votes FOR SELECT
TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_votes" ON election_votes;
CREATE POLICY "insert_own_votes"
ON election_votes FOR INSERT
TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_votes" ON election_votes;
CREATE POLICY "update_own_votes"
ON election_votes FOR UPDATE
TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_votes" ON election_votes;
CREATE POLICY "delete_own_votes"
ON election_votes FOR DELETE
TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "select_status_authenticated" ON election_status;
CREATE POLICY "select_status_authenticated"
ON election_status FOR SELECT
TO authenticated USING (true);

DROP POLICY IF EXISTS "update_status_admin_only" ON election_status;
CREATE POLICY "update_status_admin_only"
ON election_status FOR UPDATE
TO authenticated USING (is_election_admin()) WITH CHECK (is_election_admin());

-- ============================================
-- 5. AUTH USERS (22 users: 1 admin + 21 voters)
-- Uses conditional insert since auth.users email unique index is partial
-- ============================================

DO $$
DECLARE
  v_password text;
  v_user_email text;
  v_emails text[] := ARRAY[
    'Admin@Hevre-Hatovim.com',
    'OrDahan26@Hevre-Hatovim.com',
    'Itzikmoryo24@Hevre-Hatovim.com',
    'ItayOhan12@Hevre-Hatovim.com',
    'JordanBohbo51@Hevre-Hatovim.com',
    'Dviro2026@Hevre-Hatovim.com',
    'DorAvich2026@Hevre-Hatovim.com',
    'ChaimMarks2026@Hevre-Hatovim.com',
    'Yogevshabati12@Hevre-Hatovim.com',
    'YosefChandler71@Hevre-Hatovim.com',
    'YaakovSchwartz526@Hevre-Hatovim.com',
    'Mikakkk@Hevre-Hatovim.com',
    'NatiYosi71@Hevre-Hatovim.com',
    'LievBenyeekov@Hevre-Hatovim.com',
    'Omerjoseph61@Hevre-Hatovim.com',
    'Eingal51@Hevre-Hatovim.com',
    'Amitlas@Hevre-Hatovim.com',
    'Korenbenmo@Hevre-Hatovim.com',
    'Korennaga@Hevre-Hatovim.com',
    'Leta618@Hevre-Hatovim.com',
    'Rafi10@Hevre-Hatovim.com',
    'Sharvit819@Hevre-Hatovim.com'
  ];
BEGIN
  v_password := crypt('Hevre222026', gen_salt('bf'));

  FOREACH v_user_email IN ARRAY v_emails LOOP
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = lower(v_user_email)) THEN
      INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        recovery_sent_at,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data,
        email_change,
        email_change_confirm_status,
        phone_change_token,
        is_sso_user
      ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        lower(v_user_email),
        v_password,
        now(),
        now(),
        now(),
        now(),
        CASE WHEN lower(v_user_email) = 'admin@hevre-hatovim.com'
          THEN '{"is_admin": true}'::jsonb
          ELSE '{}'::jsonb
        END,
        '{}'::jsonb,
        ''::text,
        0,
        ''::text,
        false
      );
    END IF;
  END LOOP;
END $$;

-- ============================================
-- 6. INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_election_votes_user_id ON election_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_election_votes_candidate_id ON election_votes(candidate_id);
CREATE INDEX IF NOT EXISTS idx_election_votes_rank_position ON election_votes(rank_position);
