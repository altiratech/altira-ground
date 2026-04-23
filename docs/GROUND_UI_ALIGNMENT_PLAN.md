# Altira Ground UI Alignment Plan

Status: implementation-planning document

## Purpose

This plan defines how Ground should align with the Altira family UI language while preserving the product-specific behavior that makes Ground useful.

The goal is not to redesign Ground into Atlas or Signal. The goal is to make Ground feel like a mature Altira product shell while keeping the dossier-first workflow intact.

## Working Read

Ground is already strongly aligned with the Altira family on:

- typography
- dark-shell tone
- amber and cyan accent language
- uppercase mono metadata treatment
- provenance-forward product posture

Ground is only partially aligned on shell maturity.

Today, Ground reads as a polished dossier prototype. Signal and Atlas read more like durable product terminals with clearer chrome, navigation framing, and mode clarity.

That means the main UI gap is not brand mismatch. The gap is structural maturity.

## Alignment Goal

Ground should move toward:

- Signal-grade chrome
- Atlas-grade mode clarity
- Ground-specific dossier-first structure

Ground should not move toward:

- Atlas-style research-terminal sprawl
- heavy left-nav shell before the product needs it
- queue-first or review-console semantics
- parcel-first interaction patterns
- dashboard-first homepage behavior

## What Must Stay True

- `Project` remains the hero object
- the active workflow remains:
  - `Coverage Universe`
  - `Project Dossier`
  - `Ground Feed`
  - `Watch Decision`
- provenance remains visible and legible at every important surface
- the dossier remains the center of gravity
- the shell must support decision-making, not exploration for its own sake

## Borrow From Signal

Ground should borrow these behaviors from Signal:

- stronger product chrome at the top of the app
- clearer workspace and mode framing
- stronger status language at a glance
- tighter hierarchy between app identity, context, and active work

### Signal Elements To Reuse In Spirit

- a more deliberate top header that feels terminal-like but restrained
- more explicit labeling for current context such as market, lens, and active object
- clearer "where am I?" cues when moving between universe and dossier states

### What Not To Borrow From Signal

- queue-driven interaction as the product center
- reviewer-console framing
- workflow language that makes Ground feel operationally generic instead of project-specific

## Borrow From Atlas

Ground should borrow these behaviors from Atlas:

- stronger mode separation
- stronger sense of durable product shell
- clearer sectional boundaries inside the active working surface

### Atlas Elements To Reuse In Spirit

- explicit distinction between a browsing state and an active working state
- stronger shell continuity across screens
- clearer sectional rhythm so the app feels like a product, not just a page

### What Not To Borrow From Atlas

- heavy persistent sidebar
- multi-mode sprawl before Ground has enough surfaces to justify it
- generic terminal complexity
- wide compare or research navigation

## Borrow From Altiratech.com

Ground should stay closer to the public site on:

- product posture language
- token polish
- contrast discipline
- concise product framing

### Public-Site Elements To Reuse In Spirit

- cleaner product identity treatment
- tighter neutral palette discipline
- stronger contrast between the product headline layer and the supporting metadata layer
- clearer relationship between brand language and product-specific task language

## What Ground Should Keep Unique

Ground should deliberately preserve these differences:

- dossier-first center panel instead of dashboard-first layout
- two-column rail plus active dossier structure
- thin navigation model rather than a full app-navigation framework
- watch and advance as the core decision end-state
- source trail, memo trail, and coverage posture as decision infrastructure

## Target Shell Model

The next shell iteration should have four layers.

### 1. Product Chrome

A clearer persistent top layer that includes:

- `Altira Ground` identity
- current lens: `Industrial Development`
- current pilot market or operating geography
- active mode indicator such as `Coverage Universe` or `Active Dossier`

This should feel more deliberate than the current topbar, but still quieter than Atlas.

### 2. Context Bar

A compact second layer that changes with state.

When no project is active:

- frame the universe as the current workspace
- show result count or active watch count
- reinforce that the user is screening, not browsing a parcel map

When a project is active:

- show project name
- jurisdiction
- watch state
- key recency or source-health cues

This gives Ground more mode clarity without adding a heavy sidebar.

### 3. Section Navigation

Inside active dossier state, add light section navigation for:

- `Coverage`
- `Dossier`
- `Feed`
- `Decision`

This can be a compact rail, tab row, or anchored section control. It should not become a global product nav.

### 4. Dossier Surface

Keep the current dossier core, but make the sections feel more intentionally productized:

- thesis and project identity
- blockers and unlocks
- source trail
- analyst notes
- memo trail
- feed
- watch decision

The point is not more content. The point is clearer grouping and rhythm.

## Token And Visual Direction

Ground should normalize closer to the Altira family tokens without losing its own tone.

Recommended adjustments:

- slightly tighter neutral palette alignment with the public site
- more consistent amber and cyan usage rules
- stronger distinction between primary headers and muted metadata
- more deliberate spacing rhythm in chrome and section wrappers
- keep IBM Plex Sans Condensed and IBM Plex Mono as the main family

Do not introduce:

- bright dashboard colors
- card-heavy consumer SaaS styling
- softer, generic Vite-app treatment
- map-product visual language

## One-Pass Implementation Order

If this plan is implemented, the sequence should be:

1. strengthen the top product chrome
2. add the context bar with universe versus active dossier state
3. add light dossier section navigation
4. tighten token usage and spacing rhythm
5. browser-review the shell for parity with existing provenance and workflow clarity

This should be done as one focused alignment pass, not as a rolling redesign.

## Explicit Non-Goals

This pass should not include:

- new workflow surfaces
- compare mode
- portfolio mode
- parcel search expansion
- map-first UI
- chat surfaces
- CRM behavior
- a broad navigation rewrite

## Acceptance Criteria

The alignment pass is successful if:

- Ground still reads dossier-first within five seconds of opening the app
- Ground feels visibly closer to Signal and the public Altira site without feeling like Atlas
- a user can clearly tell whether they are in `Coverage Universe` or an `Active Dossier`
- the active project context is visible without scrolling
- provenance, truth-type, and cited-source cues remain at least as legible as they are today
- the shell feels more productized without adding workflow sprawl

## Browser Review Checklist

- top chrome clearly identifies `Altira Ground`
- the current lens and market are visible
- universe state and active dossier state feel distinct
- the dossier center remains the visual hero
- source trail, analyst notes, memo trail, and watch decision remain easy to find
- no new element makes the app feel parcel-first or dashboard-first
- no section feels like a generic admin console

## Recommended Next Artifact

The next artifact after this plan should be a bounded implementation brief for the shell pass, not code changes spread across unrelated surfaces.

That implementation brief should name:

- exact shell elements to add or revise
- the file set expected to change
- the browser-review checkpoints
- the explicit non-goals for the pass
