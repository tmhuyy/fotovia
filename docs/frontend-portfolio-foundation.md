# Frontend Portfolio Foundation Notes

## Purpose

This document tracks the current photographer portfolio flow in `apps/web`.

It explains how the portfolio experience moved from a browser-local foundation into a real backend-backed persistence flow, then into a public-facing read flow, then into a richer multi-image media flow, and now into a more refined gallery UX.

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

**Status:** Working end-to-end for signed-in photographer portfolio persistence, public portfolio reading, multi-image support, and first gallery UX refinement

The current portfolio flow now uses:

- real backend CRUD through profile service
- real asset upload through asset service
- real saved portfolio items instead of browser-local source of truth
- real public rendering of saved photographer works on public detail pages
- one cover image plus optional gallery images per portfolio item
- client-side image preparation before upload
- improved signed-in gallery management UX
- compact public portfolio browsing with a focused media viewer

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

The current implementation supports:

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

## Current signed-in flow

The current signed-in photographer portfolio flow is:

1. open `/photographer/portfolio`
2. load saved portfolio items from the backend
3. prepare local previews for cover and gallery images
4. apply client-side image preparation before upload
5. call `POST /assets/upload-sessions`
6. upload images to the signed upload URL
7. call `POST /assets/upload-sessions/{sessionId}/confirm`
8. call `POST /profiles/me/portfolio-items` or `PATCH /profiles/me/portfolio-items/{itemId}`
9. render the saved portfolio item from backend data

The same real backend flow now also supports:

- edit portfolio item
- replace cover image
- add gallery images
- drag-and-drop style gallery reordering
- cleaner thumbnail removal actions
- feature / unfeature
- delete saved portfolio item with confirmation
- refresh and still see saved portfolio data

## Current public flow

The current public photographer flow now also consumes saved portfolio data:

1. open `/photographers`
2. load public photographer summaries from the backend
3. open `/photographers/[slug]`
4. load public photographer detail by slug
5. render compact saved portfolio cards from real backend data
6. open a focused viewer dialog for one selected portfolio item
7. browse cover and gallery media in a carousel-style flow
8. refresh and still see the saved public state

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

### Refined behavior

The current phase refines the portfolio UX with:

- snackbar/toast feedback when gallery selection exceeds the allowed limit
- drag-and-drop style gallery ordering instead of only move-left / move-right controls
- cleaner overlay delete action for gallery thumbnails
- delete confirmation before removing a portfolio item
- more compact public portfolio presentation
- dialog/lightbox-style viewing for one selected portfolio item
- carousel-style browsing across cover and gallery images
- stronger client-side image preparation than the first gallery pass

## Current known limitations

This phase is a strong portfolio UX milestone, but it is still not the final media experience.

Still pending:

- broader public gallery polish for very large photographer portfolios
- more advanced zooming or fullscreen controls in the viewer
- deeper real-world tuning and monitoring for compression effectiveness across many image types
- booking flow consumption of real public photographer detail data
- inspiration-image upload and AI-assisted booking inputs

## Why this phase matters

This phase turns the portfolio system into something much closer to a real photographer showcase workflow.

The current end-to-end content flow now includes:

- sign in as photographer
- open `/photographer/portfolio`
- choose a cover image
- choose optional gallery images
- get immediate validation feedback for gallery limits
- reorder gallery images more naturally
- upload through the real asset flow
- save a real backend portfolio item
- edit / feature / delete it with safer UX
- open `/photographers/[slug]`
- browse saved portfolio media in a focused viewer
- refresh and still see the saved state

That makes the portfolio area feel less like a basic media form and more like a real photographer workspace feeding a public showcase.

## Recommended next phase

## Phase FE/BE Next: Booking Flow Integration Using Real Public Photographer Data

### Why this should be next

The signed-in photographer side is now real, and the public photographer detail side is also real and much more usable.

The next major product gap is the actual booking path from public photographer discovery into a real booking request flow.

### Suggested goals

- connect `/photographers/[slug]` more directly to real booking creation
- prefill booking context from the selected public photographer
- support authenticated booking request creation from real photographer detail data
- keep booking entry routes protected and consistent with existing auth rules
- prepare later inspiration-image and AI-assisted booking inputs on top of the real booking flow

## Notes for later

After booking flow integration is stable, the next likely product steps should be:

- AI-assisted photographer recommendation using uploaded inspiration images
- richer booking status tracking
- deeper public portfolio polish for larger accounts
