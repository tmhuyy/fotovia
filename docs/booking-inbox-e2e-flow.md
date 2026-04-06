# Booking Inbox E2E Flow

## Purpose

This document records the phase where the booking feature was completed as a real end-to-end product slice across both backend and frontend.

This phase should be treated as the point where Fotovia booking stopped being only a request-entry foundation and became a usable two-sided workflow.

## What this phase completed

This phase completed the following end-to-end flow:

1. a client opens a real public photographer detail page
2. the client starts a direct booking request from that selected photographer
3. the client submits a real booking request
4. the system saves the booking with initial `pending` status
5. the selected photographer can open the photographer booking inbox
6. the photographer can review the request details
7. the photographer can confirm or decline the request from the frontend

## Key implementation result

This phase is important because it closed the mismatch that existed before:

- earlier work had real booking creation on the client side
- earlier work had partial photographer inbox direction
- but the overall flow was not yet stable enough to be tested as one complete user feature

This phase fixed that by treating booking as one full slice instead of splitting backend and frontend into disconnected steps.

## Completed product behavior

### Direct booking request flow

The direct booking flow now behaves correctly:

- `/photographers/[slug]` can lead into a direct booking request
- `/bookings/new?photographerSlug=...` now resolves the selected photographer correctly
- the user is taken into the real booking request form instead of falling back into the older guided-brief-only local success path
- submitting the request now creates a real booking record
- the client sees the real success state backed by created booking data
- the success state shows the booking reference and request status

### Photographer inbox flow

The photographer-side booking workflow now behaves correctly:

- `/photographer/bookings` is the real photographer inbox route
- the inbox loads incoming booking requests for the signed-in photographer
- request details can be reviewed in the workspace UI
- the photographer can perform the first response decision:
    - confirm
    - decline
- request status updates are reflected in the frontend and stay correct after reload

## Important backend decisions in this phase

### Auth guard alignment

A major blocker in earlier attempts was that frontend auth state and backend auth guard behavior were not aligned.

This phase fixed that by making the shared auth guard work with the auth format actually used by the frontend flow.

Practical result:

- booking endpoints can now work correctly with the frontend-authenticated session in the tested flow
- the photographer inbox no longer fails only because of the old auth mismatch between frontend session state and backend guard expectations

### Supabase-safe schema approach

This phase kept the decision that shared Supabase schema changes should not depend on unsafe TypeORM auto synchronization.

Instead, schema work for this phase used a manual SQL migration direction.

Important DB additions for booking inbox flow:

- `clientEmail`
- `photographerUserId`

This keeps the booking flow practical while avoiding the earlier shared-table schema sync risk.

## Important frontend decisions in this phase

### One phase must equal one testable feature

This phase corrected an earlier planning mistake.

The booking feature is now treated with a stricter rule:

- a phase should cover one complete feature slice
- the phase should be testable from the real frontend
- the phase should not be considered done if the user flow still depends on placeholder logic or backend-only scaffolding

This rule should continue for the next phases.

### Direct booking entry is now explicit

The booking entry page now reads selected photographer context correctly and separates:

- guided booking brief flow when no photographer is selected
- direct photographer booking request flow when `photographerSlug` is present

That distinction is now part of the real product behavior, not only a temporary assumption.

## Manual SQL migration used in this phase

This phase used a manual SQL migration for the shared Supabase database.

Purpose of that migration:

- add `clientEmail`
- add `photographerUserId`
- backfill older booking rows where possible
- add indexes to support photographer inbox lookups and status filtering

This should be kept in repo history as the source of truth for the DB-side booking inbox changes.

## Test result summary

This phase has been tested successfully in the real frontend flow.

Validated behavior:

- direct booking request works from the client side
- booking success state works
- photographer inbox loads correctly
- photographer can confirm or decline requests
- the flow works as a real UI-driven booking slice

## Important testing note

The current auth/session model still behaves as one active session per browser storage context.

That means:

- two different accounts should not be tested in parallel inside the same browser storage context
- for dual-account testing, use separate contexts such as:
    - normal window + incognito
    - two different browsers
    - two browser profiles

This is not treated as a bug in the booking phase itself. It is part of the current auth/session architecture.

## Current booking capability after this phase

Fotovia now supports:

- public photographer discovery
- direct booking request creation
- persisted booking records
- photographer-side inbox review
- first response status handling from the photographer side

This means the booking feature now has a complete initial two-sided workflow foundation.

## What is still missing after this phase

The booking system is now real, but it is not yet fully mature.

Still pending:

- client-side booking history page
- client-side booking detail page
- visible status tracking for the client after submission
- richer booking lifecycle states beyond the first response
- possible booking detail timeline / activity history
- notifications / messaging
- payment or deposit flow
- AI-assisted booking refinement

## Recommended next phase

## Phase Next: Client Booking History and Status Tracking

The natural next step is to complete the booking visibility loop for the client side.

After this phase, photographers can already see and respond to booking requests, but clients still need a proper place to:

- view their submitted requests
- review request details later
- track current request status after photographer action

That should be the next booking phase so the booking feature becomes understandable from both sides of the marketplace.
