# Portfolio AI Classification Foundation

## Phase status

Completed and locally tested.

This phase established the backend foundation for asynchronous portfolio item classification using the existing Fotovia AI classification service.

---

## Goal of this phase

The main goal of this phase was to make portfolio AI classification work as a background process instead of blocking the portfolio save flow.

When a photographer creates or updates a portfolio item with a cover image and optional gallery images, the system now:

- saves the portfolio item first
- queues a classification job in the background
- calls the FastAPI classification service using signed/readable image URLs
- stores image-level classification results
- aggregates those image-level results into portfolio-item-level style summary fields
- updates classification status on the portfolio item

This phase focused on backend orchestration and persistence, not final frontend presentation.

---

## What was completed

### 1. FastAPI service foundation was prepared in A1

The AI classification service was refactored to support backend integration more cleanly.

Completed changes in `fotovia-ai`:

- kept the legacy `POST /classify` file-upload endpoint for backward compatibility
- added URL-based classification support
- added batch URL classification support
- added structured request/response schemas
- separated inference logic from route/controller logic

Important contract now available:

- `POST /classify/batch-urls`

This contract returns per-image classification results and is now suitable for backend-to-backend integration.

---

### 2. Profile service now supports background portfolio classification

The `apps/profile` NestJS service now includes a dedicated portfolio item classification flow.

Main completed pieces:

- classification queue integration with Redis + BullMQ
- HTTP client integration from NestJS to the FastAPI classifier
- background worker/processor for portfolio item classification
- image-level classification persistence
- portfolio-item-level aggregate style summary persistence

---

### 3. Portfolio item classification lifecycle fields were added

The portfolio item entity now tracks AI classification state.

Added portfolio item fields:

- `classificationStatus`
- `classificationJobId`
- `classificationRequestedAt`
- `classificationStartedAt`
- `classificationCompletedAt`
- `classificationFailedAt`
- `classificationError`
- `detectedPrimaryStyle`
- `detectedPrimaryScore`
- `detectedSecondaryStyles`
- `detectedStyleDistribution`

These fields allow the product to represent AI processing as a real lifecycle:

- `not_requested`
- `queued`
- `processing`
- `completed`
- `failed`

---

### 4. Image-level raw prediction storage was added

A dedicated table was added for raw image classification records.

Table:

- `profile_portfolio_item_image_classifications`

Each record stores:

- portfolio item id
- asset id
- image key
- role (`cover` or `gallery`)
- status
- top predictions JSON
- top label
- top confidence
- error
- classified timestamp

This keeps the raw AI evidence separate from the summarized portfolio item result.

---

### 5. Aggregation logic was added in the profile service

The portfolio item summary is not taken directly from a single image.

Instead, the profile service aggregates the per-image predictions using weighted scoring:

- cover image weight = 2
- gallery image weight = 1
- low-confidence predictions below the threshold are ignored

Current threshold:

- minimum confidence = `0.08`

Current aggregate result:

- `detectedPrimaryStyle`
- `detectedPrimaryScore`
- `detectedSecondaryStyles`
- `detectedStyleDistribution`

This makes the final portfolio item classification more useful than simply picking one image prediction.

---

### 6. Save flow is no longer blocked by AI

This was one of the most important outcomes of the phase.

The system now behaves like this:

1. save portfolio item first
2. mark classification status as `queued`
3. enqueue a background job
4. worker processes classification asynchronously
5. update result later

This avoids making the photographer wait for classification during create or update.

---

### 7. Stale-job protection was added

A `classificationJobId` is stored on the portfolio item.

This is used to avoid stale background jobs overwriting newer classification results when a portfolio item is updated multiple times close together.

This is an important safety mechanism for future reliability.

---

### 8. Reclassification logic was corrected

A bug was found during testing:

- editing only title/description was incorrectly triggering reclassification

This was fixed by changing the logic so that reclassification only happens when the actual media changes:

- cover asset changed
- gallery asset list changed

Text-only edits should no longer enqueue a new classification job.

---

## Infrastructure and configuration added

### Profile service env

The profile service now requires:

```env
REDIS_HOST=
REDIS_PORT=
REDIS_DB=
REDIS_PASSWORD=

AI_CLASSIFIER_BASE_URL=
AI_CLASSIFIER_TIMEOUT_MS=
AI_CLASSIFIER_TOP_K=
```
## Supporting local services

To run this phase locally:

- Redis must be running
- fotovia-ai must be running
- apps/profile must be running

## SQL / database update

Manual SQL migration was used for this phase.

Added file:

- docs/sql/profile-portfolio-ai-classification-foundation.sql

This migration adds:

- new classification columns on profile_portfolio_items
- the new profile_portfolio_item_image_classifications table
- supporting indexes

This follows the existing project rule of using manual SQL migration patterns for shared Supabase database changes.

## Tested outcomes

This phase was locally tested and the main scenarios were verified.

Confirmed working:

- Redis connection and queue initialization
- portfolio item creation still returns success quickly
- classification jobs are enqueued after media create/update
- worker processes queued jobs successfully
- image-level prediction records are stored
- portfolio-level summary fields are stored
- AI service failure does not break portfolio item creation
- cover change triggers reclassification
- gallery change triggers reclassification
- text-only update does not reclassify after the fix
- stale-job protection logic is in place and job ids are tracked

## Current product state after this phase
Working now
- asynchronous portfolio item classification foundation
- background classification with queue + worker
- persistence of raw image predictions
- persistence of portfolio summary style result
- classification lifecycle tracking in the profile service
Not done yet
- frontend portfolio workspace still does not present classification state/results clearly to the photographer
- no dedicated retry classification action in the UI
- public photographer browsing does not use AI classification yet
- no AI-based public filtering or recommendation yet

## Key implementation notes for future phases
1. NestJS is the orchestrator

The profile service owns:

```
queueing
job lifecycle
retries
aggregation logic
persistence
```

The FastAPI service only performs classification inference.

2. AI summary should remain separate from raw image predictions

Do not collapse raw per-image results into a single flat output only.
Both layers are useful:

- image-level evidence
- portfolio-item-level summary
3. Queue-based processing should remain the default

Do not move classification back into the synchronous save request unless there is a very strong reason.

4. Reclassification should be triggered only by real media changes

Do not requeue classification for text-only portfolio edits.

## Suggested next phase
### Phase next: Portfolio AI Classification Visibility and Retry (BE + FE)

#### Why this should be next

The backend foundation is now working, but the photographer still does not get a good product-facing experience from it.

The next step should expose the AI result clearly in the real frontend flow:

- show status badges in the portfolio workspace
- show detected primary style and supporting style signals
- show failed state clearly
- allow manual retry when classification fails

#### Suggested scope

Backend:

- expose any remaining classification fields cleanly in portfolio item responses
- add a manual requeue/retry endpoint for a portfolio item classification job

Frontend:

- show queued / processing / completed / failed state on portfolio cards or detail UI
- show detectedPrimaryStyle
- show optional secondary styles / confidence summary
- show failure message state
- add retry classification action for failed items
- refetch or poll until a queued/processing item reaches a terminal state

#### Acceptance criteria for the next phase

- photographer creates or updates a portfolio item
- frontend shows queued/processing state
- when classification completes, frontend shows detected style
- when classification fails, frontend shows failed state
- photographer can manually retry classification from the portfolio workspace
- the whole flow is testable end-to-end in the real frontend UI