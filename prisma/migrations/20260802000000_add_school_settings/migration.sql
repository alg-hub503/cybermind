-- CreateTable
CREATE TABLE "SchoolSettings" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    -- General
    "description" TEXT,

    -- Branding
    "logoUrl" TEXT,
    "coverUrl" TEXT,
    "faviconUrl" TEXT,
    "primaryColor" TEXT DEFAULT '#4F46E5',
    "secondaryColor" TEXT DEFAULT '#64748B',

    -- Regional
    "locale" TEXT DEFAULT 'ar',
    "currency" TEXT DEFAULT 'SAR',
    "timezone" TEXT DEFAULT 'Asia/Riyadh',
    "dateFormat" TEXT DEFAULT 'DD/MM/YYYY',

    -- Contact
    "contactEmail" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "address" TEXT,

    -- Trial (data only)
    "trialStart" TIMESTAMP(3),
    "trialEnd" TIMESTAMP(3),

    -- Invoicing
    "invoicePrefix" TEXT DEFAULT 'INV-',
    "invoiceNextNum" INTEGER NOT NULL DEFAULT 1,
    "invoiceNotes" TEXT,

    -- Legal / Tax (placeholders)
    "taxNumber" TEXT,
    "crNumber" TEXT,
    "legalNotes" TEXT,

    CONSTRAINT "SchoolSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SchoolSettings_schoolId_key" ON "SchoolSettings"("schoolId");

-- AddForeignKey
ALTER TABLE "SchoolSettings" ADD CONSTRAINT "SchoolSettings_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
