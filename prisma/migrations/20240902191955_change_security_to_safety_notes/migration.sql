/*
  Warnings:

  - You are about to drop the column `security` on the `Player` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Player" DROP COLUMN "security",
ADD COLUMN     "safetyNotes" TEXT;
