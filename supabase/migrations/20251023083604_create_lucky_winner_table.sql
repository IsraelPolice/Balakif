/*
  # יצירת טבלת זוכה בגיפט קארד

  1. טבלה חדשה
    - `lucky_winner`
      - `id` (integer, primary key) - תמיד 1
      - `phone_number` (text) - המספר הזוכה
      - `created_at` (timestamp) - מתי נבחר
      - `event_name` (text) - שם האירוע (פרסי האקדמיה)
  
  2. אבטחה
    - Enable RLS
    - כולם יכולים לקרוא
    - רק מנהל יכול לעדכן (נעשה ידנית)
*/

CREATE TABLE IF NOT EXISTS lucky_winner (
  id integer PRIMARY KEY DEFAULT 1,
  phone_number text NOT NULL,
  created_at timestamptz DEFAULT now(),
  event_name text DEFAULT 'Academy Awards 2025',
  CONSTRAINT single_winner CHECK (id = 1)
);

ALTER TABLE lucky_winner ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read lucky winner"
  ON lucky_winner
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Only service role can insert/update lucky winner"
  ON lucky_winner
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);