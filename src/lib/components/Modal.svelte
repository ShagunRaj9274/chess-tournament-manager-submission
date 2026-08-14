<script>
  /** A dialog used for the create and edit forms. */
  let { title = '', subtitle = '', open = false, onclose, children } = $props();

  let sheet = $state(null);

  // Move focus into the dialog when it opens, so keyboard and screen-reader
  // users land on the form rather than the page behind it.
  $effect(() => {
    if (open && sheet) sheet.focus();
  });

  function onkeydown(event) {
    if (event.key === 'Escape' && open) onclose?.();
  }
</script>

<svelte:window {onkeydown} />

{#if open}
  <div class="scrim">
    <button class="scrim-close" aria-label="Close dialog" onclick={() => onclose?.()}></button>

    <div class="sheet" role="dialog" aria-modal="true" aria-label={title} bind:this={sheet} tabindex="-1">
      <header>
        <div>
          <h2>{title}</h2>
          {#if subtitle}<p class="muted">{subtitle}</p>{/if}
        </div>
        <button class="btn btn--small" onclick={() => onclose?.()}>Close</button>
      </header>
      <div class="sheet-body">
        {@render children?.()}
      </div>
    </div>
  </div>
{/if}

<style>
  .scrim {
    position: fixed;
    inset: 0;
    z-index: 40;
    background: rgba(6, 18, 15, 0.72);
    backdrop-filter: blur(3px);
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 6vh 1rem 2rem;
    overflow-y: auto;
    animation: fade 0.16s ease-out;
  }

  .scrim-close {
    position: absolute;
    inset: 0;
    border: none;
    padding: 0;
    background: transparent;
    cursor: default;
  }

  .sheet {
    position: relative;
    outline: none;
    width: min(560px, 100%);
    background: var(--baize-800);
    border: 1px solid var(--line-strong);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    animation: rise 0.2s ease-out;
  }

  header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    padding: 1.15rem 1.25rem;
    border-bottom: 1px solid var(--line);
  }

  header p {
    font-size: 0.85rem;
    margin-top: 0.2rem;
  }

  .sheet-body {
    padding: 1.25rem;
  }

  @keyframes fade {
    from {
      opacity: 0;
    }
  }

  @keyframes rise {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
  }
</style>
