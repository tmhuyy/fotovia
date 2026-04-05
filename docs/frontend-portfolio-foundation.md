# Frontend Portfolio Foundation Notes

## Purpose

This document tracks the current photographer portfolio foundation state in `apps/web`.

## Current route direction

Status: **working**

Routes:

- `/photographer/dashboard` = photographer workspace and next-step guidance
- `/photographer/portfolio` = protected portfolio management route for photographer accounts

## Current portfolio behavior

Status: **asset-first frontend foundation**

Behavior:

- signed-in photographer accounts can access the protected portfolio page
- signed-out users are redirected through the existing protected-route flow
- the portfolio page supports:
    - empty state
    - sample-loading state
    - portfolio grid state
    - add item flow
    - local image preview generation
- portfolio items now use asset-style preview data instead of only a plain image URL field

## Current asset direction

The current portfolio item structure now includes asset-style media data.

This phase supports:

- local image validation
- local preview generation
- seeded sample asset preview data
- replace/remove selected image before creating a portfolio item

## Current limitation

This phase does not yet include:

- real upload to backend storage
- persistent asset save
- edit/delete/reorder workflow depth
- public rendering of real uploaded portfolio assets
- media moderation or transformation

## Recommended next phase

### Persistent Asset Upload and Portfolio Management Actions

Goals:

- connect the current asset-first UI to real persistent media upload
- add portfolio item edit/delete/reorder actions
- prepare public photographer detail and discovery pages to consume real stored assets
