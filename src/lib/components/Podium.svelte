<script>
  /** First, second and third place, in the order they stand on a podium. */
  let { standings = [] } = $props();

  const order = [1, 0, 2];
  let places = $derived(order.map((index) => standings[index]).filter(Boolean));
  const label = ['1st', '2nd', '3rd'];
</script>

<div class="podium">
  {#each places as player (player.id)}
    {@const rank = standings.indexOf(player)}
    <div class="place rank-{rank}">
      <span class="medal mono">{label[rank]}</span>
      <span class="name">{player.name}</span>
      <span class="score mono">{player.points} {player.points === 1 ? 'pt' : 'pts'}</span>
      <div class="block"></div>
    </div>
  {/each}
</div>

<style>
  .podium {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    align-items: end;
    gap: 0.6rem;
    padding: 1.5rem 1.25rem 0;
  }

  .place {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.3rem;
    text-align: center;
    min-width: 0;
  }

  .medal {
    font-size: 0.72rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  .name {
    font-family: var(--display);
    font-weight: 600;
    font-size: 0.98rem;
    line-height: 1.2;
    overflow-wrap: anywhere;
  }

  .score {
    font-size: 0.75rem;
    color: var(--sage);
  }

  .block {
    width: 100%;
    margin-top: 0.5rem;
    border-radius: 3px 3px 0 0;
    border: 1px solid var(--line-strong);
    border-bottom: none;
    background: linear-gradient(180deg, rgba(244, 237, 220, 0.1), rgba(244, 237, 220, 0.02));
  }

  .rank-0 .medal,
  .rank-0 .name {
    color: var(--brass);
  }
  .rank-0 .block {
    height: 5.5rem;
    border-color: var(--brass-dim);
    background: linear-gradient(180deg, rgba(205, 164, 78, 0.28), rgba(205, 164, 78, 0.04));
  }

  .rank-1 .medal {
    color: #c8cfcb;
  }
  .rank-1 .block {
    height: 3.9rem;
  }

  .rank-2 .medal {
    color: #b98552;
  }
  .rank-2 .block {
    height: 2.9rem;
  }
</style>
