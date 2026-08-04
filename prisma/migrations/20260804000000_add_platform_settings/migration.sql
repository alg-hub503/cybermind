-- CreateTable
CREATE TABLE "PlatformSettings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    -- Platform Identity
    "platformName" TEXT DEFAULT 'CyberMind',
    "defaultLogoUrl" TEXT,
    "defaultPrimaryColor" TEXT DEFAULT '#4F46E5',
    "supportEmail" TEXT,

    -- Trial Defaults
    "trialDurationDays" INTEGER NOT NULL DEFAULT 14,
    "trialWarningDays" INTEGER NOT NULL DEFAULT 3,

    -- Platform
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PlatformSettings_pkey" PRIMARY KEY ("id")
);
