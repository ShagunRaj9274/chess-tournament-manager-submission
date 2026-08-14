/**
 * Copies the SQLite WebAssembly binary out of node_modules and into /static so
 * the browser can fetch it at runtime. Running this on `dev` and `build` keeps
 * the binary out of Git while guaranteeing it exists in every deployment.
 */
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, 'node_modules', 'sql.js', 'dist', 'sql-wasm-browser.wasm');
const targetDir = join(root, 'static');
const target = join(targetDir, 'sql-wasm.wasm');

if (!existsSync(source)) {
  console.error('[copy-sql-wasm] sql.js is not installed. Run `npm install` first.');
  process.exit(1);
}

mkdirSync(targetDir, { recursive: true });
copyFileSync(source, target);
console.log('[copy-sql-wasm] static/sql-wasm.wasm is ready.');
