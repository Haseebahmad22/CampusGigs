-- =============================================
-- Gig attachments, gig messages, gig category
-- =============================================

-- Attachments (gig specs uploaded by client + deliverables uploaded by freelancer)
CREATE TABLE IF NOT EXISTS gig_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gig_id UUID NOT NULL REFERENCES gigs(id) ON DELETE CASCADE,
  uploader_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size_bytes INTEGER NOT NULL CHECK (file_size_bytes >= 0),
  mime_type TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('spec', 'submission')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gig_attachments_gig_kind ON gig_attachments(gig_id, kind);
CREATE INDEX IF NOT EXISTS idx_gig_attachments_uploader ON gig_attachments(uploader_id);

-- Per-gig chat between client and accepted freelancer
CREATE TABLE IF NOT EXISTS gig_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gig_id UUID NOT NULL REFERENCES gigs(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body TEXT NOT NULL CHECK (length(trim(body)) > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gig_messages_gig_created ON gig_messages(gig_id, created_at);

-- Gig category (links gigs to existing skill_categories table)
ALTER TABLE gigs
  ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES skill_categories(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_gigs_category ON gigs(category_id);
