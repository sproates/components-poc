import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { serve } from './serve-storybook.mjs';

const mode = process.argv[2] ?? 'all';
if (!['all', 'functional', 'perf'].includes(mode)) throw new Error(`Unknown test mode: ${mode}`);
const env = {
  ...process.env,
  STORYBOOK_DISABLE_TELEMETRY: '1',
  PLAYWRIGHT_BROWSERS_PATH: resolve('.cache/ms-playwright')
};
let child;
function run(command, args) {
  return new Promise((resolve, reject) => {
    child = spawn(command, args, { stdio: 'inherit', env });
    child.once('error', reject);
    child.once('exit', (code) => code === 0 ? resolve() : reject(new Error(`${command} exited ${code}`)));
  });
}
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, () => { child?.kill(signal); process.exit(130); });
}

let server;
try {
  if (mode !== 'perf') {
    await run(resolve('node_modules/.bin/vitest'), ['run', '--config', 'vitest.config.ts']);
  }
  if (mode !== 'functional') {
    await run('npm', ['run', 'build:storybook']);
    server = await serve();
    env.STORYBOOK_URL = `http://127.0.0.1:${server.address().port}`;
    console.log(`Testing fresh Storybook at ${env.STORYBOOK_URL}`);
    await run(resolve('node_modules/.bin/playwright'), ['test', '--config', 'playwright.perf.config.ts', ...process.argv.slice(3)]);
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  server?.closeAllConnections();
  server?.close();
}
