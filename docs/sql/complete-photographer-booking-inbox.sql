ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS "clientEmail" varchar(255),
ADD COLUMN IF NOT EXISTS "photographerUserId" uuid;

UPDATE public.bookings AS b
SET "photographerUserId" = p.user_id
FROM public.profiles AS p
WHERE b."photographerProfileId" = p.id
  AND p.role = 'photographer'
  AND b."photographerUserId" IS NULL;

CREATE INDEX IF NOT EXISTS idx_bookings_photographer_user_id
  ON public.bookings ("photographerUserId");

CREATE INDEX IF NOT EXISTS idx_bookings_photographer_profile_id
  ON public.bookings ("photographerProfileId");

CREATE INDEX IF NOT EXISTS idx_bookings_status
  ON public.bookings (status);

CREATE INDEX IF NOT EXISTS idx_bookings_photographer_user_status
  ON public.bookings ("photographerUserId", status);

CREATE INDEX IF NOT EXISTS idx_bookings_photographer_profile_status
  ON public.bookings ("photographerProfileId", status);