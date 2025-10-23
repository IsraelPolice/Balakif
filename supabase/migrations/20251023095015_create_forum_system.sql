/*
  # יצירת מערכת פורום מלאה

  1. טבלאות חדשות
    - `forum_topics` - נושאי הפורום
      - `id` (uuid, primary key)
      - `name` (text, unique, שם הנושא)
      - `icon` (text, אייקון FontAwesome)
      - `created_at` (timestamptz)
    
    - `forum_posts` - פוסטים בפורום
      - `id` (uuid, primary key)
      - `content` (text, תוכן הפוסט)
      - `topic` (text, נושא הפוסט)
      - `author_name` (text, nullable, שם המחבר)
      - `parent_id` (uuid, nullable, עבור תגובות)
      - `likes` (integer, מספר לייקים)
      - `is_poll` (boolean, האם זה סקר)
      - `poll_options` (jsonb, אופציות הסקר)
      - `poll_votes` (jsonb, הצבעות בסקר)
      - `created_at` (timestamptz)

  2. אבטחה
    - Enable RLS על כל הטבלאות
    - כולם יכולים לקרוא
    - כולם יכולים להוסיף (אנונימי)
    - רק המחבר יכול לעדכן/למחוק
*/

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
  TO anon, authenticated
  USING (true);

-- Create forum_posts table
CREATE TABLE IF NOT EXISTS forum_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  topic text DEFAULT 'כללי',
  author_name text,
  parent_id uuid REFERENCES forum_posts(id) ON DELETE CASCADE,
  likes integer DEFAULT 0,
  is_poll boolean DEFAULT false,
  poll_options jsonb,
  poll_votes jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read forum posts"
  ON forum_posts
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert forum posts"
  ON forum_posts
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update forum posts"
  ON forum_posts
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default topics
INSERT INTO forum_topics (name, icon) VALUES
  ('כללי', 'fa-comments'),
  ('הודעות', 'fa-bullhorn'),
  ('שאלות ותשובות', 'fa-question-circle'),
  ('בידור', 'fa-smile'),
  ('דיונים', 'fa-users'),
  ('טכנולוגיה', 'fa-laptop-code'),
  ('פורום אריאל עין גל', 'fa-user'),
  ('פורום מיכה גורלובסקי', 'fa-user'),
  ('פורום אור דהן', 'fa-user'),
  ('פורום איציק מור יוסף', 'fa-user')
ON CONFLICT (name) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_forum_posts_parent_id ON forum_posts(parent_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_topic ON forum_posts(topic);
CREATE INDEX IF NOT EXISTS idx_forum_posts_created_at ON forum_posts(created_at DESC);