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

- signed-in users can load real profile data
- if no profile exists yet, the UI can create a profile foundation
- users can update real profile fields through the profile service
- profile UI no longer depends on mock profile builders in the main production-facing flow

## Current profile UX behavior

Status: **improved**

Behavior:

- profile save uses snackbar feedback instead of inline success boxes
- profile foundation creation uses snackbar feedback
- summary card now handles long email and phone values more safely
- profile access is available from the signed-in account area instead of cluttering the main navbar

## Current known limitation

This phase focuses on the profile foundation only.

Still pending:

- authenticated-only route protection for `/profile`
- richer photographer profile fields
- avatar upload
- portfolio integration
- public photographer-profile read flow from real backend data
- profile completion guidance after sign-in or sign-up

## Recommended next phase

### Protected Profile and Authenticated Page Rules

Goals:

- protect `/profile` and future authenticated pages
- align auth-required routes with the real session state
- guide signed-in users more intentionally into profile completion or next actions
