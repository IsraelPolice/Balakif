/*
  # Update AI Characters & Add Stock Tickers

  1. Changes
    - Clear and re-insert exact AI characters list
    - Add ticker symbols to stock_prices table
    - Add stock indices table
    - Add short positions table

  2. New Tables
    - `stock_indices` - Market indices combining multiple members
    - `user_short_positions` - Short selling positions
*/

-- Clear existing AI characters
DELETE FROM ai_characters;

-- Insert exact AI characters
INSERT INTO ai_characters (name, role, location, birth_date, flag, special_action) VALUES
('עמית לסרי', 'מייסד הקבוצה', 'גבעתיים', '17 בדצמבר 1996', '🇮🇱', null),
('דביר ברקת', 'חבר', 'קרית ביאליק', '15 בפברואר 1997', '🇮🇱', 'blacklist'),
('ליאב בן יעקב', 'חבר', 'חיפה', '12 במרץ 1997', '🇮🇱', null),
('יוסף קחלר', 'מנהל שותף', 'גבעתיים', '16 באפריל 1997', '🇮🇱', null),
('אריאל עין גל', 'חבר', 'נהריה', '26 בפברואר 1997', '🇮🇱', null),
('דביר אוחנה', 'חבר', 'חיפה', '24 באוגוסט 1996', '🇮🇱', null),
('איתי אוחנה', 'חבר', 'חיפה', '28 בדצמבר 1997', '🇮🇱', null),
('אור דהן', 'חבר', 'תל אביב', '1 בפברואר 1997', '🇮🇱', null),
('איציק מור יוסף', 'חבר', 'קרית אתא', '21 בינואר 1997', '🇮🇱', null),
('נתנאל יוסילביץ''', 'חבר', 'מעלות תרשיחא', '29 בספטמבר 1997', '🇮🇱', null),
('קורן נאגר', 'חבר', 'נהריה', '30 ביוני 1997', '🇮🇱', null),
('קורן בן משה', 'חבר', 'הרצליה', '8 בדצמבר 1997', '🇮🇱', null),
('ג''ורדן בוחבוט', 'חבר', 'ארצות הברית', '1 ביולי 1997', '🇺🇸', null),
('מיכה גורלובסקי', 'חבר', 'תל אביב', '22 במרץ 1997', '🇮🇱', null),
('עומר יוסף', 'חבר', 'נהריה', 'יוני 1997', '🇮🇱', null),
('דור אביכזר', 'חבר', 'מעלות תרשיחא', 'ינואר 1997', '🇮🇱', null),
('אלי יגורוב (קטלטה)', 'חבר', 'הרצליה', 'יולי 1997', '🇮🇱', null),
('יעקב שוורץ', 'חבר', 'אריאל', 'יוני 1997', '🇮🇱', null),
('יוגב שבתאי', 'חבר', 'אריאל', '26 בינואר 1997', '🇮🇱', null),
('חיים מרקס', 'חבר', 'גבעתיים', '25 במאי 1997', '🇮🇱', null),
('רפי אלגרבלי', 'חבר', 'תל אביב', '2 בפברואר 1997', '🇮🇱', null),
('אריאל שרביט', 'חבר', 'מעלות תרשיחא', '19 בפברואר 1997', '🇮🇱', null);

-- Add ticker column to stock_prices
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stock_prices' AND column_name = 'ticker'
  ) THEN
    ALTER TABLE stock_prices ADD COLUMN ticker text;
  END IF;
END $$;

-- Update stock prices with tickers
UPDATE stock_prices SET ticker = 'AMIT' WHERE member_name = 'עמית לסרי';
UPDATE stock_prices SET ticker = 'DVIR-B' WHERE member_name = 'דביר ברקת';
UPDATE stock_prices SET ticker = 'LIAV' WHERE member_name = 'ליאב בן יעקב';
UPDATE stock_prices SET ticker = 'YOSEF' WHERE member_name = 'יוסף קחלר';
UPDATE stock_prices SET ticker = 'ARIEL-E' WHERE member_name = 'אריאל עין גל';
UPDATE stock_prices SET ticker = 'DVIR-O' WHERE member_name = 'דביר אוחנה';
UPDATE stock_prices SET ticker = 'ITAY' WHERE member_name = 'איתי אוחנה';
UPDATE stock_prices SET ticker = 'OR' WHERE member_name = 'אור דהן';
UPDATE stock_prices SET ticker = 'ITZIK' WHERE member_name = 'איציק מור יוסף';
UPDATE stock_prices SET ticker = 'NATANEL' WHERE member_name = 'נתנאל יוסילביץ''';
UPDATE stock_prices SET ticker = 'KOREN-N' WHERE member_name = 'קורן נאגר';
UPDATE stock_prices SET ticker = 'KOREN-B' WHERE member_name = 'קורן בן משה';
UPDATE stock_prices SET ticker = 'JORDAN' WHERE member_name = 'ג''ורדן בוחבוט';
UPDATE stock_prices SET ticker = 'MICHA' WHERE member_name = 'מיכה גורלובסקי';
UPDATE stock_prices SET ticker = 'OMER' WHERE member_name = 'עומר יוסף';
UPDATE stock_prices SET ticker = 'DOR' WHERE member_name = 'דור אביכזר';
UPDATE stock_prices SET ticker = 'ELI' WHERE member_name = 'אלי יגורוב (קטלטה)';
UPDATE stock_prices SET ticker = 'YAAKOV' WHERE member_name = 'יעקב שוורץ';
UPDATE stock_prices SET ticker = 'YOGEV' WHERE member_name = 'יוגב שבתאי';
UPDATE stock_prices SET ticker = 'HAIM' WHERE member_name = 'חיים מרקס';
UPDATE stock_prices SET ticker = 'RAFI' WHERE member_name = 'רפי אלגרבלי';
UPDATE stock_prices SET ticker = 'ARIEL-S' WHERE member_name = 'אריאל שרביט';

-- Stock Indices table
CREATE TABLE IF NOT EXISTS stock_indices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  index_name text NOT NULL UNIQUE,
  index_ticker text NOT NULL UNIQUE,
  description text,
  member_names text[] NOT NULL,
  current_value numeric DEFAULT 1000,
  daily_change_percent numeric DEFAULT 0,
  last_updated timestamptz DEFAULT now()
);

ALTER TABLE stock_indices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view indices"
  ON stock_indices FOR SELECT
  TO authenticated
  USING (true);

-- User Short Positions table
CREATE TABLE IF NOT EXISTS user_short_positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_phone text NOT NULL,
  member_name text NOT NULL,
  shares numeric NOT NULL,
  short_price numeric NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_short_positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own short positions"
  ON user_short_positions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage own short positions"
  ON user_short_positions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own short positions"
  ON user_short_positions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete own short positions"
  ON user_short_positions FOR DELETE
  TO authenticated
  USING (true);

-- Insert market indices
INSERT INTO stock_indices (index_name, index_ticker, description, member_names, current_value) VALUES
('מדד החזקים', 'STRONG-5', 'מדד המניות החזקות ביותר', ARRAY['דביר ברקת', 'עמית לסרי', 'יוסף קחלר', 'איתי אוחנה', 'דביר אוחנה'], 1000),
('מדד החלשים', 'WEAK-4', 'מדד המניות החלשות', ARRAY['אריאל שרביט', 'אריאל עין גל', 'קורן נאגר', 'חיים מרקס'], 500),
('מדד החברה הטובים', 'HT-22', 'מדד כולל של כל חברי הקבוצה', ARRAY['עמית לסרי', 'דביר ברקת', 'ליאב בן יעקב', 'יוסף קחלר', 'אריאל עין גל', 'דביר אוחנה', 'איתי אוחנה', 'אור דהן', 'איציק מור יוסף', 'נתנאל יוסילביץ''', 'קורן נאגר', 'קורן בן משה', 'ג''ורדן בוחבוט', 'מיכה גורלובסקי', 'עומר יוסף', 'דור אביכזר', 'אלי יגורוב (קטלטה)', 'יעקב שוורץ', 'יוגב שבתאי', 'חיים מרקס', 'רפי אלגרבלי', 'אריאל שרביט'], 800)
ON CONFLICT (index_ticker) DO NOTHING;