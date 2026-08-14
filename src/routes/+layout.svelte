<script>
  import { onMount } from 'svelte';
  import { base } from '$app/paths';
  import { page } from '$app/state';
  import '$lib/styles/app.css';
  import { app, boot, resetDemoData } from '$lib/stores/app.svelte.js';
  import Toast from '$lib/components/Toast.svelte';

  let { children } = $props();

  const links = [
    { href: '/', label: 'Overview' },
    { href: '/players', label: 'Players' },
    { href: '/tournaments', label: 'Tournaments' }
  ];

  let path = $derived(page.url.pathname.replace(base, '') || '/');

  function isActive(href) {
    return href === '/' ? path === '/' : path.startsWith(href);
  }

  onMount(boot);

  function onReset() {
    if (confirm('Replace everything with the original sample data?')) resetDemoData();
  }
</script>

<div class="shell">
  <aside class="rail">
    <a class="brand" href="{base}/">
      <span class="mark" aria-hidden="true">&#9822;</span>
      <span class="wordmark">
        <strong>Arbiter</strong>
        <em>Tournament desk</em>
      </span>
    </a>

    <nav>
      {#each links as link (link.href)}
        <a href="{base}{link.href}" class:active={isActive(link.href)}>{link.label}</a>
      {/each}
    </nav>

    <div class="rail-foot">
      <p class="mono">SQLite · WebAssembly</p>
      <p class="muted">Your data is saved in this browser.</p>
      <button class="btn btn--small" onclick={onReset}>Reset demo data</button>
    </div>
  </aside>

  <main>
    {#if app.error}
      <div class="notice">
        <h2>The database did not open</h2>
        <p class="muted">{app.error}</p>
      </div>
    {:else if !app.ready}
      <div class="notice">
        <p class="eyebrow">Opening the database</p>
      </div>
    {:else}
      {@render children?.()}
    {/if}
  </main>
</div>

<Toast />

<style>
  .shell {
    display: grid;
    grid-template-columns: 232px minmax(0, 1fr);
    min-height: 100vh;
  }

  .rail {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    padding: 1.5rem 1.25rem;
    background: var(--baize-950);
    border-right: 1px solid var(--line);
    position: sticky;
    top: 0;
    height: 100vh;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    text-decoration: none;
  }

  .mark {
    display: grid;
    place-items: center;
    width: 2.1rem;
    height: 2.1rem;
    border-radius: 4px;
    background: var(--brass);
    color: var(--baize-950);
    font-size: 1.2rem;
  }

  .wordmark {
    display: flex;
    flex-direction: column;
    line-height: 1.15;
  }

  .wordmark strong {
    font-family: var(--display);
    font-size: 1.1rem;
    letter-spacing: -0.01em;
  }

  .wordmark em {
    font-family: var(--mono);
    font-style: normal;
    font-size: 0.62rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--sage);
  }

  nav {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
  }

  nav a {
    padding: 0.5rem 0.6rem;
    border-radius: var(--radius);
    border-left: 2px solid transparent;
    text-decoration: none;
    font-size: 0.92rem;
    color: var(--sage);
    transition: color 0.15s ease, background 0.15s ease;
  }

  nav a:hover {
    color: var(--buff-100);
    background: rgba(244, 237, 220, 0.05);
  }

  nav a.active {
    color: var(--buff-100);
    border-left-color: var(--brass);
    background: rgba(205, 164, 78, 0.09);
  }

  .rail-foot {
    margin-top: auto;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.4rem;
    font-size: 0.75rem;
  }

  .rail-foot .mono {
    font-size: 0.66rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--brass);
  }

  .rail-foot button {
    margin-top: 0.4rem;
  }

  main {
    padding: 2.5rem clamp(1rem, 4vw, 3rem) 4rem;
    max-width: 1180px;
    width: 100%;
  }

  .notice {
    padding: 4rem 0;
  }

  @media (max-width: 820px) {
    .shell {
      grid-template-columns: 1fr;
    }

    .rail {
      position: static;
      height: auto;
      flex-direction: row;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
      border-right: none;
      border-bottom: 1px solid var(--line);
    }

    nav {
      flex-direction: row;
      gap: 0.25rem;
    }

    nav a {
      border-left: none;
      border-bottom: 2px solid transparent;
      border-radius: 0;
    }

    nav a.active {
      border-left-color: transparent;
      border-bottom-color: var(--brass);
    }

    .rail-foot {
      margin-top: 0;
      margin-left: auto;
      flex-direction: row;
      align-items: center;
    }

    .rail-foot p {
      display: none;
    }

    .rail-foot button {
      margin-top: 0;
    }

    main {
      padding-top: 1.75rem;
    }
  }
</style>
