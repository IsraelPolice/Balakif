/*
  # יצירת טבלת פורום אנונימי

  1. טבלאות חדשות
    - `forum_posts`
      - `id` (uuid, מפתח ראשי)
      - `content` (text, תוכן ההודעה)
      - `created_at` (timestamptz, תאריך יצירה)
      - `likes` (integer, מספר לייקים)
      
  2. אבטחה
    - הפעלת RLS על טבלת `forum_posts`
    - מדיניות קריאה לכולם (כולל משתמשים לא מאומתים)
    - מדיניות הוספה לכולם (פורום אנונימי מלא)
*/

CREATE TABLE IF NOT EXISTS forum_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  likes integer DEFAULT 0
);

ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read forum posts"
  ON forum_posts
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert forum posts"
  ON forum_posts
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update forum posts likes"
  ON forum_posts
  FOR UPDATE
  USING (true)
  WITH CHECK (true);