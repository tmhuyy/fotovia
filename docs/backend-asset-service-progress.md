# Backend Asset Service Progress

## Phase BE-1: Asset Service Stabilization + Upload Session Core

**Status:** Completed

## Goal

Stabilize the `apps/asset` service so it stops behaving like a leftover booking placeholder and starts acting like the real storage/media backend foundation for Fotovia.

This phase focuses on the core asset lifecycle only:

- create upload session
- upload through signed URL
- confirm uploaded asset
- attach asset usage
- detach asset usage
- read asset metadata
- generate read URL

## What was completed

### 1. Asset service skeleton was corrected

The service was moved away from leftover booking placeholder logic and aligned with the asset domain.

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

## Current DB direction

The current asset-service schema is built around 3 tables:

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

The asset service is still standalone.

It is not yet integrated into:

- profile avatar update flow
- portfolio backend flow
- AI style classification pipeline

## Why this phase matters

This phase creates the backend storage foundation that later photographer-facing features will depend on.

Without this phase, avatar upload and portfolio media would not have a clean reusable backend path.

## Recommended next phase

## Phase BE-2: Avatar Integration with Profile Service

Suggested goals:

- connect profile avatar flow to asset service
- let profile service store or reference the active avatar asset
- attach avatar usage with:
    - `serviceName = profile`
    - `entityType = profile`
    - `fieldName = avatar`
- update profile read model so frontend can still consume avatar cleanly
- optionally harden upload confirmation by checking real storage object existence before marking asset `READY`

## Notes for later

After avatar integration is stable, the next backend step should likely be:

- portfolio item backend
- multiple asset attachment to portfolio items
- async AI classification for uploaded portfolio images
