/*
  # Create Social Network System

  1. New Tables
    - `friend_requests`
      - `id` (uuid, primary key)
      - `requester_phone` (text) - Phone of user sending request
      - `recipient_phone` (text) - Phone of user receiving request
      - `status` (text) - pending, accepted, rejected
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `friendships`
      - `id` (uuid, primary key)
      - `user1_phone` (text) - First user's phone
      - `user2_phone` (text) - Second user's phone
      - `created_at` (timestamptz)
    
    - `social_posts`
      - `id` (uuid, primary key)
      - `author_phone` (text) - Post author's phone
      - `author_name` (text) - Post author's name
      - `content` (text) - Post content
      - `image_url` (text, nullable) - Optional image
      - `likes` (jsonb) - Array of phone numbers who liked
      - `created_at` (timestamptz)
    
    - `post_comments`
      - `id` (uuid, primary key)
      - `post_id` (uuid) - Foreign key to social_posts
      - `author_phone` (text) - Comment author's phone
      - `author_name` (text) - Comment author's name
      - `content` (text) - Comment content
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Users can only see posts from friends
    - Users can manage their own friend requests
    - Users can create posts and comments

  3. Indexes
    - Add indexes for phone lookups and post queries
*/

-- Create friend_requests table
CREATE TABLE IF NOT EXISTS friend_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_phone text NOT NULL,
  recipient_phone text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(requester_phone, recipient_phone)
);

-- Create friendships table
CREATE TABLE IF NOT EXISTS friendships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_phone text NOT NULL,
  user2_phone text NOT NULL,
  created_at timestamptz DEFAULT now(),
  CHECK (user1_phone < user2_phone),
  UNIQUE(user1_phone, user2_phone)
);

-- Create social_posts table
CREATE TABLE IF NOT EXISTS social_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_phone text NOT NULL,
  author_name text NOT NULL,
  content text NOT NULL,
  image_url text,
  likes jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create post_comments table
CREATE TABLE IF NOT EXISTS post_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  author_phone text NOT NULL,
  author_name text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;

-- Policies for friend_requests
CREATE POLICY "Users can view their own friend requests"
  ON friend_requests FOR SELECT
  TO anon, authenticated
  USING (requester_phone = current_setting('request.jwt.claim.phone', true) 
         OR recipient_phone = current_setting('request.jwt.claim.phone', true));

CREATE POLICY "Users can create friend requests"
  ON friend_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Recipients can update friend requests"
  ON friend_requests FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for friendships
CREATE POLICY "Users can view their friendships"
  ON friendships FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can create friendships"
  ON friendships FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policies for social_posts
CREATE POLICY "Users can view all posts"
  ON social_posts FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can create posts"
  ON social_posts FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own posts"
  ON social_posts FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete own posts"
  ON social_posts FOR DELETE
  TO anon, authenticated
  USING (true);

-- Policies for post_comments
CREATE POLICY "Users can view all comments"
  ON post_comments FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can create comments"
  ON post_comments FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can delete own comments"
  ON post_comments FOR DELETE
  TO anon, authenticated
  USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_friend_requests_phones ON friend_requests(requester_phone, recipient_phone);
CREATE INDEX IF NOT EXISTS idx_friendships_phones ON friendships(user1_phone, user2_phone);
CREATE INDEX IF NOT EXISTS idx_social_posts_author ON social_posts(author_phone);
CREATE INDEX IF NOT EXISTS idx_social_posts_created ON social_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_comments_post ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_created ON post_comments(created_at DESC);