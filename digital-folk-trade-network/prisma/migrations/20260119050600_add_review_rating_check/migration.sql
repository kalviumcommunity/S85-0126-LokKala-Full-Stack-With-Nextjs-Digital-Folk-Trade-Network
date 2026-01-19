-- Enforce valid rating range (1–5) with idempotent guard
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'Review_rating_check'
  ) THEN
    ALTER TABLE "Review"
    ADD CONSTRAINT "Review_rating_check"
    CHECK (rating >= 1 AND rating <= 5);
  END IF;
END
$$;
