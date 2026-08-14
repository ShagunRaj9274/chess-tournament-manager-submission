<script>
  /** Shown wherever a list has nothing in it yet — an invitation, not an apology. */
  let { headline, hint = '', children } = $props();
</script>

<div class="empty">
  <span class="piece" aria-hidden="true">&#9822;</span>
  <h3>{headline}</h3>
  {#if hint}<p class="muted">{hint}</p>{/if}
  {@render children?.()}
</div>

<style>
  .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.6rem;
    text-align: center;
    padding: 3rem 1.5rem;
  }

  .piece {
    font-size: 2.4rem;
    line-height: 1;
    color: var(--brass-dim);
  }

  p {
    max-width: 34ch;
    font-size: 0.9rem;
  }
</style>
