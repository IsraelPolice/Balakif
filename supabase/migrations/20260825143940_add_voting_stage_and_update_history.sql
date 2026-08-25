/*
# Add Two-Stage Voting + Update Hall of Fame

## Overview
1. Adds a `voting_stage` column to `election_status` to support the two-stage
   voting workflow (Stage 1: ranks 1-5, Stage 2: ranks 6-10, or closed).
2. Updates `submit_ballot` to validate against the current stage.
3. Updates `election_history` (Hall of Fame) with corrected historical data.

## Changes

### 1. election_status table
- New column: `voting_stage` (text, default 'closed')
  - Values: 'closed' | 'top1_5' | 'top5_10'
  - When 'closed', is_open is false and no voting is allowed.
  - When 'top1_5', users vote for ranks 1-5.
  - When 'top5_10', users vote for ranks 6-10 (stage 1 candidates are locked).

### 2. submit_ballot function
- Updated to check `voting_stage`:
  - 'closed' → reject all submissions
  - 'top1_5' → only accept ranks 1-5, require all 5 filled
  - 'top5_10' → only accept ranks 6-10, require all 5 filled
- Deletes only the votes for the current stage's ranks before inserting,
  preserving votes from the other stage.

### 3. election_history data
- Replaces all rows with the corrected historical results (2019-2024).

## Security
- No new tables. RLS policies unchanged.
- election_status UPDATE still admin-only (existing policy).
*/

-- 1. Add voting_stage column
ALTER TABLE election_status
  ADD COLUMN IF NOT EXISTS voting_stage text NOT NULL DEFAULT 'closed'
  CHECK (voting_stage IN ('closed', 'top1_5', 'top5_10'));

-- Update is_open to be consistent with voting_stage
-- (is_open stays for backward compat; voting_stage is the source of truth)
UPDATE election_status
  SET is_open = (voting_stage != 'closed'),
  voting_stage = 'closed'
WHERE id = 1;

-- 2. Update submit_ballot to handle two-stage voting
CREATE OR REPLACE FUNCTION submit_ballot(p_rankings jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_stage text;
  v_rank_count int;
  v_candidate_id uuid;
  v_rank int;
  v_item jsonb;
  v_min_rank int;
  v_max_rank int;
  v_required_count int := 5;
BEGIN
  SELECT voting_stage INTO v_stage FROM election_status WHERE id = 1;

  IF v_stage = 'closed' OR v_stage IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'ההצבעה סגורה כרגע');
  END IF;

  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'לא מחובר');
  END IF;

  IF v_stage = 'top1_5' THEN
    v_min_rank := 1; v_max_rank := 5;
  ELSIF v_stage = 'top5_10' THEN
    v_min_rank := 6; v_max_rank := 10;
  ELSE
    RETURN jsonb_build_object('success', false, 'error', 'שלב הצבעה לא תקין');
  END IF;

  v_rank_count := jsonb_array_length(p_rankings);
  IF v_rank_count != v_required_count THEN
    RETURN jsonb_build_object('success', false, 'error',
      'חובה לדרג בדיוק 5 מועמדים בשלב זה');
  END IF;

  -- Validate all ranks are within the allowed range and all 5 are present
  IF NOT EXISTS (
    SELECT 1 FROM generate_series(v_min_rank, v_max_rank) AS req_rank
    WHERE NOT EXISTS (
      SELECT 1 FROM jsonb_array_elements(p_rankings) AS elem
      WHERE (elem->>'rank')::int = req_rank
    )
  ) THEN
    RETURN jsonb_build_object('success', false, 'error',
      'חובה למלא את כל המקומות ' || v_min_rank || '-' || v_max_rank);
  END IF;

  -- Validate no rank is outside the allowed range
  FOR v_item IN SELECT jsonb_array_elements(p_rankings) LOOP
    v_rank := (v_item->>'rank')::int;
    IF v_rank < v_min_rank OR v_rank > v_max_rank THEN
      RETURN jsonb_build_object('success', false, 'error',
        'דירוג מחוץ לטווח המותר לשלב זה');
    END IF;
  END LOOP;

  -- Delete only the votes in the current stage's range
  DELETE FROM election_votes
  WHERE user_id = auth.uid()
    AND rank_position >= v_min_rank
    AND rank_position <= v_max_rank;

  -- Insert new votes
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
      RETURN jsonb_build_object('success', false, 'error',
        'לא ניתן לדרג את אותו מועמד פעמיים או להשתמש באותו מיקום פעמיים');
    END;
  END LOOP;

  RETURN jsonb_build_object('success', true, 'votes_count', v_rank_count, 'stage', v_stage);
END;
$$;

-- 3. Update Hall of Fame data
-- First delete existing rows, then insert corrected data
DELETE FROM election_history;

INSERT INTO election_history (year, winner_name, winner_points, runner_up_name, runner_up_points, third_place_name, third_place_points, total_voters) VALUES
  (2019, 'יוסף קחלר', 95, 'דביר ברקת', 82, 'עמית לסרי', 71, 18),
  (2020, 'עמית לסרי', 88, 'יוסף קחלר', 79, 'דביר ברקת', 65, 16),
  (2021, 'עמית לסרי', 92, 'יוסף קחלר', 78, 'דביר אוחנה', 60, 19),
  (2022, 'דביר אוחנה', 102, 'עמית לסרי', 89, 'יוסף קחלר', 75, 20),
  (2023, 'עמית לסרי', 97, 'יוסף קחלר', 84, 'דביר אוחנה', 68, 21),
  (2024, 'עמית לסרי', 102, 'יוסף קחלר', 89, 'דביר אוחנה', 75, 21)
ON CONFLICT (year) DO NOTHING;
