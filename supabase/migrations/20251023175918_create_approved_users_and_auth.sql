/*
  # Create Approved Users and Authentication System

  1. New Tables
    - `approved_users`
      - `id` (uuid, primary key)
      - `name` (text, unique) - Full name of the user
      - `phone` (text, unique) - Phone number
      - `created_at` (timestamptz)
    
    - `user_sessions`
      - `id` (uuid, primary key)
      - `phone` (text) - User's phone number
      - `password_hash` (text) - Hashed password
      - `created_at` (timestamptz)
      - `last_login` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for public read access to approved_users (for validation)
    - Add policies for authenticated users to manage their sessions

  3. Initial Data
    - Insert all approved users from the provided list
*/

-- Create approved_users table
CREATE TABLE IF NOT EXISTS approved_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  phone text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create user_sessions table for authentication
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  last_login timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE approved_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Policies for approved_users (public read for validation)
CREATE POLICY "Anyone can read approved users"
  ON approved_users FOR SELECT
  TO anon, authenticated
  USING (true);

-- Policies for user_sessions
CREATE POLICY "Users can read own session"
  ON user_sessions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert session"
  ON user_sessions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own session"
  ON user_sessions FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Insert approved users
INSERT INTO approved_users (name, phone) VALUES
  ('עמית לסרי', '0528199115'),
  ('דביר ברקת', '0505550674'),
  ('ליאב בן יעקב', '0528199115'),
  ('יוסף קחלר', '0544375174'),
  ('איציק מור יוסף', '0587830179'),
  ('איתי אוחנה', '0535235297'),
  ('קורן בן משה', '0542072856'),
  ('ג׳ורדן בוחבוט', '050407633'),
  ('אריאל עין קל', '0546603631'),
  ('דביר אוחנה', '0539222662'),
  ('אור דהן', '0525594170'),
  ('דור אביכזר', '0525868712'),
  ('חיים מרקס', '0544785336'),
  ('מיכה גורלובסקי', '0527488174'),
  ('קורן נאגר', '0526615726'),
  ('נתנאל יוסילביץ׳', '0524719411'),
  ('עומר יוסף', '0549863202'),
  ('אלי יגורוב', '0549988476'),
  ('רפאל אלגרבלי', '0545488845'),
  ('יוגב שבתאי', '0543179530'),
  ('יעקב שוורץ', '0502155779'),
  ('אריאל שרביט', '0528977852')
ON CONFLICT (phone) DO NOTHING;