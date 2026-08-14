import { all, one, run } from '../db/database.js';

export function listTournaments() {
  return all(`
    SELECT t.*,
           (SELECT COUNT(*) FROM tournament_players tp WHERE tp.tournament_id = t.id) AS player_count,
           (SELECT COALESCE(MAX(m.round), 0) FROM matches m WHERE m.tournament_id = t.id) AS rounds_played
    FROM tournaments t
    ORDER BY t.created_at DESC, t.id DESC
  `);
}

export function getTournament(id) {
  return one(
    `SELECT t.*,
            (SELECT COUNT(*) FROM tournament_players tp WHERE tp.tournament_id = t.id) AS player_count,
            (SELECT COALESCE(MAX(m.round), 0) FROM matches m WHERE m.tournament_id = t.id) AS rounds_played
     FROM tournaments t WHERE t.id = ?`,
    [id]
  );
}

/**
 * @param {{ name: string, venue?: string, start_date?: string, total_rounds?: number }} input
 * @returns {number} the new tournament id
 */
export function createTournament(input) {
  const { lastInsertId } = run(
    'INSERT INTO tournaments (name, venue, start_date, total_rounds) VALUES (?, ?, ?, ?)',
    [
      input.name.trim(),
      input.venue?.trim() || null,
      input.start_date || null,
      Math.max(1, Number(input.total_rounds) || 3)
    ]
  );
  return lastInsertId;
}

export function updateTournament(id, input) {
  run('UPDATE tournaments SET name = ?, venue = ?, start_date = ?, total_rounds = ? WHERE id = ?', [
    input.name.trim(),
    input.venue?.trim() || null,
    input.start_date || null,
    Math.max(1, Number(input.total_rounds) || 3),
    id
  ]);
}

export function deleteTournament(id) {
  run('DELETE FROM tournaments WHERE id = ?', [id]);
}

export function setStatus(id, status) {
  run('UPDATE tournaments SET status = ? WHERE id = ?', [status, id]);
}

/** Players entered in a tournament. */
export function listRoster(tournamentId) {
  return all(
    `SELECT p.* FROM tournament_players tp
     JOIN players p ON p.id = tp.player_id
     WHERE tp.tournament_id = ?
     ORDER BY p.rating DESC, p.name ASC`,
    [tournamentId]
  );
}

/** Players who exist but are not entered in this tournament yet. */
export function listAvailablePlayers(tournamentId) {
  return all(
    `SELECT * FROM players
     WHERE id NOT IN (SELECT player_id FROM tournament_players WHERE tournament_id = ?)
     ORDER BY rating DESC, name ASC`,
    [tournamentId]
  );
}

export function addPlayerToTournament(tournamentId, playerId) {
  run('INSERT OR IGNORE INTO tournament_players (tournament_id, player_id) VALUES (?, ?)', [
    tournamentId,
    playerId
  ]);
}

export function removePlayerFromTournament(tournamentId, playerId) {
  run('DELETE FROM tournament_players WHERE tournament_id = ? AND player_id = ?', [
    tournamentId,
    playerId
  ]);
}

/**
 * Final table. A win and a bye are both worth one point; ties are broken by
 * fewer byes, then rating, then name, so the order is always deterministic.
 */
export function getStandings(tournamentId) {
  return all(
    `SELECT p.id, p.name, p.rating, p.country,
            SUM(CASE WHEN m.winner_id = p.id THEN 1 ELSE 0 END) AS points,
            SUM(CASE WHEN m.is_bye = 1 AND m.white_id = p.id THEN 1 ELSE 0 END) AS byes,
            SUM(CASE WHEN m.id IS NOT NULL AND m.is_bye = 0 THEN 1 ELSE 0 END) AS played,
            SUM(CASE WHEN m.is_bye = 0 AND m.winner_id IS NOT NULL AND m.winner_id <> p.id
                     THEN 1 ELSE 0 END) AS losses
     FROM tournament_players tp
     JOIN players p ON p.id = tp.player_id
     LEFT JOIN matches m ON m.tournament_id = tp.tournament_id
                        AND (m.white_id = p.id OR m.black_id = p.id)
     WHERE tp.tournament_id = ?
     GROUP BY p.id
     ORDER BY points DESC, byes ASC, p.rating DESC, p.name ASC`,
    [tournamentId]
  );
}

/** The podium of a finished tournament, used on the dashboard. */
export function getPodium(tournamentId) {
  return getStandings(tournamentId).slice(0, 3);
}
