# Frontend Profile Integration Notes

## Purpose

This document tracks the current production-facing profile integration state in `apps/web`.

## Current profile API direction

The frontend treats profile data as a separate backend concern from auth identity.

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

This is used for the signed-in production-facing profile page.

## Frontend API client split

The frontend now uses dedicated service clients for profile, asset, and public photographer flows.

### Current clients

- `profileClient`
- `assetClient`

### Reason

- auth service and profile service are separate backend services
- asset upload flow is a separate backend concern from profile field editing
- public photographer read flow should stay separate from signed-in editing concerns
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

## Relationship to workspace direction

- `/profile` remains the editable profile source page for signed-in users
- `/photographer/dashboard` remains the photographer workspace / progress page
- `/photographer/portfolio` handles signed-in photographer portfolio persistence
- `/photographers` and `/photographers/[slug]` now consume real backend public photographer data
- the workspace route does not replace `/profile`; it gives post-auth product direction a clearer home

## Current public photographer detail status

**Status:** Working with real saved backend data

### Current public read behavior

- `/photographers` now reads real public photographer summaries from the backend
- `/photographers/[slug]` now reads real public photographer detail by slug
- public pages now render real saved avatar data
- public pages now render real saved portfolio items
- the public read side now updates when signed-in profile or portfolio data changes and the public page is refreshed

## Why this phase matters

This means Fotovia is no longer limited to “signed-in edit flows only”.

The current product now supports a real loop of:

- photographer signs in
- photographer updates profile and avatar
- photographer saves portfolio items
- public marketplace pages read the saved data
- clients can browse real photographer detail instead of mock content

That is the first meaningful signed-in to public-read bridge in the system.

## Current known limitations

This phase completes the first real public photographer read flow, but it is still intentionally narrow.

Still pending:

- richer public photographer presentation fields
- one cover image plus optional gallery images per portfolio item
- client-side compression or image optimization before upload
- broader profile completion guidance that reacts to avatar, portfolio, and public readiness together
- booking flow consumption of real public photographer detail data

## Recommended next phase

## Phase FE/BE Next: Multi-image Portfolio Gallery + Client-side Compression

### Why this should be next

The public detail flow now works, so the next gap is no longer “can clients see real data?”
The next gap is “is photographer media rich enough and efficient enough for real usage?”

The current portfolio item still uses one primary image only. That is good for the first persistence slice, but it is limiting for real photography showcase workflows.

### Suggested goals

- keep one required cover image per portfolio item
- add optional gallery images for the same portfolio item
- support image ordering inside each portfolio item
- add client-side image compression before upload
- keep asset upload-session flow as the shared upload path
- avoid breaking the current single-image item flow while expanding it

## Notes for later

After multi-image gallery support is stable, the next likely product step should be:

- public photographer detail gallery refinement
- booking flow integration using real public photographer data
- AI classification triggered from saved uploaded photographer works
