-- Update admin email check to match the actual admin email used in the frontend
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
  IF v_admin_email IS NULL OR lower(v_admin_email) NOT IN ('admin@hevre-hatovim.com', 'hevrehatovim2026@gmail.com') THEN
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
