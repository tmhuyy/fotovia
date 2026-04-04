# Frontend Profile Integration Notes

## Purpose

This document tracks the current production-facing profile integration state in `apps/web`.

## Current profile API direction

The frontend now treats profile data as a separate backend concern from auth identity.

### Identity source

`/auth/me` provides:

- `id`
- `email`
- `role`

This is used for auth and session hydration.

### Profile source

`/profiles/me` provides editable profile data such as:

- `fullName`
- `phone`
- `location`
- `bio`
- `specialties`
- `pricePerHour`
- `experienceYears`

This is used for the production-facing profile page.

## Frontend API client split

The frontend uses a dedicated `profileClient`.

Reason:

- auth service and profile service are separate backend services
- profile requests should not be routed through the auth client
- service boundaries should stay visible in the frontend service layer too

## Current `/profile` behavior

Status: **working**

Behavior:

- `/profile` is now treated as an authenticated-only page
- signed-in users can load real profile data
- signed-out users are redirected away through the protected-route flow
- if no profile exists yet, the UI can create a profile foundation
- users can update real profile fields through the profile service
- profile UI no longer depends on mock profile builders in the main production-facing flow

## Current profile UX behavior

Status: **improved**

Behavior:

- profile save uses snackbar feedback instead of inline success boxes
- profile foundation creation uses snackbar feedback
- summary card handles long email and phone values more safely
- profile access is available from the signed-in account area instead of cluttering the main navbar

## Current known limitation

This phase focuses on the profile foundation only.

Still pending:

- richer photographer profile fields
- avatar upload
- portfolio integration
- public photographer-profile read flow from real backend data
- profile completion guidance after sign-in or sign-up

## Recommended next phase

### Profile Completion Direction + Role-Aware Product Entry

Goals:

- build on top of the protected `/profile` and protected booking-entry foundation
- decide how profile completion should connect to later booking or onboarding paths
- clarify what clients and photographers should see next after authentication
