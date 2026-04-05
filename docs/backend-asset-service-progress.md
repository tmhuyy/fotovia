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

## What was completed

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

## Current domain boundaries

### Asset service owns

- storage provider integration
- storage bucket selection
- upload session lifecycle
- asset metadata
- asset usage attachment / detachment
- read URL generation

### Asset service does not own yet

- profile business logic
- avatar update logic inside profile service
- portfolio item business logic
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

## Current tested flow

The intended manual test flow for this phase is:

1. `POST /assets/upload-sessions`
2. upload the file to Supabase using the returned signed upload data
3. `POST /assets/upload-sessions/{sessionId}/confirm`
4. `GET /assets/{assetId}`
5. `GET /assets/{assetId}/read-url`
6. `POST /assets/usages/attach`
7. `GET /assets/{assetId}/usages`
8. `PATCH /assets/usages/{usageId}/detach`

---

## Important implementation notes

### Signed upload behavior

Creating an upload session does **not** upload the file by itself.

It only creates:

- the asset record
- the upload session record
- the signed upload data

The real file upload must still happen separately against Supabase Storage.

### Current limitation

This phase does not yet verify object existence in storage before confirming an upload session as `READY`.

That hardening step is intentionally deferred to the next phase if needed.

### Current integration status

The asset service is currently stable enough as a standalone media foundation, but it is still **not yet integrated** into:

- profile avatar update flow
- portfolio backend flow
- AI style classification pipeline

Because of that, full end-to-end product testing is still limited at this point.

---

## Why this phase matters

This phase creates the backend storage foundation that later photographer-facing and profile-facing features will depend on.

Without this phase:

- avatar upload would not have a reusable backend path
- portfolio media persistence would not have a shared storage lifecycle
- future AI media workflows would not have a clean asset source

---

## Recommended next phase

## Phase BE-2: Avatar Integration with Profile Service

### Why this should be next

This is the fastest path toward real end-to-end testing and frontend integration.

The profile domain already has `avatarUrl`, while the asset service already has the upload-session and usage foundation. Connecting these two services will unlock the first real media feature that the frontend can consume cleanly.

### Suggested goals

- connect profile avatar flow to asset service
- let profile service store or reference the active avatar asset
- attach avatar usage with:
    - `serviceName = profile`
    - `entityType = profile`
    - `fieldName = avatar`
- enforce one active avatar per profile
- update profile read model so frontend can still consume avatar cleanly
- optionally harden upload confirmation by checking real storage object existence before marking asset `READY`

### Suggested backend shape

The simplest backend direction for the next phase is:

1. user uploads avatar through asset upload-session flow
2. asset becomes `READY`
3. profile service receives an avatar asset id
4. profile service asks asset service to attach usage for the profile avatar slot
5. profile service stores the active avatar reference and readable avatar URL
6. `GET /profiles/me` returns avatar data the frontend can use directly

---

## Notes for later

After avatar integration is stable, the next backend step should likely be:

- portfolio item backend
- multiple asset attachment to portfolio items
- async AI classification for uploaded portfolio images

From a delivery perspective, the likely fastest path to visible end-to-end progress is:

1. BE-2 avatar integration
2. FE avatar upload / profile avatar integration
3. backend portfolio media persistence
4. FE portfolio persistence with real backend media
