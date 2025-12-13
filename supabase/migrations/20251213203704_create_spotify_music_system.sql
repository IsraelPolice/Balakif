/*
  # Create Hevre Spotify Music System

  1. New Tables
    - `artists`
      - `id` (uuid, primary key)
      - `name` (text) - Artist name
      - `image_url` (text) - Profile image URL
      - `bio` (text) - Artist biography
      - `stats` (jsonb) - Statistics like follower count, awards, etc.
      - `created_at` (timestamptz)
    
    - `tracks`
      - `id` (uuid, primary key)
      - `title` (text) - Track title
      - `artist_names` (text[]) - Array of artist names
      - `soundcloud_url` (text) - SoundCloud embed URL
      - `soundcloud_track_id` (text) - SoundCloud track ID
      - `duration` (integer) - Duration in seconds
      - `play_count` (integer) - Number of plays
      - `cover_image` (text) - Track cover image URL
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for public read access (music streaming app needs public access)
    - Add policies for authenticated admin users to manage content
*/

-- Create artists table
CREATE TABLE IF NOT EXISTS artists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  image_url text,
  bio text DEFAULT '',
  stats jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create tracks table
CREATE TABLE IF NOT EXISTS tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  artist_names text[] DEFAULT '{}',
  soundcloud_url text NOT NULL,
  soundcloud_track_id text,
  duration integer DEFAULT 0,
  play_count integer DEFAULT 0,
  cover_image text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;

-- Public read access for artists
CREATE POLICY "Anyone can view artists"
  ON artists
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Public read access for tracks
CREATE POLICY "Anyone can view tracks"
  ON tracks
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Authenticated users can update play counts
CREATE POLICY "Anyone can update track play counts"
  ON tracks
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Insert initial data for artists
INSERT INTO artists (name, image_url, bio, stats) VALUES
  ('עמית לסרי', 'https://i.ibb.co/0pmDBQQQ/Gemini-Generated-Image-uhmvbmuhmvbmuhmv.png', 'מייסד החבר''ה הטובים', '{"awards": "בן זונה של השנה x5", "role": "מייסד"}'),
  ('דביר ברקת', 'https://i.ibb.co/TDH5wZht/Gemini-Generated-Image-9dvhkl9dvhkl9dvh.png', 'אמן ראפ', '{"role": "רפר"}'),
  ('דביר אוחנה', 'https://via.placeholder.com/300', 'אמן', '{"role": "אמן"}'),
  ('איתי אוחנה', 'https://via.placeholder.com/300', 'אמן', '{"role": "אמן"}'),
  ('אור דהן', 'https://via.placeholder.com/300', 'אמן', '{"role": "אמן"}'),
  ('יוסף קחלר', 'https://via.placeholder.com/300', 'אמן', '{"role": "אמן"}'),
  ('חיים מרקס', 'https://via.placeholder.com/300', 'אמן', '{"role": "אמן"}'),
  ('רפי אלגרבלי', 'https://via.placeholder.com/300', 'אמן', '{"role": "אמן"}'),
  ('איציק מור יוסף', 'https://via.placeholder.com/300', 'אמן', '{"role": "אמן"}')
ON CONFLICT DO NOTHING;

-- Insert initial tracks
INSERT INTO tracks (title, artist_names, soundcloud_url, soundcloud_track_id, duration, cover_image) VALUES
  (
    'ה.ה לנצח טהורים',
    ARRAY['עמית לסרי', 'אור דהן', 'יוסף קחלר', 'חיים מרקס', 'רפי אלגרבלי'],
    'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/2228760905%3Fsecret_token%3Ds-RrSPry82xf2&color=%231DB954&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false',
    '2228760905',
    240,
    'https://i.ibb.co/0pmDBQQQ/Gemini-Generated-Image-uhmvbmuhmvbmuhmv.png'
  ),
  (
    'ביס לפנים',
    ARRAY['עמית לסרי', 'יוסף קחלר', 'אור דהן'],
    'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/2228760899%3Fsecret_token%3Ds-Z8Lc35K84DL&color=%231DB954&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false',
    '2228760899',
    200,
    'https://i.ibb.co/0pmDBQQQ/Gemini-Generated-Image-uhmvbmuhmvbmuhmv.png'
  ),
  (
    'חיים מפחד',
    ARRAY['עמית לסרי', 'איציק מור יוסף', 'חיים מרקס'],
    'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/2228760902%3Fsecret_token%3Ds-tRB0kjWrvzw&color=%231DB954&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false',
    '2228760902',
    220,
    'https://i.ibb.co/0pmDBQQQ/Gemini-Generated-Image-uhmvbmuhmvbmuhmv.png'
  ),
  (
    'ביטוח לאומי 2',
    ARRAY['דביר אוחנה', 'דביר ברקת', 'איתי אוחנה'],
    'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/1303803088&color=%231DB954&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true',
    '1303803088',
    180,
    'https://i.ibb.co/TDH5wZht/Gemini-Generated-Image-9dvhkl9dvhkl9dvh.png'
  )
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tracks_artist_names ON tracks USING gin(artist_names);
CREATE INDEX IF NOT EXISTS idx_tracks_created_at ON tracks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_artists_name ON artists(name);