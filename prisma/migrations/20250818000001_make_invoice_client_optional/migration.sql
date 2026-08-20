-- Phase 3: Make Invoice.clientId optional for Student Billing
-- This allows invoices to be created for students without a Client record

-- Allow NULL values in clientId column
ALTER TABLE "Invoice" ALTER COLUMN "clientId" DROP NOT NULL;
