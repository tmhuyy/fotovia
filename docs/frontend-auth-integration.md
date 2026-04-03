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

## Current known limitation

The real auth session is now usable for sign-in and navbar behavior, but auth-aware UI is not fully unified across the entire app yet.

Still deferred:

- broader auth-aware UI cleanup outside navbar/main-page flow
- sign-up contract cleanup
- route protection rules
- full removal of mock-session usage from development-only tools or older placeholder paths

## Recommended next phase

### Sign-up Contract Cleanup

Goals:

- verify frontend sign-up payload matches backend `CreateUserDto`
- confirm support for role and full-name fields
- align frontend validation and backend validation
- decide post-sign-up behavior clearly
