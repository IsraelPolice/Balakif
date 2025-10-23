/*
  # הוספת תמיכה בהעלאת תמונות לפורום

  1. שינויים
    - הוספת עמודה `image_url` לטבלת `forum_posts`
      - תשמור את ה-URL של התמונה שהועלתה
      - nullable - לא כל פוסט צריך תמונה
    
  2. הערות
    - התמונות יישמרו ב-Supabase Storage
    - הפוסט יכיל רק את ה-URL
    - התמונות יוצגו בצורה פרופורציונלית כמו באינסטגרם
*/

-- Add image_url column to forum_posts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'forum_posts' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE forum_posts ADD COLUMN image_url text;
  END IF;
END $$;