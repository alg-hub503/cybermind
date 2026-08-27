-- Rollback Email Verification and Phone Verification
-- Drops EmailVerification table, removes emailVerifiedAt and phone from User

-- DropEmailVerification
DROP TABLE "EmailVerification" CASCADE;

-- Remove email verification and phone fields from User
ALTER TABLE "User" DROP COLUMN "emailVerifiedAt";
ALTER TABLE "User" DROP COLUMN "phone";
