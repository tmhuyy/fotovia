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

---

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

That keeps the first real media integration simpler and gives the frontend a stable avatar source.

### 4. Local integration config was aligned for real web testing

The local integration now aligns:

- asset HTTP port
- asset TCP port
- profile-to-asset TCP connection
- asset-service CORS origin for the local web frontend

This was needed to complete the first real end-to-end avatar flow from web to backend services.

---

## Current verified end-to-end media flow

The current verified avatar flow is now:

1. `POST /assets/upload-sessions`
2. upload the file to Supabase using the returned signed upload data
3. `POST /assets/upload-sessions/{sessionId}/confirm`
4. `PATCH /profiles/me/avatar`
5. `GET /profiles/me`
6. frontend renders saved `avatarUrl`

This means Fotovia now has its first real production-facing profile media loop working end-to-end.

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

- profile business logic outside media attachment
- photographer portfolio item business logic
- AI style classification results as domain source of truth

---

## Current DB direction

The current asset-service schema is built around 3 tables.

### `assets`

Stores core metadata about each uploaded file, including:

- owner
- provider
- bucket
- object key
- original filename
- mime type
- size
- resource type
- purpose
- visibility
- status
- optional dimensions / checksum / metadata

### `asset_upload_sessions`

Tracks upload intent and confirmation lifecycle, including:

- asset link
- requested user
- expected mime type
- max size
- client filename
- upload method
- status
- expiry time
- uploaded / confirmed timestamps

### `asset_usages`

Tracks where an asset is used in business domains, including:

- service name
- entity type
- entity id
- field name
- usage role
- sort order
- detached state

---

## Important implementation notes

### Signed upload behavior

Creating an upload session does **not** upload the file by itself.

It only creates:

- the asset record
- the upload session record
- the signed upload data

The real file upload still happens separately against Supabase Storage.

### Current limitation

Upload confirmation hardening is still not the final version.

The service flow works for current integration, but stronger verification against real object existence in storage before marking an asset as ready is still a good hardening step for a later backend phase.

### Current integration status

Avatar integration is now complete enough for real frontend testing.

Still not completed yet:

- real portfolio backend persistence
- public portfolio read integration
- multi-item portfolio media mapping from real backend data
- AI classification pipeline integration on saved photographer works

---

## Why this phase matters

This phase turns the asset service from a standalone media foundation into a backend service that is now actively used by another real business flow.

Without BE-2:

- the frontend could not complete avatar upload end-to-end
- profile media would still depend on placeholder handling
- the asset service would still be unproven in a real production-facing user flow

With BE-2 complete, the asset service is no longer only infrastructure groundwork; it is now part of a working product slice.

---

## Recommended next phase

## Phase BE-3: Portfolio Backend Persistence + Portfolio Media Mapping

### Why this should be next

Now that avatar upload works end-to-end, the largest remaining media/product gap is photographer portfolio persistence.

The frontend portfolio experience already exists, but it still depends on browser-local persistence instead of a real backend source of truth.

### Suggested goals

- introduce real backend persistence for photographer portfolio items
- let portfolio items reference real uploaded assets
- keep asset service as the shared media/storage backend
- support at least the first practical portfolio actions:
    - create
    - list
    - update
    - delete
    - feature / unfeature
- keep newest-first ordering unless a stronger business rule is introduced later
- prepare later public photographer detail rendering from saved portfolio records

### Suggested implementation shape

The fastest clean direction is:

1. keep asset upload-session flow as the shared upload path
2. introduce a portfolio item record that references one primary uploaded asset first
3. expose authenticated CRUD endpoints for the signed-in photographer
4. connect frontend portfolio management to those endpoints
5. defer multi-image gallery expansion until the single-item path is stable

---

## Notes for later

After real portfolio persistence is stable, the next likely steps should be:

- public photographer detail integration with saved portfolio items
- discovery/search consumption of portfolio data
- async AI classification on uploaded photographer works
