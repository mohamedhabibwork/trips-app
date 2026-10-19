-- 0001_lookups_is_active.sql
--
-- Adds the `is_active` retirement flag to both lookup tables and the two composite indexes that
-- back the read paths (design §3.1, §3.2). This file is the authoritative DDL for every
-- environment that does not use `drizzle-kit push`; `db:generate` is deliberately not used for
-- this change because the journal is not baselined and would emit a full-schema baseline that
-- conflicts with the `push` workflow (design §3.3).
--
-- Every statement is idempotent (`IF NOT EXISTS`), so `psql -f` twice and `bun run db:push` on a
-- dev database both converge on the same state.
--
-- `is_active` is orthogonal to `is_deleted`:
--   is_active  = true  -> the value may be offered to users
--   is_active  = false -> hidden from option lists, still resolvable (LK-01)
--   is_deleted = true  -> retired record, excluded from every read path
-- `value` is intentionally untouched: it stays NOT NULL and is never rendered or compared (OQ-4).

ALTER TABLE lookup_types ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;
ALTER TABLE lookups      ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- `listTypes`: ordered by (sortBy, code), filtered on (isActive, isDeleted).
CREATE INDEX IF NOT EXISTS lookup_types_active_idx
  ON lookup_types (is_active, is_deleted, sort_by, code);

-- `getTypeByCode`: one type's items, ordered by (sortBy, code), filtered on (isActive, isDeleted).
CREATE INDEX IF NOT EXISTS lookups_type_active_idx
  ON lookups (lookup_type_id, is_active, is_deleted, sort_by, code);
