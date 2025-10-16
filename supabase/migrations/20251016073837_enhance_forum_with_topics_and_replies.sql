/*
  # שדרוג מערכת הפורום - Topics, Replies ו-Named Authors

  1. שינויים בטבלאות
    - הוספת עמודות לטבלת `forum_posts`:
      - `topic` (text, נושא הפוסט)
      - `author_name` (text, nullable, שם המפרסם אם לא אנונימי)
      - `parent_id` (uuid, nullable, מזהה הפוסט ההורה בתגובות)
    - יצירת טבלת `forum_topics` לניהול נושאים
    
  2. טבלאות חדשות
    - `forum_topics`
      - `id` (uuid, מפתח ראשי)
      - `name` (text, שם הנושא)
      - `icon` (text, אייקון הנושא)
      - `created_at` (timestamptz)
      
  3. אבטחה
    - עדכון מדיניות RLS לטבלאות החדשות
    - אותן הרשאות - קריאה והוספה לכולם
*/

-- Add new columns to forum_posts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'forum_posts' AND column_name = 'topic'
  ) THEN
    ALTER TABLE forum_posts ADD COLUMN topic text DEFAULT 'כללי';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'forum_posts' AND column_name = 'author_name'
  ) THEN
    ALTER TABLE forum_posts ADD COLUMN author_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'forum_posts' AND column_name = 'parent_id'
  ) THEN
    ALTER TABLE forum_posts ADD COLUMN parent_id uuid REFERENCES forum_posts(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create forum_topics table
CREATE TABLE IF NOT EXISTS forum_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  icon text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE forum_topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read forum topics"
  ON forum_topics
  FOR SELECT
  USING (true);

-- Insert default topics
INSERT INTO forum_topics (name, icon) VALUES
  ('כללי', 'fa-comments'),
  ('הודעות', 'fa-bullhorn'),
  ('שאלות ותשובות', 'fa-question-circle'),
  ('בידור', 'fa-smile'),
  ('דיונים', 'fa-users'),
  ('טכנולוגיה', 'fa-laptop-code')
ON CONFLICT (name) DO NOTHING;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_forum_posts_parent_id ON forum_posts(parent_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_topic ON forum_posts(topic);
CREATE INDEX IF NOT EXISTS idx_forum_posts_created_at ON forum_posts(created_at DESC);