# Frontend Portfolio Foundation Notes

## Purpose

This document tracks the current photographer portfolio flow in `apps/web`.

It explains how the portfolio experience moved from a browser-local foundation into a real backend-backed persistence flow.

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

**Status:** Working end-to-end for signed-in photographer portfolio persistence

The current portfolio flow now uses:

- real backend CRUD through profile service
- real asset upload through asset service
- real saved portfolio items instead of browser-local source of truth

### Current signed-in route

- `/photographer/portfolio`

### Current source of truth

- backend profile service for portfolio item records
- backend asset service for uploaded portfolio images

## Current portfolio item shape

The current implementation keeps one primary uploaded image per portfolio item.

A saved portfolio item now contains:

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

## Current frontend flow

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

The backend phase improves the product by replacing browser-local persistence with:

- real query + mutation flows
- saved backend data after refresh
- shared asset upload flow aligned with avatar uploads
- real uploaded asset references instead of plain manual image URLs

## Current known limitations

This phase is a strong signed-in persistence milestone, but it is still intentionally narrow.

Still pending:

- public photographer detail integration with real saved portfolio items
- public photographer listing integration from real saved data
- multi-image gallery support per portfolio item
- stronger upload hardening such as client-side compression and validation expansion
- AI classification triggered from saved portfolio uploads

## Why this phase matters

This is the first real photographer-work persistence loop in the product.

The current end-to-end photographer content flow now includes:

- sign in as photographer
- open `/photographer/portfolio`
- choose an image
- upload through the real asset flow
- save a real backend portfolio item
- edit / feature / delete it
- refresh and still see the saved state

That turns the portfolio page from a UX prototype into a working product slice.

## Recommended next phase

## Phase FE/BE Next: Public Photographer Detail Integration

### Why this should be next

The product can now save real photographer portfolio content, but clients still cannot consume that content through the public marketplace.

The next visible gap is not more signed-in editing features; it is the public read side.

### Suggested goals

- replace mock photographer detail data with real backend-saved data
- show avatar, basic photographer profile, and saved featured works publicly
- keep signed-in edit routes and public read routes clearly separated
- prepare the listing/discovery experience to consume real saved detail data later

## Notes for later

After public detail integration is stable, the next portfolio/media step should likely be:

- one cover image plus optional gallery images per portfolio item
- client-side image compression before upload
- thumbnail or derivative-image strategy if storage pressure becomes important
- AI classification flow attached to saved photographer works
