# Backend Asset Service Progress

## Phase BE-1: Asset Service Stabilization + Upload Session Core

**Status:** Completed

## Goal

Stabilize the `apps/asset` service so it becomes the real storage/media backend foundation for Fotovia instead of a placeholder service.

This phase focuses on the core asset lifecycle only:

- create upload session
- upload through signed URL
- confirm uploaded asset
- attach asset usage
- detach asset usage
- read asset metadata
- generate read URL

## What was completed in BE-1

### 1. Asset service skeleton was corrected

The service was moved away from leftover placeholder logic and aligned with the asset domain.

Core service direction now centers around:

- `Asset`
- `AssetUploadSession`
- `AssetUsage`

### 2. Core upload-session flow was introduced

The first real backend asset flow now exists:

1. create an upload session
2. receive signed upload data
3. upload file to Supabase Storage
4. confirm the upload session
5. mark the asset as ready

### 3. Asset usage attachment flow was introduced

The service now has a generic usage layer so the same asset backend can later support:

- profile avatars
- portfolio cover images
- portfolio gallery images
- future media attachment cases

### 4. Read URL flow was introduced

The service can now return:

- public URL for public assets
- signed read URL for private assets

---

## Phase BE-2: Avatar Integration with Profile Service

**Status:** Completed

## Goal

Connect the profile avatar flow to the asset service so the frontend can use a real upload-and-attach media path instead of a mock or manual URL-only approach.

## What was completed in BE-2

### 1. Profile service now connects to asset service for avatar handling

The profile domain now uses the asset service as the media source for avatar updates instead of treating avatar as a plain free-form field.

### 2. Profile avatar now uses a real asset reference

The integration now supports the pattern:

1. upload avatar through asset upload-session flow
2. confirm the uploaded asset
3. send avatar asset id to profile service
4. attach the asset to the profile avatar slot
5. resolve a readable avatar URL
6. store the active avatar reference in profile-facing data

### 3. Single active avatar behavior is now part of the integration shape

The current profile-avatar slot is designed around one active avatar per profile.

### 4. Local integration config was aligned for real web testing

The local integration now aligns:

- asset HTTP port
- asset TCP port
- profile-to-asset TCP connection
- asset-service CORS origin for the local web frontend

---

## Phase BE-3: Portfolio Backend Persistence + Portfolio Media Mapping

**Status:** Completed

## Goal

Use the existing asset service as the real media backend for photographer portfolio persistence.

This phase keeps the first portfolio version intentionally simple:

- one primary uploaded image per portfolio item
- real CRUD in the profile domain
- real asset usage attachment for saved items
- real delete cleanup for current primary image usage

## What was completed in BE-3

### 1. Portfolio item persistence now exists in the profile domain

The profile service now owns saved photographer portfolio records instead of leaving the portfolio as a browser-local frontend concern.

### 2. Portfolio items now use real uploaded asset references

The current portfolio item flow now supports:

1. upload portfolio image through asset upload-session flow
2. confirm uploaded asset
3. create or update a saved portfolio item using a real `assetId`
4. resolve a readable asset URL
5. persist portfolio item data with real uploaded media metadata

### 3. Asset usage mapping now supports saved portfolio items

Portfolio items now attach their primary image into a usage slot shaped around:

- service name
- portfolio item entity
- primary image field

This keeps asset ownership and media-lifecycle concerns inside the asset service while the profile domain owns portfolio business logic.

### 4. Delete flow now includes asset-usage cleanup

The current backend shape now supports detaching the active usage for a saved portfolio item when that item is deleted.

This keeps the portfolio/media relationship cleaner than a create-only integration.

---

## Current verified media flows

The backend asset service is now part of two working product flows:

### Avatar flow

1. `POST /assets/upload-sessions`
2. upload file to Supabase using signed upload data
3. `POST /assets/upload-sessions/{sessionId}/confirm`
4. `PATCH /profiles/me/avatar`
5. `GET /profiles/me`

### Portfolio flow

1. `POST /assets/upload-sessions`
2. upload file to Supabase using signed upload data
3. `POST /assets/upload-sessions/{sessionId}/confirm`
4. `POST /profiles/me/portfolio-items`
5. `GET /profiles/me/portfolio-items`
6. `PATCH /profiles/me/portfolio-items/{itemId}`
7. `DELETE /profiles/me/portfolio-items/{itemId}`

---

## Current domain boundaries

### Asset service owns

- storage provider integration
- storage bucket selection
- upload session lifecycle
- asset metadata
- asset usage attachment / detachment
- read URL generation

### Asset service does not own

- photographer portfolio business logic itself
- public photographer detail presentation logic
- AI style classification results as domain source of truth

### Profile service owns

- profile-facing media attachments
- saved photographer portfolio item records
- photographer-owned CRUD rules for portfolio items

---

## Current implementation limits

The current system is intentionally still a first real persistence slice.

Still pending:

- multi-image gallery support per portfolio item
- stronger upload confirmation hardening against real storage object existence
- public photographer detail integration using saved portfolio data
- listing/discovery integration from real saved data
- AI classification triggered from saved portfolio uploads

## Why this phase matters

The asset service is no longer only infrastructure groundwork.

It now powers two real business flows:

- avatar uploads
- photographer portfolio uploads

That means the asset backend has moved from “foundation only” to “actively supporting real product slices.”

## Recommended next phase

## Phase BE/FE Next: Public Photographer Detail Integration with Real Saved Data

### Why this should be next

The system can now save real photographer profile media and real portfolio items, but the public marketplace still does not consume that saved data yet.

The next product milestone should expose:

- public photographer read data
- public saved portfolio rendering
- real bridge from signed-in photographer setup to client-facing browsing

### Suggested goals

- expose a public photographer detail read model
- support a stable public route key such as slug
- render saved avatar + saved featured portfolio items publicly
- keep edit/write flows private and read flows public
- prepare discovery/listing integration for a later phase

## Notes for later

After public detail integration is stable, the next media hardening step should likely be:

- cover image plus optional gallery images per portfolio item
- client-side image compression before upload
- thumbnail or derivative-image strategy
- AI classification integration on saved works
