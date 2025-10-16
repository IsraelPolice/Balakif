/*
  # הוספת סקרים ולייקים לתגובות

  1. שינויים בטבלאות
    - הוספת עמודות לטבלת `forum_posts`:
      - `is_poll` (boolean, האם זה סקר)
      - `poll_options` (jsonb, אופציות הסקר)
      - `poll_votes` (jsonb, הצבעות לסקר)
      
  2. טבלאות חדשות
    - `forum_reply_likes`
      - `id` (uuid, מפתח ראשי)
      - `reply_id` (uuid, מזהה התגובה)
      - `user_fingerprint` (text, טביעת אצבע של המשתמש)
      - `created_at` (timestamptz)
      
  3. אבטחה
    - RLS policies לטבלה החדשה
    - כולם יכולים לקרוא ולהוסף לייקים
*/

-- Add new columns to forum_posts for polls
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'forum_posts' AND column_name = 'is_poll'
  ) THEN
    ALTER TABLE forum_posts ADD COLUMN is_poll boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'forum_posts' AND column_name = 'poll_options'
  ) THEN
    ALTER TABLE forum_posts ADD COLUMN poll_options jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'forum_posts' AND column_name = 'poll_votes'
  ) THEN
    ALTER TABLE forum_posts ADD COLUMN poll_votes jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Create forum_reply_likes table for tracking reply likes
CREATE TABLE IF NOT EXISTS forum_reply_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reply_id uuid NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  user_fingerprint text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(reply_id, user_fingerprint)
);

ALTER TABLE forum_reply_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read reply likes"
  ON forum_reply_likes
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can add reply likes"
  ON forum_reply_likes
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can delete their reply likes"
  ON forum_reply_likes
  FOR DELETE
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_forum_reply_likes_reply_id ON forum_reply_likes(reply_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_is_poll ON forum_posts(is_poll);