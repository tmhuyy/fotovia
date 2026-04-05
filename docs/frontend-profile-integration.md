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
- `/photographer/portfolio` now handles real photographer portfolio persistence separately
- the workspace route does not replace `/profile`; it gives post-auth product direction a clearer home
- profile role data continues to help drive authenticated UI direction where auth identity alone was not sufficient

## Current known limitations

This phase now covers the real profile foundation and real avatar upload, but it still does not complete the full public photographer experience.

Still pending:

- richer photographer profile fields for public presentation
- public photographer-profile read flow from real backend data
- public photographer detail integration with real saved portfolio content
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

## Phase FE/BE Next: Public Photographer Detail Integration with Real Saved Data

### Why this should be next

The signed-in profile and portfolio flows now persist real backend data, but the public marketplace still does not consume that saved data yet.

The next visible product milestone should be:

- real public photographer detail data
- real public portfolio rendering
- real bridge from photographer workspace to marketplace-facing pages

### Suggested goals

- expose a public photographer read model from the backend
- support a stable public route key such as slug
- replace mock detail-page portfolio sections with real saved backend portfolio items
- surface avatar, basic profile fields, and featured works from real saved data
- keep the signed-in edit routes separate from the public read routes

## Notes for later

After public photographer detail integration is stable, the next logical media/product step should likely be:

- multi-image gallery support per portfolio item
- image upload hardening and client-side compression
- discovery/listing integration from real saved photographer data
