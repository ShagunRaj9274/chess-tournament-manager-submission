import { all, run, transaction } from '../db/database.js';
import { drawRound } from '../domain/pairing.js';
import { listRoster, setStatus } from './tournaments.js';

/** Every match of a tournament, newest round first, with player names attached. */
export function listMatches(tournamentId) {
  return all(
    `SELECT m.*,
            w.name AS white_name, w.rating AS white_rating,
            b.name AS black_name, b.rating AS black_rating
     FROM matches m
     JOIN players w ON w.id = m.white_id
     LEFT JOIN players b ON b.id = m.black_id
     WHERE m.tournament_id = ?
     ORDER BY m.round DESC, m.board ASC`,
    [tournamentId]
  );
}

/** Matches grouped into rounds, ready to render. */
export function listRounds(tournamentId) {
  const rounds = new Map();
  for (const match of listMatches(tournamentId)) {
    if (!rounds.has(match.round)) rounds.set(match.round, []);
    rounds.get(match.round).push(match);
  }
  return [...rounds.entries()].map(([round, matches]) => ({ round, matches }));
}

export function countMatches() {
  return all('SELECT COUNT(*) AS total FROM matches')[0].total;
}

/**
 * Draws the next round, picks a winner for every board at random and stores the
 * results in one transaction.
 *
 * @param {number} tournamentId
 * @returns {number} the round number that was played
 */
export function playNextRound(tournamentId) {
  const roster = listRoster(tournamentId);
  if (roster.length < 2) throw new Error('Add at least two players before starting a round.');

  const previous = all('SELECT white_id, black_id, is_bye FROM matches WHERE tournament_id = ?', [
    tournamentId
  ]);
  const playedRounds =
    all('SELECT COALESCE(MAX(round), 0) AS last FROM matches WHERE tournament_id = ?', [
      tournamentId
    ])[0].last ?? 0;
  const round = playedRounds + 1;
  const boards = drawRound(roster, previous);

  transaction(() => {
    for (const board of boards) {
      run(
        `INSERT INTO matches (tournament_id, round, board, white_id, black_id, winner_id, is_bye)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [tournamentId, round, board.board, board.whiteId, board.blackId, board.winnerId, board.isBye ? 1 : 0]
      );
    }
    setStatus(tournamentId, 'in_progress');
  });

  return round;
}

/** Clears every result so a tournament can be drawn again from scratch. */
export function resetTournamentMatches(tournamentId) {
  transaction(() => {
    run('DELETE FROM matches WHERE tournament_id = ?', [tournamentId]);
    setStatus(tournamentId, 'draft');
  });
}
