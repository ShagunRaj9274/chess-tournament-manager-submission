import { sveltekit } from '@sveltejs/kit/vite';

export default {
  plugins: [sveltekit()],
  optimizeDeps: {
    // sql.js ships a UMD bundle; pre-bundling keeps the dev server happy.
    include: ['sql.js/dist/sql-wasm-browser.js']
  },
  server: { fs: { strict: false } }
};
