# Asset Service

## Purpose of this document

This file is a working spec / history note for the `asset-service` in the Fotovia project.
Its purpose is to keep future discussions aligned to the same design direction,
so we do not lose context, blur service boundaries, or need to re-explain everything from scratch.

---

## 1. Background

The system currently has services such as `auth-service`, `profile-service`, and other services in a microservice architecture.

In Fotovia's real business cases, many features will need file uploads, especially images:
- profile avatars
- portfolio images
- cover images
- future private files such as verification documents, booking references, or chat attachments

If each service handles file upload on its own, uploads to storage on its own, generates URLs on its own, and deletes old files on its own, the same logic will be duplicated across multiple services.
That makes the system harder to maintain, harder to secure, harder to clean up, and harder to scale.

Because of that, the current decision is to create a dedicated `asset-service`.

---


## 3. What the asset service does

The `asset-service` is responsible for **file/media metadata and lifecycle**, not for business-domain details such as profile information.

### 3.1. Manage file metadata
Examples:
- which user owns the file
- what purpose the file serves (`avatar`, `portfolio_image`, ...)
- which bucket the file is stored in
- what the object key is
- whether the file is public or private
- what the current status is

### 3.2. Orchestrate the upload workflow
Examples:
- the frontend requests an upload ticket
- the service validates mime type, file size, and purpose
- the service generates an object key
- the service issues a signed upload URL or accepts upload through the backend
- the service confirms that upload is complete

### 3.3. Return URLs for frontend rendering
Examples:
- public URLs for avatars or portfolio images
- signed URLs for private assets
- preview / thumbnail / transformed URLs

### 3.4. Track where an asset is being used
Examples:
- which asset is currently the avatar of which profile
- which asset belongs to which portfolio item
- which assets are still in use and which are orphaned

### 3.5. Prepare for image variants
Examples:
- thumbnails
- previews
- optimized WebP versions
- cropped versions

---

## 4. What the asset service does not do

### 4.1. It does not manage profile business logic
The `asset-service` does not decide:
- display name
- bio
- portfolio caption
- profile visibility settings

That remains the responsibility of `profile-service`.

### 4.2. It does not store binary files in Postgres
Binary/blob/file bytes should not be stored in the application database.

The correct separation is:
- **object storage** stores the real file
- **asset-service database** stores metadata, lifecycle, and references

### 4.3. It does not force domain services to treat URLs as the source of truth
`profile-service` should store references such as `avatar_asset_id`, not treat `avatar_url` as the primary source of truth.

A URL can be cached at the response layer or in projections, but the real source of truth should remain the asset metadata.

---

## 5. Storage strategy that has been decided

### 5.1. Do not store files on each service's local disk
Files should not live on the local disk of `profile-service` or `asset-service` if the system is intended to follow a real microservice deployment model.

### 5.2. Use object storage
The most suitable direction for the current system is:
- **Supabase Storage**

Reasoning:
- the project already uses Supabase
- it integrates easily with the current backend
- it supports public/private buckets
- it supports public URLs
- it supports signed URLs
- it supports signed upload URLs

### 5.3. Initial bucket direction
Initial suggestion:
- `avatars-public`
- `portfolio-public`
- `private-assets`

These can be reduced to fewer buckets in the first phase if needed, but the access model should still distinguish between:
- public assets
- private assets

---

## 6. Upload strategy that has been decided

There are two main directions.

### 6.1. Easier approach for MVP
- frontend sends `multipart/form-data` to `asset-service`
- `asset-service` receives the file
- `asset-service` uploads the file to storage
- it returns metadata and URL

Pros:
- easy to understand
- faster to implement

Cons:
- the backend has to handle binary file traffic
- it scales worse than direct upload

### 6.2. Recommended real-world approach
- frontend calls `asset-service` to request an upload ticket
- `asset-service` creates a pending asset record and an upload session
- `asset-service` returns a signed upload URL
- frontend uploads directly to storage
- frontend calls confirm
- `asset-service` verifies and marks the asset as usable

This is the recommended long-term direction.

### 6.3. Current conclusion
- it is acceptable to start with the simpler method if fast delivery is needed
- but the target architecture should be **direct upload using signed URLs**

---

## 7. Relationship between services

### Frontend
- requests upload
- uploads the file
- confirms upload
- receives URLs for preview

### asset-service
- manages asset metadata
- manages upload sessions
- confirms when an asset is ready
- returns URL / signed URL
- manages asset usage

### object storage
- stores the actual file

### profile-service
- manages profile business logic only
- only references assets
- example: `avatar_asset_id`

---

## 8. Important data-modeling decisions

### 8.1. The asset database is a metadata layer
The `asset-service` database **does not replace object storage**.
It is only an application metadata layer on top of storage.

### 8.2. The true identity of a stored file
The source of truth for a file in storage is:
- `bucket_name`
- `object_key`

Not just `filename` or `url`.

### 8.3. Each upload should become a new object
It is better not to overwrite the same object key in a naive way.
The most practical approach is to treat each upload as a new object. This is more immutable and avoids cache/CDN and rollback issues.

---

## 9. Main tables agreed at the design level

The current agreed design for `asset-service` includes 4 main tables:

### 9.1. `assets`
The core table.
It answers questions such as:
- what this asset is
- who owns it
- where it is stored
- what purpose it serves
- what status it is in

### 9.2. `asset_upload_sessions`
This table tracks the upload lifecycle.
It answers questions such as:
- has an upload ticket been issued yet
- has the upload finished
- has it been confirmed
- has the session expired

### 9.3. `asset_usages`
This table tracks where an asset is being used.
It answers questions such as:
- which asset is currently an avatar
- which asset belongs to which portfolio item
- which assets still have active usage so they are not deleted by mistake

### 9.4. `asset_variants`
This table tracks derived versions of an asset.
Examples:
- thumbnails
- previews
- optimized variants
- transformed versions

---

## 10. Summary of the initial table responsibilities

### `assets`
Represents the root identity of a file in the application layer.
This is the table that other services should reference through `asset_id`.

### `asset_upload_sessions`
Tracks the upload process from the moment an upload is requested until it is confirmed or expired.

### `asset_usages`
Tracks where an asset is attached in the domain layer.
This is important to avoid deleting assets that are still being used.

### `asset_variants`
Tracks generated or derived versions of the original asset.
This is useful for image-heavy use cases such as thumbnails or previews.

---

## 11. Current design philosophy

The current design philosophy is:
- keep the service realistic enough for production use
- keep it generic enough to support more than just avatars
- avoid over-engineering too early
- separate file storage concerns from business-domain concerns
- make future services reuse the same asset logic instead of duplicating upload code

In simple terms:
- **object storage** = where the file lives
- **asset-service DB** = the brain that understands the file
- **domain services** = places that use the file for business features

---

## 12. Current progress status

At the moment, the following ideas have already been agreed:
- a dedicated `asset-service` is needed
- files should live in object storage, not local service disk or Postgres blobs
- Supabase Storage is the practical storage direction for now
- the long-term upload architecture should use signed direct upload
- the service boundary between `asset-service` and `profile-service` is now clear
- the first design-level table set contains 4 main tables:
  - `assets`
  - `asset_upload_sessions`
  - `asset_usages`
  - `asset_variants`

---

## 13. Next planned steps

The next steps should be done in order:

1. define the **asset lifecycle** clearly
2. design the `assets` table in detail
3. design the `asset_upload_sessions` table in detail
4. design the `asset_usages` table in detail
5. design the `asset_variants` table in detail
6. map the design to real cases such as avatar and portfolio
7. implement the entities in TypeORM

---

## 14. Short reminder for future discussions

Whenever future work continues on `asset-service`, the conversation should stay aligned with these rules:

- asset-service is a metadata and lifecycle service
- object storage stores the actual binary file
- domain services should reference `asset_id`
- do not collapse everything back into `profile-service`
- design with real-world use cases in mind, but avoid unnecessary complexity too early

