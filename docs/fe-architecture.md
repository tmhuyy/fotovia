# Fotovia Frontend Architecture

## Frontend stack
- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack Query
- Axios
- React Hook Form
- Zod
- Zustand

## Routing
Use Next.js App Router.

Suggested route groups:
- `(public)` for public pages
- `(auth)` for login/register
- `(dashboard)` for authenticated pages

## Suggested folder structure
``` apps/web/src/
  app/
    (public)/
    (auth)/
    (dashboard)/
    layout.tsx
    globals.css

  components/
    ui/
    common/
    layout/
    home/
    photographers/
    booking/
    ai/
    profile/
    asset/

  features/
    auth/
    profile/
    photographer/
    booking/
    ai/
    asset/

  services/
    api/
    auth.service.ts
    profile.service.ts
    photographer.service.ts
    booking.service.ts
    ai.service.ts
    asset.service.ts

  providers/
    app-provider.tsx
    query-provider.tsx
    theme-provider.tsx
    auth-session-provider.tsx

  store/
    auth.store.ts
    ui.store.ts

  lib/
    utils.ts
    constants.ts
    query-client.ts
    auth-token.ts

  schemas/
  types/
```
## Architecture rules

### Pages

- Pages should mainly compose sections and reusable components.

- Pages should stay thin and should not contain too much business logic.

### Components

- Reusable UI should go into the components directory.

- Feature-specific UI sections should be grouped by domain, such as:
``` 
components/home
components/booking
components/ai 
```

### Features

- Each feature folder should contain local business logic related to that domain.

- A feature folder may include:
```
hooks
schemas
types
helper functions
feature-specific logic
``` 

### Services

All API calls should go through service files.

Examples:
- auth.service.ts
- booking.service.ts
- ai.service.ts

Pages and UI components should not directly manage complex API logic.

### Query management

Use TanStack Query for:

- fetching data
- caching data
- mutations
- query invalidation
- loading and error states

Suggested query key examples:

- ['profile', 'me']
- ['photographers']
- ['photographer', id]
- ['bookings', 'me']
- ['booking', id]
- ['ai', 'predict']

### Client state

Use Zustand only for light client-side state, such as:

- auth session state
- modal or drawer state
- small UI preferences
- temporary local filters if needed

Do not use Zustand for server-fetched resource data that should be handled by TanStack Query.

### Data flow

The preferred frontend data flow is:

Page
→ Feature hook
→ Service layer
→ Axios instance
→ API

This helps keep the codebase clean and maintainable.

## Initial MVP pages
### Public pages
- /
- /photographers
- /photographers/[slug]
- /login
- /register

### User dashboard pages
- /profile
- /bookings
- /bookings/[id]
- /ai

### Photographer pages
- /photographer/dashboard
- /photographer/portfolio
- /photographer/requests

### Homepage priority

The homepage should be implemented immediately after project setup.

The homepage is important because it will define the visual direction of the whole frontend.

It should include:
```
navbar
hero section
featured photographers
AI feature intro
how it works
portfolio showcase
CTA section
footer
```
## Implementation priority for Sprint 1

Sprint 1 should focus on:

1. frontend setup
2. Tailwind and design token configuration
3. providers and shared utilities
4. homepage implementation

Authentication and dashboard flows can be implemented after the homepage foundation is ready.

## Architecture goal

The frontend should be built fast, but still follow a clean and scalable structure.

The priority is:
```
simple
clean
modular
reusable
easy for future expansion
```
