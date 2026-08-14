<script>
  import { base } from '$app/paths';
  import { goto } from '$app/navigation';
  import { app, notify, refresh } from '$lib/stores/app.svelte.js';
  import {
    createTournament,
    deleteTournament,
    updateTournament
  } from '$lib/repositories/tournaments.js';
  import Modal from '$lib/components/Modal.svelte';
  import StatusBadge from '$lib/components/StatusBadge.svelte';
  import EmptyState from '$lib/components/EmptyState.svelte';

  const today = new Date().toISOString().slice(0, 10);
  const blank = { name: '', venue: '', start_date: today, total_rounds: 3 };

  let form = $state({ ...blank });
  let editingId = $state(null);
  let formOpen = $state(false);
  let pendingDelete = $state(null);
  let formError = $state('');

  function openCreate() {
    form = { ...blank };
    editingId = null;
    formError = '';
    formOpen = true;
  }

  function openEdit(tournament) {
    form = {
      name: tournament.name,
      venue: tournament.venue ?? '',
      start_date: tournament.start_date ?? today,
      total_rounds: tournament.total_rounds
    };
    editingId = tournament.id;
    formError = '';
    formOpen = true;
  }

  function submit() {
    if (!form.name.trim()) {
      formError = 'A tournament needs a name.';
      return;
    }
    if (editingId) {
      updateTournament(editingId, form);
      refresh();
      formOpen = false;
      notify('Tournament updated.');
      return;
    }
    const id = createTournament(form);
    refresh();
    formOpen = false;
    notify('Tournament created. Now enter the players.');
    goto(`${base}/tournaments/${id}`);
  }

  function confirmDelete() {
    const { id, name } = pendingDelete;
    deleteTournament(id);
    refresh();
    pendingDelete = null;
    notify(`Deleted ${name}.`);
  }
</script>

<div class="stack">
  <header class="spread">
    <div>
      <span class="eyebrow">Calendar</span>
      <h1>Tournaments</h1>
      <p class="muted lead">
        Each tournament holds its own entry list, its own rounds and its own final table.
      </p>
    </div>
    <button class="btn btn--primary" onclick={openCreate}>New tournament</button>
  </header>

  {#if app.tournaments.length === 0}
    <div class="panel">
      <EmptyState
        headline="No tournaments on the calendar"
        hint="Create one, enter the players, then draw the first round."
      >
        <button class="btn btn--small" onclick={openCreate}>Create a tournament</button>
      </EmptyState>
    </div>
  {:else}
    <div class="cards">
      {#each app.tournaments as tournament (tournament.id)}
        <article class="card">
          <div class="card-top">
            <StatusBadge status={tournament.status} />
            <span class="mono muted date">{tournament.start_date ?? '—'}</span>
          </div>
          <h2><a href="{base}/tournaments/{tournament.id}">{tournament.name}</a></h2>
          <p class="muted venue">{tournament.venue ?? 'Venue not set'}</p>

          <dl>
            <div>
              <dt>Players</dt>
              <dd class="mono">{tournament.player_count}</dd>
            </div>
            <div>
              <dt>Rounds</dt>
              <dd class="mono">{tournament.rounds_played}/{tournament.total_rounds}</dd>
            </div>
          </dl>

          <div class="row actions">
            <a class="btn btn--small btn--primary" href="{base}/tournaments/{tournament.id}">Open</a>
            <button class="btn btn--small" onclick={() => openEdit(tournament)}>Edit</button>
            <button class="btn btn--small btn--danger" onclick={() => (pendingDelete = tournament)}>
              Delete
            </button>
          </div>
        </article>
      {/each}
    </div>
  {/if}
</div>

<Modal
  open={formOpen}
  title={editingId ? 'Edit tournament' : 'New tournament'}
  subtitle="Rounds can be changed later, as long as the draw has not passed them."
  onclose={() => (formOpen = false)}
>
  <div class="stack form">
    <div class="field">
      <label for="t-name">Name</label>
      <input id="t-name" bind:value={form.name} placeholder="Patna Open 2026" />
    </div>
    <div class="field">
      <label for="t-venue">Venue</label>
      <input id="t-venue" bind:value={form.venue} placeholder="optional" />
    </div>
    <div class="grid-2">
      <div class="field">
        <label for="t-date">Start date</label>
        <input id="t-date" type="date" bind:value={form.start_date} />
      </div>
      <div class="field">
        <label for="t-rounds">Rounds</label>
        <input id="t-rounds" type="number" min="1" max="15" bind:value={form.total_rounds} />
      </div>
    </div>
    {#if formError}<p class="error">{formError}</p>{/if}
    <div class="row end">
      <button class="btn" onclick={() => (formOpen = false)}>Cancel</button>
      <button class="btn btn--primary" onclick={submit}>
        {editingId ? 'Save tournament' : 'Create tournament'}
      </button>
    </div>
  </div>
</Modal>

<Modal
  open={Boolean(pendingDelete)}
  title="Delete tournament"
  subtitle="The entry list and every result go with it."
  onclose={() => (pendingDelete = null)}
>
  <p>Delete <strong>{pendingDelete?.name}</strong>?</p>
  <div class="row end confirm">
    <button class="btn" onclick={() => (pendingDelete = null)}>Keep tournament</button>
    <button class="btn btn--danger" onclick={confirmDelete}>Delete tournament</button>
  </div>
</Modal>

<style>
  h1 {
    margin-top: 0.4rem;
  }

  .lead {
    max-width: 52ch;
    margin-top: 0.6rem;
    font-size: 0.95rem;
  }

  .cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
    gap: 1rem;
  }

  .card {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 1.1rem;
    background: var(--baize-800);
    border: 1px solid var(--line);
    border-radius: var(--radius);
    transition: border-color 0.15s ease;
  }

  .card:hover {
    border-color: var(--line-strong);
  }

  .card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .date {
    font-size: 0.72rem;
  }

  .card h2 {
    font-size: 1.15rem;
  }

  .card h2 a {
    text-decoration: none;
  }

  .card h2 a:hover {
    color: var(--brass);
  }

  .venue {
    font-size: 0.85rem;
  }

  dl {
    display: flex;
    gap: 1.5rem;
    margin: 0.4rem 0 0.2rem;
    padding-top: 0.7rem;
    border-top: 1px solid var(--line);
  }

  dt {
    font-family: var(--mono);
    font-size: 0.64rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--sage);
  }

  dd {
    margin: 0.1rem 0 0;
    font-size: 1.05rem;
  }

  .actions {
    margin-top: auto;
    padding-top: 0.7rem;
    gap: 0.4rem;
  }

  .form {
    gap: 1rem;
  }

  .error {
    color: var(--claret);
    font-size: 0.85rem;
  }

  .end {
    justify-content: flex-end;
  }

  .confirm {
    margin-top: 1.25rem;
  }
</style>
