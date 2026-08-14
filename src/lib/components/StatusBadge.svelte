<script>
  let { status } = $props();
  const labels = { draft: 'Draft', in_progress: 'In progress', completed: 'Completed' };
</script>

<span class="badge badge--{status}">{labels[status] ?? status}</span>
