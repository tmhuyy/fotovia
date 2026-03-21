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

### Next Recommended Phase
- Connect auth UI to real services in `services/auth.service.ts`.
- Add `auth.store.ts` and `auth-token.ts` with real session handling.
- Implement password reset and email verification flows.
- Add route protection and authenticated layout for dashboard routes.
