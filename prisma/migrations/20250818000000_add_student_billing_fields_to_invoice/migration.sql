-- 1. Create the new InvoiceStatus enum type FIRST
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'ISSUED', 'PAID', 'PARTIALLY_PAID', 'OVERDUE', 'CANCELED');

-- 2. Add new columns to existing Invoice table
ALTER TABLE "Invoice" ADD COLUMN "studentId" TEXT;
ALTER TABLE "Invoice" ADD COLUMN "status" "InvoiceStatus" NOT NULL DEFAULT 'ISSUED';
ALTER TABLE "Invoice" ADD COLUMN "dueDate" TIMESTAMP(3);
ALTER TABLE "Invoice" ADD COLUMN "period" TEXT;

-- 3. Add foreign key: Invoice.studentId → Student.id
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 4. Add indexes for new fields
CREATE INDEX "Invoice_studentId_idx" ON "Invoice"("studentId");
CREATE INDEX "Invoice_status_idx" ON "Invoice"("status");

-- Backfill behavior:
-- All existing Invoice rows will automatically receive:
--   status = 'ISSUED' (via DEFAULT)
--   studentId = NULL (no existing data in column)
--   dueDate = NULL (no existing data in column)
--   period = NULL (no existing data in column)
