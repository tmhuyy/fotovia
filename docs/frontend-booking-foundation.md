# Frontend Booking Foundation Notes

## Purpose

This document tracks the first real booking-request foundation in `apps/web` and its paired backend contract in `apps/booking`.

It explains how the product moved from a guided / placeholder booking entry into a real authenticated booking creation flow using selected public photographer data.

## Previous booking direction

The earlier booking flow was useful as a UI foundation, but it was still lightweight.

That earlier phase introduced:

- `/bookings/new` route foundation
- booking brief / guided entry structure
- form UX and validation foundation
- prefill support from query params
- local-only submission state
- no real booking persistence yet

That earlier direction was helpful because it let the booking UX take shape before the real backend contract was ready.

## Current booking direction

Status: Working foundation for real booking request creation from public photographer detail data

The current booking flow now uses:

- real public photographer detail as the booking source context
- real authenticated booking submission
- real backend booking creation instead of browser-local success state
- selected photographer context preserved through the booking page
- protected route behavior through the authenticated booking route
- success UI backed by created booking response data

### Current entry routes

- `/photographers/[slug]`
- `/bookings/new`

### Current source of truth

- backend profile / public photographer APIs for selected photographer detail
- backend booking service for booking request creation
- frontend booking page reads selected photographer context from real public data instead of mock-only booking context

## Current booking request shape

The current real booking request flow sends:

- `photographerProfileId`
- `photographerSlug`
- `photographerName`
- `sessionType`
- `sessionDate`
- `sessionTime`
- `duration`
- `location`
- `budget`
- `contactPreference`
- `concept`
- `inspiration`
- `notes`

The saved booking record now also includes:

- `id`
- `clientUserId`
- `status`
- `createdAt`
- `updatedAt`

## Current booking flow

The current real booking request flow is:

1. open `/photographers/[slug]`
2. load real public photographer detail from backend data
3. click the booking CTA on the photographer detail page
4. navigate to `/bookings/new?photographerSlug=...`
5. resolve the selected photographer again from real public photographer data
6. require authenticated access for the booking route
7. fill in booking request details
8. submit the form to the real booking API
9. create a persisted booking request with `pending` status
10. render the success state using the real created booking response

## Current UX behavior

### Preserved behavior

The current phase intentionally keeps the UX direction that already felt correct in the earlier booking foundation:

- premium, calm booking page presentation
- guided booking form structure
- validation-first form behavior
- summary card beside the request form
- selected photographer context visible during booking

### New real behavior

This phase upgrades the booking flow with:

- real CTA handoff from public photographer detail
- real selected photographer lookup on booking page
- protected booking route behavior
- real API submission instead of local-only submit simulation
- success state based on persisted booking data
- request reference / status display after submit
- cleaner separation between booking brief entry and photographer-selected booking request flow

## Why this phase matters

This phase turns booking into the first real user action that connects public discovery to backend persistence.

The current end-to-end path now includes:

- browse real photographers on public pages
- open one real public photographer detail page
- start a booking request from that selected photographer
- keep the photographer context inside the booking flow
- authenticate before accessing the protected booking page
- submit a real request to the backend
- receive a created booking response instead of fake local success state

That makes the product feel more like a real marketplace workflow instead of only a showcase + placeholder request experience.

## Current known limitations

This phase creates the real booking request foundation, but the booking system is still not complete.

Still pending:

- photographer-side booking inbox / request management
- client-side booking history / request tracking
- richer booking status transitions
- photographer response actions such as confirm / decline
- inspiration-image upload as part of booking
- AI-assisted booking input and recommendation flow
- notifications around booking updates

## Recommended next phase

## Phase FE/BE Next: Photographer Booking Inbox and Status Foundation

### Why this should be next

The platform can now create real booking requests from public photographer detail pages.

The next major product gap is what happens after that request is created.

Right now, the client can submit a real request, but the photographer side still needs a real place to review incoming requests and update request status. Without that management layer, the booking flow is only complete on the client-entry side.

### Suggested goals

- create a signed-in photographer booking inbox route
- load real booking requests for the current photographer
- show request details in a usable review UI
- support initial status actions such as confirm or decline
- keep the contract ready for later client-side request tracking
- prepare the foundation for notifications and richer booking lifecycle features later

## Notes for later

After photographer booking inbox/status foundation is stable, the next likely product steps should be:

- client booking history / booking detail pages
- richer booking status timeline
- notifications and conversation flow
- inspiration-image upload in booking
- AI-assisted photographer matching and booking assistance
