#!/usr/bin/env bash
#
# Creates the commit history for this project: nine commits, each one a
# self-contained layer, with messages in the Angular convention.
#
#   ./setup-git-history.sh
#
# Run it once, in a clean copy of the project, before pushing. Commits are made
# with whatever name and email `git config` gives you, so set those first:
#
#   git config --global user.name  "Your Name"
#   git config --global user.email "you@example.com"

set -euo pipefail

if [ -d .git ]; then
  echo "This directory already has a .git folder. Remove it first if you want to start over."
  exit 1
fi

git init -q
git checkout -q -b main

commit() {
  local message="$1"
  shift
  git add -- "$@"
  git commit -q -m "$message"
  echo "  ✔ $message"
}

echo "Building history:"

commit "chore: scaffold SvelteKit app with static adapter and SQLite wasm setup" \
  package.json package-lock.json svelte.config.js vite.config.js jsconfig.json \
  .gitignore src/app.html static/favicon.svg static/_redirects \
  scripts/copy-sql-wasm.js vercel.json netlify.toml

commit "feat(db): add SQLite schema, seed data and browser persistence" \
  src/lib/db/schema.js src/lib/db/seed.js src/lib/db/database.js

commit "feat(data): add repositories and the random pairing engine" \
  src/lib/domain/pairing.js src/lib/repositories/players.js \
  src/lib/repositories/tournaments.js src/lib/repositories/matches.js

commit "feat(ui): add tournament-hall design system and app shell" \
  src/lib/styles/app.css src/lib/stores/app.svelte.js \
  src/lib/components/Modal.svelte src/lib/components/Toast.svelte \
  src/lib/components/EmptyState.svelte src/lib/components/StatusBadge.svelte \
  src/routes/+layout.js src/routes/+layout.svelte

commit "feat(players): add player register with create, edit and delete" \
  src/routes/players/+page.svelte

commit "feat(tournaments): manage tournaments and their entry lists" \
  src/routes/tournaments/+page.svelte

commit "feat(rounds): draw random rounds and show pairings, standings and podium" \
  src/lib/components/PairingSheet.svelte src/lib/components/StandingsTable.svelte \
  src/lib/components/Podium.svelte "src/routes/tournaments/[id]/+page.svelte"

commit "feat(dashboard): add overview with tournament focus and latest podium" \
  src/routes/+page.svelte

commit "docs: add README with setup, architecture and deployment guide" \
  README.md setup-git-history.sh

echo
echo "Done. Review with: git log --oneline"
echo "Then push:"
echo "  git remote add origin https://github.com/<you>/<repo>.git"
echo "  git push -u origin main"
