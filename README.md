# Fotovia

Fotovia is an online photography booking platform with AI-assisted style matching and photographer recommendation.

This repository is organized as a monorepo and currently includes the frontend web app, backend services, shared packages, and project documentation.

## Repository structure

```bash
apps/
  web/        # Frontend web app
  auth/       # Authentication service
  profile/    # Profile service
  booking/    # Booking service

packages/     # Shared configs/packages
docs/         # Project documentation and progress tracking

AGENTS.md     # AI agent guidance
turbo.json    # Turborepo config
```

## Current frontend status

The frontend already has:

- homepage foundation
- auth UI foundation
- responsive foundation
- dark mode foundation

For the latest frontend progress, check:

- `docs/frontend-progress.md`
- `docs/fe-architecture.md`
- `docs/design-system.md`

## Tech stack

### Frontend

- Next.js
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- TanStack Query
- Axios
- React Hook Form
- Zod
- Zustand
- next-themes

### Monorepo tooling

- Turborepo
- Yarn workspaces
- TypeScript

## Prerequisites

Make sure these are installed:

- Node.js 18 or newer
- Yarn 1.22.19 or compatible
- Git

## Getting started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd fotovia
```

### 2. Install dependencies

```bash
yarn install
```

## Available root scripts

```bash
yarn dev
yarn build
yarn lint
yarn check-types
yarn format
```

### What they do

- `yarn dev` runs development tasks across the monorepo
- `yarn build` builds all configured apps and packages
- `yarn lint` runs lint checks
- `yarn check-types` runs type checking
- `yarn format` formats supported files with Prettier

## Running apps

### Run the frontend web app

From the repository root:

```bash
yarn workspace web dev
```

The frontend runs on:

```text
http://localhost:8888
```

### Build the frontend

```bash
yarn workspace web build
```

### Start the frontend production build

```bash
yarn workspace web start
```

### Lint the frontend

```bash
yarn workspace web lint
```

### Type-check the frontend

```bash
yarn workspace web check-types
```

## Environment variables

Frontend example env file:

- `apps/web/.env.example`

To use it:

```bash
cp apps/web/.env.example apps/web/.env.local
```

Then update the values based on your local backend setup.

## Documentation

Project docs live in the `docs/` folder:

- `docs/system-overview.md`
- `docs/fe-architecture.md`
- `docs/design-system.md`
- `docs/frontend-progress.md`

## Notes

- Root `README.md` is for general repo setup and project overview.
- App-specific setup should be documented inside each app folder.
- After each completed frontend phase, update `docs/frontend-progress.md` and related docs so future development sessions can understand the current state of the project.