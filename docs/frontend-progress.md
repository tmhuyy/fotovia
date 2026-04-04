# Frontend Progress

This file tracks the progress of frontend tasks for Fotovia.

## Phase 1: Frontend Foundation

**Status:** Completed

### Scope

- Setup frontend foundation
- Configure Tailwind theme tokens
- Setup providers and shared utilities
- Build homepage first after setup

### Delivered

- App Router structure with `(public)` route group.
- Scalable folder structure in `apps/web/src`.
- Tailwind v4 theme tokens for Premium Neutral palette.
- Google fonts integrated (Playfair Display + Inter).
- Providers for TanStack Query.
- Shared utilities and service layer scaffolding.
- Homepage sections implemented: navbar, hero, featured photographers, AI intro, how it works, portfolio showcase, CTA, footer.

### Notes

- Auth is intentionally not implemented yet.
- Homepage uses brand tokens only; no raw hex colors in components.

### Key Files

- `apps/web/src/app/layout.tsx`
- `apps/web/src/app/globals.css`
- `apps/web/src/app/(public)/page.tsx`
- `apps/web/src/components/home/home-page.tsx`
- `apps/web/src/providers/app-provider.tsx`
- `apps/web/src/providers/query-provider.tsx`

## Phase 2: Auth UI Foundation

**Status:** Completed

### Scope

- Auth route group and pages
- Auth UI components and schemas
- React Hook Form + Zod validation
- UI-only auth flows with placeholder submit handlers

### Delivered

- New `(auth)` route group with pages:
    - `/sign-in`
    - `/sign-up`
    - `/register-email`
    - `/check-email`
- Auth layout shell and card structure consistent with Premium Neutral theme.
- Reusable auth UI components: form header, text fields, password toggle field, footer links, error message.
- Zod schemas for sign-in, sign-up, and register-email.
- React Hook Form integration with field-level validation and submission states.
- Added shadcn-style input and label components for form reuse.

### Notes

- No API calls, auth services, or token handling implemented.
- No Zustand auth store or route protection logic included.
- Placeholder submit handlers only.

### Key Files

- `apps/web/src/app/(auth)/layout.tsx`
- `apps/web/src/app/(auth)/sign-in/page.tsx`
- `apps/web/src/app/(auth)/sign-up/page.tsx`
- `apps/web/src/app/(auth)/register-email/page.tsx`
- `apps/web/src/app/(auth)/check-email/page.tsx`
- `apps/web/src/features/auth/components/auth-shell.tsx`
- `apps/web/src/features/auth/components/sign-in-form.tsx`
- `apps/web/src/features/auth/components/sign-up-form.tsx`
- `apps/web/src/features/auth/components/register-email-form.tsx`
- `apps/web/src/features/auth/schemas/sign-in.schema.ts`
- `apps/web/src/features/auth/schemas/sign-up.schema.ts`
- `apps/web/src/features/auth/schemas/register-email.schema.ts`

## Phase 3: Auth Flow Refinement and Role-Based Entry UX

**Status:** Completed

### Scope

- Refine homepage CTA for clear entry into auth
- Introduce explicit role selection for sign-up
- Keep auth UI consistent with Premium Neutral styling
- Evaluate register-email flow alignment

### Delivered

- Homepage CTA refinements:
    - Navbar now includes sign-in, get started, and become a photographer entry points.
    - Hero CTA updated to focus on finding a photographer or joining as a photographer.
    - Added a role-introduction block to clarify client vs photographer paths.
- Sign-up flow now includes explicit role selection with two role cards.
- Register-email flow now includes role selection and updated copy.
- Added role query parameter handling (`role=client|photographer`) for sign-up entry links.

### Decisions

- Register-email page kept but de-emphasized; surfaced as an optional link in sign-up.
- Role selection is required in both sign-up and register-email to keep future onboarding aligned.

### Notes

- Still UI-only. No API calls, auth services, or tokens implemented.
- Role selection is prepared for payload integration in the next phase.

### Key Files

- `apps/web/src/components/home/navbar.tsx`
- `apps/web/src/components/home/hero-section.tsx`
- `apps/web/src/components/home/role-intro.tsx`
- `apps/web/src/features/auth/components/role-selector.tsx`
- `apps/web/src/features/auth/components/sign-up-form.tsx`
- `apps/web/src/features/auth/components/register-email-form.tsx`
- `apps/web/src/features/auth/schemas/sign-up.schema.ts`
- `apps/web/src/features/auth/schemas/register-email.schema.ts`

## Phase 4: Responsive and Dark Mode Foundation

**Status:** Completed

### Scope

- Strengthen responsive behavior across homepage and auth flows
- Introduce dark mode system and theme toggling
- Convert components to semantic theme tokens

### Delivered

- Responsive refinements:
    - Navbar now wraps and scales CTA actions on smaller screens.
    - Section spacing and container padding adjusted for mobile-to-desktop rhythm.
    - Card grids now adapt at `sm` and `lg` breakpoints.
    - Auth shell and card padding adjusted for mobile comfort.
- Dark mode foundation:
    - Added `next-themes` provider and theme toggle component.
    - Semantic color tokens introduced (`background`, `surface`, `foreground`, `muted`, `border`, `accent`, `ai`).
    - Dark theme values defined with premium neutral contrast.
    - Homepage and auth components updated to use semantic tokens.

### Decisions

- Dark mode uses CSS variable overrides on `.dark` with system theme as default.
- Primary CTA colors invert using `bg-foreground` + `text-background` for contrast in both modes.

### Notes

- No API/auth logic changes.
- Role-based flows remain UI-only.

### Key Files

- `apps/web/src/app/globals.css`
- `apps/web/src/providers/theme-provider.tsx`
- `apps/web/src/components/common/theme-toggle.tsx`
- `apps/web/src/components/layout/container.tsx`
- `apps/web/src/components/common/section.tsx`
- `apps/web/src/components/home/navbar.tsx`
- `apps/web/src/components/home/hero-section.tsx`
- `apps/web/src/features/auth/components/auth-shell.tsx`

## Phase 5: Auth Logic and Session Foundation

**Status:** Completed

### Scope

- Direct auth-service connection
- Auth service + token utilities
- Zustand auth store
- Connect sign-in/sign-up to real logic
- Session initialization groundwork

### Delivered

- Added `NEXT_PUBLIC_AUTH_API_URL` for direct auth-service connection.
- Implemented `auth.service.ts` with sign-in, sign-up, register-email, and current-user calls.
- Added `auth-token.ts` for token storage in localStorage.
- Added `auth.store.ts` for session state, token handling, and user summary.
- Added `auth-session-provider.tsx` to initialize session on app load.
- Connected sign-in and sign-up forms to real service logic with clean error/success states.
- Register-email now attempts direct auth-service call with graceful messaging.

### Assumptions

- Auth sign-in endpoint assumed as `POST /auth/signin`.
- Current user endpoint assumed as `GET /auth/me`.
- Register-email endpoint assumed as `POST /auth/register-email`.
- Auth responses assumed to return `accessToken` and `user` (with fallback support for `token`).

### Notes

- No refresh token flow implemented.
- No protected routes or dashboard logic yet.
- Role selection continues to be included in sign-up payloads.

### Key Files

- `apps/web/src/services/auth.service.ts`
- `apps/web/src/services/api/axios.ts`
- `apps/web/src/lib/auth-token.ts`
- `apps/web/src/store/auth.store.ts`
- `apps/web/src/providers/auth-session-provider.tsx`
- `apps/web/src/features/auth/components/sign-in-form.tsx`
- `apps/web/src/features/auth/components/sign-up-form.tsx`
- `apps/web/src/features/auth/components/register-email-form.tsx`
- `apps/web/.env.example`

## Phase 6: Sign-Up Role URL Sync

**Status:** Completed

### Scope

- Keep sign-up role selection in sync with the URL query param
- Normalize role param and enforce predictable fallback behavior

### Delivered

- Sign-up role now derives from `role` query param with normalization.
- URL updates only when the user explicitly changes role selection.
- Removed the form watch -> URL sync effect that caused router.replace ping-pong.
- Missing or invalid role param falls back to `client` and updates the URL once.

### Decisions

- Role param remains the single source of truth for sign-up deep links.
- Fallback behavior defaults to `client` for missing/invalid values.
- One-way sync from URL -> form only; no automatic form -> URL effects.

### Notes

- No auth API changes.
- No homepage CTA changes required; existing links already aligned.

### Key Files

- `apps/web/src/features/auth/components/sign-up-form.tsx`

### Next Recommended Phase

- Add role-based redirects after successful auth.
- Introduce lightweight onboarding for client vs photographer.
- Add protected routes and authenticated layouts.

## Phase 7 (Phase A): Mock Session and Dev Cheat Panel

**Status:** Completed

### Scope

- Add a frontend-only mock session store with persistence.
- Provide a dev-only cheat panel for switching mock auth states.
- Document env flag for dev visibility.

### Delivered

- New mock session store with persisted state (`signed out`, `client`, `photographer`).
- Session persistence uses localStorage (key: `fotovia-mock-session`).
- Dev-only cheat panel with quick actions:
    - Sign in as client
    - Sign in as photographer
    - Sign out
- Mock state displays current role and user summary.
- Env flag `NEXT_PUBLIC_ENABLE_DEV_CHEATS` added to control visibility (also enabled in development by default).

### Decisions

- Mock session is isolated from real auth/token logic to avoid backend dependency.
- URL and UI flows remain unchanged; no public UI uses mock state yet.

### Notes

- No API calls, token storage changes, or protected routes added.
- Panel is fixed in the corner and styled as a subtle internal tool.

### Key Files

- `apps/web/src/store/mock-session.store.ts`
- `apps/web/src/components/dev/dev-cheat-panel.tsx`
- `apps/web/src/providers/app-provider.tsx`
- `apps/web/.env.example`
- `apps/web/README.md`

### Next Recommended Phase

- Decide how mock session should integrate with real session once backend is stable.
- Use mock session state to power role-based navbar or dashboard entry in development.

## Phase 8 (Phase B): Auth-aware Homepage and Navbar

**Status:** Completed

### Scope

- Use mock session state to adapt homepage and navbar.
- Provide sign-out actions for mocked sessions.
- Keep public UI premium and minimal.

### Delivered

- Navbar now adapts to mock session state:
    - Signed out: Sign in, Get started, Become a photographer.
    - Client: Explore photographers, Profile, Sign out.
    - Photographer: Workspace, Profile, Sign out.
- Hero CTAs now adapt by role:
    - Signed out: Find a photographer + Join as photographer.
    - Client: Explore photographers + View profile.
    - Photographer: Open workspace + View profile.
- Sign-out clears mock session and returns UI to signed-out state.

### Decisions

- Auth-aware behavior is powered by the mock session store only.
- No protected routing or real auth integration added.

### Notes

- Placeholder links are used for future profile/workspace routes.
- Visual direction and responsive layout preserved.

### Key Files

- `apps/web/src/components/home/navbar.tsx`
- `apps/web/src/components/home/hero-section.tsx`
- `apps/web/src/store/mock-session.store.ts`

### Next Recommended Phase

- Connect navbar and hero to real auth/session data when backend stabilizes.
- Introduce lightweight profile and dashboard entry pages.

## Phase 9 (Phase C): Profile UI Foundation

**Status:** Completed

### Scope

- Add profile route and UI foundation.
- Build role-aware profile presentation for clients and photographers.
- Introduce mock-only edit profile form.

### Delivered

- New `/profile` route with role-aware layout and profile sections.
- Profile summary card with avatar placeholder, role badge, and contact details.
- Profile edit form with React Hook Form + Zod (mock save only).
- Role-aware sections:
    - Client: saved photographers and booking preferences.
    - Photographer: portfolio preview and availability snapshot.
- Mock profile data helper wired to mock session state.

### Decisions

- Profile uses mock session state only; no API integration.
- Profile edits save locally and update UI only.

### Notes

- Placeholder links remain for future profile/workspace routes.
- Design remains Premium Neutral with dark mode support.

### Key Files

- `apps/web/src/app/profile/page.tsx`
- `apps/web/src/features/profile/components/profile-page.tsx`
- `apps/web/src/features/profile/components/profile-details-form.tsx`
- `apps/web/src/features/profile/components/profile-summary-card.tsx`
- `apps/web/src/features/profile/components/profile-role-highlights.tsx`
- `apps/web/src/features/profile/data/mock-profile.ts`
- `apps/web/src/features/profile/schemas/profile.schema.ts`
- `apps/web/src/components/ui/textarea.tsx`

### Next Recommended Phase

- Wire profile data to real backend services.
- Add profile image upload and portfolio management.

## Phase 10: Photographer Listing UI Foundation

**Status:** Completed

### Scope

- Add public photographer listing route with mock discovery UX.
- Build filter/search/sort UI and responsive photographer cards.
- Introduce mock dataset for discovery.

### Delivered

- New `/photographers` route for public discovery.
- Mock photographer dataset with specialties, styles, locations, pricing, and tags.
- Discovery controls: search, specialty, style, location, budget, and sort.
- Frontend-only filtering and sorting with empty state handling.
- Premium card grid layout with role-neutral CTAs for future detail pages.

### Decisions

- Listing uses mock data and client-side filtering only.
- Cards link to `/photographers/[slug]` placeholder for future detail pages.

### Notes

- No backend integration, booking flow, or AI match logic added.
- UI remains Premium Neutral with dark mode support.

### Key Files

- `apps/web/src/app/photographers/page.tsx`
- `apps/web/src/features/photographer/components/photographers-page.tsx`
- `apps/web/src/features/photographer/components/photographer-card.tsx`
- `apps/web/src/features/photographer/components/photographer-filters.tsx`
- `apps/web/src/features/photographer/data/mock-photographers.ts`
- `apps/web/src/features/photographer/types/photographer.types.ts`

### Next Recommended Phase

- Add photographer detail page foundation (`/photographers/[slug]`).
- Introduce booking request UI scaffold.

## Phase 11: Photographer Detail UI Foundation

**Status:** Completed

### Scope

- Add photographer detail route and UI foundation.
- Extend mock data to support detail sections.
- Introduce portfolio, services, and CTA presentation.

### Delivered

- New `/photographers/[slug]` detail route.
- Detail hero with cover placeholder, avatar, specialty, and trust signals.
- About, portfolio preview, services, and testimonials sections.
- Sticky booking CTA card with availability teaser.
- Extended mock detail data (intro, experience, services, portfolio, testimonials).

### Decisions

- Detail page uses mock data only; no API integration.
- Booking CTA is present but disabled until booking flow is built.

### Notes

- Listing cards already link to `/photographers/[slug]`.
- UI remains Premium Neutral with dark mode support.

### Key Files

- `apps/web/src/app/photographers/[slug]/page.tsx`
- `apps/web/src/features/photographer/components/photographer-detail-page.tsx`
- `apps/web/src/features/photographer/components/photographer-detail-hero.tsx`
- `apps/web/src/features/photographer/components/photographer-detail-cta.tsx`
- `apps/web/src/features/photographer/components/photographer-portfolio-section.tsx`
- `apps/web/src/features/photographer/components/photographer-services-section.tsx`
- `apps/web/src/features/photographer/components/photographer-testimonials-section.tsx`
- `apps/web/src/features/photographer/data/mock-photographer-details.ts`
- `apps/web/src/features/photographer/types/photographer-detail.types.ts`

### Next Recommended Phase

- Build booking request UI and route.
- Add AI style match prompts to detail view.

## Patch: Photographer UUID + Slug Refactor

**Status:** Completed

### Scope

- Refactor mock photographer data to use UUID `id` + public `slug`.
- Update listing and detail routes to use slug-based navigation.

### Delivered

- Photographer type now includes `id` (UUID) and `slug` (public route value).
- Mock photographer dataset updated with UUIDs and slugs.
- Detail lookup now resolves by slug (`getPhotographerDetailBySlug`).
- Detail route updated to `/photographers/[slug]`.
- Listing cards now link to `/photographers/{slug}`.

### Notes

- UUIDs remain internal-only for future backend alignment.
- No backend/API integration added.

## Phase 12: Booking Request UI Foundation

**Status:** Completed

### Scope

- Add booking request route and UI foundation.
- Build booking request form with summary and success states.
- Wire detail-to-booking CTA for marketplace flow continuity.

### Delivered

- New booking route: `/photographers/[slug]/book`.
- Booking request page layout with back link, header, form, and summary sidebar.
- React Hook Form + Zod validation for booking request fields.
- Booking summary card that updates as form values change.
- Mock confirmation state after submit with next-step CTAs.
- Booking CTA on photographer detail now links into the booking request flow.

### Decisions

- Booking flow remains frontend-only with mock submit handling.
- Booking summary uses mock photographer data and form values only.

### Notes

- No booking API integration, payments, or request management yet.
- Success state is local and resettable for repeated mock submissions.

### Key Files

- `apps/web/src/app/photographers/[slug]/book/page.tsx`
- `apps/web/src/features/booking/components/booking-request-page.tsx`
- `apps/web/src/features/booking/components/booking-request-form.tsx`
- `apps/web/src/features/booking/components/booking-summary-card.tsx`
- `apps/web/src/features/booking/components/booking-success.tsx`
- `apps/web/src/features/booking/schemas/booking-request.schema.ts`
- `apps/web/src/features/photographer/components/photographer-detail-cta.tsx`

### Next Recommended Phase

- Connect booking request form to real booking API.
- Add booking history and request management UI.

## Phase 13: Home Booking Entry and Real Featured Photographers

**Status:** Completed

### Scope

- Strengthen homepage booking entry paths.
- Replace featured photographer placeholders with real mock data.
- Add a guided booking-entry block on the homepage.

### Delivered

- Featured photographers now use the real mock dataset and link to detail pages.
- Hero CTAs now emphasize two paths: explore photographers or start a booking request.
- New booking-entry section with quick brief inputs and a guided-path explainer.
- Added `/bookings/new` placeholder page for guided booking briefs.
- Homepage CTA section updated to reinforce browse-first and request-first paths.

### Decisions

- Guided booking request remains a placeholder route until the full brief flow is built.
- Quick brief inputs are passed to `/bookings/new` via query params for future prefill use.

### Notes

- No backend/API integration added.
- Auth-aware behavior remains intact for signed-in roles.

### Key Files

- `apps/web/src/components/home/featured-photographers.tsx`
- `apps/web/src/components/home/hero-section.tsx`
- `apps/web/src/components/home/booking-entry-section.tsx`
- `apps/web/src/components/home/cta-section.tsx`
- `apps/web/src/app/bookings/new/page.tsx`
- `apps/web/src/features/booking/components/booking-brief-page.tsx`

### Next Recommended Phase

- Build the full guided booking brief flow.
- Add recommendation results and matching logic UI scaffolds.

## Phase 14: Guided Booking Brief UI

**Status:** Completed

### Scope

- Replace the `/bookings/new` placeholder with a real guided booking brief form.
- Support prefill values from the homepage quick brief entry.
- Add a live summary sidebar and next-step CTA.

### Delivered

- `/bookings/new` now renders a full guided booking brief form with validation.
- New guided brief fields: session type, date, time, location, budget, style, description, contact preference, inspiration link, notes.
- Live summary card with brief readiness and a “Find matching photographers” CTA.
- Local success state confirming brief submission (no backend yet).
- Prefill support from homepage quick brief query params.

### Decisions

- Guided booking remains frontend-only with mock submission handling.
- Recommendation results are deferred; CTA currently routes to the public photographer listing.

### Notes

- Direct booking flow remains unchanged.
- Dark mode and responsive behaviors preserved.

### Key Files

- `apps/web/src/features/booking/components/booking-brief-page.tsx`
- `apps/web/src/features/booking/components/booking-brief-form.tsx`
- `apps/web/src/features/booking/components/booking-brief-form-fields.tsx`
- `apps/web/src/features/booking/components/booking-brief-summary-card.tsx`
- `apps/web/src/features/booking/components/booking-brief-success.tsx`
- `apps/web/src/features/booking/schemas/booking-brief.schema.ts`
- `apps/web/src/features/booking/data/booking-options.ts`

### Next Recommended Phase

- Build the guided recommendation results page.
- Connect guided booking briefs to a real backend and matching pipeline.

## Phase 15: 2-Step Guided Booking Flow

**Status:** Completed

### Scope

- Treat homepage quick brief as Step 1.
- Make `/bookings/new` a clear Step 2 continuation.
- Improve prefill continuity and reduce duplicate feeling.

### Delivered

- Homepage quick brief CTA now communicates continuation to Step 2.
- Added Step 1 messaging and flow guidance in the homepage booking-entry block.
- `/bookings/new` copy updated to “Step 2 of 2” with continuation language.
- Prefilled Step 1 values now surfaced in a “Prefilled from Step 1” block.
- Guided booking form copy now emphasizes refining and extending the brief.

### Decisions

- Prefill continuity continues via query params from the homepage.
- No backend persistence added yet.

### Notes

- Direct booking flow remains unchanged and distinct.

### Key Files

- `apps/web/src/components/home/booking-entry-section.tsx`
- `apps/web/src/features/booking/components/booking-brief-page.tsx`
- `apps/web/src/features/booking/components/booking-brief-form.tsx`

### Next Recommended Phase

- Add recommendation results page and guided-match flow.

## Patch: Guided Booking Prefill Continuity

**Status:** Completed

### Scope

- Ensure homepage Step 1 values persist into `/bookings/new`.
- Prevent empty Step 2 forms when coming from the quick brief.

### Delivered

- `/bookings/new` now reads query params directly on the client for reliable prefill.
- Prefilled Step 1 values are merged with server-provided props for continuity.

### Notes

- No backend persistence added.
- Direct booking flow unchanged.

### Key Files

- `apps/web/src/features/booking/components/booking-brief-page.tsx`

## Phase 16: Sign In API Connection (Reusable Service Pattern)

**Status:** Completed

### Scope

- Connect sign-in UI to the real auth backend (`POST /auth/login`).
- Introduce lightweight API response/error helpers for reuse.
- Ensure auth requests support credentials for cookie-based auth.
- Apply minimal backend CORS support for local dev if required.

### Delivered

- Sign-in now posts to `POST /auth/login` and unwraps the `{ statusCode, data }` response shape.
- Added API helpers:
    - `ApiResponse<T>` type
    - `unwrapResponse` response normalizer
    - `normalizeApiError` error normalizer
- `authClient` now uses `withCredentials: true` for cookie-based auth.
- Sign-in UI now maps backend failures to calm, user-facing messages.
- Backend auth service enables CORS for `http://localhost:8888` with credentials.

### Decisions

- Login response normalized to `{ accessToken, refreshToken?, user: null }` to match current backend output.
- Refresh-token flow and `/auth/me` hydration remain deferred.
- Sign-up integration remains unchanged in this phase.

### Notes

- Corrected the earlier assumption of `/auth/signin`; the backend uses `/auth/login`.
- Access token is still stored via the existing auth store for future API calls.

### Key Files

- `apps/web/src/services/api/axios.ts`
- `apps/web/src/services/api/types.ts`
- `apps/web/src/services/api/response.ts`
- `apps/web/src/services/api/error.ts`
- `apps/web/src/services/auth.service.ts`
- `apps/web/src/features/auth/components/sign-in-form.tsx`
- `apps/auth/src/main.ts`

### Next Recommended Phase

- Connect sign-up to real backend response shape.
- Add `/auth/me` hydration once user payloads are returned.
- Implement refresh-token handling and route protection.

## Phase: 17 Sign-In Zod Validation Runtime Fix + Error UX Cleanup

**Status:** Completed

### Scope

- Fix the runtime Zod overlay issue on the sign-in page
- Keep invalid input errors inside the form instead of throwing a runtime error
- Prevent invalid form states from triggering fake loading behavior
- Improve sign-in validation UX to feel closer to production-ready marketplace patterns

### Delivered

- Fixed the sign-in validation flow so invalid inputs now stay inside React Hook Form error state
- Password and email validation errors now render inline under the correct field
- Invalid form submissions no longer trigger the runtime Zod overlay
- Invalid form submissions no longer leave the submit button stuck in a loading state
- Sign-in auth failures remain separated from field validation failures through a form-level auth alert

### Decisions

- Sign-in validation should stay lightweight and appropriate for login UX
- Field validation errors and API auth errors must remain visually separate
- Zod validation for normal user input must never surface as a runtime overlay in the expected flow

### Notes

- A compatibility issue between `zod` and `@hookform/resolvers` was part of the problem
- Resolver compatibility should be checked first if similar runtime validation behavior appears again
- The desired UX pattern is inline field error messaging, similar to standard React Hook Form + Zod form behavior

### Key Files

- `apps/web/package.json`
- `apps/web/src/features/auth/schemas/sign-in.schema.ts`
- `apps/web/src/features/auth/components/sign-in-form.tsx`

### Outcome

- Successful login still redirects to `/`
- Access token and refresh token continue to be stored after successful login
- Invalid input now behaves like normal form validation instead of a runtime crash

### Next Recommended Phase

- Review `/auth/me` contract and improve frontend session hydration
- Start reducing mock-session dependence in auth-aware UI

## Phase 18: Auth Session Hydration and Navbar Unification

**Status:** Completed

### Scope

- Make `/auth/me` usable for frontend session hydration.
- Hydrate the signed-in user after successful login.
- Reflect real signed-in state on the homepage navbar.
- Prevent the navbar from flashing a signed-out state on reload before session hydration finishes.

### Delivered

- Updated backend `/auth/me` to return a frontend-usable user summary instead of a placeholder string.
- Sign-in flow now fetches current user data after successful login before redirecting to `/`.
- Auth session provider now hydrates session state from stored token + `/auth/me`.
- Navbar now reflects real signed-in state using the auth store.
- Navbar reload behavior now avoids showing signed-out actions before session hydration completes.
- Sign-out clears frontend auth state and returns the navbar to signed-out state cleanly.

### Decisions

- `/auth/me` is now the source of truth for frontend user hydration after login and on reload.
- Navbar should not render signed-out CTA state while auth hydration is still in progress.
- A neutral loading/hydration state is preferred over a signed-out flash.

### Notes

- This phase focuses on real auth session behavior for the navbar and main page entry experience.
- Broader auth-aware UI cleanup across the rest of the app is still deferred.
- Mock-session-based developer tools may still exist separately and are not the source of truth for the production-facing auth flow.

### Key Files

- `apps/auth/src/auth/auth.controller.ts`
- `apps/auth/src/auth/auth.service.ts`
- `apps/web/src/services/auth.service.ts`
- `apps/web/src/store/auth.store.ts`
- `apps/web/src/providers/auth-session-provider.tsx`
- `apps/web/src/features/auth/components/sign-in-form.tsx`
- `apps/web/src/components/home/navbar.tsx`

### Next Recommended Phase

- Audit and clean up sign-up contract between frontend and backend.
- Unify remaining auth-aware UI away from mock-session where appropriate.

## Phase 19: Frontend Sign-Up Integration

**Status:** Completed

### Scope

- Align the frontend sign-up flow with the updated backend signup contract.
- Submit `email`, `password`, `role`, and `fullName` to the real auth backend.
- Keep sign-up validation and error UX consistent with the improved sign-in flow.
- Redirect users to sign-in after successful account creation instead of assuming auto-login.

### Delivered

- Updated frontend auth service to normalize sign-up separately from sign-in.
- Sign-up now submits the backend-aligned payload:
    - `email`
    - `password`
    - `role`
    - `fullName`
- Sign-up no longer assumes the backend returns auth tokens.
- Sign-up now redirects to `/sign-in` after success.
- Added sign-in success-entry support using query params after registration.
- Sign-up validation remains inline with field-level errors and form-level API error handling.
- Reused auth form UX patterns already established in the sign-in flow.

### Decisions

- Sign-up and sign-in are now treated as two separate backend contracts.
- Sign-up success should redirect to sign-in instead of auto-authenticating immediately.
- Role remains part of sign-up payload because it is part of user identity setup.
- Full name remains part of sign-up payload because it is required to initialize the minimal profile foundation.

### Notes

- This phase assumes backend signup orchestration is already working.
- Sign-up currently ends at account creation success and sign-in entry.
- Post-sign-up onboarding is still deferred.
- Guest-only route behavior for `/sign-in` and `/sign-up` is still not fully enforced.

### Key Files

- `apps/web/src/types/auth.types.ts`
- `apps/web/src/services/auth.service.ts`
- `apps/web/src/features/auth/schemas/sign-up.schema.ts`
- `apps/web/src/features/auth/components/auth-text-field.tsx`
- `apps/web/src/features/auth/components/password-field.tsx`
- `apps/web/src/features/auth/components/sign-up-form.tsx`
- `apps/web/src/features/auth/components/sign-in-form.tsx`

### Next Recommended Phase

- Add guest-only route behavior for `/sign-in` and `/sign-up`.
- Decide and implement post-sign-up onboarding direction.
- Continue unifying remaining auth-aware UI away from old mock-session paths where needed.

## Phase 20: Auth Route Rules and Guest-Only Page Behavior

**Status:** Completed

### Scope

- Prevent signed-in users from accessing guest-only auth pages.
- Apply guest-only route behavior at the auth route-group level.
- Avoid flashing auth forms while session hydration is still in progress.
- Keep auth route behavior aligned with the real auth store and `/auth/me` hydration flow.

### Delivered

- Added a reusable guest-only route guard for auth pages.
- Auth route group now blocks signed-in users from lingering on `/sign-in` and `/sign-up`.
- Auth pages now wait for auth hydration before deciding whether to render auth forms or redirect.
- During hydration or redirect, auth pages render a neutral loading skeleton instead of flashing the full form UI.
- Guest users can still access auth pages normally.

### Decisions

- Guest-only logic should live at the `(auth)` layout level instead of being duplicated inside each auth page.
- A neutral loading state is preferred over rendering signed-out auth forms before hydration completes.
- Real auth store state remains the source of truth for guest-only route behavior.

### Notes

- This phase focuses on guest-only auth routes only.
- Full protected-route behavior for authenticated-only pages is still deferred.
- Post-sign-up onboarding direction is still deferred.

### Key Files

- `apps/web/src/features/auth/components/guest-only-route.tsx`
- `apps/web/src/app/(auth)/layout.tsx`

### Next Recommended Phase

- Introduce authenticated-only route rules for future protected pages.
- Define post-sign-up onboarding direction more clearly.
- Continue reducing older mock-session dependency in non-production-facing tools where needed.

## Phase 21: Frontend Profile Bootstrap with Real Profile Service

**Status:** Completed

### Scope

- Replace mock profile usage in the production-facing `/profile` flow.
- Connect frontend profile UI to the real profile backend.
- Use a dedicated profile API client instead of routing profile requests through the auth client.
- Support real profile read, create-foundation fallback, and update flows.
- Keep profile UI aligned with the current backend-supported profile fields.

### Delivered

- Added a dedicated `profileClient` using `NEXT_PUBLIC_PROFILE_API_URL`.
- Frontend profile service now uses the profile client instead of the auth client.
- `/profile` now reads profile data from the real backend through `/profiles/me`.
- Added real profile bootstrap behavior for accounts that do not yet have a profile foundation.
- Profile update flow now uses the real backend instead of mock-only local state.
- Navbar now has a clearer production-facing entry into the profile page.
- Backend profile service was configured to allow CORS from the Next app with credentials.

### Decisions

- Auth API client and profile API client should stay separate because they target different backend services.
- `/auth/me` remains the identity summary source.
- `/profiles/me` is now the source of truth for editable profile data.
- Production-facing profile UI should no longer depend on mock profile builders.

### Notes

- This phase focuses on profile foundation fields already supported by the backend.
- Older mock profile fields that do not map to real backend data are intentionally deferred or removed from the real flow.
- The profile backend must allow the frontend origin and credentials for the dedicated profile client to work correctly.

### Key Files

- `apps/web/src/services/api/axios.ts`
- `apps/web/src/services/profile.service.ts`
- `apps/web/src/features/profile/components/profile-page.tsx`
- `apps/web/src/features/profile/components/profile-details-form.tsx`
- `apps/web/src/features/profile/components/profile-summary-card.tsx`
- `apps/web/src/features/profile/components/profile-role-highlights.tsx`
- `apps/web/src/features/profile/components/profile-empty-state.tsx`
- `apps/web/src/features/profile/types/profile.types.ts`
- `apps/web/src/features/profile/schemas/profile.schema.ts`
- `apps/profile/src/main.ts`

### Next Recommended Phase

- Add authenticated-only route rules for profile and future protected pages.
- Decide how profile completion should connect to later onboarding or workspace flows.
- Continue cleaning up any remaining mock-only developer paths that overlap with real profile behavior.
