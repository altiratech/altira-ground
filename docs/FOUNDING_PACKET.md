# Altira Ground Founding Packet

Status: canonical current-scope document

## 1. Project

- Project name: Altira Ground
- Owner: Ryan Jameson
- Date opened: 2026-03-20
- Status: scaffolded

## 2. One-Sentence Product Definition

`This product helps private-capital teams evaluate industrial-development transition projects in the Texas/ERCOT corridor through a project dossier, a change feed, and a watch-or-advance workflow, without becoming a parcel portal or dashboard-first market terminal.`

## 3. First User

- Primary user: associate, VP, principal, or similarly senior operator on a small or mid-sized private-capital team
- What they are trying to get done: reach a defendable first screen on a transition asset faster
- What they do today instead: stitch together parcel tools, zoning files, public records, hazard layers, and internal memos
- Why they would switch: one dossier and one feed shorten time-to-conviction and reduce workflow fragmentation

## 4. First Workflow

1. user sources or opens an opportunity
2. user opens the project dossier
3. user reviews blockers and unlocks with source trail
4. user checks recent project or jurisdiction events
5. user decides to watch or advance

## 5. Canonical Object

- Canonical object: `Project`
- Why this is the product center: the user is evaluating a project thesis, not browsing a parcel database
- What is explicitly not the canonical object: county, dashboard, parcel, or model score

## 6. Current Scope

- In scope:
  - one pilot-market coverage list
  - one seeded/manual project dossier
  - one project/jurisdiction event feed
  - persisted watch-state decision
  - source-backed memo support

## 7. Explicit Non-Goals

- Not in scope now:
  - county dashboards
  - statewide or national breadth
  - composite scoring as the primary UI
  - CRM workflow
  - hidden AI truth
  - broad commercial data commitments before the first loop works

## 8. Do-Not-Drift-Into

- Drift risks to avoid:
  - Atlas-style homepage structure
  - map-first portal behavior
  - parcel-first information architecture
  - broad powered-sites product framing before the industrial-development loop proves itself
  - a generic underwriting dashboard

## 9. Approved Terminology

| Use | Avoid | Why |
| --- | --- | --- |
| `project dossier` | `parcel detail` | keeps the hero object explicit |
| `evidence claim` | `fact` by default | preserves truth-boundary discipline |
| `ground feed` | `news feed` | keeps the workflow tied to decision-relevant change |
| `watch decision` | `save` alone | forces the workflow to end in intent |

## 10. Repo / Architecture Pattern

- Repo shape: standalone monorepo scaffold
- Frontend stack: React + Vite
- Backend stack: Cloudflare Worker API
- Shared contracts: `packages/shared`
- Persistence direction: D1 for structured persistence
- Explicitly rejected patterns:
  - cloning Atlas as a starter
  - forking Resilience as product foundation
  - heavy multi-service platform build before the first loop works

## 11. Data Truth Rules

- Source of truth: official public sources plus explicit manual curation
- What is observed vs inferred: source-backed record facts are observed; blocker/unlock interpretation can be inferred when labeled
- What must never be faked: project records, source timestamps, or site facts
- How uncertainty should be shown: truth type plus confidence where relevant

## 12. Quality Gates

- Required validation:
  - no material claim without provenance
  - no inferred claim presented as observed fact
  - no dossier page that depends on dashboard-first context
  - watch or advance decision persists with a reason

## 13. First 2-4 Week Build Sequence

| Order | Build block | Why now |
| --- | --- | --- |
| 1 | shared contracts | foundation for both API and web |
| 2 | seeded pilot project | gives the workflow something real to prove against |
| 3 | Coverage Universe list | fastest entry into the loop |
| 4 | Project Dossier | product center |
| 5 | Ground Feed | monitoring proof |
| 6 | watch-state action | closes the loop |

## 14. Open Questions That Do Not Block Start

- Open but non-blocking:
  - exact pilot jurisdictions inside the Texas/ERCOT corridor
  - exact map or geocoding vendor
  - whether the first memo export is markdown only

## 15. Go / No-Go Check Before Real Code

- [x] one-sentence product definition is stable
- [x] first user is specific
- [x] first workflow is specific
- [x] canonical object is clear
- [x] non-goals are written down
- [x] repo pattern is chosen
- [x] data truth rules are defined
