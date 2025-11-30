/*
  # Fix AI Requests Table and RLS

  1. Changes
    - Ensure ai_requests table exists with correct structure
    - Fix RLS policies for public access

  2. Security
    - Allow all operations for testing
*/

-- Create table if not exists
CREATE TABLE IF NOT EXISTS ai_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_phone text NOT NULL,
  character_name text NOT NULL,
  prompt text NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE ai_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow all ai_requests operations" ON ai_requests;

-- Create permissive policy
CREATE POLICY "Allow all ai_requests operations"
  ON ai_requests FOR ALL
  USING (true)
  WITH CHECK (true);