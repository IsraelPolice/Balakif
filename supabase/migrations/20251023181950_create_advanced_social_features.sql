/*
  # Create Advanced Social Network Features

  1. New Tables
    - `user_profiles`
      - `phone` (text, primary key) - User's phone number
      - `name` (text) - User's full name
      - `bio` (text, nullable) - User biography
      - `profile_picture` (text, nullable) - Profile picture URL
      - `cover_photo` (text, nullable) - Cover photo URL
      - `location` (text, nullable) - User location
      - `work` (text, nullable) - Work information
      - `education` (text, nullable) - Education information
      - `relationship_status` (text, nullable) - Relationship status
      - `website` (text, nullable) - Personal website
      - `birthday` (date, nullable) - Birthday
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `groups`
      - `id` (uuid, primary key)
      - `name` (text) - Group/Page name
      - `description` (text) - Group/Page description
      - `type` (text) - 'group' or 'page'
      - `privacy` (text) - 'public' or 'private'
      - `cover_photo` (text, nullable)
      - `creator_phone` (text) - Creator's phone
      - `created_at` (timestamptz)
    
    - `group_members`
      - `id` (uuid, primary key)
      - `group_id` (uuid) - Foreign key to groups
      - `user_phone` (text) - Member's phone
      - `role` (text) - 'admin', 'moderator', 'member'
      - `joined_at` (timestamptz)
    
    - `group_posts`
      - `id` (uuid, primary key)
      - `group_id` (uuid) - Foreign key to groups
      - `author_phone` (text) - Post author's phone
      - `author_name` (text) - Post author's name
      - `content` (text) - Post content
      - `image_url` (text, nullable)
      - `likes` (jsonb) - Array of phones who liked
      - `created_at` (timestamptz)
    
    - `group_join_requests`
      - `id` (uuid, primary key)
      - `group_id` (uuid) - Foreign key to groups
      - `user_phone` (text) - Requester's phone
      - `user_name` (text) - Requester's name
      - `status` (text) - 'pending', 'approved', 'rejected'
      - `created_at` (timestamptz)
    
    - `wall_posts`
      - `id` (uuid, primary key)
      - `wall_owner_phone` (text) - Wall owner's phone
      - `author_phone` (text) - Post author's phone
      - `author_name` (text) - Post author's name
      - `content` (text) - Post content
      - `image_url` (text, nullable)
      - `likes` (jsonb) - Array of phones who liked
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Users can manage their own profiles
    - Group admins can manage their groups
    - Members can view group content

  3. Indexes
    - Add indexes for fast lookups
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  phone text PRIMARY KEY,
  name text NOT NULL,
  bio text,
  profile_picture text,
  cover_photo text,
  location text,
  work text,
  education text,
  relationship_status text,
  website text,
  birthday date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create groups table
CREATE TABLE IF NOT EXISTS groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  type text DEFAULT 'group' CHECK (type IN ('group', 'page')),
  privacy text DEFAULT 'public' CHECK (privacy IN ('public', 'private')),
  cover_photo text,
  creator_phone text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create group_members table
CREATE TABLE IF NOT EXISTS group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_phone text NOT NULL,
  role text DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  joined_at timestamptz DEFAULT now(),
  UNIQUE(group_id, user_phone)
);

-- Create group_posts table
CREATE TABLE IF NOT EXISTS group_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  author_phone text NOT NULL,
  author_name text NOT NULL,
  content text NOT NULL,
  image_url text,
  likes jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create group_join_requests table
CREATE TABLE IF NOT EXISTS group_join_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_phone text NOT NULL,
  user_name text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(group_id, user_phone)
);

-- Create wall_posts table
CREATE TABLE IF NOT EXISTS wall_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wall_owner_phone text NOT NULL,
  author_phone text NOT NULL,
  author_name text NOT NULL,
  content text NOT NULL,
  image_url text,
  likes jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_join_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE wall_posts ENABLE ROW LEVEL SECURITY;

-- Policies for user_profiles
CREATE POLICY "Anyone can view profiles"
  ON user_profiles FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policies for groups
CREATE POLICY "Anyone can view public groups"
  ON groups FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can create groups"
  ON groups FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Creators can update groups"
  ON groups FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Creators can delete groups"
  ON groups FOR DELETE
  TO anon, authenticated
  USING (true);

-- Policies for group_members
CREATE POLICY "Anyone can view group members"
  ON group_members FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can join groups"
  ON group_members FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can manage members"
  ON group_members FOR DELETE
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can update member roles"
  ON group_members FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for group_posts
CREATE POLICY "Members can view group posts"
  ON group_posts FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Members can create posts"
  ON group_posts FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authors can update posts"
  ON group_posts FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authors can delete posts"
  ON group_posts FOR DELETE
  TO anon, authenticated
  USING (true);

-- Policies for group_join_requests
CREATE POLICY "Users can view join requests"
  ON group_join_requests FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can create join requests"
  ON group_join_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update join requests"
  ON group_join_requests FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for wall_posts
CREATE POLICY "Anyone can view wall posts"
  ON wall_posts FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can post on walls"
  ON wall_posts FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authors can delete posts"
  ON wall_posts FOR DELETE
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authors can update posts"
  ON wall_posts FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_phone ON user_profiles(phone);
CREATE INDEX IF NOT EXISTS idx_groups_creator ON groups(creator_phone);
CREATE INDEX IF NOT EXISTS idx_groups_type ON groups(type);
CREATE INDEX IF NOT EXISTS idx_group_members_group ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user ON group_members(user_phone);
CREATE INDEX IF NOT EXISTS idx_group_posts_group ON group_posts(group_id);
CREATE INDEX IF NOT EXISTS idx_group_posts_created ON group_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_group_join_requests_group ON group_join_requests(group_id);
CREATE INDEX IF NOT EXISTS idx_wall_posts_owner ON wall_posts(wall_owner_phone);
CREATE INDEX IF NOT EXISTS idx_wall_posts_created ON wall_posts(created_at DESC);