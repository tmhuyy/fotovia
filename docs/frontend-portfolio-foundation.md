# Frontend Portfolio Foundation Notes

## Purpose

This document tracks the current photographer portfolio flow in `apps/web`.

It explains how the portfolio experience moved from a browser-local foundation into a real backend-backed persistence flow, then into a public-facing read flow, and now into a richer multi-image media flow.

## Previous foundation direction

The earlier portfolio phase focused on UI and local portfolio state only.

That phase introduced:

- portfolio route foundation
- portfolio item form and grid
- asset preview model
- local image preview generation
- browser-local persistence
- newest-first ordering
- feature / unfeature actions in the frontend

That foundation was useful because it let the product lock the UX direction before backend persistence was ready.

## Current portfolio direction

**Status:** Working end-to-end for signed-in photographer portfolio persistence, public portfolio reading, and first-pass multi-image support

The current portfolio flow now uses:

- real backend CRUD through profile service
- real asset upload through asset service
- real saved portfolio items instead of browser-local source of truth
- real public rendering of saved photographer works on public detail pages
- one cover image plus optional gallery images per portfolio item
- first-pass client-side image compression before upload

### Current signed-in route

- `/photographer/portfolio`

### Current public routes

- `/photographers`
- `/photographers/[slug]`

### Current source of truth

- backend profile service for portfolio item records
- backend asset service for uploaded portfolio images
- public photographer pages now read saved portfolio data from the backend

## Current portfolio item shape

The current implementation now supports:

- one required cover image
- optional gallery images
- featured state
- newest-first item ordering
- gallery ordering inside the item

A saved portfolio item currently contains:

- `id`
- `title`
- `description`
- `category`
- `isFeatured`
- cover asset metadata
- gallery image metadata
- `createdAt`
- `updatedAt`

This is the first version of a richer media model for photographer works.

## Current signed-in flow

The current signed-in photographer portfolio flow is:

1. open `/photographer/portfolio`
2. load saved portfolio items from the backend
3. prepare local previews for cover and gallery images
4. apply first-pass client-side compression before upload
5. call `POST /assets/upload-sessions`
6. upload images to the signed upload URL
7. call `POST /assets/upload-sessions/{sessionId}/confirm`
8. call `POST /profiles/me/portfolio-items` or `PATCH /profiles/me/portfolio-items/{itemId}`
9. render the saved portfolio item from backend data

The same real backend flow now also supports:

- edit portfolio item
- replace cover image
- add gallery images
- reorder gallery images
- feature / unfeature
- delete saved portfolio item
- refresh and still see saved portfolio data

## Current public flow

The current public photographer flow now also consumes saved portfolio data:

1. open `/photographers`
2. load public photographer summaries from the backend
3. open `/photographers/[slug]`
4. load public photographer detail by slug
5. render saved portfolio items from real backend data
6. render cover image plus optional gallery images
7. refresh and still see the saved public state

## Current UX behavior

### Preserved behavior

The current phase intentionally keeps the UX behaviors that already felt correct in earlier phases:

- newest item first
- feature / unfeature
- create
- edit
- delete
- image-first form flow
- premium, calm workspace presentation

### Expanded behavior

The current phase expands the portfolio flow with:

- one cover image per item
- optional gallery images
- simple gallery ordering controls
- first-pass client-side compression before upload
- richer public portfolio rendering

## Current known limitations

This phase is a meaningful media upgrade, but it is still not the final photographer gallery experience.

Still pending:

- snackbar/toast feedback when gallery selection exceeds the allowed image limit
- drag-and-drop gallery ordering for better UX
- overlay delete button for gallery thumbnails
- more compact public portfolio presentation on `/photographers/[slug]`
- dialog/lightbox view for a selected portfolio item
- carousel-style navigation across gallery images in the public view
- stronger and better-tuned client-side compression, because current reduction may still be too small for some images
- safe asset cleanup when deleting a portfolio item
- confirmation dialog before deleting a portfolio item

## Why this phase matters

This phase moves Fotovia beyond “one saved image per project” into a more realistic photographer showcase model.

The current end-to-end content flow now includes:

- sign in as photographer
- open `/photographer/portfolio`
- choose a cover image
- choose optional gallery images
- compress images on the client
- upload through the real asset flow
- save a real backend portfolio item
- edit / feature / delete it
- open `/photographers/[slug]`
- view saved portfolio media publicly
- refresh and still see the saved state

That turns the portfolio area into a richer saved media pipeline instead of a basic single-image project list.

## Recommended next phase

## Phase FE/BE Next: Portfolio Gallery UX Refinement + Safe Asset Cleanup

### Why this should be next

The current gallery foundation works, but the next gaps are now mostly product UX and storage hygiene.

The biggest remaining issues are:

- gallery interaction still feels too mechanical
- public portfolio viewing can become too long and heavy
- image compression still needs stronger tuning
- deleting a portfolio item does not yet fully solve asset cleanup

### Suggested goals

- show snackbar/toast feedback when gallery upload exceeds the allowed limit
- replace move-left / move-right with drag-and-drop ordering
- replace gallery remove buttons with cleaner thumbnail overlay actions
- show public portfolio items in a more compact card-based layout
- open a dialog/lightbox when a portfolio item is selected
- support carousel navigation across cover and gallery images
- tune client-side compression more aggressively and visibly
- add delete confirmation before removing a portfolio item
- clean up orphaned assets more safely after delete

## Notes for later

After gallery UX refinement and safe cleanup are stable, the next likely portfolio/media steps should be:

- public gallery polish
- booking flow consumption of real public photographer data
- AI classification flow attached to saved photographer works
