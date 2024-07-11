/*
  Warnings:

  - You are about to drop the column `glasses` on the `Player` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Player" DROP COLUMN "glasses",
ADD COLUMN     "security" TEXT;
