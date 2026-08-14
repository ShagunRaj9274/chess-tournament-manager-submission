/**
 * Sample data, inserted once when a browser opens the app for the first time so
 * the demo has something to show. "Reset demo data" restores exactly this.
 */
export const SEED = `
INSERT INTO players (name, email, country, rating) VALUES
  ('Aditi Rao',      'aditi.rao@example.com',   'India',   2140),
  ('Marcus Feld',    'marcus.feld@example.com', 'Germany', 2065),
  ('Lena Petrova',   'lena.p@example.com',      'Estonia', 1988),
  ('Kwame Osei',     'kwame.osei@example.com',  'Ghana',   1930),
  ('Sofia Marino',   'sofia.marino@example.com','Italy',   1875),
  ('Hiroshi Tanaka', 'h.tanaka@example.com',    'Japan',   1812),
  ('Nora Haddad',    'nora.haddad@example.com', 'Morocco', 1764),
  ('Diego Salas',    'diego.salas@example.com', 'Chile',   1690);

INSERT INTO tournaments (name, venue, start_date, total_rounds, status) VALUES
  ('Patna Open 2026', 'Gandhi Maidan Chess Hall', date('now'), 3, 'draft');

INSERT INTO tournament_players (tournament_id, player_id)
  SELECT 1, id FROM players;
`;
