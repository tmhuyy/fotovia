# Fotovia System Overview

## Introduction

Fotovia is an online photography booking platform designed to connect users with photographers. The platform also includes an AI-powered image classification feature to help users find photographers that match their preferred photography style.

## Core features

- Photographer discovery
- Photographer profile and portfolio viewing
- Booking request creation
- Booking tracking
- User profile management
- Photographer dashboard
- Portfolio and asset management
- AI style classification and recommendation

## Main actors

### 1. Customer

A customer can browse photographers, view details, send booking requests, and track bookings.

### 2. Photographer

A photographer can manage profile information, portfolio assets, and booking requests.

### 3. System

The system handles authentication, profiles, bookings, assets, and AI classification.

## Service responsibility overview

### Auth service

The auth service is responsible for identity and session-related data, including:

- email
- password hash
- role
- access and refresh token flow
- current authenticated identity summary

### Profile service

The profile service is responsible for user-facing profile data, including:

- full name
- avatar
- bio
- location
- phone
- photographer-oriented profile details

## Current signup architecture

The current signup flow is designed as a coordinated backend flow:

1. auth service receives the signup request
2. auth service creates the user account with identity fields
3. auth service calls profile service to create the initial profile
4. profile service creates the minimal profile foundation
5. signup succeeds only when both account creation and profile creation succeed

This keeps role in auth while allowing profile data to grow independently in the profile service.

## Current auth identity direction

The current `/auth/me` endpoint should provide a frontend-usable identity summary for auth hydration, such as:

- id
- email
- role

This endpoint is intentionally different from full profile endpoints because it represents signed-in identity, not full editable profile data.

## AI feature summary

The AI feature allows users to upload an inspiration image. The system classifies the photography style, such as food photography or cinematic photography, then uses that result to recommend suitable photographers.

## Business value

Fotovia helps users find the right photographer more quickly and improves the booking experience through a clean online platform and AI-assisted style matching.
