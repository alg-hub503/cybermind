-- Migration: School-Scoped Roles & Permissions
-- SELF-CONTAINED and DYNAMIC - works with any data
-- IMPORTANT: Run scripts/recreate-roles.ts after this migration to populate roles

-- ============================================================
-- PHASE 1: Add new columns
-- ============================================================

ALTER TABLE "Role" ADD COLUMN IF NOT EXISTS "systemKey" TEXT;
ALTER TABLE "Role" ADD COLUMN IF NOT EXISTS "schoolId" TEXT;

-- ============================================================
-- PHASE 2: Remove OLD unique constraint and index
-- ============================================================

ALTER TABLE "Role" DROP CONSTRAINT IF EXISTS "Role_name_key";
DROP INDEX IF EXISTS "Role_name_key";

-- ============================================================
-- PHASE 3: Add NEW unique constraints
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Role_schoolId_name_key') THEN
    ALTER TABLE "Role" ADD CONSTRAINT "Role_schoolId_name_key" UNIQUE ("schoolId", "name");
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Role_schoolId_systemKey_key') THEN
    ALTER TABLE "Role" ADD CONSTRAINT "Role_schoolId_systemKey_key" UNIQUE ("schoolId", "systemKey");
  END IF;
END $$;

-- ============================================================
-- PHASE 4: Make schoolId NOT NULL
-- ============================================================

ALTER TABLE "Role" ALTER COLUMN "schoolId" SET NOT NULL;

-- ============================================================
-- PHASE 5: Add index
-- ============================================================

CREATE INDEX IF NOT EXISTS "Role_schoolId_idx" ON "Role"("schoolId");

-- ============================================================
-- NOTE: Role data and UserRole references are populated by
-- scripts/recreate-roles.ts (run after applying this migration)
-- ============================================================
