# Fotovia Frontend Agent Guide

This file contains frontend-specific instructions for the Fotovia web app.

## Frontend stack

Use the following stack:

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack Query
- Axios
- React Hook Form
- Zod
- Zustand

## Frontend objective

Build a premium photography booking frontend with a clean structure, reusable UI, and scalable code organization.

## Theme

Fotovia uses the **Premium Neutral** theme.

### Brand color tokens

Use these Tailwind tokens:

- `bg-brand-background`
- `bg-brand-surface`
- `text-brand-primary`
- `text-brand-muted`
- `border-brand-border`
- `text-brand-accent`
- `bg-brand-accent`
- `text-brand-ai`

Do not use raw hex colors directly inside components unless absolutely necessary.

### Semantic tokens and dark mode

Prefer semantic tokens in components so light and dark mode stay consistent:

- `bg-background`
- `bg-surface`
- `text-foreground`
- `text-muted`
- `border-border`
- `text-accent`
- `bg-accent`

## Implementation priority

### Sprint 1

Focus on:

1. setting up the frontend foundation
2. configuring Tailwind brand tokens
3. setting up providers and shared utilities
4. building the homepage first

Do not build auth flow before the homepage foundation is ready unless explicitly requested.

## Homepage sections to implement first

The homepage should include:

- navbar
- hero section
- featured photographers
- AI feature intro
- how it works
- portfolio showcase
- CTA section
- footer

## UI rules

- keep components reusable
- keep pages thin
- use clean spacing
- use large imagery where appropriate
- keep the visual tone elegant and minimal
- avoid too many effects or animations
- do not overload the homepage with bright colors
- let photography remain the visual focus

## Code organization

### Components

Use `components` for reusable presentational UI.

Suggested areas:

- `components/common`
- `components/layout`
- `components/home`

### Features

Use `features/*` for domain-specific logic.

Examples:

- `features/auth`
- `features/profile`
- `features/booking`
- `features/ai`

### Services

Use `services/*` for API communication.

All HTTP requests should go through service files.

### Providers

Use `providers/*` for app-wide providers such as:

- query provider
- app provider

## Data handling rules

### Server state

Use **TanStack Query** for:

- fetching
- caching
- mutations
- invalidation

### Client state

Use **Zustand** only for light client-side state.

Do not use Zustand for server resource data that belongs in TanStack Query.

### Forms

Use **React Hook Form + Zod** for forms and validation.

## Code quality rules

- use TypeScript everywhere
- prefer small reusable components
- prefer clear naming
- avoid large page files
- keep business logic out of presentational components
- keep styling consistent with the design system
- prefer maintainable code over rushed prototype code

## Naming conventions

- components: kebab-case file names
- hooks: `useXxx`
- services: `xxx.service.ts`
- schemas: `xxx.schema.ts`
- types: `xxx.types.ts` or `types.ts`

## Expected frontend domains

The frontend is expected to support these main modules:

- auth
- profile
- photographer
- booking
- asset
- ai

## Main user flow

1. User lands on homepage
2. User browses photographers
3. User views photographer details and portfolio
4. User creates a booking request
5. User tracks booking status
6. User may upload an inspiration image
7. AI returns style classification
8. System recommends photographers based on that style

## Final instruction

Move fast, but keep the structure clean enough for future expansion.

Always build the simplest clean version first.

## Auth form validation rules

When working on auth forms such as sign-in or sign-up:

- Keep validation inside `react-hook-form` with `zodResolver(...)`
- Do not allow normal invalid input flow to throw runtime Zod overlays
- Show validation messages directly under the related field
- Use destructive field styling for invalid states
- Keep field validation errors separate from API submission errors
- Invalid forms must not submit API requests
- Invalid forms must not leave submit buttons stuck in loading state
- If validation suddenly starts throwing runtime errors again, check `zod` and `@hookform/resolvers` compatibility first


## Auth session hydration rules

- Use `/auth/me` as the frontend source of truth for current signed-in user data.
- After successful sign-in, hydrate current user data before treating the session as fully ready.
- Do not show signed-out navbar actions while session hydration is still in progress.
- Prefer a neutral loading or skeleton state during auth hydration.
- Production-facing auth-aware UI should prefer the real auth store over mock-session state.