# Frontend Auth Integration Notes

## Purpose

This document tracks the current real-auth integration state for `apps/web` so future development sessions can continue with the correct auth assumptions.

## Current frontend API clients

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

- sign-in submits to the auth service
- frontend stores the returned access token
- frontend resolves a merged session user after sign-in
- successful sign-in redirects to a safe internal `next` route when it exists
- if no safe `next` route exists, sign-in falls back by role:
    - `client` -> `/`
    - `photographer` -> `/photographer/dashboard`
- sign-in no longer depends on a manual refresh to complete the user-visible session flow

## Current sign-up status

Status: **working**

Behavior:

- sign-up submits to `POST /auth/signup`
- frontend sends:
    - `email`
    - `password`
    - `role`
    - `fullName`
- frontend does not assume sign-up returns auth tokens
- successful sign-up redirects to `/sign-in`
- sign-in page can show a post-registration success state and prefill email from query params
- sign-up preserves safe `next` route intent when it is part of a protected-route flow

## Current session hydration status

Status: **working for navbar and main-page entry**

Behavior:

- on app load, frontend checks stored token
- if a token exists, frontend requests `/auth/me`
- auth store is hydrated from `/auth/me`
- navbar waits for hydration before deciding whether to render signed-in or signed-out controls

## Current guest-only auth route status

Status: **working**

Behavior:

- signed-out users can access `/sign-in` and `/sign-up`
- signed-in users are redirected away from guest-only auth pages
- auth pages wait for hydration before deciding whether to render or redirect
- auth pages use a neutral loading skeleton during hydration or redirect

## Current authenticated-only route status

Status: **working for `/profile`, `/bookings/new`, `/photographers/[slug]/book`, and `/photographer/dashboard`**

Behavior:

- signed-out users cannot remain on `/profile`, `/bookings/new`, `/photographers/[slug]/book`, or `/photographer/dashboard`
- protected routes wait for auth hydration before deciding whether to render or redirect
- signed-out users are redirected to `/sign-in?next=...`
- successful sign-in can return users to the original protected page
- if no safe `next` route exists, post-auth fallback can depend on user role
- the current protected-route pattern is reusable for future authenticated pages

## Current post-auth entry direction

Status: **working**

Behavior:

- protected-route continuity is preserved through sign-in and sign-up entry
- photographer accounts now have a real protected workspace destination
- role-aware post-auth fallback now reduces unnecessary returns to the homepage
- role-aware navbar and account UI now depend on the merged session user, not auth identity alone

## Current feedback behavior

Status: **working**

Behavior:

- mutation-like backend actions can use snackbar feedback
- sign-out uses snackbar feedback
- profile save uses snackbar feedback
- profile foundation creation uses snackbar feedback

Rule:

- keep field validation errors inline
- use snackbar for backend mutation feedback when a full-page error state is unnecessary

The real auth flow is now usable for sign-in, sign-up, navbar behavior, guest-only auth routes, authenticated-only profile and booking-entry routing, and mutation feedback patterns, but broader auth-aware product direction is still incomplete.

Still deferred:

- broader authenticated-only route protection for future protected pages such as dashboards or request management
- broader cleanup of older mock-only developer paths
- post-sign-up onboarding direction
- role-aware entry beyond the current auth and profile flow

## Recommended next phase

### Profile Completion Direction + Role-Aware Entry

Goals:

- decide what signed-in clients and photographers should see as their next meaningful product step
- connect protected profile access with clearer completion or onboarding guidance
- define whether future protected routes should expand into dashboard, booking management, or role-based workspace flows
- keep auth-aware homepage and entry-point behavior consistent with the real auth store
