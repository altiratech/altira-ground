# API Workspace

This folder holds the Cloudflare Worker API for Ground.

Founding scope:
- coverage-list read path
- dossier read path
- feed read path
- watch-state write path

Persistence notes:
- the API now includes a D1 schema under `migrations/0001_initial.sql`
- local migration command: `npm run db:migrate:local -w @ground/api`
- local bootstrap preview route: `GET /api/v1/local/bootstrap`
- local bootstrap reset route: `POST /api/v1/local/bootstrap/reset`
- local bootstrap preview helper: `npm run preview:d1:bootstrap` (direct SQLite path, no Worker startup)
- local bootstrap reset helper: `npm run reset:d1:bootstrap` (direct SQLite path, no Worker startup)
- local bootstrap verification helper: `npm run verify:d1:bootstrap-reset` (direct SQLite path, no Worker startup)
- repo-level D1 write-path verification command: `npm run verify:d1:write-paths`
- repo-level D1 write-path fallback command: `npm run verify:d1:write-paths:inprocess`
- when a `DB` binding exists but the schema has not been migrated yet, the API falls back to the seeded in-memory store so local dossier/feed work does not fail closed
- current local bootstrap seed now includes two Sherman dossiers so reset can restore a small coverage baseline instead of only one project
- current write-path smoke coverage now explicitly exercises project creation and memo creation in addition to the original watch-state path
