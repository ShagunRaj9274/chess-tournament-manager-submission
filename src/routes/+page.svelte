<script>
  import { base } from '$app/paths';
  import { app } from '$lib/stores/app.svelte.js';
  import { getStandings } from '$lib/repositories/tournaments.js';
  import StatusBadge from '$lib/components/StatusBadge.svelte';
  import Podium from '$lib/components/Podium.svelte';
  import EmptyState from '$lib/components/EmptyState.svelte';

  // The tournament that still needs an arbiter: the one in progress, otherwise
  // the most recent draft, otherwise the last one that finished.
  let focus = $derived(
    app.tournaments.find((t) => t.status === 'in_progress') ??
      app.tournaments.find((t) => t.status === 'draft') ??
      app.tournaments[0]
  );

  let lastCompleted = $derived(app.tournaments.find((t) => t.status === 'completed'));
  let podium = $derived(lastCompleted ? getStandings(lastCompleted.id).slice(0, 3) : []);

  function focusLine(t) {
    if (!t) return '';
    if (t.status === 'completed') return `Finished after ${t.rounds_played} rounds`;
    if (t.status === 'in_progress') return `Round ${t.rounds_played} of ${t.total_rounds} played`;
    return t.player_count >= 2 ? 'Ready for round 1' : 'Needs at least two players';
  }
</script>

<div class="stack">
  <section class="hero">
    <span class="eyebrow">Tournament desk</span>
    {#if focus}
      <h1>{focus.name}</h1>
      <p class="lead muted">
        {focusLine(focus)} · {focus.player_count}
        {focus.player_count === 1 ? 'player' : 'players'}{focus.venue ? ` · ${focus.venue}` : ''}
      </p>
      <div class="row">
        <a class="btn btn--primary" href="{base}/tournaments/{focus.id}">Open tournament</a>
        <a class="btn" href="{base}/tournaments">All tournaments</a>
      </div>
    {:else}
      <h1>Nothing on the board</h1>
      <p class="lead muted">
        Register the players, then open a tournament and let the draw do the rest.
      </p>
      <div class="row">
        <a class="btn btn--primary" href="{base}/tournaments">Create a tournament</a>
        <a class="btn" href="{base}/players">Add players</a>
      </div>
    {/if}
  </section>

  <section class="tally">
    <div>
      <span class="mono value">{app.players.length}</span>
      <span class="label">Players registered</span>
    </div>
    <div>
      <span class="mono value">{app.tournaments.length}</span>
      <span class="label">Tournaments</span>
    </div>
    <div>
      <span class="mono value">{app.matchCount}</span>
      <span class="label">Games recorded</span>
    </div>
  </section>

  <div class="columns">
    <section class="panel panel--flush">
      <div class="panel-head">
        <h2>Tournaments</h2>
        <a class="btn btn--small" href="{base}/tournaments">Manage</a>
      </div>
      {#if app.tournaments.length === 0}
        <EmptyState headline="No tournaments yet" hint="Create one to start pairing players." />
      {:else}
        <ul class="list">
          {#each app.tournaments.slice(0, 5) as tournament (tournament.id)}
            <li>
              <a href="{base}/tournaments/{tournament.id}">
                <span class="name">{tournament.name}</span>
                <span class="meta mono muted">
                  {tournament.player_count} players · R{tournament.rounds_played}/{tournament.total_rounds}
                </span>
                <StatusBadge status={tournament.status} />
              </a>
            </li>
          {/each}
        </ul>
      {/if}
    </section>

    <section class="panel panel--flush">
      <div class="panel-head">
        <h2>Latest podium</h2>
      </div>
      {#if podium.length > 0}
        <p class="podium-name muted mono">{lastCompleted.name}</p>
        <Podium standings={podium} />
      {:else}
        <EmptyState
          headline="No podium yet"
          hint="Finish a tournament and the top three appear here."
        />
      {/if}
    </section>
  </div>
</div>

<style>
  .hero {
    max-width: 46rem;
  }

  .hero .eyebrow {
    display: block;
    margin-bottom: 0.6rem;
  }

  .lead {
    margin: 0.7rem 0 1.3rem;
    font-size: 1rem;
  }

  .tally {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    border-top: 1px solid var(--line);
    border-bottom: 1px solid var(--line);
  }

  .tally div {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    padding: 1rem 1.25rem;
    border-left: 1px solid var(--line);
  }

  .tally div:first-child {
    border-left: none;
    padding-left: 0;
  }

  .value {
    font-size: 1.6rem;
    font-weight: 500;
    color: var(--brass);
  }

  .label {
    font-size: 0.75rem;
    color: var(--sage);
  }

  .columns {
    display: grid;
    grid-template-columns: 1.35fr 1fr;
    gap: 1.25rem;
    align-items: start;
  }

  .list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .list a {
    display: grid;
    grid-template-columns: 1fr auto auto;
    align-items: center;
    gap: 0.75rem;
    padding: 0.8rem 1.25rem;
    border-bottom: 1px solid var(--line);
    text-decoration: none;
  }

  .list li:last-child a {
    border-bottom: none;
  }

  .list a:hover {
    background: rgba(244, 237, 220, 0.04);
  }

  .name {
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .meta {
    font-size: 0.75rem;
  }

  .podium-name {
    padding: 1rem 1.25rem 0;
    font-size: 0.75rem;
  }

  @media (max-width: 900px) {
    .columns {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 520px) {
    .list a {
      grid-template-columns: 1fr auto;
    }

    .meta {
      grid-column: 1 / -1;
    }
  }
</style>
