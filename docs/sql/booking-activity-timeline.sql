CREATE TABLE IF NOT EXISTS public.booking_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "bookingId" uuid NOT NULL,
  "eventType" varchar(40) NOT NULL,
  "actorRole" varchar(30) NOT NULL,
  "actorUserId" uuid NULL,
  "actorLabel" varchar(255) NOT NULL,
  note text NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_booking_events_booking_id
  ON public.booking_events ("bookingId");

CREATE INDEX IF NOT EXISTS idx_booking_events_booking_id_created_at
  ON public.booking_events ("bookingId", "createdAt");

INSERT INTO public.booking_events (
  "bookingId",
  "eventType",
  "actorRole",
  "actorUserId",
  "actorLabel",
  note,
  "createdAt"
)
SELECT
  b.id,
  'created',
  'client',
  b."clientUserId",
  COALESCE(NULLIF(b."clientEmail", ''), 'Client'),
  'Backfilled booking creation event.',
  b."createdAt"
FROM public.bookings b
WHERE NOT EXISTS (
  SELECT 1
  FROM public.booking_events be
  WHERE be."bookingId" = b.id
    AND be."eventType" = 'created'
);

INSERT INTO public.booking_events (
  "bookingId",
  "eventType",
  "actorRole",
  "actorUserId",
  "actorLabel",
  note,
  "createdAt"
)
SELECT
  b.id,
  b.status,
  CASE
    WHEN b.status = 'cancelled' THEN 'client'
    WHEN b.status IN ('confirmed', 'declined', 'completed') THEN 'photographer'
    ELSE 'system'
  END,
  CASE
    WHEN b.status = 'cancelled' THEN b."clientUserId"
    WHEN b.status IN ('confirmed', 'declined', 'completed') THEN b."photographerUserId"
    ELSE NULL
  END,
  CASE
    WHEN b.status = 'cancelled' THEN COALESCE(NULLIF(b."clientEmail", ''), 'Client')
    WHEN b.status IN ('confirmed', 'declined', 'completed') THEN b."photographerName"
    ELSE 'System'
  END,
  'Backfilled lifecycle event from existing booking status.',
  b."updatedAt"
FROM public.bookings b
WHERE b.status IN ('confirmed', 'declined', 'completed', 'cancelled')
  AND NOT EXISTS (
    SELECT 1
    FROM public.booking_events be
    WHERE be."bookingId" = b.id
      AND be."eventType" = b.status
  );