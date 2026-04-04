# Backend Auth + Profile Integration Notes

## Purpose

This document tracks the current backend integration state between the auth service and profile service so future sessions can continue with the correct assumptions.

## Current ownership decision

Auth service owns:

- user identity
- email
- password hash
- role
- refresh token state
- login session timestamps

Profile service owns:

- user-facing profile data
- full name
- avatar
- bio
- location
- phone
- photographer-specific profile fields

## Signup contract

Current `POST /auth/signup` request is expected to include:

- `email`
- `password`
- `role`
- `fullName`

Ownership after signup:

- auth service stores `email`, `password`, and `role`
- profile service stores `userId`, `role`, and `fullName` as the minimal profile foundation

## Current signup orchestration

Current signup flow is:

1. frontend or Swagger sends signup payload to auth service
2. auth service creates the user first
3. auth service calls profile service through TCP
4. profile service creates a minimal profile from signup payload
5. if profile creation fails, auth service rolls back the newly created user
6. signup succeeds only when both user creation and profile creation succeed

## Current auth/profile integration behavior

Auth service now:

- accepts signup payload with `role` and `fullName`
- stores `role` on the user entity
- calls profile service using a TCP message pattern during signup

Profile service now:

- exposes a message pattern for profile creation from signup
- creates a minimal profile using `userId`, `role`, and `fullName`
- keeps `/profiles/me` as the base for future real profile reads

## `/auth/me` behavior

Current `/auth/me` should be treated as the frontend-facing identity summary endpoint.

It should return a usable auth identity shape such as:

- `id`
- `email`
- `role`

This endpoint is for auth/session identity, not full profile data.

## Architectural decision

Role must stay in auth service.

Reason:

- role is part of identity and authorization, not only display profile data
- frontend auth hydration should be able to know the current role directly from auth
- backend guards and later authorization logic should not depend on profile service just to know the user role

Full name should stay in profile service.

Reason:

- full name is profile-facing user data
- it belongs to the user profile surface and can evolve with profile editing later

## Current status

Status: **working in backend manual test**

Confirmed direction:

- signup contract expanded beyond email/password
- auth and profile ownership are now clearly separated
- profile foundation is now integrated into signup instead of being postponed entirely

## Current limitation

This phase establishes the backend contract and orchestration only.

Still pending:

- frontend profile integration
- broader profile CRUD completion
- post-sign-up onboarding flow
- deeper cross-service error handling polish

## Recommended next phase

### Frontend Profile and Route Integration

Goals:

- continue reducing placeholder and mock-only auth/profile paths
- prepare `/profiles/me` usage on the frontend
- define route rules for guest-only and authenticated pages
