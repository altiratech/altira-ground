import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export async function buildGroundApiModule({ rootDir, entryFile, bundleFile }) {
  const esbuildBinary = path.join(rootDir, 'node_modules', 'wrangler', 'node_modules', 'esbuild', 'bin', 'esbuild');

  writeFileSync(
    entryFile,
    [
      `export { createApp } from ${JSON.stringify(path.join(rootDir, 'apps/api/src/app.ts'))};`,
      `export { D1GroundStore } from ${JSON.stringify(path.join(rootDir, 'apps/api/src/d1-store.ts'))};`,
      '',
    ].join('\n'),
  );

  execFileSync(
    esbuildBinary,
    [entryFile, '--bundle', '--platform=node', '--format=esm', `--outfile=${bundleFile}`],
    {
      cwd: rootDir,
      encoding: 'utf8',
      stdio: 'pipe',
    },
  );

  return import(`${pathToFileURL(bundleFile).href}?t=${Date.now()}`);
}
