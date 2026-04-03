# Frontend Auth Integration Notes

## Purpose
This document keeps track of the current frontend auth integration state in `apps/web` so future ChatGPT or Codex sessions can continue with the correct assumptions.

## Current auth endpoints
Local development setup:
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
- FE expects backend responses wrapped by the shared response interceptor
- FE normalizes login response data before storing tokens
- Successful login redirects to `/`
- Access token and refresh token are stored for later authenticated flows

## Validation status
Sign-in validation now behaves as expected:
- invalid email shows inline field error
- invalid password shows inline field error
- invalid form input does not trigger runtime Zod overlay
- invalid form input does not trigger fake loading state
- invalid credentials from the backend show a form-level auth alert

## Important implementation notes
- FE must use `/auth/login`, not `/auth/signin`
- FE auth requests use credentials support
- Login flow currently stores tokens successfully, but full user hydration is still limited by the current `/auth/me` contract
- Field validation errors and backend auth failures must remain visually separate

## Dependency compatibility note
A runtime validation issue appeared during sign-in work.

Root cause area:
- compatibility between `zod`
- and `@hookform/resolvers`

Rule:
- if Zod validation starts throwing runtime overlays again, check resolver compatibility before debugging form code deeply

## Current limitation
The frontend auth flow is only partially unified.

Working now:
- sign-in API connection
- token storage
- redirect after login
- inline validation UX

Still pending:
- improve `/auth/me`
- hydrate real current user data reliably
- unify auth-aware UI across navbar, home, and profile
- reduce remaining mock-session dependence

## Recommended next phase
### Auth Session Unification
Goals:
- improve `/auth/me` usefulness for frontend hydration
- sync frontend auth-aware UI with real backend session data
- reduce or remove mock-session usage in production-facing auth paths