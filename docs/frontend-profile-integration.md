# Frontend Profile Integration Notes

## Purpose

This document tracks the current production-facing profile integration state in `apps/web`.

## Current profile API direction

The frontend now treats profile data as a separate backend concern from auth identity.

### Identity source

`/auth/me` provides:

- `id`
- `email`
- `role`

This is used for auth and session hydration.

### Profile source

`/profiles/me` provides editable profile data such as:

- `fullName`
- `phone`
- `location`
- `bio`
- `specialties`
- `pricePerHour`
- `experienceYears`

This is used for the production-facing profile page.

## Frontend API client split

The frontend uses a dedicated `profileClient`.

Reason:

- auth service and profile service are separate backend services
- profile requests should not be routed through the auth client
- service boundaries should stay visible in the frontend service layer too

## Current `/profile` behavior

Status: **working**

Behavior:

- `/profile` is now treated as an authenticated-only page
- signed-in users can load real profile data
- signed-out users are redirected away through the protected-route flow
- if no profile exists yet, the UI can create a profile foundation
- users can update real profile fields through the profile service
- profile UI no longer depends on mock profile builders in the main production-facing flow

## Current profile UX behavior

Status: **improved**

Behavior:

- profile save uses snackbar feedback instead of inline success boxes
- profile foundation creation uses snackbar feedback
- summary card handles long email and phone values more safely
- profile access is available from the signed-in account area instead of cluttering the main navbar

## Current known limitation

This phase focuses on the profile foundation only.

Still pending:

- richer photographer profile fields
- avatar upload
- portfolio integration
- public photographer-profile read flow from real backend data
- profile completion guidance after sign-in or sign-up

## Relationship to workspace direction

- `/profile` remains the editable profile source page for signed-in users
- photographer accounts can now reach `/profile` from a protected workspace foundation
- the workspace route does not replace `/profile`; it gives post-auth product direction a clearer home
- profile role data now helps drive authenticated UI direction where auth identity alone was not sufficient

## Current known limitation

This phase still keeps profile editing separate from richer onboarding, portfolio tooling, and booking management.

## Recommended next phase

### Profile Completion Direction + Role-Aware Product Guidance

Goals:

- connect profile completeness more clearly to the photographer workspace
- decide whether incomplete profile state should drive stronger prompts or gated actions
- prepare later portfolio and booking-management flows without overloading the current profile page

## Phase 26: Profile completion guidance

This phase builds on top of the existing real `/profiles/me` integration and uses that data to guide photographer users inside the protected workspace.

### What changed

- profile completion is now computed from real profile data
- the photographer workspace now shows completion percentage and missing profile areas
- `/profile` remains the editable source page
- the workspace acts as a guidance and progress layer rather than replacing profile editing

### Current completion fields

The current profile completion logic checks these fields:

- full name
- phone
- location
- bio
- specialties
- price per hour
- experience years

### Current states handled

The workspace now handles these profile-related states:

- loading profile progress
- profile exists and is partially complete
- profile exists and is fully complete
- profile is missing
- profile request fails for another reason

### Relationship to workspace direction

This phase makes the photographer workspace more meaningful without turning it into a heavy dashboard.

Current rule:

- `/profile` = edit real data
- `/photographer/dashboard` = see progress, guidance, and next product direction

## Recommended next phase

### Photographer Portfolio Foundation

Goals:

- define the first real portfolio structure for photographer accounts
- connect workspace direction to portfolio setup
- prepare later public discovery and photographer detail improvements using more realistic portfolio data

## Phase 27: Portfolio foundation relationship

Phase 27 extends the photographer-side product flow beyond profile readiness and into portfolio setup.

### What changed

- photographer accounts now have a protected portfolio management route
- the photographer workspace now points more clearly from profile readiness to portfolio foundation
- the portfolio page acts as the first dedicated place to manage portfolio items
- `/profile` still remains the real editable source for photographer profile fields

### Current product direction

The current photographer-side direction is now:

- `/profile` = edit real profile data
- `/photographer/dashboard` = see progress, guidance, and next-step direction
- `/photographer/portfolio` = build and manage the first portfolio foundation

### Why this matters

Profile completion alone is not enough for a strong photographer marketplace experience.

The portfolio phase starts to provide:

- creative proof
- future discovery value
- a better bridge toward public photographer detail quality
- a future foundation for real asset/media integration

## Current limitation

This phase still keeps portfolio data frontend-only.

Still pending:

- real asset upload
- portfolio persistence to backend
- portfolio editing and deletion workflows
- public photographer detail integration with real uploaded works

## Recommended next phase

### Portfolio Asset Upload / Asset Integration Foundation

Goals:

- connect the portfolio page to a real upload flow
- define how uploaded media maps into portfolio items
- prepare later public portfolio rendering using real media assets

## Phase 28: Asset-first portfolio direction

Phase 28 extends the photographer-side flow beyond portfolio foundation and into asset-first portfolio setup.

### What changed

- portfolio items no longer rely only on a manual `imageUrl` input
- the portfolio page now works with asset-style preview data
- photographers can now choose a local image file and preview it inside the portfolio flow
- the photographer workspace now points more clearly toward asset-first portfolio setup

### Current photographer-side direction

The current photographer-side product flow is now:

- `/profile` = edit real profile data
- `/photographer/dashboard` = see readiness and next-step guidance
- `/photographer/portfolio` = manage asset-first portfolio setup

### Why this matters

Moving from a plain image URL field to asset-style preview data makes the portfolio flow more realistic and prepares the frontend for a later real upload integration phase.

This gives the product a better bridge toward:

- real media storage
- stronger portfolio management
- more realistic public photographer detail rendering
- future AI/media-related features

## Current limitation

This phase still keeps portfolio assets frontend-only.

Still pending:

- real file upload to storage
- asset persistence in backend
- portfolio edit/delete/reorder workflows
- public use of real portfolio assets

## Phase 29: Relationship to persistent portfolio management

Phase 29 keeps the role-aware photographer workspace and profile completion direction in place, then strengthens the photographer-side portfolio flow with saved local management actions.

### What changed

- the portfolio page now supports persistent local save in the current browser
- photographers can now edit existing portfolio items
- photographers can now delete portfolio items
- photographers can now mark items as featured or remove featured state
- portfolio ordering is now simplified to newest-first instead of manual reordering

### Why this matters

The photographer-side experience is now more realistic than a create-only portfolio prototype.

Current photographer-side direction is now:

- `/profile` = edit real profile data
- `/photographer/dashboard` = view progress and next-step direction
- `/photographer/portfolio` = manage saved portfolio items in a persistent local workflow

## Current limitation

This phase still keeps portfolio persistence local to the current browser.

Still pending:

- real backend upload persistence
- real asset/media records
- public photographer detail integration with saved portfolio items
- backend-driven edit/delete behavior
