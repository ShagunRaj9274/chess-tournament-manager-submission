<script>
  import { toast } from '../stores/app.svelte.js';

  let visible = $state(false);
  let timer;

  $effect(() => {
    if (!toast.seq) return;
    visible = true;
    clearTimeout(timer);
    timer = setTimeout(() => (visible = false), 2800);
    return () => clearTimeout(timer);
  });
</script>

{#if visible}
  <div class="toast" class:error={toast.tone === 'error'} role="status">{toast.message}</div>
{/if}

<style>
  .toast {
    position: fixed;
    left: 50%;
    bottom: 1.5rem;
    transform: translateX(-50%);
    z-index: 60;
    font-family: var(--mono);
    font-size: 0.8rem;
    padding: 0.65rem 1rem;
    border-radius: var(--radius);
    background: var(--buff-100);
    color: var(--baize-950);
    box-shadow: var(--shadow);
    animation: slide 0.2s ease-out;
    max-width: min(90vw, 420px);
  }

  .error {
    background: var(--claret);
    color: var(--buff-100);
  }

  @keyframes slide {
    from {
      opacity: 0;
      transform: translate(-50%, 12px);
    }
  }
</style>
