# Scripts

This folder is reserved for local bootstrap, seed, reset, and validation helpers.

Keep early scripts simple and grounded in the repo-local docs.

Current helpers:
- `review_browser.sh`
  - ensures the local Ground D1 schema exists
  - rebuilds the current browser-review bundle into `.tmp/browser-review`
  - starts a D1-backed in-process API shim on `127.0.0.1:8796`
  - starts a same-origin local review server on `127.0.0.1:5176`
  - keeps the stack running until interrupted
- `preview_d1_bootstrap.sh`
  - reads the existing Wrangler-managed local D1 SQLite file directly
  - returns the current local bootstrap state without starting the Worker
  - shows seed catalog ids, current project ids, and any missing or extra coverage entries
- `reset_d1_bootstrap.sh`
  - reads the existing Wrangler-managed local D1 SQLite file directly
  - previews the current local bootstrap state
  - resets the local D1 store back to the bootstrap seed catalog
  - writes before/after/reset artifacts into `.tmp/`
- `verify_d1_bootstrap_reset.sh`
  - reads and writes the existing Wrangler-managed local D1 SQLite file directly
  - adds a temporary local probe project
  - verifies that local bootstrap preview detects the extra project
  - resets local D1 back to the seed catalog
  - confirms only the seeded bootstrap projects remain after reset
- `verify_d1_write_paths.sh`
  - applies local D1 migrations
  - starts the Ground Worker locally
  - creates a unique manual project
  - creates a memo on that project
  - restarts the Worker
  - confirms both writes persisted through local D1
- `verify_d1_write_paths_inprocess.sh`
  - uses the same local D1 SQLite file but avoids `wrangler dev`
  - bundles the API entry and exercises the real routes via `app.request()`
  - creates a unique manual project
  - creates a public source record on that project
  - creates an analyst note on that project
  - creates a memo on that project that explicitly cites both the created public source and analyst note
  - re-instantiates the app and confirms all writes persisted through D1

Bootstrap script note:
- `preview_d1_bootstrap.sh`, `reset_d1_bootstrap.sh`, and `verify_d1_bootstrap_reset.sh` do not require `wrangler dev`
- they expect an existing local D1 schema file; if local D1 has never been initialized, run the normal local migration path first

Write-path note:
- `verify_d1_write_paths.sh` is still the native Worker-backed proof and should stay available
- `verify_d1_write_paths_inprocess.sh` is the fallback when local Wrangler health blocks the native path

Convenience entrypoint from repo root:
- `npm run preview:d1:bootstrap`
- `npm run reset:d1:bootstrap`
- `npm run review:browser`
- `npm run verify:d1:bootstrap-reset`
- `npm run verify:d1:write-paths`
- `npm run verify:d1:write-paths:inprocess`
