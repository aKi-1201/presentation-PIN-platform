/*
  Warnings:

  - The `status` column on the `presentations` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "PresentationStatus" AS ENUM ('ACTIVE', 'EXPIRED');

-- AlterTable
ALTER TABLE "presentations" DROP COLUMN "status",
ADD COLUMN     "status" "PresentationStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateIndex
CREATE INDEX "presentations_status_idx" ON "presentations"("status");
