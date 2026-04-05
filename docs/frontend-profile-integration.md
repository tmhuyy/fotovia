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

## Relationship to workspace direction

- `/profile` remains the editable profile source page for signed-in users
- photographer accounts can now reach `/profile` from a protected workspace foundation
- the workspace route does not replace `/profile`; it gives post-auth product direction a clearer home
- profile role data now helps drive authenticated UI direction where auth identity alone was not sufficient

## Current known limitation

This phase still keeps profile editing separate from richer onboarding, portfolio tooling, and booking management.

## Recommended next phase

### Profile Completion Direction + Role-Aware Product Guidance

Goals:

- connect profile completeness more clearly to the photographer workspace
- decide whether incomplete profile state should drive stronger prompts or gated actions
- prepare later portfolio and booking-management flows without overloading the current profile page

## Phase 26: Profile completion guidance

This phase builds on top of the existing real `/profiles/me` integration and uses that data to guide photographer users inside the protected workspace.

### What changed

- profile completion is now computed from real profile data
- the photographer workspace now shows completion percentage and missing profile areas
- `/profile` remains the editable source page
- the workspace acts as a guidance and progress layer rather than replacing profile editing

### Current completion fields

The current profile completion logic checks these fields:

- full name
- phone
- location
- bio
- specialties
- price per hour
- experience years

### Current states handled

The workspace now handles these profile-related states:

- loading profile progress
- profile exists and is partially complete
- profile exists and is fully complete
- profile is missing
- profile request fails for another reason

### Relationship to workspace direction

This phase makes the photographer workspace more meaningful without turning it into a heavy dashboard.

Current rule:

- `/profile` = edit real data
- `/photographer/dashboard` = see progress, guidance, and next product direction

## Recommended next phase

### Photographer Portfolio Foundation

Goals:

- define the first real portfolio structure for photographer accounts
- connect workspace direction to portfolio setup
- prepare later public discovery and photographer detail improvements using more realistic portfolio data
