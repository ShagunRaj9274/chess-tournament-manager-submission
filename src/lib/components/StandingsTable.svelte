<script>
  /** The cross-table. A win and a bye are worth one point each. */
  let { standings = [] } = $props();
</script>

<div class="table-scroll">
  <table>
    <thead>
      <tr>
        <th class="rank">#</th>
        <th>Player</th>
        <th class="numeric">Rating</th>
        <th class="numeric">Points</th>
        <th class="numeric">Won</th>
        <th class="numeric">Lost</th>
        <th class="numeric">Byes</th>
      </tr>
    </thead>
    <tbody>
      {#each standings as player, index (player.id)}
        <tr class:podium={index < 3}>
          <td class="rank mono medal-{index}">{index + 1}</td>
          <td>
            <span class="name">{player.name}</span>
            {#if player.country}<span class="muted country">{player.country}</span>{/if}
          </td>
          <td class="numeric muted">{player.rating}</td>
          <td class="numeric points">{player.points}</td>
          <td class="numeric muted">{player.points - player.byes}</td>
          <td class="numeric muted">{player.losses}</td>
          <td class="numeric muted">{player.byes}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .rank {
    width: 3rem;
    text-align: center;
  }

  .name {
    font-weight: 500;
  }

  .country {
    display: block;
    font-size: 0.75rem;
  }

  .points {
    font-family: var(--mono);
    font-weight: 600;
  }

  .medal-0 {
    color: var(--brass);
    font-weight: 600;
  }
  .medal-1 {
    color: #c8cfcb;
    font-weight: 600;
  }
  .medal-2 {
    color: #b98552;
    font-weight: 600;
  }

  tr.podium {
    background: rgba(205, 164, 78, 0.05);
  }
</style>
