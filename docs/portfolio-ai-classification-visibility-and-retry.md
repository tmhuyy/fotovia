# Portfolio AI Classification Visibility and Retry

This document records the phase that exposed portfolio AI classification clearly in the photographer workspace and added a real retry flow.

---

## Phase Summary

### Phase name

**Portfolio AI Classification Visibility and Retry**

### Phase goal

The previous phase already completed the backend foundation for asynchronous portfolio item classification, but the product still lacked a visible end-to-end experience for photographers.

This phase focused on making that AI processing understandable and testable through the real frontend flow.

The main objectives were:

- show portfolio item AI classification status in the photographer workspace
- show AI result data when classification finishes
- show failure state clearly
- allow a photographer to retry failed classification directly from the UI
- keep the whole flow aligned with the queue-based backend architecture

---

## Why This Phase Was Needed

Before this phase:

- backend classification queueing already worked
- image-level prediction persistence already existed
- portfolio-level aggregate style fields already existed
- classification lifecycle status already existed in the database

However, the photographer-facing product still had important gaps:

- no clear frontend visibility of classification state
- no direct UI signal for queued / processing / completed / failed
- no manual retry action when classification failed
- no automatic workspace refresh while background AI processing was running

This meant the backend was working, but the feature was not yet fully useful from a real product perspective.

---

## Completed Scope

### Backend

This phase added a manual retry entry point for portfolio item classification.

Implemented behavior:

- added a dedicated retry service for portfolio item classification
- added support for the `manual_retry` trigger type
- exposed a retry endpoint for authenticated photographers:
    - `POST /profiles/me/portfolio-items/:itemId/retry-classification`
- blocked retry when classification is already running:
    - `queued`
    - `processing`
- reused the existing queue-based orchestration rather than creating a second classification path

### Frontend

This phase exposed classification state and results directly in the photographer portfolio workspace.

Implemented behavior:

- portfolio item type definitions now include AI classification fields
- photographer service now normalizes backend classification data into frontend-friendly shape
- portfolio cards now show:
    - AI status badge
    - detected primary style
    - confidence summary
    - secondary style signals
    - failure message when classification fails
- retry button is available for failed items
- the workspace automatically refreshes while at least one portfolio item is:
    - `queued`
    - `processing`
- portfolio summary cards now include AI-related visibility:
    - in progress count
    - failed count
    - completed count

---

## Backend Design Notes

### Retry architecture

The retry flow was intentionally added as a dedicated service instead of being mixed deeply into the main profile service.

Reason:

- keeps retry logic isolated and easier to maintain
- avoids overloading the already large profile service
- keeps classification orchestration inside the existing classification subsystem

### Retry rules

Retry is allowed only when the item is in a terminal or recoverable state.

Retry is blocked if the item is already being processed:

- `queued`
- `processing`

When retry is accepted:

- the item is requeued through the existing BullMQ flow
- the old error/result state is expected to be reset by the classification queue service
- the system continues using the same background classification pipeline as create/update flows

---

## Frontend Design Notes

### Classification visibility

The photographer should now clearly understand what is happening after saving portfolio media.

The workspace now communicates:

- AI is queued
- AI is processing
- AI completed successfully
- AI failed and can be retried

### Auto-refresh behavior

The portfolio page now polls while there is at least one active classification job.

This makes the feature feel alive from the UI without requiring the user to manually refresh.

### AI result presentation

For completed items, the frontend now exposes:

- detected primary style
- confidence for the primary style when available
- secondary style signals from the distribution or fallback summary fields

### Failure recovery

When classification fails:

- the portfolio card shows the failed state
- an error message can be shown if available
- a retry button requeues the item directly from the workspace

---

## End-to-End Product Behavior After This Phase

A photographer can now do the following through the real frontend flow:

1. open `/photographer/portfolio`
2. create a new portfolio item with cover image and optional gallery images
3. save the item
4. immediately see the portfolio card appear
5. observe AI status move through:
    - `queued`
    - `processing`
    - `completed` or `failed`
6. if completed:
    - see detected style information directly in the portfolio workspace
7. if failed:
    - see a failed state
    - retry classification from the same workspace

This is the first phase where the portfolio AI classification feature becomes clearly testable through the actual product UI rather than only through backend behavior.

---

## Files Changed in This Phase

### Backend

- `apps/profile/src/classification/portfolio-item-classification.types.ts`
- `apps/profile/src/portfolio-item-classification-retry.service.ts`
- `apps/profile/src/profile.controller.ts`
- `apps/profile/src/profile.module.ts`

### Frontend

- `apps/web/src/features/photographer/types/portfolio.types.ts`
- `apps/web/src/services/photographer.service.ts`
- `apps/web/src/features/photographer/components/portfolio-item-card.tsx`
- `apps/web/src/features/photographer/components/photographer-portfolio-page.tsx`

---

## Important Bug / Type Safety Fix During This Phase

A TypeScript strict-mode issue appeared in the style-label formatting helper.

Problem:

- accessing `part[0]` directly caused:
    - `Object is possibly 'undefined'`

Fix:

- replaced direct indexing with a safer string formatting approach using `charAt(0)`
- trimmed and filtered empty parts before formatting

This kept the label formatter type-safe under strict TypeScript settings.

---

## Current Testing Status

### User validation status

The frontend logic for this phase was tested and confirmed as working.

Confirmed by testing:

- frontend classification visibility works
- retry interaction works
- the overall FE logic for the phase is okay

### Core tested flows

- create portfolio item and observe AI lifecycle
- see completed classification result on the UI
- see failed state when classification fails
- retry classification from the UI
- text-only edit should not incorrectly trigger reclassification
- status refresh behavior on the portfolio page

---

## Product Feedback Captured After Testing

A very important UX/product issue was identified after testing:

### Current issue

The portfolio form still includes a manual `category` field, but the product direction now expects AI classification to determine the photography style from:

- cover image
- gallery images

This creates a semantic conflict.

The current UI can incorrectly imply that:

- the photographer manually decides the category/style
- AI classification is only secondary
- manual category may be the source of truth

### Product conclusion

If AI classification is the real source of truth for style/category understanding, then the manual category field should not remain in its current form.

This should not be treated as a small UI patch only.  
It should be cleaned up as part of the next proper foundation phase.

---

## Recommended Next Phase

### Next phase name

**Portfolio AI-First Model Cleanup (FE + BE)**

### Why this should be next

The classification visibility and retry flow now works, but the current data model and form UX still reflect an older manual-category mindset.

To avoid future rework, the next phase should align the portfolio model and form with the true business direction:

- AI-first classification
- cleaner source-of-truth semantics
- reduced long-term UX confusion

### Expected next-phase scope

Possible next-phase work:

- remove or redesign manual `category` if it no longer matches business meaning
- update frontend form copy so AI classification is clearly explained
- align DTOs and backend model usage with the AI-first direction
- avoid keeping a temporary UI field that will likely be removed later

---

## Architectural Direction Going Forward

A new working preference was clarified during this stage:

- when building future features, prefer a stronger and more durable foundation from the start
- avoid short-term patches if they are likely to create later rework
- when feasible, complete both frontend and backend flow together in one end-to-end phase

This means future Fotovia phases should prioritize:

- correct business meaning
- forward-compatible structure
- fewer temporary workarounds
- real product-ready flow instead of narrow technical completion only

---

## Practical Continuation Note

If continuing from this phase in a new chat:

1. read this file first
2. read the latest repo docs before planning
3. treat the latest repo state and docs as source of truth
4. plan the next phase as an AI-first cleanup of the portfolio form/model rather than a surface-only UI patch
