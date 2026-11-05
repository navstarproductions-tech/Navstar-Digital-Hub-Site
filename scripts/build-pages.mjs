import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const root = process.cwd();
const env = { ...process.env, CF_PAGES: '1' };
const steps = [
  [resolve(root, 'node_modules/typescript/bin/tsc'), ['-b', resolve(root, 'tsconfig.json')]],
  [resolve(root, 'node_modules/vite/bin/vite.js'), ['build', root, '--config', resolve(root, 'vite.config.ts')]],
];

for (const [script, args] of steps) {
  const result = spawnSync(process.execPath, [script, ...args], { cwd: root, env, stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}