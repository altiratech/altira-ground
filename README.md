# Altira Ground

Altira Ground is a project-first intelligence product for real-asset transitions.

The first lens is industrial-development opportunity evaluation in the Texas/ERCOT corridor. The hero object is a **project dossier**, not a dashboard.

## Product Center

The founding loop is:
1. source an opportunity
2. open a project dossier
3. assess blockers and unlocks
4. review recent change events
5. decide to watch or advance

## Status

Active foundation build.

Current implemented slice:
- npm workspaces monorepo
- shared TypeScript contracts
- Cloudflare Worker API with D1-backed project, feed, source, memo, and watch-state endpoints
- React + Vite web shell for Coverage Universe, Project Dossier, Ground Feed, and Watch Decision
- manual project intake for tightly scoped pilot expansion
- public source-record, analyst-note, and memo creation paths
- memo cards with cited-source identity and recency context
- local D1 bootstrap/reset helpers and write-path verification scripts
- a same-origin browser-review harness for reliable local inspection when normal dev paths are unhealthy
- seeded Sherman, Texas project examples grounded in public source records

## Quick Start

```bash
git clone https://github.com/altiratech/altira-ground.git
cd altira-ground
npm install
```

Run API and web app in separate terminals:

```bash
npm run dev:api
```

```bash
npm run dev:web
```

Useful checks:

```bash
npm run typecheck
npm run test
npm run build
```

## Review Workflow

For a reliable local browser check:

```bash
npm run reset:d1:bootstrap
npm run review:browser
```

Then open `http://127.0.0.1:5176`.

The review harness builds the current web shell into `.tmp/browser-review`, starts a D1-backed in-process API shim, and serves a same-origin review stack.

## Canonical Build Truth

Treat these docs as authoritative inside this repo:
- `docs/FOUNDING_PACKET.md`
- `docs/IMPLEMENTATION_ENTRY_BRIEF.md`
- `docs/ARCHITECTURE_GUARDRAILS.md`
- `docs/DOMAIN_MODEL.md`
- `docs/API_CONTRACTS.md`
- `docs/AI_BOUNDARY.md`
- `docs/SOURCE_ADAPTER_RULES.md`

## Repo Shape

```text
apps/api/        Cloudflare Worker API
apps/web/        React/Vite UI
packages/shared/ Shared TypeScript contracts
docs/            product, architecture, and source-boundary rules
scripts/         local bootstrap, review, and verification helpers
tests/           repo-level and cross-surface tests
```

## Build Rule

Do not drift into an Atlas clone, a parcel portal, or a dashboard-first product before the dossier/feed/watch loop works.

## License

No open-source license has been selected yet. Public source visibility does not grant reuse rights until a license file is added.
