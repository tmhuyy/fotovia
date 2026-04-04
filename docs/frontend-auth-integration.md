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

- sign-in submits to `POST /auth/login`
- frontend stores returned tokens
- frontend then requests `/auth/me`
- current user is hydrated into the auth store
- successful sign-in redirects to `/`

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

## Current known limitation

The real auth flow is now usable for sign-in, sign-up, navbar behavior, guest-only auth routes, and mutation feedback patterns, but authenticated-only route protection is still incomplete.

Still deferred:

- authenticated-only route protection for pages like `/profile`
- broader cleanup of older mock-only developer paths
- post-sign-up onboarding direction
- role-aware entry beyond the current auth and profile flow

## Recommended next phase

### Authenticated Route Rules

Goals:

- define which routes require an authenticated session
- redirect signed-out users away from protected pages
- keep auth route behavior aligned with the real auth store and hydration state
