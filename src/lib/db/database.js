import initSqlJs from 'sql.js/dist/sql-wasm-browser.js';
import { base } from '$app/paths';
import { SCHEMA } from './schema.js';
import { SEED } from './seed.js';

const STORAGE_KEY = 'chess-tournament-manager:db:v1';

/** @type {import('sql.js').Database | null} */
let db = null;
/** @type {Promise<import('sql.js').Database> | null} */
let opening = null;

/** Turns the in-memory database into a string localStorage can hold. */
function encode(bytes) {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function decode(text) {
  const binary = atob(text);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/**
 * Opens the SQLite database, restoring the previous session from localStorage
 * when one exists. Safe to call from anywhere: the same connection is reused.
 * @returns {Promise<import('sql.js').Database>}
 */
export function openDatabase() {
  if (db) return Promise.resolve(db);
  if (opening) return opening;

  opening = (async () => {
    const SQL = await initSqlJs({ locateFile: () => `${base}/sql-wasm.wasm` });

    const saved = localStorage.getItem(STORAGE_KEY);
    let restored = false;
    if (saved) {
      try {
        db = new SQL.Database(decode(saved));
        restored = true;
      } catch {
        // A corrupt snapshot should never block the app: start clean instead.
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    if (!db) db = new SQL.Database();

    db.run(SCHEMA);
    if (!restored) {
      db.run(SEED);
      save();
    }
    return db;
  })();

  return opening;
}

// `export()` closes and reopens the connection internally, which would discard
// an open transaction, so snapshots are deferred until the transaction ends.
let txDepth = 0;

function persist() {
  const snapshot = db.export();
  // The reopen inside `export()` resets connection pragmas, so foreign keys —
  // and the cascading deletes that depend on them — have to be switched on again.
  db.run('PRAGMA foreign_keys = ON');
  localStorage.setItem(STORAGE_KEY, encode(snapshot));
}

/** Writes the current database back to localStorage. */
export function save() {
  if (!db || txDepth > 0) return;
  persist();
}

/**
 * Runs a SELECT and returns plain objects.
 * @param {string} sql
 * @param {Array<string|number|null>} [params]
 * @returns {Array<Record<string, any>>}
 */
export function all(sql, params = []) {
  const statement = db.prepare(sql);
  statement.bind(params);
  const rows = [];
  while (statement.step()) rows.push(statement.getAsObject());
  statement.free();
  return rows;
}

/**
 * Runs a SELECT expected to match at most one row.
 * @returns {Record<string, any> | null}
 */
export function one(sql, params = []) {
  return all(sql, params)[0] ?? null;
}

/**
 * Runs an INSERT/UPDATE/DELETE and persists the result.
 * @returns {{ lastInsertId: number, changes: number }}
 */
export function run(sql, params = []) {
  db.run(sql, params);
  const lastInsertId = db.exec('SELECT last_insert_rowid() AS id')[0]?.values[0][0] ?? 0;
  const changes = db.getRowsModified();
  save();
  return { lastInsertId, changes };
}

/**
 * Runs several writes as one unit, so a failed draw cannot leave half a round
 * behind. Nesting is safe: only the outermost call opens the transaction.
 */
export function transaction(work) {
  const outermost = txDepth === 0;
  if (outermost) db.run('BEGIN TRANSACTION');
  txDepth += 1;

  try {
    const result = work();
    txDepth -= 1;
    if (outermost) {
      db.run('COMMIT');
      persist();
    }
    return result;
  } catch (error) {
    txDepth -= 1;
    if (outermost) {
      // A rollback failure must not hide the error that caused it.
      try {
        db.run('ROLLBACK');
      } catch (rollbackError) {
        console.error('Rollback failed', rollbackError);
      }
    }
    throw error;
  }
}

/** Wipes the database and reloads the sample data. */
export function resetDatabase() {
  db.run('PRAGMA foreign_keys = OFF');
  for (const table of ['matches', 'tournament_players', 'tournaments', 'players']) {
    db.run(`DROP TABLE IF EXISTS ${table}`);
  }
  db.run(SCHEMA);
  db.run(SEED);
  save();
}
