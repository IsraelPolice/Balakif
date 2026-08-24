/*
# Create Election History (Hall of Fame)

1. New Table
- `election_history` - stores past election results for display before voting opens
  - `id` (uuid, primary key)
  - `year` (int, unique) - the election year
  - `winner_name` (text) - first place winner
  - `winner_points` (int) - total points
  - `runner_up_name` (text) - second place
  - `runner_up_points` (int)
  - `third_place_name` (text) - third place
  - `third_place_points` (int)
  - `total_voters` (int) - how many people voted
  - `created_at` (timestamptz)

2. Security
- RLS enabled, public read access (anon + authenticated) so the page works without login
- No write access from the client (admin manages via SQL or admin API)

3. Seed Data
- Past "בן זונה של השנה" winners from group history
*/

CREATE TABLE IF NOT EXISTS election_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year int NOT NULL UNIQUE,
  winner_name text NOT NULL,
  winner_points int NOT NULL DEFAULT 0,
  runner_up_name text,
  runner_up_points int NOT NULL DEFAULT 0,
  third_place_name text,
  third_place_points int NOT NULL DEFAULT 0,
  total_voters int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE election_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anyone_can_read_election_history" ON election_history;
CREATE POLICY "anyone_can_read_election_history"
ON election_history FOR SELECT
TO anon, authenticated USING (true);

INSERT INTO election_history (year, winner_name, winner_points, runner_up_name, runner_up_points, third_place_name, third_place_points, total_voters) VALUES
  (2019, 'יוסף קחלר', 95, 'דביר אוחנה', 82, 'עמית לסרי', 71, 18),
  (2020, 'דביר אוחנה', 88, 'עמית לסרי', 79, 'יוסף קחלר', 65, 16),
  (2021, 'איתי אוחנה', 92, 'דביר ברקת', 78, 'ג''ורדן בוחבוט', 60, 19),
  (2022, 'עמית לסרי', 102, 'יוסף קחלר', 89, 'דביר אוחנה', 75, 20),
  (2023, 'דביר ברקת', 97, 'מיכה גורלובסקי', 84, 'יעקב שוורץ', 68, 21),
  (2024, 'יוגב שבתאי', 99, 'רפי אלגרבלי', 86, 'קורן בן משה', 72, 21),
  (2025, 'נתנאל יוסילביץ', 105, 'אור דהן', 91, 'דור אביכזר', 78, 22)
ON CONFLICT (year) DO NOTHING;
