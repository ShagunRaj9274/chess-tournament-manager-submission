import { all, one, run } from '../db/database.js';

/** Every player, strongest first. */
export function listPlayers() {
  return all(`
    SELECT p.*,
           (SELECT COUNT(*) FROM tournament_players tp WHERE tp.player_id = p.id) AS tournaments_entered,
           (SELECT COUNT(*) FROM matches m WHERE m.winner_id = p.id) AS wins
    FROM players p
    ORDER BY p.rating DESC, p.name ASC
  `);
}

export function getPlayer(id) {
  return one('SELECT * FROM players WHERE id = ?', [id]);
}

/**
 * @param {{ name: string, email?: string, country?: string, rating?: number }} input
 * @returns {number} the new player id
 */
export function createPlayer(input) {
  const { lastInsertId } = run(
    'INSERT INTO players (name, email, country, rating) VALUES (?, ?, ?, ?)',
    [input.name.trim(), input.email?.trim() || null, input.country?.trim() || null, Number(input.rating) || 1200]
  );
  return lastInsertId;
}

export function updatePlayer(id, input) {
  run('UPDATE players SET name = ?, email = ?, country = ?, rating = ? WHERE id = ?', [
    input.name.trim(),
    input.email?.trim() || null,
    input.country?.trim() || null,
    Number(input.rating) || 1200,
    id
  ]);
}

/** Removes a player; rosters and matches referencing them cascade away. */
export function deletePlayer(id) {
  run('DELETE FROM players WHERE id = ?', [id]);
}
