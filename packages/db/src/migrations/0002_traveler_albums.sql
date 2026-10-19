-- 0002_traveler_albums.sql
--
-- Traveler album surface (SCR-TRV-16/17):
--   1. `trip_photo_albums` gains an audience model: `public` (any signed-in traveler after the
--      trip is completed) or `selected_travelers` (only the uuids listed in
--      `audience_account_ids`, e.g. confirmed travelers of the trip).
--   2. `album_shared_links` stores the 32-character share tokens with an active/revoked
--      lifecycle so a revoked or unknown link resolves to "not found".
--
-- Every statement is idempotent (`IF NOT EXISTS`), matching the 0001 convention: `psql -f`
-- twice and `bun run db:push` on a dev database converge on the same state.

ALTER TABLE trip_photo_albums
  ADD COLUMN IF NOT EXISTS audience text NOT NULL DEFAULT 'public';
ALTER TABLE trip_photo_albums
  ADD COLUMN IF NOT EXISTS audience_account_ids jsonb NOT NULL DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS trip_photo_albums_trip_status_idx
  ON trip_photo_albums (trip_id, status);

CREATE TABLE IF NOT EXISTS album_shared_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
  album_id uuid NOT NULL REFERENCES trip_photo_albums (id) ON DELETE CASCADE,
  token text NOT NULL,
  created_by_account_id uuid NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active',
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS album_shared_links_token_uidx ON album_shared_links (token);
CREATE INDEX IF NOT EXISTS album_shared_links_album_idx ON album_shared_links (album_id);
CREATE INDEX IF NOT EXISTS album_shared_links_tenant_idx ON album_shared_links (tenant_id);
CREATE INDEX IF NOT EXISTS album_shared_links_status_idx ON album_shared_links (status);
