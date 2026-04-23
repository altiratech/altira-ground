# Altira Ground UI Alignment Implementation Brief

Status: bounded implementation brief

## Purpose

This brief turns the UI alignment plan into one focused shell pass.

The pass should make Ground feel more like a mature Altira product terminal while preserving:

- dossier-first workflow
- provenance-first decision support
- project-first ontology
- narrow product scope

## Source Documents

- `/Users/ryanjameson/Desktop/Lifehub/Code/active/altira-ground/docs/GROUND_UI_ALIGNMENT_PLAN.md`
- `/Users/ryanjameson/Desktop/Lifehub/Code/active/altira-ground/docs/FOUNDING_PACKET.md`
- `/Users/ryanjameson/Desktop/Lifehub/Code/active/altira-ground/docs/NORTH_STAR.md`
- `/Users/ryanjameson/Desktop/Lifehub/Code/active/altira-ground/docs/IMPLEMENTATION_ENTRY_BRIEF.md`
- `/Users/ryanjameson/Desktop/Lifehub/Code/active/altira-ground/docs/ARCHITECTURE_GUARDRAILS.md`
- `/Users/ryanjameson/Desktop/Lifehub/Code/active/altira-ground/docs/AI_BOUNDARY.md`

## What This Pass Should Achieve

This pass should deliver:

1. stronger product chrome
2. clearer universe-versus-dossier mode framing
3. lighter but more intentional section navigation
4. tighter token and spacing discipline

This pass should not introduce new workflows or widen product scope.

## Exact UX Outcomes

After this pass, a user should be able to tell at a glance:

- they are inside `Altira Ground`
- the product lens is `Industrial Development`
- the operating market is the `Texas/ERCOT corridor`
- whether they are in `Coverage Universe` or an `Active Dossier`
- which project is active
- what the current watch state is

The app should still feel centered on:

- project dossier
- source-backed feed
- watch or advance decision

## In Scope

### 1. Product Chrome Revision

Revise the top shell so it includes:

- `Altira Ground` product identity
- a concise product descriptor
- lens label
- market label
- current mode label

This should feel closer to Signal’s polished console header than the current lighter topbar.

### 2. Context Bar

Add a compact context layer beneath the top chrome.

In `Coverage Universe` state, it should show:

- screen context
- project count
- watch count or similarly useful bounded status

In `Active Dossier` state, it should show:

- active project name
- jurisdiction
- watch state
- one useful freshness or source-health cue

### 3. Dossier Section Navigation

Add light section navigation for the active project state only.

The sections should be:

- `Coverage`
- `Dossier`
- `Feed`
- `Decision`

This can be tabs, anchor pills, or a compact rail, but it must stay visually lighter than Atlas navigation.

### 4. Token Tightening

Tighten the shell toward the Altira family by adjusting:

- chrome spacing rhythm
- hierarchy between headline and metadata layers
- neutral background and border consistency
- accent usage consistency for amber and cyan

## Out Of Scope

Do not include:

- new routes
- new data objects
- compare mode
- portfolio mode
- dashboard home redesign
- map-first interaction
- chat or AI assistant surfaces
- workflow expansion beyond the current dossier loop

## File Set Expected To Change

Primary files:

- `/Users/ryanjameson/Desktop/Lifehub/Code/active/altira-ground/apps/web/src/App.tsx`
- `/Users/ryanjameson/Desktop/Lifehub/Code/active/altira-ground/apps/web/src/styles.css`

Possible secondary files only if necessary:

- `/Users/ryanjameson/Desktop/Lifehub/Code/active/altira-ground/apps/web/src/api.ts`
- `/Users/ryanjameson/Desktop/Lifehub/Code/active/altira-ground/README.md`
- `/Users/ryanjameson/Desktop/Lifehub/Code/active/altira-ground/CURRENT_STATUS.md`

Do not widen the file set without a clear reason.

## Implementation Sequence

1. revise top chrome
2. add context bar states
3. add dossier section navigation
4. tighten spacing and token hierarchy
5. verify no provenance or watch-action regression

## UX Rules

- the dossier must remain the visual hero
- the left rail must remain secondary to the active project surface
- provenance-heavy surfaces must remain easy to locate
- watch and advance must stay close to the working context
- nothing in the shell should make Ground feel like a parcel portal
- nothing in the shell should make Ground feel like a generic admin app

## Browser Review Checkpoints

Review the pass with `npm run review:browser`.

Confirm:

- the top chrome clearly identifies `Altira Ground`
- the lens and market are visible without scrolling
- `Coverage Universe` and `Active Dossier` feel like different working modes
- the active project context is visible near the top of the shell
- the dossier center is still the hero surface
- `Source Trail`, `Analyst Notes`, `Memo Trail`, and `Watch Decision` remain easy to find
- no new shell element competes with provenance or watch-state cues

## Acceptance Criteria

The pass is successful if:

- Ground feels more like a mature Altira product sibling
- Ground does not feel more like Atlas than Ground
- the shell is more deliberate without being heavier
- the working mode is obvious at a glance
- provenance remains as legible as before
- the app still reads dossier-first in the first five seconds

## Recommended Commit Boundary

Treat this as a single UX-alignment commit or PR slice.

Do not combine this shell pass with:

- data-model work
- new source adapters
- write-surface expansion
- AI feature work
