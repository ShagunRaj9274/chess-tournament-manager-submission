/**
 * Random pairing engine.
 *
 * A round is built by shuffling the roster, splitting it into boards and
 * tossing a coin for colours and for the result. The one piece of judgement
 * layered on top of pure chance: the shuffle is retried a few times to avoid
 * repeating a pairing that has already been played, and the bye goes to
 * somebody who has not had one yet.
 */

/** Fisher–Yates shuffle on a copy of the list. */
export function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function coinFlip() {
  return Math.random() < 0.5;
}

const pairKey = (a, b) => [a, b].sort((x, y) => x - y).join('-');

/** How many pairings in a candidate round have already been played. */
function repeatCount(boards, history) {
  return boards.filter((board) => board.blackId && history.has(pairKey(board.whiteId, board.blackId)))
    .length;
}

function buildBoards(players) {
  const boards = [];
  for (let i = 0; i < players.length; i += 2) {
    const whiteFirst = coinFlip();
    const [white, black] = whiteFirst
      ? [players[i], players[i + 1]]
      : [players[i + 1], players[i]];
    boards.push({ whiteId: white.id, blackId: black.id, isBye: false });
  }
  return boards;
}

/**
 * Draws one round.
 *
 * @param {Array<{ id: number }>} roster players entered in the tournament
 * @param {Array<{ white_id: number, black_id: number|null, is_bye: number }>} previousMatches
 * @returns {Array<{ board: number, whiteId: number, blackId: number|null, winnerId: number, isBye: boolean }>}
 */
export function drawRound(roster, previousMatches = []) {
  if (roster.length < 2) {
    throw new Error('A round needs at least two players.');
  }

  const history = new Set(
    previousMatches
      .filter((m) => !m.is_bye && m.black_id)
      .map((m) => pairKey(m.white_id, m.black_id))
  );

  const byeCounts = new Map(roster.map((p) => [p.id, 0]));
  for (const match of previousMatches) {
    if (match.is_bye) byeCounts.set(match.white_id, (byeCounts.get(match.white_id) ?? 0) + 1);
  }

  let best = null;
  for (let attempt = 0; attempt < 60; attempt += 1) {
    let pool = shuffle(roster);
    let byePlayer = null;

    if (pool.length % 2 === 1) {
      // Give the bye to a player with the fewest so far, chosen at random
      // among the tied candidates.
      const fewest = Math.min(...pool.map((p) => byeCounts.get(p.id) ?? 0));
      const candidates = pool.filter((p) => (byeCounts.get(p.id) ?? 0) === fewest);
      byePlayer = candidates[Math.floor(Math.random() * candidates.length)];
      pool = pool.filter((p) => p.id !== byePlayer.id);
    }

    const boards = buildBoards(pool);
    const repeats = repeatCount(boards, history);
    if (!best || repeats < best.repeats) best = { boards, byePlayer, repeats };
    if (repeats === 0) break;
  }

  const round = best.boards.map((board, index) => ({
    board: index + 1,
    whiteId: board.whiteId,
    blackId: board.blackId,
    isBye: false,
    winnerId: coinFlip() ? board.whiteId : board.blackId
  }));

  if (best.byePlayer) {
    round.push({
      board: round.length + 1,
      whiteId: best.byePlayer.id,
      blackId: null,
      isBye: true,
      winnerId: best.byePlayer.id
    });
  }

  return round;
}
