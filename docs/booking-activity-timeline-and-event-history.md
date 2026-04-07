# Booking Activity Timeline and Event History

## Purpose

This document records the phase where Fotovia booking gained a real activity timeline and event history across both backend and frontend.

Before this phase, the booking feature already supported:

- real direct booking request creation
- photographer inbox review
- photographer confirm / decline actions
- client booking history
- client-side pending cancellation
- photographer-side completion flow

However, users still only saw the current booking status. They could not clearly understand the full sequence of events that happened over time.

This phase closes that gap.

## What this phase completed

This phase completed a real booking timeline feature as one full backend + frontend slice.

### Completed flow

1. a client creates a booking request
2. the system stores a `created` booking event
3. later lifecycle actions also create timeline events such as:
    - confirmed
    - declined
    - cancelled
    - completed
4. the client can open the booking detail UI and see a chronological activity timeline
5. the photographer can open the booking detail UI and see the same booking timeline from the workspace side
6. after reload, the timeline still reflects the stored event history

## Backend work completed

### Booking event persistence

This phase introduced a dedicated booking event model.

The system now stores separate lifecycle events instead of only relying on the current booking status.

Supported event types:

- created
- confirmed
- declined
- cancelled
- completed

### Timeline read paths

This phase added real backend read paths for booking timeline access with correct ownership checks:

- client timeline access for bookings created by the current client
- photographer timeline access for bookings belonging to the current photographer workspace

This keeps the timeline private and role-safe.

### Manual SQL migration

Because the project uses a shared Supabase database and avoids unsafe schema synchronization, this phase used a manual SQL migration to:

- create `booking_events`
- add indexes for timeline reads
- backfill `created` events for older bookings
- backfill lifecycle events for older bookings that already had final statuses

## Frontend work completed

### Shared timeline UI

This phase introduced a reusable booking timeline component that renders:

- loading state
- empty state
- error state
- ordered event list
- event actor information
- event time
- optional event notes

### Client-side booking timeline

The client booking detail view now shows the full activity timeline for the selected booking.

This means the client can understand not only the current status, but also the history of how the booking reached that status.

### Photographer-side booking timeline

The photographer booking detail view now also shows the full activity timeline.

This makes the workspace easier to understand because lifecycle actions are now visible as historical events, not only as a final state.

## Product outcome after this phase

After this phase, Fotovia booking now supports:

- real request creation
- real request ownership
- client history
- photographer inbox
- lifecycle actions
- full booking activity timeline

This is the first point where the booking feature has both:

- practical lifecycle control
- practical lifecycle visibility

for both marketplace roles.

## What was validated

This phase was tested successfully through the real frontend flow.

Validated outcomes:

- newly created bookings show a `created` timeline event
- confirming a booking adds a `confirmed` event
- declining a booking adds a `declined` event
- cancelling a booking adds a `cancelled` event
- completing a booking adds a `completed` event
- both client and photographer can view the timeline from the real UI
- timeline data remains correct after reload

## Current booking capability after this phase

Fotovia booking now supports the following end-to-end behavior:

### Client side

- browse photographers
- create a real booking request
- track request history
- cancel a pending request
- view full booking timeline

### Photographer side

- review incoming requests
- confirm or decline pending requests
- mark confirmed bookings as completed
- view full booking timeline

This makes booking a much more understandable two-sided workflow.

## Booking scope status

At this point, the booking feature is strong enough to be treated as an MVP-complete booking module for the current product stage.

That means booking now already covers the essential marketplace loop:

- request creation
- request response
- request tracking
- lifecycle actions
- lifecycle visibility

Additional booking work can still be done later, but it is no longer required before moving to the next strategic product area.

## What is still optional backlog for booking

Possible later booking expansions include:

- notifications
- messaging / conversation flow
- payment or deposit handling
- richer post-confirmation coordination
- calendar / scheduling refinement

These are useful future product improvements, but they are not blockers for moving the project into the AI-powered portfolio classification direction.

## Recommended next phase

## Phase Next: Portfolio AI Classification Foundation

The next major product step should shift from booking depth into the AI capability that differentiates Fotovia.

### Why this should be next

The booking loop is already practical enough for the current stage.

The next strategically important feature is to let the system understand photographer style automatically from uploaded portfolio images, instead of depending only on manual human labeling.

### Suggested goals

- detect style class for uploaded portfolio images using the existing AI classification direction
- support the current 10 photography classes
- store classification results in the backend
- aggregate image-level predictions into a portfolio-item-level detected style result
- surface the detected result in the photographer workspace
- prepare the data for later marketplace filtering and smarter photographer matching

### Why this is a good next boundary

This would still be one complete backend + frontend feature slice:

- backend integration with the AI classification service
- persistence of classification results
- frontend visibility in portfolio management UI
- real end-to-end test flow from upload to detected style display
