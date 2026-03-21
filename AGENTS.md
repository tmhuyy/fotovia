# Fotovia Project Agent Guide

Fotovia is an online photography booking platform with AI-powered photography style classification and photographer recommendation.

## Project goals
- Users can browse photographers
- Users can view photographer portfolios
- Users can book photographers
- Photographers can manage their profiles and booking requests
- Users can upload an inspiration image
- The AI service classifies the image style and recommends suitable photographers

## Current frontend decisions
Frontend stack:
- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack Query
- Axios
- React Hook Form
- Zod
- Zustand

## Design theme
Theme name: Premium Neutral

Color tokens:
- primary: #171717
- background: #FAF8F4
- surface: #FFFFFF
- accent: #C8A97E
- muted: #6B7280
- border: #E7E0D6
- ai: #A78BFA

Important:
- Do not hardcode colors directly inside components
- Use Tailwind theme tokens only
- Keep the UI premium, minimal, and photography-focused

## Frontend implementation direction
- Frontend should live in `apps/web`
- Use Next.js App Router
- Organize code by feature/module
- Keep pages thin
- Reusable UI components should be extracted
- API calls should go through a service layer
- Server state should use TanStack Query
- Local UI/client state should use Zustand only when necessary
- Forms should use React Hook Form + Zod

## Sprint 1 scope
1. Setup frontend foundation
2. Configure Tailwind theme tokens
3. Setup providers and project structure
4. Build homepage first after setup

Homepage sections:
- Navbar
- Hero
- Featured Photographers
- AI Feature Intro
- How It Works
- Portfolio Showcase
- CTA Section
- Footer

## Coding rules
- Use TypeScript everywhere
- Prefer small reusable components
- Prefer clear naming
- Avoid large page files
- Use feature-based folder organization
- Keep components presentational when possible
- Keep business logic in hooks/services
- Prefer clean spacing and simple layouts
- Avoid overusing animations
- UI should feel elegant, calm, and premium

## Naming conventions
- Components: kebab-case file names
- Hooks: useXxx
- Services: xxx.service.ts
- Schemas: xxx.schema.ts
- Types: xxx.types.ts or types.ts

## Expected frontend modules
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
k
## Architecture priority
Speed matters, but structure must still be clean enough for future expansion.
Always build the simplest clean version first.