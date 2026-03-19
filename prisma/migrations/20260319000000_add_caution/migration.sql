-- CreateEnum
CREATE TYPE "CautionStatus" AS ENUM ('NONE', 'HELD', 'CAPTURED', 'RELEASED', 'EXPIRED');

-- AlterTable
ALTER TABLE "Reservation"
  ADD COLUMN "cautionAmount"   DECIMAL(10,2),
  ADD COLUMN "cautionIntentId" TEXT,
  ADD COLUMN "cautionStatus"   "CautionStatus" NOT NULL DEFAULT 'NONE',
  ADD COLUMN "cautionDeadline" TIMESTAMP(3);
