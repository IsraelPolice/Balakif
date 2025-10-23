/*
  # Fix image_url column cache issue

  1. Drop and recreate image_url column to refresh PostgREST schema cache
  2. This forces Supabase API to recognize the column
*/

-- Drop the column if it exists
ALTER TABLE forum_posts DROP COLUMN IF EXISTS image_url;

-- Add it back
ALTER TABLE forum_posts ADD COLUMN image_url text;
