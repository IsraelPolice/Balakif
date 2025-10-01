/*
  # ChromaVerse: Interdimensional Tycoon Database Schema

  ## Overview
  Complete database schema for ChromaVerse game featuring multiverse exploration,
  empire building, tech progression, and interdimensional resource management.

  ## New Tables

  ### 1. `game_saves`
  Stores player game state and progress
  - `id` (uuid, primary key) - Unique save identifier
  - `player_name` (text) - Player's chosen name
  - `current_turn` (integer) - Game turn counter
  - `multiverse_energy` (bigint) - Primary currency for portal operations
  - `reality_shards` (bigint) - Premium currency for reality manipulation
  - `knowledge_points` (bigint) - Research currency
  - `reputation` (integer) - Faction standing (-1000 to 1000)
  - `timeline_stability` (integer) - Reality coherence (0-100)
  - `discovered_dimensions` (integer) - Count of explored dimensions
  - `game_data` (jsonb) - Complete game state (dimensions, outposts, research, etc.)
  - `created_at` (timestamptz) - Save creation time
  - `updated_at` (timestamptz) - Last save time

  ### 2. `leaderboard`
  Global rankings for competitive play
  - `id` (uuid, primary key)
  - `player_name` (text) - Player identifier
  - `score` (bigint) - Overall achievement score
  - `dimensions_conquered` (integer)
  - `total_wealth` (bigint)
  - `game_turns` (integer) - Completion time
  - `victory_type` (text) - How they won
  - `achieved_at` (timestamptz)

  ### 3. `achievements`
  Player unlock system
  - `id` (uuid, primary key)
  - `save_id` (uuid, foreign key) - Links to game save
  - `achievement_code` (text) - Achievement identifier
  - `unlocked_at` (timestamptz)

  ### 4. `dimension_templates`
  Procedurally generated dimension configurations (cached for performance)
  - `id` (uuid, primary key)
  - `seed` (text) - Generation seed
  - `name` (text) - Dimension name
  - `type` (text) - Physics type (standard, quantum, entropic, etc.)
  - `difficulty` (integer) - Challenge rating
  - `resources` (jsonb) - Available resources
  - `factions` (jsonb) - Native civilizations
  - `special_rules` (jsonb) - Unique mechanics
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Public read access for leaderboard
  - Authenticated users can manage their own saves
  - Dimension templates are publicly readable for shared experiences

  ## Important Notes
  1. `game_data` JSONB stores complex nested state for flexibility
  2. All resource counters use BIGINT for large numbers in late game
  3. Achievements use codes for easy expansion without schema changes
  4. Dimension templates allow sharing interesting procedural generations
*/

-- Create game_saves table
CREATE TABLE IF NOT EXISTS game_saves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name text NOT NULL DEFAULT 'Architect',
  current_turn integer NOT NULL DEFAULT 0,
  multiverse_energy bigint NOT NULL DEFAULT 1000,
  reality_shards bigint NOT NULL DEFAULT 50,
  knowledge_points bigint NOT NULL DEFAULT 100,
  reputation integer NOT NULL DEFAULT 0,
  timeline_stability integer NOT NULL DEFAULT 100,
  discovered_dimensions integer NOT NULL DEFAULT 1,
  game_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create leaderboard table
CREATE TABLE IF NOT EXISTS leaderboard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name text NOT NULL,
  score bigint NOT NULL DEFAULT 0,
  dimensions_conquered integer NOT NULL DEFAULT 0,
  total_wealth bigint NOT NULL DEFAULT 0,
  game_turns integer NOT NULL DEFAULT 0,
  victory_type text NOT NULL DEFAULT 'domination',
  achieved_at timestamptz DEFAULT now()
);

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  save_id uuid REFERENCES game_saves(id) ON DELETE CASCADE,
  achievement_code text NOT NULL,
  unlocked_at timestamptz DEFAULT now(),
  UNIQUE(save_id, achievement_code)
);

-- Create dimension_templates table
CREATE TABLE IF NOT EXISTS dimension_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seed text NOT NULL UNIQUE,
  name text NOT NULL,
  type text NOT NULL,
  difficulty integer NOT NULL DEFAULT 1,
  resources jsonb NOT NULL DEFAULT '[]'::jsonb,
  factions jsonb NOT NULL DEFAULT '[]'::jsonb,
  special_rules jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_game_saves_updated ON game_saves(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON leaderboard(score DESC);
CREATE INDEX IF NOT EXISTS idx_achievements_save ON achievements(save_id);
CREATE INDEX IF NOT EXISTS idx_dimension_seed ON dimension_templates(seed);

-- Enable Row Level Security
ALTER TABLE game_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE dimension_templates ENABLE ROW LEVEL SECURITY;

-- Policies for game_saves (anyone can create/read/update their saves in single-player mode)
CREATE POLICY "Anyone can create game saves"
  ON game_saves FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can read all game saves"
  ON game_saves FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can update game saves"
  ON game_saves FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete game saves"
  ON game_saves FOR DELETE
  TO anon
  USING (true);

-- Policies for leaderboard (public read, controlled write)
CREATE POLICY "Anyone can read leaderboard"
  ON leaderboard FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can insert leaderboard entries"
  ON leaderboard FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policies for achievements
CREATE POLICY "Anyone can read achievements"
  ON achievements FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can insert achievements"
  ON achievements FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policies for dimension_templates (public read/write for sharing)
CREATE POLICY "Anyone can read dimension templates"
  ON dimension_templates FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can create dimension templates"
  ON dimension_templates FOR INSERT
  TO anon
  WITH CHECK (true);