# Altira Ground Source Adapter Rules

## Purpose

This document locks the first source-ingest rules for Ground so data adapters stay honest and reusable.

## Source Classes

- `official_public`
- `vendor`
- `licensed`
- `manual`

## Required Metadata For Every Source Record

- source class
- publisher
- title
- source URL when available
- retrieved timestamp
- published timestamp when available
- rights status
- record type

## Adapter Output Rule

No adapter should write directly into approved dossier claims.

Adapters should produce:
1. raw source artifact metadata
2. normalized source record
3. candidate events or candidate claims for review

## First Source Priorities

The first repo pass should preserve support for:
- parcel and appraisal records
- zoning and future-land-use records
- civic agendas and minutes
- FEMA flood context
- USGS elevation context
- FCC broadband context
- ERCOT planning and grid context
- manual analyst notes

## Rights Rule

- Public sources may be used first when access and citation are clear.
- Vendor or licensed sources must not be treated as safe by default.
- Scraped data with unclear rights must not become canonical product fuel.

## Storage Rule

- Keep source metadata separate from approved claims.
- Preserve source trail on candidate events and candidate claims.
- Keep manual notes attributable to a user or analyst identity.
