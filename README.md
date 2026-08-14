# Arbiter — Chess Tournament Management System

A tournament desk in the browser: register players, open a tournament, enter the field, draw
random pairings round by round, and publish the podium.

**Live demo:** _add your deployment URL here_

Built with **Svelte 5 + SvelteKit + JavaScript**, storing everything in a real **SQLite** database
that runs in the browser through WebAssembly.

---

## Features

**Player management (CRUD)**
Create, read, update and delete players with name, email, country and rating. The register shows
how many tournaments each player has entered and how many games they have won. Deleting a player
cascades to their entries and results.

**Tournament management (CRUD)**
Create, read, update and delete tournaments with a venue, start date and a number of rounds. Each
tournament keeps its own entry list, drawn from the player register — add players one at a time or
enter the whole field at once.

**Random match system**
One click draws a round: the field is shuffled with Fisher–Yates, split into boards, colours are
decided by a coin toss, and a winner is picked at random for every board. Results are written to the
database in a single transaction. Two rules sit on top of the randomness so the tournament still
behaves like a tournament — the draw retries to avoid repeating a pairing that has already been
played, and on an odd field the bye goes to somebody who has not had one yet.

**Rankings**
A live cross-table ranks the field by points (a win or a bye is worth one), breaking ties by fewer
byes, then rating, then name. Finishing a tournament locks the standings and publishes the top
three on a podium, which also appears on the dashboard.

---

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | SvelteKit 2 with Svelte 5 (runes) |
| Language | JavaScript |
| Database | SQLite via `sql.js` (WebAssembly), snapshotted to `localStorage` |
| Build | Vite, `@sveltejs/adapter-static` |

There is no backend. The SQLite file lives in the browser, so the whole app deploys as static files
and the demo works without any server or account.

---

## Run it locally

Requires Node.js 20 or newer.

```bash
npm install
npm run dev      # http://localhost:5173
```

```bash
npm run build    # static site in ./build
npm run preview  # serve the production build
```

`npm run dev` and `npm run build` both run `scripts/copy-sql-wasm.js` first, which copies the SQLite
WebAssembly binary out of `node_modules` into `static/`. The binary is generated, so it is listed in
`.gitignore` rather than committed.

---

## Deploy

The build output is a static single page app in `build/`.

- **Vercel** — import the repository. `vercel.json` sets the build command, output directory and the
  SPA rewrite.
- **Netlify** — import the repository. `netlify.toml` and `static/_redirects` do the same.
- **GitHub Pages** — set `paths.base` in `svelte.config.js` to `/<repository-name>`, then publish
  `build/` (copy `index.html` to `404.html` so deep links resolve).

---

## How it is put together

```
src/
├── lib/
│   ├── db/
│   │   ├── schema.js        SQL schema, written to be safe to re-run
│   │   ├── seed.js          sample players and a tournament for first-time visitors
│   │   └── database.js      connection, query helpers, transactions, persistence
│   ├── repositories/        every SQL statement in the app
│   │   ├── players.js       player CRUD
│   │   ├── tournaments.js   tournament CRUD, entry lists, standings
│   │   └── matches.js       rounds, results, reset
│   ├── domain/
│   │   └── pairing.js       the random draw — shuffle, colours, byes, results
│   ├── stores/
│   │   └── app.svelte.js    reactive snapshot of the database, built on runes
│   ├── components/          modal, pairing sheet, standings, podium, toast, empty state
│   └── styles/app.css       design tokens and shared element styles
└── routes/
    ├── +layout.svelte       navigation rail, database boot
    ├── +page.svelte         dashboard
    ├── players/             player register
    └── tournaments/
        ├── +page.svelte     tournament list
        └── [id]/            entry list, round control, pairings, standings, podium
```

Components never touch the database directly. They call a repository, the repository runs SQL, and
the reactive snapshot in `app.svelte.js` is refreshed from the database afterwards — so the database
stays the single source of truth rather than a copy of component state.

### Database schema

```
players            id, name, email, country, rating, created_at
tournaments        id, name, venue, start_date, total_rounds, status, created_at
tournament_players tournament_id, player_id            (composite key, cascades)
matches            id, tournament_id, round, board, white_id, black_id,
                   winner_id, is_bye, played_at
```

A bye is stored as a match with no `black_id`, `is_bye = 1` and the sitting player as the winner, so
one query computes the standings across games and byes alike.

### Two details worth knowing

`sql.js` closes and reopens the connection inside `export()`. That means a snapshot taken mid
transaction would discard it, and every reopen resets connection pragmas. Both are handled in
`database.js`: snapshots are deferred until the outermost transaction commits, and
`PRAGMA foreign_keys = ON` is reapplied after each export so the cascading deletes keep working.

---

## Data and privacy

Everything is stored in your own browser under the key `chess-tournament-manager:db:v1`. Nothing is
uploaded anywhere. "Reset demo data" in the sidebar restores the original sample tournament.
