/*
  # Rename image_url to img_url to bypass cache issue

  1. Drop old image_url column
  2. Add new img_url column
  3. This bypasses PostgREST cache issues
*/

-- Drop the problematic column
ALTER TABLE forum_posts DROP COLUMN IF EXISTS image_url;

-- Add new column with different name
ALTER TABLE forum_posts ADD COLUMN img_url text;
