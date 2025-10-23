/*
  # Refresh img_url column

  This migration drops and recreates the img_url column to refresh the schema cache.
  
  1. Changes
    - Drop img_url column from forum_posts
    - Add img_url column back to forum_posts
*/

-- Drop the column
ALTER TABLE forum_posts DROP COLUMN IF EXISTS img_url;

-- Add it back
ALTER TABLE forum_posts ADD COLUMN img_url text;
