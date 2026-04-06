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

### 4. Delete flow now includes asset-usage cleanup

The current backend shape now supports detaching the active usage for a saved portfolio item when that item is deleted.

---

## Phase BE-4: Public Photographer Detail Read Integration

**Status:** Completed

## Goal

Use the saved profile and portfolio data from the profile domain to power real public photographer pages instead of mock-only public presentation.

## What was completed in BE-4

### 1. Public photographer summaries now read from the backend

The public marketplace list flow now reads photographer summaries from real saved profile data.

### 2. Public photographer detail now reads by slug

The profile domain now supports a public read model keyed by a stable slug for `/photographers/[slug]`.

### 3. Public detail pages now render real media

The public photographer detail flow now uses:

- real saved avatar data
- real saved portfolio items
- real backend profile fields for public presentation

### 4. Signed-in and public flows are now connected

The system now supports a real bridge from:

- signed-in photographer profile editing
- signed-in photographer portfolio persistence
- public client-facing photographer browsing

---

## Phase BE-5: Portfolio Gallery Expansion + First-pass Client-side Compression Support

**Status:** Completed

## Goal

Expand the portfolio media model from one saved primary image into:

- one required cover image
- optional gallery images
- richer public rendering of the saved item

This phase also assumes the frontend now prepares images before upload with a first-pass client-side compression step.

## What was completed in BE-5

### 1. Portfolio items now support cover + gallery structure

The portfolio model now supports:

- one cover image stored directly on the portfolio item
- additional gallery images stored separately but linked to the same item

### 2. Portfolio gallery persistence now exists in the profile domain

The backend now persists gallery image records for each portfolio item instead of treating every item as a one-image entry.

### 3. Asset usage mapping now supports cover and gallery cases

The media usage layer now distinguishes between:

- cover image usage
- gallery image usage

### 4. Public photographer detail can now render richer saved media

The public detail read model now supports:

- cover image rendering
- optional gallery image rendering for the same saved portfolio item

---

## Phase BE-6: Portfolio Gallery UX Refinement + Safe Asset Cleanup

**Status:** Completed

## Goal

Refine the product experience around saved photographer media while making storage cleanup safer.

This phase focuses on:

- better gallery interaction on the signed-in side
- more compact public portfolio browsing
- focused viewing of one selected portfolio item
- safer delete behavior in both UX and storage lifecycle

## What was completed in BE-6

### 1. Gallery-limit handling now has explicit user feedback

The frontend now surfaces immediate user-facing feedback when one portfolio item exceeds the allowed gallery image limit instead of relying only on quiet inline behavior.

### 2. Gallery interaction was refined

The signed-in portfolio flow now supports:

- more natural gallery reordering
- cleaner thumbnail removal actions
- clearer per-image management during create and edit flows

### 3. Public portfolio browsing is now more focused

The public photographer detail side no longer needs to expand every saved project inline by default.

Instead, the current shape supports:

- more compact portfolio item browsing
- selecting one saved work
- focused viewing of that work’s cover and gallery media

### 4. Safe asset cleanup now exists after delete

Deleting a portfolio item no longer stops at detaching usages and deleting portfolio records.

The backend now supports an orphan-safe cleanup path:

1. detach active usages for the deleted item
2. remove the portfolio records
3. attempt physical storage cleanup only when the asset no longer has active usages

This keeps the storage lifecycle safer than immediately deleting every related object regardless of reuse.

### 5. Delete flow is safer for users

The product now requires explicit confirmation before deleting a portfolio item, reducing accidental destructive actions.

---

## Current verified media flows

The backend asset service is now part of five real product slices:

### Avatar flow

1. `POST /assets/upload-sessions`
2. upload file to Supabase using signed upload data
3. `POST /assets/upload-sessions/{sessionId}/confirm`
4. `PATCH /profiles/me/avatar`
5. `GET /profiles/me`

### Portfolio persistence flow

1. `POST /assets/upload-sessions`
2. upload file to Supabase using signed upload data
3. `POST /assets/upload-sessions/{sessionId}/confirm`
4. `POST /profiles/me/portfolio-items`
5. `GET /profiles/me/portfolio-items`
6. `PATCH /profiles/me/portfolio-items/{itemId}`
7. `DELETE /profiles/me/portfolio-items/{itemId}`

### Public photographer detail flow

1. signed-in photographer saves profile data
2. signed-in photographer saves portfolio data
3. public photographer list reads saved backend summaries
4. public photographer detail reads saved backend detail by slug
5. public pages render saved avatar and saved portfolio media

### Portfolio gallery flow

1. signed-in photographer uploads one cover image
2. signed-in photographer uploads optional gallery images
3. signed-in photographer saves one portfolio item with cover + gallery
4. backend persists cover and gallery image records
5. public detail reads and renders richer saved portfolio media

### Safe cleanup flow

1. user confirms deletion of a saved portfolio item
2. backend detaches active usages for the item
3. backend removes portfolio records
4. asset service checks whether each related asset still has active usages
5. storage objects are removed only when the asset is orphaned

---

## Current domain boundaries

### Asset service owns

- storage provider integration
- storage bucket selection
- upload session lifecycle
- asset metadata
- asset usage attachment / detachment
- read URL generation
- orphan-safe physical asset cleanup

### Asset service does not own

- photographer portfolio business logic itself
- public photographer presentation logic itself
- client-side image preparation itself
- AI style classification results as domain source of truth

### Profile service owns

- profile-facing media attachments
- saved photographer portfolio item records
- saved photographer portfolio gallery records
- public photographer read model
- photographer-owned CRUD rules for portfolio items

---

## Current implementation limits

The current system is now a much stronger media platform slice, but some product gaps still remain.

Still pending:

- broader public gallery polish for very large portfolios
- deeper real-world tuning and monitoring for compression effectiveness across many image types
- more advanced viewer features such as richer zoom/fullscreen behavior
- stronger upload confirmation hardening against real storage object existence
- booking flow consumption of real public photographer data
- inspiration-image upload and AI classification triggered from booking or portfolio flows
- thumbnail or derivative-image strategy if needed later

## Why this phase matters

The media layer is no longer limited to saving images and rendering them publicly.

It now supports a more realistic product loop with:

- refined gallery interaction on the signed-in side
- safer delete behavior for users
- compact public browsing plus focused media viewing
- safer storage cleanup after delete

That makes Fotovia feel closer to a usable photography platform instead of just a media persistence demo.

## Recommended next phase

## Phase BE/FE Next: Booking Flow Integration Using Real Public Photographer Data

### Why this should be next

The photographer content pipeline is now real on both the signed-in and public sides.

The next major product gap is converting that real photographer detail experience into a real booking path.

### Suggested goals

- connect public photographer detail pages directly to real booking creation
- prefill booking context from the selected photographer
- keep booking entry routes protected and consistent with current auth rules
- build on top of the existing real public photographer data instead of duplicating detail logic
- prepare later inspiration-image and AI-assisted booking inputs on top of the real booking flow

## Notes for later

After booking flow integration is stable, the next likely product steps should be:

- AI-assisted recommendation using inspiration images
- richer booking status tracking
- deeper public portfolio polish for larger accounts
