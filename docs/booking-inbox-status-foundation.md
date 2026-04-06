# Booking Inbox and Status Foundation Notes

## Purpose

This document tracks the first foundation work for photographer-side booking inbox and request status management.

It exists after the earlier booking request creation phase, where clients could already open a public photographer detail page, enter the booking flow, and submit a real booking request.

This phase focuses on the next missing step in the booking lifecycle: what happens after the booking request is created.

## Current baseline before this phase

Before this phase started, the product already supported:

- real public photographer browsing
- real public photographer detail by slug
- real booking entry from public photographer detail
- authenticated booking request submission
- persisted booking creation with initial `pending` status
- success state on the booking request page backed by real response data

At that point, the booking system was only complete on the client-entry side.

The major gap was that photographers still did not have a real place to review incoming requests or update request status.

## What this phase attempted

This phase started the foundation for photographer-side booking inbox and first-response status actions.

Target direction:

- add photographer booking inbox route in the frontend
- load incoming booking requests for the signed-in photographer
- show request details in a usable workspace view
- support the initial status actions:
    - confirm
    - decline

## Current implementation status

Status: In progress / not yet treated as fully complete

### Backend direction started

The phase started the backend work needed for photographer-side booking operations:

- add logic to identify which booking requests belong to the current photographer
- add logic to list incoming booking requests
- add logic to update request status from `pending` to an initial response state
- prepare the booking entity / service layer for inbox ownership handling

### Frontend direction started

The phase also started the frontend direction for a photographer booking workspace:

- route concept for `/photographer/bookings`
- booking inbox list + detail layout direction
- status display and action direction
- dashboard entry point direction from photographer workspace

## Important blocker discovered

A major technical issue was discovered during this phase:

The local implementation initially introduced a partial lookup entity for the shared `profiles` table inside the booking service.

Because the project is using a shared Supabase PostgreSQL database, and `synchronize` was enabled in development-style service config, that partial entity created schema-sync risk against the real `profiles` table.

This caused a serious drift risk for a shared table that is primarily owned by the profile service.

## Key decision from this phase

### Do not rely on `synchronize: true` against Supabase shared DB

From this phase onward, shared Supabase database work should not depend on TypeORM auto schema synchronization.

Recommended direction:

- keep `synchronize: false` for services using the shared Supabase database
- apply schema changes intentionally through SQL or migration-style steps
- avoid defining partial TypeORM entities for shared tables owned by another service

### Booking ownership lookup should avoid shared-table partial entity sync

For photographer ownership lookup, the safer direction is:

- use read-only SQL access for lookup
- or use a service-to-service data access pattern later
- but do not map a partial `profiles` entity in booking service when schema sync is active

## What is considered done from this phase

Even though the full photographer inbox flow is not yet signed off as complete, this phase still produced useful project-level progress:

- it clarified the next required booking lifecycle step
- it defined the intended backend and frontend shape for photographer inbox/status handling
- it exposed the schema-sync risk with shared Supabase DB
- it established a safer rule for future schema work:
    - shared remote DB should not rely on TypeORM synchronize

## What is not yet considered complete

This phase should not yet be marked as a finished end-to-end booking phase.

Still not fully signed off:

- stable backend implementation for photographer inbox ownership and status update
- stable frontend implementation for `/photographer/bookings`
- full tested confirm / decline flow from UI to backend
- final route protection and role validation pass
- end-to-end smoke test for inbox flow

## Recommended next phase

## Phase Next: Complete Photographer Booking Inbox and Status Flow (BE + FE)

This should be treated as the next real phase, not a later optional polish task.

### Why this should be next

The product already supports real booking request creation from the client side.

The booking feature still feels incomplete until the photographer side can:

- see incoming requests
- open request details
- confirm or decline the request
- keep the state consistent in both backend and frontend

This next phase should finish that missing second half of the booking workflow.

### Required rules for the next phase

From the next phase onward, implementation should be done as one combined slice:

- backend contract
- frontend route / UI
- service integration
- test flow guidance

The goal is to make each phase testable end-to-end instead of leaving backend-only or frontend-only partial work.

## Next phase target scope

- stabilize backend inbox ownership lookup without unsafe schema sync behavior
- complete backend endpoints for:
    - list incoming photographer booking requests
    - update request status
- complete frontend `/photographer/bookings` flow
- connect photographer dashboard entry into the inbox
- validate role-aware access
- provide Supabase-safe SQL notes if any schema changes are needed
- provide explicit test steps for the full booking inbox workflow

## Acceptance criteria for the next phase

- a client can create a real booking request
- the selected photographer can sign in and open `/photographer/bookings`
- the photographer can see incoming requests that belong to them
- the photographer can open request details
- the photographer can confirm or decline a pending request
- the UI updates correctly after the status action
- the backend and frontend flow is tested together as one end-to-end slice
