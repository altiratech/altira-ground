# Altira Ground Implementation Entry Brief

## Purpose

This brief exists so the repo can be opened and understood quickly at the start of implementation.

## What Is Fixed

- Product name: `Altira Ground`
- Product boundary: separate sibling Altira product, not Atlas with a renamed thesis
- Initial wedge: industrial-development transition projects for private-capital users
- Pilot market: `Texas/ERCOT corridor`
- Architecture shape:
  - `apps/web` = React + Vite
  - `apps/api` = Cloudflare Worker API
  - `packages/shared` = shared TypeScript contracts
  - intended v1 store = D1 for structured persistence
- v1 core workflow:
  - `Coverage Universe`
  - `Project Dossier`
  - `Ground Feed`
  - `Watch Decision`

## What Is Not Fixed Yet

- shared Altira auth provider / SSO path
- exact parcel normalization vendor
- exact map/search vendor
- the first commercial data contract, if any
- broader compare, scoring, or portfolio workflows

These are later choices after the first workflow is stable.

## Recommended First Runnable Slice

The first runnable slice should be:

1. shared contracts for `Project`, `Event`, `EvidenceClaim`, and `WatchState`
2. one seeded/manual Texas/ERCOT project using public-data-backed claims
3. a compact `Coverage Universe` list
4. a dossier page with thesis, blockers, unlocks, site context, jurisdiction context, and timeline
5. a feed/timeline view for recent events
6. a `watch` or `advance` action with persisted reason
7. visible truth-type and provenance treatment on material claims

Why:
- it proves the actual product loop
- it keeps the product project-first
- it avoids inventing a broader system before the workflow works

## Current Implemented Foundation

The repo now includes:

1. npm workspace root plus TypeScript base config
2. `@ground/shared` contracts for `Project`, `Event`, `EvidenceClaim`, `SourceRecord`, `Memo`, and `WatchState`
3. a Cloudflare Worker API with:
   - `GET /health`
   - `GET /api/v1/projects`
   - `POST /api/v1/projects`
   - `GET /api/v1/projects/:projectId`
   - `GET /api/v1/projects/:projectId/feed`
   - `POST /api/v1/projects/:projectId/source-records`
   - `POST /api/v1/projects/:projectId/analyst-notes`
   - `POST /api/v1/projects/:projectId/watch-state`
   - `POST /api/v1/projects/:projectId/memos`
4. initial D1 persistence support:
   - `apps/api/migrations/0001_initial.sql`
   - `D1GroundStore` for the founding Ground objects
   - verified local migration path for `altira-ground-db`
   - two-project Sherman bootstrap catalog for local coverage recovery
   - local-only bootstrap preview and reset routes at `/api/v1/local/bootstrap` and `/api/v1/local/bootstrap/reset`
   - repo-local `npm run preview:d1:bootstrap` and `npm run reset:d1:bootstrap` helpers that operate directly on the local D1 SQLite file
   - repo-local `npm run review:browser` harness that rebuilds the current web shell into `.tmp/browser-review`, starts a D1-backed in-process API shim, and serves a same-origin browser review surface without `wrangler dev`
   - repo-local `npm run verify:d1:bootstrap-reset` helper for repeated reset-and-reseed durability checks without `wrangler dev`
   - repo-local `npm run verify:d1:write-paths` helper for repeated D1-backed create/write persistence checks
   - repo-local `npm run verify:d1:write-paths:inprocess` fallback for route-level D1 persistence proof when Wrangler is blocked
   - local memory fallback when the D1 binding exists but the schema has not been migrated yet
5. two seeded Texas/ERCOT Sherman dossiers centered on TI and GlobalWafers or Globitech manufacturing expansion plus City of Sherman public planning and infrastructure records
6. a Vite web app that renders:
   - Coverage Universe
   - manual project intake for tightly bounded pilot expansion
   - Project Dossier
   - dossier-side coverage posture and missing-layer surfacing
   - dossier-side public source-record creation inside Source Trail
   - explicit analyst-notes surfacing that pairs manual-note sources with memo trail context
   - dossier-side memo composition with explicit cited-source selection
   - dossier-side analyst-note creation so a user can add manual local judgment directly into the source trail
   - Ground Feed
   - Watch Decision
   - source trail and truth-type display
7. API regression coverage for health, projects list, dossier detail, public source-record creation, analyst-note creation, watch-state mutation, project creation, and memo creation

## Immediate Next Build Block

1. keep the current write surface tight and dossier-adjacent: manual intake, source-record add, analyst-note add, explicitly cited memo add, and watch decision are enough for now
2. use the repo-local SQLite bootstrap helpers and the write-path verifiers as the default durability proof before widening product behavior
3. keep the product loop dossier-first while local persistence now supports preview/reset hygiene, a small multi-project bootstrap baseline, and explicit source-coverage posture in the dossier
4. make the next persistence upgrade about better seed operations and data expansion rules, not more UI write surface

## Explicit Defers

Do not treat these as founding blockers:
- statewide or national coverage
- broad vendor integrations
- advanced ranking or composite scoring
- compare mode
- portfolio dashboards
- CRM workflow
- chat-heavy AI surfaces

## Canonical Inputs

- `/Users/ryanjameson/Desktop/Lifehub/Business Ideas/04_Altira - Ground/Ground_Canonical_Object_Spec.md`
- `/Users/ryanjameson/Desktop/Lifehub/Business Ideas/04_Altira - Ground/Ground_v1_Workflow_Spec.md`
- `/Users/ryanjameson/Desktop/Lifehub/Business Ideas/04_Altira - Ground/Ground_Observed_vs_Inferred_Rules.md`
- `/Users/ryanjameson/Desktop/Lifehub/Business Ideas/04_Altira - Ground/Ground_Source_Rights_Matrix.md`
- `/Users/ryanjameson/Desktop/Lifehub/Business Ideas/04_Altira - Ground/Ground_Codex_Build_Playbook.md`
