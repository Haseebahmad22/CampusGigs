-- =============================================
-- Token system: accounts, escrows, transactions
-- =============================================

CREATE TABLE IF NOT EXISTS token_accounts (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_token_accounts_set_updated_at ON token_accounts;
CREATE TRIGGER trg_token_accounts_set_updated_at
BEFORE UPDATE ON token_accounts
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS token_escrows (
  gig_id UUID PRIMARY KEY REFERENCES gigs(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  freelancer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL CHECK (amount > 0),
  status TEXT NOT NULL DEFAULT 'held' CHECK (status IN ('held', 'released', 'refunded')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  released_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ
);

ALTER TABLE IF EXISTS token_escrows
  ALTER COLUMN freelancer_id DROP NOT NULL;

CREATE INDEX IF NOT EXISTS idx_token_escrows_client ON token_escrows(client_id);
CREATE INDEX IF NOT EXISTS idx_token_escrows_freelancer ON token_escrows(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_token_escrows_status ON token_escrows(status);

CREATE TABLE IF NOT EXISTS token_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  to_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  gig_id UUID REFERENCES gigs(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL CHECK (amount > 0),
  type TEXT NOT NULL CHECK (type IN ('signup_bonus', 'gig_payout', 'manual_adjustment')),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_token_transactions_from ON token_transactions(from_user_id);
CREATE INDEX IF NOT EXISTS idx_token_transactions_to ON token_transactions(to_user_id);
CREATE INDEX IF NOT EXISTS idx_token_transactions_gig ON token_transactions(gig_id);

-- Backfill accounts for existing users
INSERT INTO token_accounts (user_id, balance)
SELECT u.id, 0
FROM users u
LEFT JOIN token_accounts ta ON ta.user_id = u.id
WHERE ta.user_id IS NULL;
