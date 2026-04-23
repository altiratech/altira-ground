# Altira Ground AI Boundary

## Purpose

This document explains how AI can assist Ground without becoming hidden source of truth.

## Allowed Uses

AI may help with:
- extraction from source documents
- summarization
- clustering similar evidence
- change explanation
- memo drafting

## Prohibited Uses

AI may not:
- create observed facts without a cited source
- silently overwrite approved claims
- convert inferred claims into observed facts
- resolve conflicting sources without surfacing the conflict
- replace dossier structure with a generic chat surface

## Review Gate

Human review is required before:
- a material claim becomes part of a canonical dossier section
- an inferred claim becomes a blocker or unlock
- a hypothetical path is shown as a recommended option

## Display Rule

- observed, inferred, and hypothetical content must never look identical
- inferred and hypothetical content must show confidence and source lineage
- AI-authored memo text must not back-propagate into source-of-truth fields automatically

## Repo Rule

Keep AI features downstream of the object model. If the product cannot explain a claim without AI flourish, the underlying contract is not ready.
