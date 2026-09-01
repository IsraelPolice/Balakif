-- Allow 'full' as a valid voting_stage value
ALTER TABLE election_status DROP CONSTRAINT IF EXISTS election_status_voting_stage_check;
ALTER TABLE election_status ADD CONSTRAINT election_status_voting_stage_check
  CHECK (voting_stage = ANY (ARRAY['closed'::text, 'top1_5'::text, 'top5_10'::text, 'full'::text]));
