# Portfolio AI-First Model Cleanup

This document records the phase that cleaned up the portfolio model and workspace flow so AI-detected style becomes the main source of truth instead of a manual category field.

---

## Phase Summary

### Phase name

**Portfolio AI-First Model Cleanup (FE + BE)**

### Phase goal

The previous phase already made AI classification visible in the photographer workspace and added retry support. However, the product still had an important semantic mismatch:

- the form still asked the photographer to choose a manual `category`
- AI classification was already designed to infer style from the cover and gallery images
- this created confusion about which value was the real source of truth

This phase fixed that mismatch at the model and product-flow level instead of treating it as a small UI patch.

The main goal was:

- remove the manual category requirement from the active create/update flow
- align frontend and backend behavior with the AI-first direction
- keep backward compatibility for older portfolio records
- make public portfolio display prefer AI-derived style information

---

## Why This Phase Was Needed

After testing the visibility/retry phase, an important UX and product issue was confirmed:

### Problem

The photographer portfolio form still included a manual `category` field, but the business direction had already changed:

- AI classification analyzes the cover image and gallery images
- AI result should determine the style/category meaning for the item
- manual category no longer matched the real feature intent

This meant the UI could incorrectly imply that:

- the photographer manually decides the style
- AI classification is secondary
- the manual category is still the product-facing source of truth

### Product conclusion

This was not just a wording issue.  
It was a model-level mismatch.

Instead of applying a temporary frontend patch, this phase cleaned up the flow in a more durable way:

- active portfolio write flow no longer depends on manual category
- AI-detected style is now the main product-facing style signal
- legacy category remains only as a backward-compatible fallback

---

## Completed Scope

### Backend

This phase changed the backend portfolio write model so manual category is no longer required for current flows.

Implemented behavior:

- removed manual `category` from the create DTO
- stopped using manual `category` as part of the active create/update request contract
- updated the entity so legacy `category` can remain nullable
- kept the column only as a compatibility fallback for older data
- changed the public portfolio response shape to expose:
    - `styleLabel`
    - `styleSource`
- made public portfolio read logic prefer:
    1. AI-detected primary style
    2. legacy category fallback
    3. no style available

### Frontend

This phase changed the photographer workspace to match the AI-first product direction.

Implemented behavior:

- removed manual category from the photographer portfolio form
- removed category from the frontend portfolio draft and mutation payload model
- updated portfolio form copy to explain AI style detection clearly
- updated workspace summary text to explain AI-first behavior
- removed manual category badge from photographer portfolio cards
- highlighted detected AI style as the main visible style signal
- updated public photographer portfolio display to use:
    - AI-detected style when available
    - legacy fallback when needed
    - neutral empty state when no style exists

### SQL / migration support

This phase also introduced a database cleanup step so the legacy column no longer blocks the AI-first model.

Added SQL:

- `docs/sql/profile-portfolio-ai-first-model-cleanup.sql`

Behavior of the SQL:

- normalizes empty-string category values to `null`
- drops the `NOT NULL` requirement from the legacy `category` column
- adds a comment clarifying that the field is legacy/backward-compatible only

---

## Design Decisions

### 1. Do not remove the DB column immediately

The legacy `category` column was intentionally kept for now.

Reason:

- reduces migration risk
- preserves compatibility with older records
- avoids unnecessary disruption while the product is transitioning to AI-first style logic

This phase changes the **active product flow first** rather than performing a destructive schema removal too early.

### 2. AI-detected style is now the preferred source of truth

Public-facing portfolio style is now resolved using this order:

1. `detectedPrimaryStyle`
2. legacy `category`
3. no style available

This allows:

- new records to behave correctly
- old records to keep displaying something reasonable
- future cleanup phases to remove the legacy path more safely

### 3. Fix the business meaning at the foundation layer

This phase followed the clarified working preference for Fotovia:

- prefer a stronger long-term foundation
- avoid temporary UI patches that likely create rework
- when possible, clean up both FE and BE in one end-to-end phase

This was the right moment to fix the actual model semantics instead of postponing the work.

---

## End-to-End Product Behavior After This Phase

### Photographer workspace

A photographer can now:

1. open `/photographer/portfolio`
2. create a portfolio item without choosing any manual category
3. upload:
    - one required cover image
    - optional gallery images
4. save the item
5. let Fotovia automatically detect style through AI classification
6. observe:
    - queued / processing / completed / failed states
    - detected style when classification completes
    - retry action when classification fails

### Public photographer profile

Visitors can now:

- view public portfolio items that prefer AI-detected style
- still see legacy style data for older items if needed
- avoid confusion caused by a manual category that no longer reflects current business logic

---

## Files Changed in This Phase

### Backend

- `apps/profile/src/dtos/create-profile-portfolio-item.dto.ts`
- `apps/profile/src/entities/profile-portfolio-item.entity.ts`
- `apps/profile/src/repositories/profile-portfolio-item.repository.ts`
- `apps/profile/src/profile.service.ts`

### Frontend

- `apps/web/src/features/photographer/types/portfolio.types.ts`
- `apps/web/src/features/photographer/types/photographer-detail.types.ts`
- `apps/web/src/services/photographer.service.ts`
- `apps/web/src/features/photographer/components/portfolio-item-form.tsx`
- `apps/web/src/features/photographer/components/portfolio-item-card.tsx`
- `apps/web/src/features/photographer/components/photographer-portfolio-page.tsx`
- `apps/web/src/features/photographer/components/photographer-portfolio-section.tsx`
- `apps/web/src/features/photographer/components/photographer-portfolio-viewer-dialog.tsx`

### Docs / SQL

- `docs/sql/profile-portfolio-ai-first-model-cleanup.sql`

---

## Issue Encountered During Implementation

### Compile/build issue

After removing the category constants from the frontend portfolio types, some components still imported the old exports:

- `PORTFOLIO_CATEGORY_LABELS`
- `PORTFOLIO_CATEGORIES`

This caused build errors because those exports no longer existed.

### Resolution

The remaining stale imports and category-render blocks were removed from the affected frontend components.

This confirmed that:

- category had been fully removed from the active portfolio UI flow
- the AI-first cleanup was now consistent across the updated files

---

## Current Testing Status

### User validation status

The phase was tested and confirmed as stable after fixing the remaining frontend compile issue.

### Confirmed working

- portfolio form no longer shows manual category
- create/update payloads no longer depend on category
- AI visibility and retry flow still work
- portfolio cards still render correctly
- public portfolio display now uses AI-first style resolution
- compile issue caused by stale category imports was fixed

---

## Product Meaning After This Phase

The portfolio feature now has a cleaner and more consistent meaning:

### Before

- category was manually chosen
- AI also classified style
- source of truth was unclear

### After

- photographers provide portfolio media and descriptive context
- Fotovia analyzes the media to detect style automatically
- AI-detected style is the main style signal
- legacy category exists only for compatibility during transition

This is a much stronger foundation for future portfolio discovery, filtering, and recommendation features.

---

## Recommended Next Phase

### Next phase direction

**Public AI Style Discovery / Filtering Foundation (FE + BE)**

### Why this should be next

Now that:

- AI classification is visible
- retry exists
- portfolio flow is AI-first
- style semantics are cleaner

the next high-value product step is to use the detected style data for actual discovery value.

### Suggested next-phase scope

Possible next work:

- expose public photographer filtering based on AI-detected styles
- let users browse photographers by detected style signals
- use AI-derived style data in marketplace/discovery UI
- start turning classification from “internal result” into “user-facing discovery value”

This would be the first phase where AI classification starts affecting public matching and browsing behavior, not just photographer-side portfolio management.

---

## Working Preference Reinforced

This phase strongly reinforces the working rule clarified recently:

- prefer building a stronger, more durable foundation from the start
- avoid short-term fixes that likely create future rework
- when feasible, complete frontend and backend flow together in one phase

This phase is a good example of that rule in practice:
instead of keeping manual category temporarily and planning a later cleanup, the feature was aligned now at the model, API, and UI layers together.

---

## Practical Continuation Note

If continuing from this phase in a new chat:

1. read this file first
2. read the latest repo docs and current repo state
3. treat the current repo/docs as source of truth
4. continue from the AI-first portfolio model
5. do not reintroduce manual category into the active portfolio flow unless a new business meaning is explicitly defined
