# Frontend Auth Integration Notes

## Purpose

This document tracks the current real-auth integration state for `apps/web` so future development sessions can continue with the correct assumptions.

## Current frontend API clients

The frontend currently uses separate API clients for different backend services.

### Auth client

- base URL: `NEXT_PUBLIC_AUTH_API_URL`
- credentials: enabled

Used for:

- `POST /auth/signup`
- `POST /auth/login`
- `GET /auth/me`
- `POST /auth/refresh-token`
- `POST /auth/signout`

### Profile client

- base URL: `NEXT_PUBLIC_PROFILE_API_URL`
- credentials: enabled

Used for:

- `GET /profiles/me`
- `POST /profiles/me`
- `PATCH /profiles/me`

## Current sign-in status

Status: **working**

Behavior:

- Sign-in submits to `POST /auth/login`
- Frontend stores returned tokens
- Frontend then requests `/auth/me`
- Current user is hydrated into the auth store
- Successful sign-in redirects to `/`

## Current sign-up status

Status: **working**

Behavior:

- Sign-up submits to `POST /auth/signup`
- Frontend sends:
    - `email`
    - `password`
    - `role`
    - `fullName`
- Frontend does not assume sign-up returns auth tokens
- Successful sign-up redirects to `/sign-in`
- Sign-in page can show a post-registration success state and prefill email from query params

## Current session hydration status

Status: **working for navbar/main page**

Behavior:

- On app load, frontend checks stored token
- If a token exists, frontend requests `/auth/me`
- Auth store is hydrated from `/auth/me`
- Navbar waits for hydration before deciding whether to render signed-in or signed-out controls

## Current guest-only auth route status

Status: **working**

Behavior:

- Signed-out users can access `/sign-in` and `/sign-up`
- Signed-in users are redirected away from guest-only auth pages
- Auth pages wait for hydration before deciding whether to render or redirect
- Auth pages use a neutral loading skeleton during hydration or redirect

## Current profile integration status

Status: **working**

Behavior:

- `/profile` now uses the real profile backend flow
- frontend profile requests go through the dedicated profile client
- signed-in users can fetch real profile data from `/profiles/me`
- profile foundation can be created when missing
- profile edits save to the real backend instead of mock-only local state

## Current backend compatibility notes

For the frontend profile client to work correctly:

- the profile service must allow the Next app origin
- credentials must be enabled for cross-origin requests

## Validation and error UX rules

Current auth and profile forms follow these rules:

- keep validation inside `react-hook-form` with `zodResolver(...)`
- show validation messages directly under the related field
- keep field validation errors separate from API submission errors
- use a form-level alert or clear inline feedback for API failures
- invalid forms must not submit requests
- invalid forms must not leave submit buttons stuck in loading state

## Current known limitation

The real auth and profile flow is now usable for sign-in, sign-up, navbar behavior, guest-only auth routes, and profile foundation flows, but protected-route behavior is still incomplete.

Still deferred:

- authenticated-only route protection for future protected pages
- broader cleanup of older mock-only developer paths
- post-sign-up onboarding direction
- role-aware entry beyond the current auth and profile flow

## Recommended next phase

### Authenticated Route Rules + Profile Completion Direction

Goals:

- define which pages require an authenticated session
- redirect signed-out users away from protected pages
- clarify how profile completion should connect to later onboarding or workspace flows
- continue removing overlap between real flows and older mock-only paths
