# Frontend Auth Integration Notes

## Purpose

This document tracks the current real-auth integration state for `apps/web` so future ChatGPT or Codex sessions can continue with the correct auth assumptions.

## Current auth endpoints

Local development:

- Frontend: `http://localhost:8888`
- Auth HTTP service: `http://localhost:3000`
- Auth TCP service: `localhost:3001`

Relevant auth endpoints:

- `GET /auth/me`
- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/refresh-token`
- `POST /auth/signout`

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

## Validation and error UX rules

Current auth forms follow these rules:

- keep validation inside `react-hook-form` with `zodResolver(...)`
- show validation messages directly under the related field
- keep field validation errors separate from API submission errors
- use a form-level auth alert for API failures
- invalid forms must not submit requests
- invalid forms must not leave submit buttons stuck in loading state

## Current known limitation

The real auth flow is now usable for sign-in, sign-up, navbar behavior, and guest-only auth routes, but auth-aware UI is not fully unified across the entire app yet.

Still deferred:

- authenticated-only route protection for future protected pages
- broader auth-aware UI cleanup outside navbar/main-page flow
- post-sign-up onboarding
- full removal of older mock-session dependencies from development-only paths

## Recommended next phase

### Authenticated Route Rules + Onboarding Direction

Goals:

- define which pages require an authenticated session
- redirect signed-out users away from protected pages
- clarify post-sign-up destination and onboarding path
- prepare for role-aware app entry beyond auth pages
