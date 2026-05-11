/*
  Warnings:

  - You are about to drop the column `management_token_hash` on the `presentations` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "presentations" DROP COLUMN "management_token_hash";
