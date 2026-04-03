# Fotovia Web

Frontend web app for Fotovia.

This app is built with a modern frontend architecture and currently includes:

- homepage foundation
- auth UI foundation
- responsive foundation
- dark mode foundation

For the latest progress, check:

- `../../docs/frontend-progress.md`

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- TanStack Query
- Axios
- React Hook Form
- Zod
- Zustand
- next-themes

## Prerequisites

Before running this app, make sure you have:

- Node.js 18 or newer
- Yarn 1.22.19 or compatible

## Install dependencies

From the repository root:

```bash
yarn install
```

## Run the frontend

From the repository root:

```bash
yarn workspace web dev
```

Or from inside `apps/web`:

```bash
yarn dev
```

The development server runs on:

```text
http://localhost:8888
```

## Build the frontend

From the repository root:

```bash
yarn workspace web build
```

Or from inside `apps/web`:

```bash
yarn build
```

## Start the production build

From the repository root:

```bash
yarn workspace web start
```

Or from inside `apps/web`:

```bash
yarn start
```

## Lint

From the repository root:

```bash
yarn workspace web lint
```

Or from inside `apps/web`:

```bash
yarn lint
```

## Type checking

From the repository root:

```bash
yarn workspace web check-types
```

Or from inside `apps/web`:

```bash
yarn check-types
```

## Environment variables

Create a local env file:

```bash
cp .env.example .env.local
```

Example env file:

- `.env.example`

Current example:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
NEXT_PUBLIC_AUTH_API_URL=http://localhost:3000
NEXT_PUBLIC_ENABLE_DEV_CHEATS=false
```

Update these values to match your backend services.

Set `NEXT_PUBLIC_ENABLE_DEV_CHEATS=true` to show the dev-only mock session panel.

## Main structure

```
src/
  app/
  components/
  features/
  lib/
  providers/
  services/
  store/
```

## Design system

Fotovia uses a Premium Neutral design style with:

- semantic theme tokens
- responsive layout foundation
- dark mode support

See:

- `../../docs/design-system.md`
- `../../docs/fe-architecture.md`

## Development notes

- Use semantic theme tokens instead of raw hex colors in components
- Keep pages thin and components reusable
- Keep responsive behavior and dark mode support in every new shared component
- After each completed phase, update `../../docs/frontend-progress.md`

## Related docs

- `../../docs/system-overview.md`
- `../../docs/fe-architecture.md`
- `../../docs/design-system.md`
- `../../docs/frontend-progress.md`
- `./AGENTS.md`
