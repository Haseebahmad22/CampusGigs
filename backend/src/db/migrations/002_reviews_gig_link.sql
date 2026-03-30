-- =============================================
-- Link reviews to gigs + unique constraint
-- =============================================

-- Add FK constraint on gig_id (column already exists but had no FK)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'reviews_gig_id_fkey' AND table_name = 'reviews'
  ) THEN
    ALTER TABLE reviews
      ADD CONSTRAINT reviews_gig_id_fkey
      FOREIGN KEY (gig_id) REFERENCES gigs(id) ON DELETE SET NULL;
  END IF;
END $$;

-- One review per client per gig
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'reviews_unique_client_gig' AND table_name = 'reviews'
  ) THEN
    ALTER TABLE reviews
      ADD CONSTRAINT reviews_unique_client_gig UNIQUE (client_id, gig_id);
  END IF;
END $$;

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_reviews_freelancer_id ON reviews(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_gig_id ON reviews(gig_id);
