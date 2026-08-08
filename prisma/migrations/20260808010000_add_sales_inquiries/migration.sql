-- CreateEnum
CREATE TYPE "SalesInquiryStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'CLOSED');

-- CreateTable
CREATE TABLE "SalesInquiry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "schoolId" TEXT,
    "organizationName" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "studentCount" INTEGER,
    "currentSolution" TEXT,
    "requirements" TEXT NOT NULL,
    "demoRequested" BOOLEAN NOT NULL DEFAULT false,
    "status" "SalesInquiryStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalesInquiry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SalesInquiry_userId_idx" ON "SalesInquiry"("userId");

-- CreateIndex
CREATE INDEX "SalesInquiry_schoolId_idx" ON "SalesInquiry"("schoolId");

-- CreateIndex
CREATE INDEX "SalesInquiry_status_idx" ON "SalesInquiry"("status");

-- CreateIndex
CREATE INDEX "SalesInquiry_createdAt_idx" ON "SalesInquiry"("createdAt");

-- AddForeignKey
ALTER TABLE "SalesInquiry" ADD CONSTRAINT "SalesInquiry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesInquiry" ADD CONSTRAINT "SalesInquiry_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;
