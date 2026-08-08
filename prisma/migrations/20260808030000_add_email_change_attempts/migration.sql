-- CreateTable
CREATE TABLE "EmailChangeAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailChangeAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EmailChangeAttempt_userId_createdAt_idx" ON "EmailChangeAttempt"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "EmailChangeAttempt" ADD CONSTRAINT "EmailChangeAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
