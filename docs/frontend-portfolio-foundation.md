# Frontend Portfolio Foundation Notes

## Purpose

This document tracks the current photographer portfolio flow in `apps/web`.

It explains how the portfolio experience moved from a browser-local foundation into a real backend-backed persistence flow, and then into a public-facing read flow.

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

**Status:** Working end-to-end for signed-in photographer portfolio persistence and public portfolio reading

The current portfolio flow now uses:

- real backend CRUD through profile service
- real asset upload through asset service
- real saved portfolio items instead of browser-local source of truth
- real public rendering of saved photographer works on public detail pages

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

The current implementation still keeps one primary uploaded image per portfolio item.

A saved portfolio item currently contains:

- `id`
- `title`
- `description`
- `category`
- `isFeatured`
- `assetId`
- `assetUrl`
- asset metadata for rendering
- `createdAt`
- `updatedAt`

This keeps the first real persistence slice simple and avoids over-expanding the data model too early.

## Current signed-in flow

The current signed-in photographer portfolio flow is:

1. open `/photographer/portfolio`
2. load saved portfolio items from the backend
3. create a local preview when choosing an image
4. call `POST /assets/upload-sessions`
5. upload the image to the signed upload URL
6. call `POST /assets/upload-sessions/{sessionId}/confirm`
7. call `POST /profiles/me/portfolio-items`
8. render the saved portfolio item from backend data

The same real backend flow now also supports:

- edit portfolio item
- replace portfolio image
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
6. refresh and still see the saved public state

## Current UX behavior

### Preserved behavior

The real backend phase intentionally keeps the UX behaviors that already felt correct in the local foundation:

- newest item first
- feature / unfeature
- create
- edit
- delete
- image-first form flow
- premium, calm workspace presentation

### Improved behavior

The backend and public-read phases improve the product by replacing browser-local and mock-only behavior with:

- real query + mutation flows
- saved backend data after refresh
- shared asset upload flow aligned with avatar uploads
- real uploaded asset references instead of plain manual image URLs
- real public photographer portfolio rendering

## Current known limitations

This phase is now a meaningful signed-in + public-read milestone, but it is still intentionally narrow.

Still pending:

- one cover image plus optional gallery images per portfolio item
- stronger upload hardening such as client-side compression and validation expansion
- thumbnail or derivative-image strategy if storage pressure becomes important
- AI classification triggered from saved portfolio uploads

## Why this phase matters

This is no longer only a signed-in persistence loop.

The current end-to-end photographer content flow now includes:

- sign in as photographer
- open `/photographer/portfolio`
- choose an image
- upload through the real asset flow
- save a real backend portfolio item
- edit / feature / delete it
- open `/photographers/[slug]`
- view the saved work publicly
- refresh and still see the saved state

That turns the portfolio area from a UX prototype into a real content pipeline that feeds the public marketplace.

## Recommended next phase

## Phase FE/BE Next: Multi-image Portfolio Gallery + Client-side Compression

### Why this should be next

The current public detail integration solved the “real data visibility” problem.

The next portfolio/media limitation is now structural:

- one image per portfolio item is too limited for real photography projects
- large image uploads can waste storage and bandwidth
- Supabase free-tier usage will benefit from smaller uploads and more predictable image sizes

### Suggested goals

- keep one required cover image for each portfolio item
- add optional gallery images per portfolio item
- support gallery ordering
- compress large images on the client before upload
- preserve the current portfolio CRUD UX where possible
- avoid overcomplicating the first gallery version

## Notes for later

After gallery + compression is stable, the next portfolio/media step should likely be:

- public photographer detail gallery polish
- portfolio cover vs gallery layout refinement
- AI classification flow attached to saved photographer works
