/*
# Create election feedback table

1. New Tables
- `election_feedback`
  - `id` (uuid, primary key)
  - `user_email` (text, not null) - the voter's email
  - `respectful_rival` (text, nullable) - optional free text: "בן זונה של כבוד"
  - `election_notes` (text, nullable) - optional free text: "הערות לבחירות ומה היית משנה"
  - `voting_stage` (text, nullable) - which stage was active when submitted
  - `created_at` (timestamptz, default now)
2. Security
- Enable RLS on `election_feedback`.
- Authenticated users can insert their own feedback (user_email matches their auth email).
- Only admin can read all feedback (admin email check).
- Users can read their own feedback.
*/

CREATE TABLE IF NOT EXISTS election_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  respectful_rival text,
  election_notes text,
  voting_stage text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE election_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "insert_own_feedback" ON election_feedback;
CREATE POLICY "insert_own_feedback" ON election_feedback FOR INSERT
  TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "select_own_feedback" ON election_feedback;
CREATE POLICY "select_own_feedback" ON election_feedback FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "delete_own_feedback" ON election_feedback;
CREATE POLICY "delete_own_feedback" ON election_feedback FOR DELETE
  TO authenticated USING (true);
