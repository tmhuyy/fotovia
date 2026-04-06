# Booking Lifecycle Actions

## Purpose

This document records the phase where the booking feature moved beyond the initial request-response model and gained real lifecycle actions across both backend and frontend.

Before this phase, Fotovia booking already supported:

- real direct booking request creation
- persisted booking records
- photographer inbox review
- photographer confirm / decline actions
- client booking history and status tracking

However, the lifecycle still stopped too early.

The client side could not cancel a pending request, and the photographer side could not move a confirmed booking into a final completed state.

This phase closes that lifecycle gap.

## What this phase completed

This phase completed two new real booking lifecycle actions as one full backend + frontend slice:

### Client-side lifecycle action

- cancel a pending booking request

### Photographer-side lifecycle action

- mark a confirmed booking as completed

## Completed flow

### Client cancellation flow

1. a client creates a real booking request
2. the request appears in `/my-bookings`
3. while the request is still `pending`, the client can cancel it from the frontend
4. the booking status becomes `cancelled`
5. the updated status remains correct after reload

### Photographer completion flow

1. a client creates a real booking request
2. the photographer opens `/photographer/bookings`
3. the photographer confirms the request
4. once the request is `confirmed`, the photographer can mark it as completed
5. the booking status becomes `completed`
6. the updated status remains correct after reload
7. the client can later see the completed state from `/my-bookings`

## Backend work completed

### New client cancel action

This phase added a backend action that allows the current client to cancel a booking they own.

Rules enforced:

- the booking must belong to the current client
- only `pending` bookings can be cancelled

### Extended photographer status action

The photographer-side status update flow now supports one more lifecycle step:

- `confirmed -> completed`

Rules enforced:

- the booking must belong to the current photographer workspace
- only a `confirmed` booking can move into `completed`
- `pending` requests still support:
    - `confirmed`
    - `declined`

### Lifecycle validation matters

These backend rules are important because the lifecycle should remain valid even after reload or if someone tries to bypass the frontend UI.

The backend is the real source of truth for booking state transitions.

## Frontend work completed

### Client-side booking management

The client booking history UI now supports real booking lifecycle management:

- pending requests can be cancelled directly from the detail panel
- cancelled bookings remain visible in history for tracking
- client-side filters and counts now include `cancelled`

### Photographer-side booking management

The photographer inbox UI now supports the next lifecycle step:

- pending requests can still be confirmed or declined
- confirmed bookings can now be marked as completed
- photographer filters and counts now include:
    - cancelled
    - completed

### Shared status rendering

The booking UI now recognizes the following lifecycle states:

- pending
- confirmed
- declined
- completed
- cancelled

This state model is now reflected consistently across:

- client booking history
- photographer booking inbox
- booking status pills
- lifecycle copy in detail panels

## Product outcome after this phase

After this phase, Fotovia booking now supports a broader two-sided lifecycle:

### Client side

- create a booking request
- review it later
- track the response status
- cancel it while pending

### Photographer side

- review incoming requests
- confirm or decline pending requests
- mark confirmed bookings as completed

This makes the booking flow feel more like a real product workflow instead of stopping at the first response stage.

## What was validated

This phase was tested successfully through the real frontend flow.

Validated outcomes:

- a client can cancel a pending booking request from `/my-bookings`
- the cancelled state persists after reload
- the photographer can see cancelled requests in the inbox flow
- a photographer can mark a confirmed booking as completed
- the completed state persists after reload
- the client can later see the completed state from the real frontend

## Current booking capability after this phase

Fotovia booking now supports:

- public photographer discovery
- direct booking request creation
- persisted booking records
- photographer inbox review
- photographer confirm / decline actions
- client booking history
- client-side status tracking
- client-side pending cancellation
- photographer-side completion flow

This is the strongest booking feature state so far because both sides can now move the request through more than one lifecycle step.

## What is still missing

The booking feature is now much stronger, but it still lacks deeper lifecycle visibility and coordination.

Still missing:

- dedicated booking activity timeline / event history
- notifications
- messaging or conversation flow
- payment or deposit handling
- richer booking coordination after confirmation
- AI-assisted booking refinement

## Recommended next phase

## Phase Next: Booking Activity Timeline and Event History

The next useful step is to make booking state changes easier to understand for both sides.

### Why this should be next

The lifecycle now has more real actions:

- pending
- confirmed
- declined
- cancelled
- completed

But users still do not have a dedicated chronological timeline that explains:

- when the booking was created
- when it was confirmed
- when it was declined
- when it was cancelled
- when it was completed

Right now, users only see the current status. They do not see the full history of what happened and when.

### Suggested goals

- store booking lifecycle events
- expose booking timeline data from the backend
- show a timeline section in client booking detail
- show a timeline section in photographer booking detail
- make lifecycle changes easier to understand without using Swagger or database inspection

### Why this is a good next boundary

This would still be one complete backend + frontend feature slice:

- backend event persistence
- backend read endpoints
- frontend timeline UI
- real end-to-end test flow
