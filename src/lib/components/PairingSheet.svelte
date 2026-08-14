<script>
  /**
   * One round, laid out like the pairing sheet pinned to the wall of a chess
   * hall: board number, White on the left, Black on the right, result in the
   * middle in the notation an arbiter would actually write.
   */
  let { round, matches } = $props();
</script>

<section class="sheet">
  <header>
    <span class="eyebrow">Round {round}</span>
    <span class="mono muted count">{matches.length} boards</span>
  </header>

  <ol>
    {#each matches as match (match.id)}
      <li class="board" style="--delay: {match.board * 40}ms">
        <span class="square" class:light={match.board % 2 === 1}>{match.board}</span>

        {#if match.is_bye}
          <span class="side white">
            <span class="disc" aria-hidden="true"></span>
            <span class="name won">{match.white_name}</span>
          </span>
          <span class="result mono">bye</span>
          <span class="side black muted">No opponent this round</span>
        {:else}
          <span class="side white">
            <span class="disc" aria-hidden="true"></span>
            <span class="name" class:won={match.winner_id === match.white_id}>{match.white_name}</span>
          </span>
          <span class="result mono">
            {match.winner_id === match.white_id ? '1–0' : '0–1'}
          </span>
          <span class="side black">
            <span class="disc filled" aria-hidden="true"></span>
            <span class="name" class:won={match.winner_id === match.black_id}>{match.black_name}</span>
          </span>
        {/if}
      </li>
    {/each}
  </ol>
</section>

<style>
  .sheet {
    border: 1px solid var(--line);
    border-radius: var(--radius);
    background: var(--baize-800);
  }

  header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    padding: 0.8rem 1rem;
    border-bottom: 1px solid var(--line);
  }

  .count {
    font-size: 0.72rem;
  }

  ol {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .board {
    display: grid;
    grid-template-columns: 2.1rem 1fr 4.2rem 1fr;
    align-items: center;
    gap: 0.75rem;
    padding: 0.6rem 1rem;
    border-bottom: 1px solid var(--line);
    animation: deal 0.28s ease-out both;
    animation-delay: var(--delay);
  }

  .board:last-child {
    border-bottom: none;
  }

  .square {
    display: grid;
    place-items: center;
    width: 2.1rem;
    height: 2.1rem;
    border-radius: 3px;
    font-family: var(--mono);
    font-size: 0.8rem;
    background: var(--baize-600);
    color: var(--buff-200);
  }

  .square.light {
    background: var(--buff-200);
    color: var(--baize-900);
  }

  .side {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-width: 0;
    font-size: 0.92rem;
  }

  .black {
    justify-content: flex-end;
    text-align: right;
  }

  .disc {
    flex: none;
    width: 0.62rem;
    height: 0.62rem;
    border-radius: 50%;
    border: 1.5px solid var(--buff-400);
  }

  .disc.filled {
    background: var(--baize-950);
    border-color: var(--baize-950);
    box-shadow: 0 0 0 1px var(--buff-400);
  }

  .black .disc {
    order: 2;
  }

  .name {
    color: var(--sage);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .name.won {
    color: var(--buff-100);
    font-weight: 600;
  }

  .result {
    text-align: center;
    font-size: 0.85rem;
    color: var(--brass);
    letter-spacing: 0.04em;
  }

  @keyframes deal {
    from {
      opacity: 0;
      transform: translateY(6px);
    }
  }

  @media (max-width: 560px) {
    .board {
      grid-template-columns: 2.1rem 1fr 3.4rem;
      row-gap: 0.35rem;
    }

    .square {
      grid-row: span 2;
    }

    .result {
      grid-row: span 2;
    }

    .black {
      justify-content: flex-start;
      text-align: left;
    }

    .black .disc {
      order: 0;
    }
  }
</style>
