# Frontend Profile Integration Notes

## Purpose

This document keeps track of the real frontend profile integration state in `apps/web`.

## Current profile API direction

The frontend now treats profile data as a separate backend concern from auth identity.

### Identity source

`/auth/me` provides:

- `id`
- `email`
- `role`

This is used for auth/session hydration.

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

The frontend now uses a dedicated profile API client.

Reason:

- auth service and profile service are separate backend services
- profile requests should not be routed through the auth service client
- service separation should stay visible in the frontend service layer as well

## Current `/profile` behavior

Status: **working**

Behavior:

- signed-in users can load real profile data
- if no profile exists yet, the UI can create a minimal profile foundation
- users can update real profile fields through the profile service
- profile UI no longer depends on mock profile builders in the main production-facing flow

## Backend compatibility requirement

The profile service must:

- allow the Next app origin
- allow credentials

Without this, the dedicated profile client will not work correctly in local development.

## Current limitation

This phase focuses on the profile foundation only.

Still pending:

- richer photographer profile fields
- avatar upload
- portfolio integration
- public photographer-profile read flow from real backend data
- stronger profile completion guidance after sign-up

## Recommended next phase

### Protected Profile and Authenticated Page Rules

Goals:

- protect `/profile` and future authenticated pages
- align auth-required routes with real session state
- guide signed-in users more intentionally into profile completion
