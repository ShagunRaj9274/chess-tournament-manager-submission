<script>
  import { base } from '$app/paths';
  import { page } from '$app/state';
  import { notify, refresh } from '$lib/stores/app.svelte.js';
  import {
    addPlayerToTournament,
    getStandings,
    getTournament,
    listAvailablePlayers,
    listRoster,
    removePlayerFromTournament,
    setStatus
  } from '$lib/repositories/tournaments.js';
  import { listRounds, playNextRound, resetTournamentMatches } from '$lib/repositories/matches.js';
  import PairingSheet from '$lib/components/PairingSheet.svelte';
  import StandingsTable from '$lib/components/StandingsTable.svelte';
  import Podium from '$lib/components/Podium.svelte';
  import StatusBadge from '$lib/components/StatusBadge.svelte';
  import EmptyState from '$lib/components/EmptyState.svelte';

  let tournamentId = $derived(Number(page.params.id));

  let tournament = $state(null);
  let roster = $state([]);
  let available = $state([]);
  let rounds = $state([]);
  let standings = $state([]);
  let selectedPlayer = $state('');
  let missing = $state(false);

  function load() {
    const found = getTournament(tournamentId);
    if (!found) {
      missing = true;
      return;
    }
    missing = false;
    tournament = found;
    roster = listRoster(tournamentId);
    available = listAvailablePlayers(tournamentId);
    rounds = listRounds(tournamentId);
    standings = getStandings(tournamentId);
    selectedPlayer = '';
  }

  $effect(() => {
    if (Number.isFinite(tournamentId)) load();
  });

  let roundsLeft = $derived(tournament ? tournament.total_rounds - tournament.rounds_played : 0);
  let canPlay = $derived(
    Boolean(tournament) && roster.length >= 2 && roundsLeft > 0 && tournament.status !== 'completed'
  );

  function enter(playerId) {
    addPlayerToTournament(tournamentId, Number(playerId));
    load();
    refresh();
  }

  function withdraw(player) {
    removePlayerFromTournament(tournamentId, player.id);
    load();
    refresh();
    notify(`${player.name} withdrawn.`);
  }

  function enterEveryone() {
    for (const player of available) addPlayerToTournament(tournamentId, player.id);
    load();
    refresh();
    notify('All registered players entered.');
  }

  function playRound() {
    try {
      const round = playNextRound(tournamentId);
      load();
      refresh();
      notify(`Round ${round} drawn and played.`);
    } catch (error) {
      notify(error.message, 'error');
    }
  }

  function finish() {
    setStatus(tournamentId, 'completed');
    load();
    refresh();
    notify('Final standings locked in.');
  }

  function reopen() {
    setStatus(tournamentId, 'in_progress');
    load();
    refresh();
  }

  function clearResults() {
    if (!confirm('Delete every round played so far?')) return;
    resetTournamentMatches(tournamentId);
    load();
    refresh();
    notify('Results cleared.');
  }
</script>

{#if missing}
  <EmptyState headline="That tournament is not here" hint="It may have been deleted.">
    <a class="btn btn--small" href="{base}/tournaments">Back to tournaments</a>
  </EmptyState>
{:else if tournament}
  <div class="stack">
    <header>
      <a class="back mono" href="{base}/tournaments">&larr; Tournaments</a>
      <div class="spread title-row">
        <div>
          <h1>{tournament.name}</h1>
          <p class="muted meta">
            {tournament.venue ?? 'Venue not set'} · {tournament.start_date ?? 'Date not set'} ·
            {tournament.total_rounds} rounds
          </p>
        </div>
        <StatusBadge status={tournament.status} />
      </div>
    </header>

    {#if tournament.status === 'completed' && standings.length >= 3}
      <section class="panel panel--flush winner">
        <div class="panel-head">
          <h2>Final result</h2>
          <span class="mono muted">{tournament.rounds_played} rounds played</span>
        </div>
        <Podium {standings} />
        <p class="champion">
          <strong>{standings[0].name}</strong> wins {tournament.name} with
          {standings[0].points} of {tournament.rounds_played}.
        </p>
      </section>
    {/if}

    <section class="control">
      <div>
        <span class="eyebrow">Round control</span>
        <p class="control-line">
          {#if tournament.status === 'completed'}
            The tournament is closed. Reopen it to keep pairing.
          {:else if roster.length < 2}
            Enter at least two players before drawing a round.
          {:else if roundsLeft <= 0}
            All {tournament.total_rounds} rounds have been played.
          {:else}
            Round {tournament.rounds_played + 1} of {tournament.total_rounds} is next.
            {roster.length} players, {Math.floor(roster.length / 2)} boards{roster.length % 2 === 1
              ? ' and one bye'
              : ''}.
          {/if}
        </p>
      </div>
      <div class="row">
        {#if tournament.status === 'completed'}
          <button class="btn" onclick={reopen}>Reopen tournament</button>
        {:else}
          <button class="btn btn--primary" onclick={playRound} disabled={!canPlay}>
            Draw round {tournament.rounds_played + 1}
          </button>
          <button
            class="btn"
            onclick={finish}
            disabled={tournament.rounds_played === 0}
            title="Lock the standings and publish the podium"
          >
            Finish tournament
          </button>
        {/if}
        {#if tournament.rounds_played > 0}
          <button class="btn btn--danger" onclick={clearResults}>Clear results</button>
        {/if}
      </div>
    </section>

    <div class="columns">
      <div class="stack">
        <section class="panel panel--flush">
          <div class="panel-head">
            <h2>Standings</h2>
            <span class="mono muted note">Win or bye = 1 point</span>
          </div>
          {#if roster.length === 0}
            <EmptyState headline="Nobody entered yet" hint="Add players from the entry list." />
          {:else}
            <StandingsTable {standings} />
          {/if}
        </section>

        {#if rounds.length > 0}
          <section class="stack rounds">
            <h2>Pairings and results</h2>
            {#each rounds as group (group.round)}
              <PairingSheet round={group.round} matches={group.matches} />
            {/each}
          </section>
        {/if}
      </div>

      <section class="panel panel--flush">
        <div class="panel-head">
          <h2>Entry list</h2>
          <span class="mono muted note">{roster.length} entered</span>
        </div>

        <div class="add">
          <select bind:value={selectedPlayer} aria-label="Choose a player to enter">
            <option value="" disabled selected>Choose a player</option>
            {#each available as player (player.id)}
              <option value={player.id}>{player.name} · {player.rating}</option>
            {/each}
          </select>
          <button class="btn btn--small" disabled={!selectedPlayer} onclick={() => enter(selectedPlayer)}>
            Enter
          </button>
        </div>

        {#if available.length > 1}
          <button class="btn btn--small enter-all" onclick={enterEveryone}>
            Enter all {available.length} remaining
          </button>
        {:else if available.length === 0}
          <p class="muted all-in">Everyone in the register is entered.</p>
        {/if}

        {#if roster.length === 0}
          <EmptyState headline="No entries yet" hint="Pick a player above to enter them." />
        {:else}
          <ul class="roster">
            {#each roster as player (player.id)}
              <li>
                <span class="name">{player.name}</span>
                <span class="mono muted">{player.rating}</span>
                <button
                  class="btn btn--small btn--danger"
                  onclick={() => withdraw(player)}
                  disabled={tournament.rounds_played > 0}
                  title={tournament.rounds_played > 0
                    ? 'Clear the results before changing the entry list'
                    : 'Withdraw this player'}
                >
                  Withdraw
                </button>
              </li>
            {/each}
          </ul>
        {/if}
      </section>
    </div>
  </div>
{/if}

<style>
  .back {
    display: inline-block;
    font-size: 0.72rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--sage);
    text-decoration: none;
    margin-bottom: 0.8rem;
  }

  .back:hover {
    color: var(--brass);
  }

  .title-row {
    align-items: center;
  }

  .meta {
    margin-top: 0.5rem;
    font-size: 0.88rem;
  }

  .winner .champion {
    padding: 1.25rem;
    margin-top: 1.25rem;
    border-top: 1px solid var(--line);
    font-size: 0.92rem;
    color: var(--sage);
  }

  .winner .champion strong {
    color: var(--buff-100);
  }

  .control {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.25rem;
    flex-wrap: wrap;
    padding: 1.1rem 1.25rem;
    border: 1px solid var(--brass-dim);
    border-radius: var(--radius);
    background: rgba(205, 164, 78, 0.07);
  }

  .control-line {
    margin-top: 0.4rem;
    font-size: 0.92rem;
  }

  .columns {
    display: grid;
    grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
    gap: 1.25rem;
    align-items: start;
  }

  .note {
    font-size: 0.7rem;
  }

  .rounds h2 {
    font-size: 1.15rem;
  }

  .add {
    display: flex;
    gap: 0.5rem;
    padding: 1rem 1.25rem 0.5rem;
  }

  .enter-all {
    margin: 0 1.25rem 0.5rem;
  }

  .all-in {
    padding: 0 1.25rem 0.5rem;
    font-size: 0.8rem;
  }

  .roster {
    list-style: none;
    margin: 0.5rem 0 0;
    padding: 0;
  }

  .roster li {
    display: grid;
    grid-template-columns: 1fr auto auto;
    align-items: center;
    gap: 0.75rem;
    padding: 0.55rem 1.25rem;
    border-top: 1px solid var(--line);
  }

  .roster .name {
    font-size: 0.92rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  @media (max-width: 980px) {
    .columns {
      grid-template-columns: 1fr;
    }
  }
</style>
