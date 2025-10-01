/*
  # Update ChromaVerse Schema for Hevre's Empire

  ## Overview
  Updates the existing game schema to support geopolitical strategy mechanics
  including nation management, diplomacy, warfare, and territorial control.

  ## Modifications

  ### 1. Update `game_saves` table
  Adds new fields for geopolitical game state:
  - `selected_nation` (text) - Player's chosen nation
  - `turn_year` (integer) - Current game year (2025-2035)
  - `turn_month` (integer) - Current month (1-12)
  - `territories_controlled` (jsonb) - Conquered territories
  - `diplomatic_relations` (jsonb) - Relations with other nations
  - `military_units` (jsonb) - Military force composition
  - `ongoing_wars` (jsonb) - Active conflicts
  - `internal_support` (integer) - Domestic approval rating
  
  ## Important Notes
  1. Maintains backward compatibility with existing saves
  2. All new fields have sensible defaults
  3. JSONB fields enable flexible game state storage
  4. Turn system tracks both year and month for realism
*/

-- Add new columns to game_saves table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'game_saves' AND column_name = 'selected_nation'
  ) THEN
    ALTER TABLE game_saves ADD COLUMN selected_nation text DEFAULT 'LasriLand';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'game_saves' AND column_name = 'turn_year'
  ) THEN
    ALTER TABLE game_saves ADD COLUMN turn_year integer DEFAULT 2025;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'game_saves' AND column_name = 'turn_month'
  ) THEN
    ALTER TABLE game_saves ADD COLUMN turn_month integer DEFAULT 1;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'game_saves' AND column_name = 'territories_controlled'
  ) THEN
    ALTER TABLE game_saves ADD COLUMN territories_controlled jsonb DEFAULT '[]'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'game_saves' AND column_name = 'diplomatic_relations'
  ) THEN
    ALTER TABLE game_saves ADD COLUMN diplomatic_relations jsonb DEFAULT '{}'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'game_saves' AND column_name = 'military_units'
  ) THEN
    ALTER TABLE game_saves ADD COLUMN military_units jsonb DEFAULT '{}'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'game_saves' AND column_name = 'ongoing_wars'
  ) THEN
    ALTER TABLE game_saves ADD COLUMN ongoing_wars jsonb DEFAULT '[]'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'game_saves' AND column_name = 'internal_support'
  ) THEN
    ALTER TABLE game_saves ADD COLUMN internal_support integer DEFAULT 75;
  END IF;
END $$;

-- Update leaderboard for geopolitical metrics
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leaderboard' AND column_name = 'territory_percentage'
  ) THEN
    ALTER TABLE leaderboard ADD COLUMN territory_percentage numeric DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leaderboard' AND column_name = 'wars_won'
  ) THEN
    ALTER TABLE leaderboard ADD COLUMN wars_won integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leaderboard' AND column_name = 'nations_conquered'
  ) THEN
    ALTER TABLE leaderboard ADD COLUMN nations_conquered integer DEFAULT 0;
  END IF;
END $$;
