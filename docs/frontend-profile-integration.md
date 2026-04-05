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
- `avatarUrl`
- `avatarAssetId`

This is used for the production-facing profile page.

## Frontend API client split

The frontend now uses dedicated service clients for both profile and asset flows.

### Current clients

- `profileClient`
- `assetClient`

### Reason

- auth service and profile service are separate backend services
- asset upload flow is a separate backend concern from profile field editing
- service boundaries should stay visible in the frontend service layer too

## Current `/profile` behavior

**Status:** Working end-to-end for profile foundation + avatar upload

### Behavior

- `/profile` is treated as an authenticated-only page
- signed-in users can load real profile data
- signed-out users are redirected away through the protected-route flow
- if no profile exists yet, the UI can create a profile foundation
- users can update real profile fields through the profile service
- users can choose a local avatar image and preview it before upload
- users can upload and replace avatar images through the real backend asset flow
- the summary card updates from real backend avatar data after a successful upload
- avatar state survives refresh because it is now backed by real backend profile data

## Current avatar upload flow

The current frontend avatar flow is:

1. choose an image file on `/profile`
2. validate file type and size in the frontend
3. generate a local preview
4. call `POST /assets/upload-sessions`
5. upload the file to the signed upload URL
6. call `POST /assets/upload-sessions/{sessionId}/confirm`
7. call `PATCH /profiles/me/avatar`
8. update or refetch `/profiles/me`
9. render the real `avatarUrl` in the profile UI

## Current profile UX behavior

**Status:** Improved

### Behavior

- profile save uses snackbar feedback instead of inline success boxes
- profile foundation creation uses snackbar feedback
- avatar upload uses snackbar feedback
- summary card handles long email and phone values more safely
- profile access is available from the signed-in account area instead of cluttering the main navbar
- avatar upload keeps the page flow lightweight instead of moving users to a separate media page

## Relationship to workspace direction

- `/profile` remains the editable profile source page for signed-in users
- `/photographer/dashboard` remains the photographer workspace / progress page
- the workspace route does not replace `/profile`; it gives post-auth product direction a clearer home
- profile role data continues to help drive authenticated UI direction where auth identity alone was not sufficient

## Current known limitations

This phase now covers the real profile foundation and real avatar upload, but it still does not complete the full photographer media flow.

Still pending:

- richer photographer profile fields
- real backend persistence for photographer portfolio items
- real backend persistence for portfolio media mappings
- public photographer-profile read flow with real saved portfolio content
- broader profile completion guidance that reacts to avatar and portfolio readiness together

## Why this phase matters

This phase gives the product its first real profile-media vertical slice.

The current end-to-end flow now includes:

- sign in
- open `/profile`
- load real profile data
- upload a real avatar through the asset service
- connect the uploaded asset to the profile
- render the saved avatar again after refresh

This is the first production-facing profile/media loop in the web app that is no longer frontend-only.

## Recommended next phase

## Phase FE-2 / BE-3: Real Portfolio Persistence + Portfolio Media Integration

### Why this should be next

Avatar upload is now working end-to-end, but photographer portfolio data is still only persisted locally in the current browser.

That means the next biggest gap between the current frontend experience and a true marketplace-ready product is portfolio persistence.

### Suggested goals

- replace browser-local portfolio persistence with real backend persistence
- connect portfolio item media to the existing asset service
- keep `/photographer/portfolio` as the signed-in source page for managing photographer works
- preserve existing frontend UX where possible:
    - create
    - edit
    - delete
    - feature / unfeature
    - newest-first ordering
- prepare later public photographer detail pages to consume real saved portfolio items

### Suggested frontend direction

The fastest clean direction is:

1. keep the current portfolio page structure
2. replace local storage as the source of truth with real backend queries and mutations
3. upload portfolio images through the same asset upload-session flow already proven by avatar upload
4. save portfolio item records that reference real uploaded assets
5. continue using snackbar feedback and thin pages with service-layer API calls

## Notes for later

After real portfolio persistence is stable, the next logical product step should likely be:

- public photographer detail integration with real saved portfolio data
- backend-driven discovery improvements
- AI classification on uploaded photographer works
