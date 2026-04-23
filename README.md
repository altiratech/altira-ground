# Altira Ground

Altira Ground is a standalone Altira product focused on project-first intelligence for real-asset transitions.

## Product Center

Build a dossier-first decision surface for private-capital teams evaluating industrial-development opportunities in the Texas/ERCOT corridor.

The founding loop is:
1. source opportunity
2. open project dossier
3. assess blockers and unlocks
4. review recent change events
5. decide to watch or advance

## Current Repo Status

This repo now has a first runnable foundation.

Current implemented slice:
- npm workspaces monorepo
- `@ground/shared` contracts
- Cloudflare Worker API with seeded dossier/feed/watch endpoints
- initial D1 schema and D1-backed API store, with local migration now verified and a seeded memory fallback still available when a `DB` binding exists before schema setup
- React + Vite web shell for Coverage Universe, Project Dossier, Ground Feed, and Watch Decision
- manual project intake in the Coverage Universe rail for tightly scoped pilot expansion
- write-path smoke coverage for project creation, public source-record creation, analyst-note creation, and memo creation
- dossier-side public source-record creation in the Source Trail panel so operators can add one more real public record without leaving the dossier
- dossier-side analyst-note creation so local judgment can be added as a real manual source, not only a seeded artifact
- dossier-side memo composition with explicit source citations, so new public records or analyst notes can be turned into grounded memo trail entries without a hidden shortcut
- memo trail cards now surface cited-source context and recency directly, so provenance stays visible at the point of reading
- two-project Sherman bootstrap catalog for local D1 reset and coverage recovery
- local-only bootstrap preview and reset routes for safe local persistence hygiene
- repo-local `npm run preview:d1:bootstrap` and `npm run reset:d1:bootstrap` helpers that operate directly on the local D1 SQLite file without `wrangler dev`
- repo-local `npm run verify:d1:bootstrap-reset` helper for repeated SQLite-backed reset and reseed verification
- repo-local `npm run review:browser` harness that rebuilds the current web shell into `.tmp/browser-review`, starts a D1-backed in-process API shim, and serves a same-origin browser review stack without relying on `wrangler dev`
- repo-local `npm run verify:d1:write-paths` helper for repeated D1-backed create-project and create-memo verification
- repo-local `npm run verify:d1:write-paths:inprocess` fallback for route-level D1 write verification when local Wrangler is unhealthy
- dossier-side coverage posture that shows source depth, truth mix, and missing source layers before a user decides to watch or advance
- explicit analyst-notes lane that pairs manual-note source records with the memo trail inside the dossier and now accepts new manual notes from the dossier UI
- two real seeded Sherman projects grounded in public source records

The next goal is to deepen the proof loop without widening scope.

## Review Workflow

For a reliable local browser check when the normal dev path is unhealthy:

1. run `npm run reset:d1:bootstrap` if you want a clean Sherman baseline
2. run `npm run review:browser`
3. open `http://127.0.0.1:5176`
4. use Playwright or a normal browser against that review surface
5. press `Ctrl-C` to stop the review stack

The review harness serves the current web code from `.tmp/browser-review` and proxies `/api` to a D1-backed in-process API shim, so the UI behaves like one origin without the older manual bundle patch.

## Canonical Build Truth

Treat these docs as authoritative inside this repo:
- `docs/FOUNDING_PACKET.md`
- `docs/IMPLEMENTATION_ENTRY_BRIEF.md`
- `docs/ARCHITECTURE_GUARDRAILS.md`
- `docs/DOMAIN_MODEL.md`
- `docs/API_CONTRACTS.md`
- `docs/AI_BOUNDARY.md`
- `docs/SOURCE_ADAPTER_RULES.md`

Upstream strategy and setup docs live in:
- `Business Ideas/04_Altira - Ground/Ground_Canonical_Object_Spec.md`
- `Business Ideas/04_Altira - Ground/Ground_v1_Workflow_Spec.md`
- `Business Ideas/04_Altira - Ground/Ground_Codex_Build_Playbook.md`

## Planned Repo Shape

- `apps/api/`
  - Cloudflare Worker API for project, feed, memo, and watch-state endpoints
- `apps/web/`
  - React + Vite UI for Coverage Universe, Project Dossier, Ground Feed, and Watch Decision
- `packages/shared/`
  - shared TypeScript contracts and schemas
- `docs/`
  - build truth and guardrails
- `scripts/`
  - local bootstrap and dev helpers
- `tests/`
  - repo-level and cross-surface tests

## Build Rule

Do not drift into an Atlas clone, a parcel portal, or a dashboard-first product before the dossier/feed/watch loop works.
