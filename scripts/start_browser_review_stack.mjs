#!/usr/bin/env node

import http from 'node:http';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { buildGroundApiModule } from './lib/build_api_bundle.mjs';
import { LocalD1Database } from './lib/local_d1_database.mjs';

const [rootDir, sqlitePath] = process.argv.slice(2);

if (!rootDir || !sqlitePath) {
  throw new Error('Usage: start_browser_review_stack.mjs <repo-root> <sqlite-path>');
}

const reviewPort = Number(process.env.GROUND_REVIEW_PORT ?? '5176');
const reviewApiPort = Number(process.env.GROUND_REVIEW_API_PORT ?? '8796');
const reviewDir = path.join(rootDir, '.tmp', 'browser-review');
const apiBundleEntry = path.join(reviewDir, 'ground-browser-api-entry.ts');
const apiBundleFile = path.join(reviewDir, 'ground-browser-api-bundle.mjs');
const browserEntry = path.join(rootDir, 'apps', 'web', 'src', 'main.tsx');
const browserBundleFile = path.join(reviewDir, 'app.js');
const browserIndexFile = path.join(reviewDir, 'index.html');
const browserCssFile = path.join(reviewDir, 'app.css');
const apiOrigin = `http://127.0.0.1:${reviewApiPort}`;

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
};

function assertExists(filePath, label) {
  try {
    statSync(filePath);
  } catch (error) {
    throw new Error(`${label} was not generated at ${filePath}`);
  }
}

async function buildBrowserReviewBundle() {
  mkdirSync(reviewDir, { recursive: true });

  const esbuildBinary = path.join(rootDir, 'node_modules', 'wrangler', 'node_modules', 'esbuild', 'bin', 'esbuild');
  execFileSync(esbuildBinary, [browserEntry, '--bundle', '--platform=browser', '--format=esm', `--outfile=${browserBundleFile}`], {
    cwd: rootDir,
    encoding: 'utf8',
    stdio: 'pipe',
  });

  writeFileSync(
    browserIndexFile,
    [
      '<!doctype html>',
      '<html lang="en">',
      '  <head>',
      '    <meta charset="UTF-8" />',
      '    <meta name="viewport" content="width=device-width, initial-scale=1.0" />',
      '    <title>Altira Ground Browser Review</title>',
      '    <link rel="stylesheet" href="/app.css" />',
      '  </head>',
      '  <body>',
      '    <div id="root"></div>',
      '    <script>',
      '      window.__GROUND_API_BASE__ = "";',
      '    </script>',
      '    <script type="module" src="/app.js"></script>',
      '  </body>',
      '</html>',
      '',
    ].join('\n'),
  );

  assertExists(browserBundleFile, 'Browser review bundle');
  assertExists(browserCssFile, 'Browser review stylesheet');
}

function resolveAssetPath(requestPath) {
  if (requestPath === '/' || requestPath === '') {
    return browserIndexFile;
  }

  const cleanPath = requestPath.split('?')[0];
  const assetPath = path.join(reviewDir, cleanPath.replace(/^\//, ''));
  try {
    if (statSync(assetPath).isFile()) {
      return assetPath;
    }
  } catch (_error) {
    return browserIndexFile;
  }

  return browserIndexFile;
}

function startApiShim(app) {
  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      try {
        const chunks = [];
        for await (const chunk of req) {
          chunks.push(chunk);
        }

        const body = chunks.length > 0 ? Buffer.concat(chunks) : undefined;
        const request = new Request(`http://127.0.0.1:${reviewApiPort}${req.url ?? '/'}`, {
          body: body && body.length > 0 ? body : undefined,
          headers: req.headers,
          method: req.method,
        });

        const response = await app.fetch(request);
        res.statusCode = response.status;
        response.headers.forEach((value, key) => {
          if (key.toLowerCase() !== 'content-encoding' && key.toLowerCase() !== 'transfer-encoding') {
            res.setHeader(key, value);
          }
        });
        res.end(Buffer.from(await response.arrayBuffer()));
      } catch (error) {
        res.statusCode = 500;
        res.setHeader('content-type', 'application/json; charset=utf-8');
        res.end(
          JSON.stringify({
            error: error instanceof Error ? error.message : String(error),
          }),
        );
      }
    });

    server.on('error', reject);
    server.listen(reviewApiPort, '127.0.0.1', () => resolve(server));
  });
}

function startReviewServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      try {
        const requestPath = req.url ?? '/';

        if (requestPath.startsWith('/api/') || requestPath === '/health') {
          const chunks = [];
          for await (const chunk of req) {
            chunks.push(chunk);
          }

          const body = chunks.length > 0 ? Buffer.concat(chunks) : undefined;
          const upstream = await fetch(`${apiOrigin}${requestPath}`, {
            body: body && body.length > 0 ? body : undefined,
            headers: req.headers,
            method: req.method,
          });

          res.statusCode = upstream.status;
          upstream.headers.forEach((value, key) => {
            if (key.toLowerCase() !== 'content-encoding' && key.toLowerCase() !== 'transfer-encoding') {
              res.setHeader(key, value);
            }
          });
          res.end(Buffer.from(await upstream.arrayBuffer()));
          return;
        }

        const assetPath = resolveAssetPath(requestPath);
        const extension = path.extname(assetPath);
        res.statusCode = 200;
        res.setHeader('content-type', mimeTypes[extension] || 'application/octet-stream');
        res.end(readFileSync(assetPath));
      } catch (error) {
        res.statusCode = 500;
        res.setHeader('content-type', 'application/json; charset=utf-8');
        res.end(
          JSON.stringify({
            error: error instanceof Error ? error.message : String(error),
          }),
        );
      }
    });

    server.on('error', reject);
    server.listen(reviewPort, '127.0.0.1', () => resolve(server));
  });
}

function closeServer(server) {
  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}

await buildBrowserReviewBundle();
const { createApp, D1GroundStore } = await buildGroundApiModule({
  bundleFile: apiBundleFile,
  entryFile: apiBundleEntry,
  rootDir,
});

const app = createApp(new D1GroundStore(new LocalD1Database(sqlitePath)));
const apiServer = await startApiShim(app);
const reviewServer = await startReviewServer();

let isClosing = false;
async function shutdown(signal) {
  if (isClosing) {
    return;
  }

  isClosing = true;
  try {
    await Promise.all([closeServer(reviewServer), closeServer(apiServer)]);
  } catch (_error) {
    // Swallow close races on shutdown.
  } finally {
    if (signal) {
      process.exit(0);
    }
  }
}

process.on('SIGINT', () => {
  void shutdown('SIGINT');
});

process.on('SIGTERM', () => {
  void shutdown('SIGTERM');
});

console.log(`Ground browser API shim listening on ${apiOrigin}`);
console.log(`Ground browser review server listening on http://127.0.0.1:${reviewPort}`);
console.log(`Ground browser review bundle rebuilt at ${reviewDir}`);
console.log('Press Ctrl-C to stop both review servers.');
