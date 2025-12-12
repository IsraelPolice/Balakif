/*
  # Create Music Listens and Site Visits Tracking System

  1. New Tables
    - `track_listens`
      - `id` (uuid, primary key)
      - `track_id` (uuid, references tracks table)
      - `listen_count` (integer, default 0)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `site_visits`
      - `id` (uuid, primary key)
      - `total_visits` (integer, default 288) - Starting at 288
      - `last_visit_date` (date) - Last date a visit was counted
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Public read access for both tables
    - Only authenticated users can update (for now we'll handle this via edge functions)

  3. Functions
    - Function to increment track listens
    - Function to increment site visits (adds 4 visits per day automatically)
*/

-- Create track_listens table
CREATE TABLE IF NOT EXISTS track_listens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id uuid REFERENCES tracks(id) ON DELETE CASCADE,
  listen_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(track_id)
);

-- Create site_visits table
CREATE TABLE IF NOT EXISTS site_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  total_visits integer DEFAULT 288,
  last_visit_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE track_listens ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_visits ENABLE ROW LEVEL SECURITY;

-- Public read access for track_listens
CREATE POLICY "Anyone can view track listens"
  ON track_listens FOR SELECT
  TO anon, authenticated
  USING (true);

-- Public read access for site_visits
CREATE POLICY "Anyone can view site visits"
  ON site_visits FOR SELECT
  TO anon, authenticated
  USING (true);

-- Function to increment track listens
CREATE OR REPLACE FUNCTION increment_track_listens(p_track_id uuid)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  v_count integer;
BEGIN
  INSERT INTO track_listens (track_id, listen_count, updated_at)
  VALUES (p_track_id, 1, now())
  ON CONFLICT (track_id)
  DO UPDATE SET 
    listen_count = track_listens.listen_count + 1,
    updated_at = now()
  RETURNING listen_count INTO v_count;
  
  RETURN v_count;
END;
$$;

-- Function to get and update site visits
CREATE OR REPLACE FUNCTION get_site_visits()
RETURNS TABLE (
  total_visits integer,
  last_visit_date date
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_record RECORD;
  v_days_passed integer;
  v_new_visits integer;
BEGIN
  -- Get or create the site visits record
  SELECT * INTO v_record FROM site_visits ORDER BY created_at DESC LIMIT 1;
  
  IF v_record IS NULL THEN
    -- Create initial record
    INSERT INTO site_visits (total_visits, last_visit_date)
    VALUES (288, CURRENT_DATE)
    RETURNING * INTO v_record;
  ELSE
    -- Calculate days passed since last visit
    v_days_passed := CURRENT_DATE - v_record.last_visit_date;
    
    IF v_days_passed > 0 THEN
      -- Add 4 visits per day
      v_new_visits := v_days_passed * 4;
      
      UPDATE site_visits
      SET 
        total_visits = total_visits + v_new_visits,
        last_visit_date = CURRENT_DATE,
        updated_at = now()
      WHERE id = v_record.id
      RETURNING * INTO v_record;
    END IF;
  END IF;
  
  -- Increment by 1 for current visit
  UPDATE site_visits
  SET total_visits = total_visits + 1, updated_at = now()
  WHERE id = v_record.id
  RETURNING site_visits.total_visits, site_visits.last_visit_date
  INTO total_visits, last_visit_date;
  
  RETURN NEXT;
END;
$$;

-- Insert initial site visits record
INSERT INTO site_visits (total_visits, last_visit_date)
VALUES (288, CURRENT_DATE)
ON CONFLICT DO NOTHING;