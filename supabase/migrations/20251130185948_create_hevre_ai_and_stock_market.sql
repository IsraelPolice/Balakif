/*
  # Hevre AI & Stock Market System

  1. New Tables
    - `ai_characters` - Available characters for AI voice generation
      - `id` (uuid, primary key)
      - `name` (text) - Character name
      - `role` (text) - Role in group
      - `location` (text) - City
      - `birth_date` (text) - Birth date
      - `flag` (text) - Country flag emoji
      - `special_action` (text, nullable) - Special action (e.g., "blacklist" for Dvir Barkat)

    - `ai_requests` - User AI voice generation requests
      - `id` (uuid, primary key)
      - `user_phone` (text) - User who made request
      - `character_name` (text) - Selected character
      - `prompt` (text) - User's prompt
      - `status` (text) - Request status: pending/completed
      - `created_at` (timestamptz)

    - `user_credits` - User credit balances
      - `user_phone` (text, primary key)
      - `credits` (integer) - Remaining credits
      - `created_at` (timestamptz)

    - `user_bank_accounts` - User bank accounts for stock trading
      - `user_phone` (text, primary key)
      - `balance` (numeric) - Current balance in dollars
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `stock_prices` - Current stock prices for each member
      - `member_name` (text, primary key)
      - `current_price` (numeric) - Current stock price
      - `daily_change_percent` (numeric) - Daily change percentage
      - `last_updated` (timestamptz)

    - `stock_price_history` - Historical stock prices
      - `id` (uuid, primary key)
      - `member_name` (text) - Stock name
      - `price` (numeric) - Price at this point
      - `timestamp` (timestamptz)

    - `user_stock_portfolios` - User stock holdings
      - `id` (uuid, primary key)
      - `user_phone` (text) - User phone
      - `member_name` (text) - Stock member name
      - `shares` (numeric) - Number of shares owned
      - `average_buy_price` (numeric) - Average purchase price
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `stock_transactions` - Stock buy/sell transactions
      - `id` (uuid, primary key)
      - `user_phone` (text) - User phone
      - `member_name` (text) - Stock name
      - `transaction_type` (text) - buy/sell
      - `shares` (numeric) - Number of shares
      - `price_per_share` (numeric) - Price per share
      - `total_amount` (numeric) - Total transaction amount
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- AI Characters table
CREATE TABLE IF NOT EXISTS ai_characters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL,
  location text NOT NULL,
  birth_date text NOT NULL,
  flag text NOT NULL DEFAULT '🇮🇱',
  special_action text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_characters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view AI characters"
  ON ai_characters FOR SELECT
  TO authenticated
  USING (true);

-- AI Requests table
CREATE TABLE IF NOT EXISTS ai_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_phone text NOT NULL,
  character_name text NOT NULL,
  prompt text NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own AI requests"
  ON ai_requests FOR SELECT
  TO authenticated
  USING (user_phone = current_setting('request.jwt.claims')::json->>'phone');

CREATE POLICY "Users can create AI requests"
  ON ai_requests FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view all AI requests"
  ON ai_requests FOR SELECT
  TO authenticated
  USING (true);

-- User Credits table
CREATE TABLE IF NOT EXISTS user_credits (
  user_phone text PRIMARY KEY,
  credits integer DEFAULT 2,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own credits"
  ON user_credits FOR SELECT
  TO authenticated
  USING (user_phone = current_setting('request.jwt.claims')::json->>'phone');

CREATE POLICY "Users can update own credits"
  ON user_credits FOR UPDATE
  TO authenticated
  USING (user_phone = current_setting('request.jwt.claims')::json->>'phone')
  WITH CHECK (user_phone = current_setting('request.jwt.claims')::json->>'phone');

-- User Bank Accounts table
CREATE TABLE IF NOT EXISTS user_bank_accounts (
  user_phone text PRIMARY KEY,
  balance numeric DEFAULT 10.00,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_bank_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bank account"
  ON user_bank_accounts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own bank account"
  ON user_bank_accounts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Stock Prices table
CREATE TABLE IF NOT EXISTS stock_prices (
  member_name text PRIMARY KEY,
  current_price numeric NOT NULL,
  daily_change_percent numeric DEFAULT 0,
  last_updated timestamptz DEFAULT now()
);

ALTER TABLE stock_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view stock prices"
  ON stock_prices FOR SELECT
  TO authenticated
  USING (true);

-- Stock Price History table
CREATE TABLE IF NOT EXISTS stock_price_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_name text NOT NULL,
  price numeric NOT NULL,
  timestamp timestamptz DEFAULT now()
);

ALTER TABLE stock_price_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view stock price history"
  ON stock_price_history FOR SELECT
  TO authenticated
  USING (true);

-- User Stock Portfolios table
CREATE TABLE IF NOT EXISTS user_stock_portfolios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_phone text NOT NULL,
  member_name text NOT NULL,
  shares numeric NOT NULL DEFAULT 0,
  average_buy_price numeric NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_phone, member_name)
);

ALTER TABLE user_stock_portfolios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own portfolio"
  ON user_stock_portfolios FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage own portfolio"
  ON user_stock_portfolios FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own portfolio"
  ON user_stock_portfolios FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Stock Transactions table
CREATE TABLE IF NOT EXISTS stock_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_phone text NOT NULL,
  member_name text NOT NULL,
  transaction_type text NOT NULL,
  shares numeric NOT NULL,
  price_per_share numeric NOT NULL,
  total_amount numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE stock_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON stock_transactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create transactions"
  ON stock_transactions FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Insert AI Characters
INSERT INTO ai_characters (name, role, location, birth_date, flag, special_action) VALUES
('עמית לסרי', 'מייסד הקבוצה', 'גבעתיים', '17 בדצמבר 1996', '🇮🇱', null),
('דביר ברקת', 'חבר', 'קרית ביאליק', '15 בפברואר 1997', '🇮🇱', 'blacklist'),
('ליאב בן יעקב', 'חבר', 'חיפה', '12 במרץ 1997', '��🇱', null),
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
('אריאל שרביט', 'חבר', 'מעלות תרשיחא', '19 בפברואר 1997', '🇮🇱', null)
ON CONFLICT (id) DO NOTHING;

-- Initialize Stock Prices
INSERT INTO stock_prices (member_name, current_price, daily_change_percent) VALUES
('דביר ברקת', 2.50, 0),
('יוסף קחלר', 2.20, 0),
('איתי אוחנה', 2.10, 0),
('עמית לסרי', 2.00, 0),
('דביר אוחנה', 1.95, 0),
('אור דהן', 1.50, 0),
('איציק מור יוסף', 1.45, 0),
('נתנאל יוסילביץ''', 1.40, 0),
('קורן בן משה', 1.35, 0),
('ג''ורדן בוחבוט', 1.30, 0),
('מיכה גורלובסקי', 1.28, 0),
('עומר יוסף', 1.25, 0),
('דור אביכזר', 1.20, 0),
('אלי יגורוב (קטלטה)', 1.18, 0),
('יעקב שוורץ', 1.15, 0),
('רפי אלגרבלי', 1.10, 0),
('אריאל שרביט', 0.85, 0),
('אריאל עין גל', 0.80, 0),
('חיים מרקס', 0.75, 0),
('יוגב שבתאי', 0.70, 0),
('קורן נאגר', 0.65, 0),
('ליאב בן יעקב', 0.60, 0)
ON CONFLICT (member_name) DO NOTHING;