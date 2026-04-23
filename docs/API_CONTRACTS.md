# Altira Ground API Contracts

## Purpose

This document locks the initial API surface so the first Ground repo does not sprawl before the workflow works.

## Initial Endpoints

### `GET /health`

Purpose:
- simple API health check

### `GET /projects`

Purpose:
- return the compact coverage list

Initial response shape:
- project id
- name
- lens
- status
- market key
- latest event date
- current watch decision

### `POST /projects`

Purpose:
- create a new sourced project shell

Required request fields:
- `name`
- `marketKey`
- `thesis`

Initial behavior:
- create project in `sourced`
- create empty/default watch state

### `GET /projects/:projectId`

Purpose:
- return the dossier payload

Initial response sections:
- project summary
- thesis
- next-use options
- blockers
- unlocks
- site context
- jurisdiction context
- timeline
- manual analyst-note sources
- memos
- watch state
- full project-linked source record set across project, site, claim, event, and memo references

### `GET /projects/:projectId/feed`

Purpose:
- return project or jurisdiction events relevant to the dossier

Initial response shape:
- ordered list of `Event`
- source references
- truth type
- confidence where needed

### `POST /projects/:projectId/watch-state`

Purpose:
- persist a workflow decision

Required request fields:
- `decision` = `watch` or `advance`
- `reason`

State rules:
- `watch` promotes project to `watching`
- `advance` promotes project to `advancing`

### `POST /projects/:projectId/memos`

Purpose:
- save a screen or diligence memo

Required request fields:
- `memoType`
- `title`
- `bodyMarkdown`
- `sourceRecordIds` with at least one cited source

### `GET /local/bootstrap`

Purpose:
- preview the local bootstrap seed catalog and current local coverage state

Initial response shape:
- store mode (`memory` or `d1`)
- seed version
- seeded bootstrap project summaries
- current project summaries
- missing seed project ids
- extra project ids

Rule:
- local-only control surface, not part of the user-facing product shell
- repo-local bootstrap scripts may inspect the same local state directly from the D1 SQLite file when Worker startup is not needed

### `POST /local/bootstrap/reset`

Purpose:
- reset local Ground coverage back to the bootstrap seed catalog

Initial response shape:
- bootstrap state before reset
- bootstrap state after reset
- reset timestamp

Rule:
- local-only control surface for development hygiene and verification
- repo-local bootstrap reset and verification scripts may apply the same reset directly against the local D1 SQLite file

## Contract Rules

- No endpoint should emit a material claim without provenance.
- No endpoint should collapse observed and inferred claims into one unlabeled surface.
- The first API pass should optimize for readability and trust, not breadth.

## Planned Shared Contracts

The first shared schema pass should include:
- `Project`
- `SiteParcel`
- `Jurisdiction`
- `SourceRecord`
- `Event`
- `EvidenceClaim`
- `Memo`
- `WatchState`
