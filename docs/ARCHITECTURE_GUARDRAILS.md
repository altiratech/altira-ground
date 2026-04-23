# Altira Ground Architecture Guardrails

## Scope Guardrails

- Build the dossier/feed/watch loop first.
- Keep the first user and first workflow fixed.
- Keep `industrial_development` as the first lens until the first loop works.
- Keep `Texas/ERCOT corridor` as the first market until the first loop works.
- Do not widen into portfolio or statewide workflow before the single-project loop proves value.

## Data Guardrails

- Core objects:
  - `project`
  - `site_parcel`
  - `jurisdiction`
  - `source_record`
  - `event`
  - `evidence_claim`
  - `memo`
  - `watch_state`
- Keep raw sources, normalized records, approved claims, and inferred judgments as separate layers.
- Material claims must never appear without provenance.
- Inference must never overwrite observed fact.
- Synthetic or plausible-looking fake project data is prohibited.

## Product Guardrails

- `Project Dossier` is the hero surface.
- `Coverage Universe` is not a county dashboard.
- `Ground Feed` is not a generic news feed.
- `Watch Decision` is not an optional save button; it closes the workflow.
- Scoring must not become the hero before the evidence model is trusted.

## Visual Guardrails

- Shared Altira quality bar
- low-glare dark shell
- amber/cyan family
- IBM Plex typography
- no soft generic SaaS cards as the default language
- no Atlas layout copy-paste

## Repo Guardrails

- Keep the repo standalone.
- Keep shared-suite concerns light until the founding workflow works.
- Prefer explicit docs and contracts before infra sprawl.
- Keep the MVP deployable without a heavy multi-service platform.
