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

## Current navbar status

Status: **working**

Behavior:

- Signed-out users see public auth CTA actions
- Signed-in users see signed-in navbar state
- Reload no longer shows a signed-out flash before hydration completes
- Sign-out clears frontend auth state cleanly

## Validation and error UX rules

Current auth forms follow these rules:

- keep validation inside `react-hook-form` with `zodResolver(...)`
- show validation messages directly under the related field
- keep field validation errors separate from API submission errors
- use a form-level auth alert for API failures
- invalid forms must not submit requests
- invalid forms must not leave submit buttons stuck in loading state

## Current known limitation

The real auth flow is now usable for sign-in, sign-up, and navbar behavior, but auth-aware UI is not fully unified across the entire app yet.

Still deferred:

- guest-only route protection for `/sign-in` and `/sign-up`
- broader auth-aware UI cleanup outside navbar/main-page flow
- route protection for future authenticated pages
- post-sign-up onboarding
- full removal of older mock-session dependencies from development-only paths

## Recommended next phase

### Auth Route Rules + Post-Sign-Up Direction

Goals:

- prevent signed-in users from lingering on guest-only auth pages
- define the next destination after sign-up more intentionally
- prepare for protected routes and role-aware onboarding
