# Altira Ground Domain Model

## Purpose

This document summarizes the first durable nouns and relationships for the repo-local implementation pass.

## Hero Object

- `Project`

The product center is the project thesis and decision workflow, not the parcel alone.

## Core Objects

| Object | Role in product |
| --- | --- |
| `Project` | hero object for evaluation, monitoring, memo, and decision state |
| `SiteParcel` | physical-site evidence attached to a project |
| `Jurisdiction` | planning and local-government context attached to a project |
| `SourceRecord` | cited source artifact backing claims and events |
| `Event` | time-based change that can move underwriting posture |
| `EvidenceClaim` | material statement with truth type, confidence, and provenance |
| `Memo` | screen or diligence narrative tied to evidence |
| `WatchState` | persisted watch or advance decision |

## Relationship Summary

- one `Project` has one or more `SiteParcel`
- one `Project` belongs to one primary `Jurisdiction` in v1
- one `Project` has many `EvidenceClaim`
- one `Project` has many `Event`
- one `Project` has many `Memo`
- one `Project` has one current `WatchState`
- one `EvidenceClaim` can cite one or more `SourceRecord`
- one `Event` can cite one or more `SourceRecord`

## State Model

### Project status

- `sourced`
- `reviewing`
- `watching`
- `advancing`
- `archived`

### Watch decision

- `none`
- `watch`
- `advance`

## Truth Model

### Truth types

- `observed`
- `inferred`
- `hypothetical`

### Required rule

Every material `EvidenceClaim` must carry:
- `truthType`
- provenance via source record references
- `confidence` when the claim is not observed

## Implementation Invariants

- `Project` remains the hero object.
- Material claims are source-backed.
- Inferred claims are reviewable and visibly labeled.
- `WatchState` is part of the founding workflow, not a future extra.
