/*
# Fix Election Data

1. Add דביר ברקת as candidate #21
2. Fix election_history: 2024 winner is עמית לסרי, remove 2025 entry
*/

INSERT INTO election_candidates (name, display_order) VALUES
  ('דביר ברקת', 21)
ON CONFLICT DO NOTHING;

DELETE FROM election_history WHERE year = 2025;

UPDATE election_history
SET winner_name = 'עמית לסרי',
    winner_points = 102,
    runner_up_name = 'יוסף קחלר',
    runner_up_points = 89,
    third_place_name = 'דביר אוחנה',
    third_place_points = 75,
    total_voters = 21
WHERE year = 2024;
