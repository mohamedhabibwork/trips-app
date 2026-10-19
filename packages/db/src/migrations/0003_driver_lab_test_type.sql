-- 0003_driver_lab_test_type.sql
--
-- Driver lab tests (SCR-ADM-14): the admin's test-type choice (drug screening, medical
-- fitness, or both) is stored on the request so the queue and detail pages can show what
-- each test covers. Existing rows predate the choice and read as "both", the page default.
--
-- Idempotent like 0001/0002: `psql -f` twice and `bun run db:push` converge on the same state.

ALTER TABLE driver_lab_tests
  ADD COLUMN IF NOT EXISTS test_type text NOT NULL DEFAULT 'both';

ALTER TABLE driver_lab_tests
  DROP CONSTRAINT IF EXISTS driver_lab_tests_test_type_check;

ALTER TABLE driver_lab_tests
  ADD CONSTRAINT driver_lab_tests_test_type_check
  CHECK (test_type IN ('drug_screening', 'medical_fitness', 'both'));
