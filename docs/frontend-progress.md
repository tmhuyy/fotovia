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
