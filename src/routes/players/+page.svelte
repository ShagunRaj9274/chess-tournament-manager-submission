<script>
  import { app, notify, refresh } from '$lib/stores/app.svelte.js';
  import { createPlayer, deletePlayer, updatePlayer } from '$lib/repositories/players.js';
  import Modal from '$lib/components/Modal.svelte';
  import EmptyState from '$lib/components/EmptyState.svelte';

  const blank = { name: '', email: '', country: '', rating: 1200 };

  let form = $state({ ...blank });
  let editingId = $state(null);
  let formOpen = $state(false);
  let pendingDelete = $state(null);
  let search = $state('');
  let formError = $state('');

  let visible = $derived(
    app.players.filter((player) => {
      const needle = search.trim().toLowerCase();
      if (!needle) return true;
      return `${player.name} ${player.country ?? ''} ${player.email ?? ''}`
        .toLowerCase()
        .includes(needle);
    })
  );

  function openCreate() {
    form = { ...blank };
    editingId = null;
    formError = '';
    formOpen = true;
  }

  function openEdit(player) {
    form = {
      name: player.name,
      email: player.email ?? '',
      country: player.country ?? '',
      rating: player.rating
    };
    editingId = player.id;
    formError = '';
    formOpen = true;
  }

  function submit() {
    if (!form.name.trim()) {
      formError = 'A player needs a name.';
      return;
    }
    if (editingId) {
      updatePlayer(editingId, form);
      notify(`Updated ${form.name.trim()}.`);
    } else {
      createPlayer(form);
      notify(`Added ${form.name.trim()}.`);
    }
    refresh();
    formOpen = false;
  }

  function confirmDelete() {
    const { id, name } = pendingDelete;
    deletePlayer(id);
    refresh();
    pendingDelete = null;
    notify(`Removed ${name}.`);
  }
</script>

<div class="stack">
  <header class="spread">
    <div>
      <span class="eyebrow">Player register</span>
      <h1>Players</h1>
      <p class="muted lead">
        Everyone who can be entered into a tournament. Ratings seed nothing in the draw — they are
        here for the record, and to break ties in the final table.
      </p>
    </div>
    <button class="btn btn--primary" onclick={openCreate}>Add player</button>
  </header>

  <section class="panel panel--flush">
    <div class="panel-head">
      <h2>{app.players.length} registered</h2>
      <input class="search" type="search" placeholder="Search by name or country" bind:value={search} />
    </div>

    {#if app.players.length === 0}
      <EmptyState headline="The register is empty" hint="Add a player to get started.">
        <button class="btn btn--small" onclick={openCreate}>Add the first player</button>
      </EmptyState>
    {:else if visible.length === 0}
      <EmptyState headline="No player matches that search" hint="Try a different name or country." />
    {:else}
      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Country</th>
              <th class="numeric">Rating</th>
              <th class="numeric">Entered</th>
              <th class="numeric">Wins</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {#each visible as player (player.id)}
              <tr>
                <td class="name">{player.name}</td>
                <td class="muted">{player.email ?? '—'}</td>
                <td class="muted">{player.country ?? '—'}</td>
                <td class="numeric mono">{player.rating}</td>
                <td class="numeric mono muted">{player.tournaments_entered}</td>
                <td class="numeric mono muted">{player.wins}</td>
                <td>
                  <div class="actions">
                    <button class="btn btn--small" onclick={() => openEdit(player)}>Edit</button>
                    <button
                      class="btn btn--small btn--danger"
                      onclick={() => (pendingDelete = player)}>Delete</button
                    >
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </section>
</div>

<Modal
  open={formOpen}
  title={editingId ? 'Edit player' : 'Add player'}
  subtitle={editingId ? 'Changes apply everywhere this player appears.' : 'Only a name is required.'}
  onclose={() => (formOpen = false)}
>
  <div class="stack form">
    <div class="field">
      <label for="player-name">Name</label>
      <input id="player-name" bind:value={form.name} placeholder="Aditi Rao" />
    </div>
    <div class="grid-2">
      <div class="field">
        <label for="player-email">Email</label>
        <input id="player-email" type="email" bind:value={form.email} placeholder="optional" />
      </div>
      <div class="field">
        <label for="player-country">Country</label>
        <input id="player-country" bind:value={form.country} placeholder="optional" />
      </div>
    </div>
    <div class="field rating">
      <label for="player-rating">Rating</label>
      <input id="player-rating" type="number" min="0" max="3500" bind:value={form.rating} />
    </div>
    {#if formError}<p class="error">{formError}</p>{/if}
    <div class="row end">
      <button class="btn" onclick={() => (formOpen = false)}>Cancel</button>
      <button class="btn btn--primary" onclick={submit}>
        {editingId ? 'Save player' : 'Add player'}
      </button>
    </div>
  </div>
</Modal>

<Modal
  open={Boolean(pendingDelete)}
  title="Delete player"
  subtitle="This also removes their entries and results."
  onclose={() => (pendingDelete = null)}
>
  <p>Delete <strong>{pendingDelete?.name}</strong> from the register?</p>
  <div class="row end confirm">
    <button class="btn" onclick={() => (pendingDelete = null)}>Keep player</button>
    <button class="btn btn--danger" onclick={confirmDelete}>Delete player</button>
  </div>
</Modal>

<style>
  .lead {
    max-width: 52ch;
    margin-top: 0.6rem;
    font-size: 0.95rem;
  }

  h1 {
    margin-top: 0.4rem;
  }

  .search {
    width: min(260px, 100%);
  }

  .name {
    font-weight: 500;
  }

  .actions {
    display: flex;
    gap: 0.4rem;
    justify-content: flex-end;
  }

  .form {
    gap: 1rem;
  }

  .rating {
    max-width: 160px;
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
