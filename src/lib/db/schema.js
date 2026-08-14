/**
 * Database schema. Every statement is idempotent so it can run on each start-up
 * and double as a lightweight migration for existing browsers.
 */
export const SCHEMA = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS players (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT    NOT NULL,
  email      TEXT,
  country    TEXT,
  rating     INTEGER NOT NULL DEFAULT 1200,
  created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tournaments (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  name         TEXT    NOT NULL,
  venue        TEXT,
  start_date   TEXT,
  total_rounds INTEGER NOT NULL DEFAULT 3,
  status       TEXT    NOT NULL DEFAULT 'draft'
               CHECK (status IN ('draft', 'in_progress', 'completed')),
  created_at   TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tournament_players (
  tournament_id INTEGER NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  player_id     INTEGER NOT NULL REFERENCES players(id)     ON DELETE CASCADE,
  registered_at TEXT    NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (tournament_id, player_id)
);

CREATE TABLE IF NOT EXISTS matches (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  tournament_id INTEGER NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  round         INTEGER NOT NULL,
  board         INTEGER NOT NULL,
  white_id      INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  black_id      INTEGER          REFERENCES players(id) ON DELETE CASCADE,
  winner_id     INTEGER          REFERENCES players(id) ON DELETE CASCADE,
  is_bye        INTEGER NOT NULL DEFAULT 0,
  played_at     TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_matches_tournament ON matches (tournament_id, round);
CREATE INDEX IF NOT EXISTS idx_roster_tournament  ON tournament_players (tournament_id);
`;
