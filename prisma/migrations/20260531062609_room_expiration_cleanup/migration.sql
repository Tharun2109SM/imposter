-- AlterTable
ALTER TABLE "Room" ADD COLUMN "expiresAt" TIMESTAMP(3);

-- Backfill existing rooms so they follow the same 24-hour lifetime rule.
UPDATE "Room"
SET "expiresAt" = "createdAt" + INTERVAL '24 hours'
WHERE "expiresAt" IS NULL;

ALTER TABLE "Room" ALTER COLUMN "expiresAt" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Room_expiresAt_idx" ON "Room"("expiresAt");

-- CreateIndex
CREATE INDEX "Room_expiresAt_updatedAt_idx" ON "Room"("expiresAt", "updatedAt");
