-- Fix inverted validation logic AND add admin vote reset function
CREATE OR REPLACE FUNCTION public.submit_ballot(p_rankings jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_stage text;
  v_rank_count int;
  v_candidate_id uuid;
  v_rank int;
  v_item jsonb;
  v_min_rank int;
  v_max_rank int;
  v_required_count int;
  v_required_min int;
  v_required_max int;
BEGIN
  SELECT voting_stage INTO v_stage FROM election_status WHERE id = 1;

  IF v_stage = 'closed' OR v_stage IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'ההצבעה סגורה כרגע');
  END IF;

  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'לא מחובר');
  END IF;

  IF v_stage = 'top1_5' THEN
    v_min_rank := 1; v_max_rank := 5; v_required_count := 5;
    v_required_min := 1; v_required_max := 5;
  ELSIF v_stage = 'top5_10' THEN
    v_min_rank := 6; v_max_rank := 10; v_required_count := 5;
    v_required_min := 6; v_required_max := 10;
  ELSIF v_stage = 'full' THEN
    v_min_rank := 1; v_max_rank := 10;
    v_required_min := 1; v_required_max := 5;
  ELSE
    RETURN jsonb_build_object('success', false, 'error', 'שלב הצבעה לא תקין');
  END IF;

  v_rank_count := jsonb_array_length(p_rankings);

  -- Validate no rank is outside the allowed range
  FOR v_item IN SELECT jsonb_array_elements(p_rankings) LOOP
    v_rank := (v_item->>'rank')::int;
    IF v_rank < v_min_rank OR v_rank > v_max_rank THEN
      RETURN jsonb_build_object('success', false, 'error',
        'דירוג מחוץ לטווח המותר');
    END IF;
  END LOOP;

  -- For full mode: ranks 1-5 are required, 6-10 are optional
  IF v_stage = 'full' THEN
    IF v_rank_count < 5 THEN
      RETURN jsonb_build_object('success', false, 'error',
        'חובה למלא לפחות את המקומות 1-5');
    END IF;
    -- Check all required ranks (1-5) are present: error if ANY is missing
    IF EXISTS (
      SELECT 1 FROM generate_series(v_required_min, v_required_max) AS req_rank
      WHERE NOT EXISTS (
        SELECT 1 FROM jsonb_array_elements(p_rankings) AS elem
        WHERE (elem->>'rank')::int = req_rank
      )
    ) THEN
      RETURN jsonb_build_object('success', false, 'error',
        'חובה למלא את כל המקומות 1-5');
    END IF;
  ELSE
    -- For staged modes: exact count required
    IF v_rank_count != v_required_count THEN
      RETURN jsonb_build_object('success', false, 'error',
        'חובה לדרג בדיוק ' || v_required_count || ' מועמדים בשלב זה');
    END IF;
    -- Check all required ranks are present: error if ANY is missing
    IF EXISTS (
      SELECT 1 FROM generate_series(v_required_min, v_required_max) AS req_rank
      WHERE NOT EXISTS (
        SELECT 1 FROM jsonb_array_elements(p_rankings) AS elem
        WHERE (elem->>'rank')::int = req_rank
      )
    ) THEN
      RETURN jsonb_build_object('success', false, 'error',
        'חובה למלא את כל המקומות ' || v_required_min || '-' || v_required_max);
    END IF;
  END IF;

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
$function$;

-- Create function for admin to reset a user's votes
CREATE OR REPLACE FUNCTION public.admin_reset_user_votes(p_user_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $function$
DECLARE
  v_admin_uid uuid := auth.uid();
  v_admin_email text;
  v_target_uid uuid;
BEGIN
  IF v_admin_uid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'לא מחובר');
  END IF;

  SELECT email INTO v_admin_email FROM auth.users WHERE id = v_admin_uid;
  IF v_admin_email IS NULL OR v_admin_email NOT IN ('hevrehatovim2026@gmail.com', 'admin@Hevre-Hatovim.com') THEN
    RETURN jsonb_build_object('success', false, 'error', 'אין הרשאת אדמין');
  END IF;

  SELECT id INTO v_target_uid FROM auth.users WHERE email = p_user_email;
  IF v_target_uid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'משתמש לא נמצא');
  END IF;

  DELETE FROM election_votes WHERE user_id = v_target_uid;

  RETURN jsonb_build_object('success', true, 'deleted_user', p_user_email);
END;
$function$;
