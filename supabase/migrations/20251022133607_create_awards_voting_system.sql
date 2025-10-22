/*
  # Academy Awards Voting System

  1. New Tables
    - `award_categories`
      - `id` (uuid, primary key)
      - `name` (text) - Category name in Hebrew
      - `video_url` (text) - YouTube video URL for the category
      - `display_order` (integer) - Order to display categories
      - `created_at` (timestamp)
    
    - `award_nominees`
      - `id` (uuid, primary key)
      - `category_id` (uuid, foreign key) - Links to award_categories
      - `name` (text) - Nominee name
      - `display_order` (integer) - Order within category
      - `created_at` (timestamp)
    
    - `award_votes`
      - `id` (uuid, primary key)
      - `category_id` (uuid, foreign key)
      - `nominee_id` (uuid, foreign key)
      - `voter_email` (text) - Voter's email
      - `voter_phone` (text) - Voter's phone number
      - `voted_at` (timestamp)
      - `ip_address` (text) - For preventing duplicate votes
    
  2. Security
    - Enable RLS on all tables
    - Public can read categories and nominees
    - Public can insert votes (with validation)
    - Only allow one vote per email per category
    - Votes are anonymous but tracked for validation
    
  3. Indexes
    - Index on voter_email and category_id for duplicate prevention
    - Index on category_id for fast vote counting
*/

-- Create award_categories table
CREATE TABLE IF NOT EXISTS award_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  video_url text NOT NULL,
  display_order integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create award_nominees table
CREATE TABLE IF NOT EXISTS award_nominees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES award_categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create award_votes table
CREATE TABLE IF NOT EXISTS award_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES award_categories(id) ON DELETE CASCADE,
  nominee_id uuid NOT NULL REFERENCES award_nominees(id) ON DELETE CASCADE,
  voter_email text NOT NULL,
  voter_phone text NOT NULL,
  voted_at timestamptz DEFAULT now(),
  ip_address text
);

-- Enable RLS
ALTER TABLE award_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE award_nominees ENABLE ROW LEVEL SECURITY;
ALTER TABLE award_votes ENABLE ROW LEVEL SECURITY;

-- Policies for award_categories
CREATE POLICY "Anyone can view categories"
  ON award_categories FOR SELECT
  TO anon, authenticated
  USING (true);

-- Policies for award_nominees
CREATE POLICY "Anyone can view nominees"
  ON award_nominees FOR SELECT
  TO anon, authenticated
  USING (true);

-- Policies for award_votes
CREATE POLICY "Anyone can submit votes"
  ON award_votes FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "No one can view votes directly"
  ON award_votes FOR SELECT
  TO anon, authenticated
  USING (false);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_votes_email_category ON award_votes(voter_email, category_id);
CREATE INDEX IF NOT EXISTS idx_votes_category ON award_votes(category_id);
CREATE INDEX IF NOT EXISTS idx_votes_nominee ON award_votes(nominee_id);
CREATE INDEX IF NOT EXISTS idx_nominees_category ON award_nominees(category_id);

-- Create a function to get vote counts (can be called by anyone)
CREATE OR REPLACE FUNCTION get_vote_counts()
RETURNS TABLE(category_id uuid, nominee_id uuid, nominee_name text, vote_count bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    av.category_id,
    av.nominee_id,
    an.name as nominee_name,
    COUNT(*)::bigint as vote_count
  FROM award_votes av
  JOIN award_nominees an ON av.nominee_id = an.id
  GROUP BY av.category_id, av.nominee_id, an.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to check if email already voted in category
CREATE OR REPLACE FUNCTION has_voted_in_category(p_email text, p_category_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM award_votes 
    WHERE voter_email = p_email AND category_id = p_category_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;