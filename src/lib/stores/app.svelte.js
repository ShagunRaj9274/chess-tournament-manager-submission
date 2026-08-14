import { openDatabase, resetDatabase } from '../db/database.js';
import { listPlayers } from '../repositories/players.js';
import { listTournaments } from '../repositories/tournaments.js';
import { countMatches } from '../repositories/matches.js';

/**
 * A thin reactive layer over the repositories. Components call an action, the
 * action writes to SQLite and then refreshes this snapshot, so the database
 * stays the single source of truth.
 */
export const app = $state({
  ready: false,
  error: null,
  players: [],
  tournaments: [],
  matchCount: 0
});

export const toast = $state({ message: '', tone: 'info', seq: 0 });

/** @param {string} message @param {'info'|'error'} [tone] */
export function notify(message, tone = 'info') {
  toast.message = message;
  toast.tone = tone;
  toast.seq += 1;
}

/** Reads the current contents of the database into `app`. */
export function refresh() {
  app.players = listPlayers();
  app.tournaments = listTournaments();
  app.matchCount = countMatches();
}

/** Opens the database once, on first paint. */
export async function boot() {
  if (app.ready) return;
  try {
    await openDatabase();
    refresh();
    app.ready = true;
  } catch (error) {
    console.error(error);
    app.error = error instanceof Error ? error.message : 'The database could not be opened.';
  }
}

export function resetDemoData() {
  resetDatabase();
  refresh();
  notify('Demo data restored.');
}
