# Frontend Portfolio Foundation Notes

## Purpose

This document tracks the current photographer portfolio flow in `apps/web`.

## Current route direction

Status: **working**

Routes:

- `/photographer/dashboard` = photographer workspace and next-step guidance
- `/photographer/portfolio` = protected persistent portfolio management route for photographer accounts

## Current portfolio behavior

Status: **persistent local portfolio management**

Behavior:

- signed-in photographer accounts can manage a saved portfolio set
- signed-out users are redirected through the existing protected-route flow
- portfolio items now persist in the current browser
- the portfolio page supports:
    - create
    - edit
    - delete
    - feature / unfeature
    - reset
- portfolio ordering now uses a stable newest-first strategy

## Current limitation

This phase does not yet include:

- real backend media persistence
- shared cross-device portfolio state
- public photographer detail integration with saved portfolio items
- advanced media management or transformations

## Recommended next phase

### Backend-Ready Portfolio Asset Persistence

Goals:

- replace browser-only persistence with a backend-ready persistence path
- connect asset/media metadata to persistent portfolio records
- prepare later public photographer detail and discovery flows to consume real saved portfolio data
