CREATE TABLE IF NOT EXISTS leaderboard (
  id SERIAL PRIMARY KEY,
  player_name VARCHAR(40) NOT NULL,
  character_name VARCHAR(32) NOT NULL,
  stage_name VARCHAR(80) NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 9999999),
  max_combo INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_score
  ON leaderboard (score DESC, created_at ASC);
