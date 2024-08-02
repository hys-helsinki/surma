/*
  Warnings:

  - The values [noTitle] on the enum `PlayerTitle` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PlayerTitle_new" AS ENUM ('KK', 'MM', 'LL', 'TT');
ALTER TABLE "Player" ALTER COLUMN "title" DROP DEFAULT;
ALTER TABLE "Player" ALTER COLUMN "title" TYPE "PlayerTitle_new" USING ("title"::text::"PlayerTitle_new");
ALTER TYPE "PlayerTitle" RENAME TO "PlayerTitle_old";
ALTER TYPE "PlayerTitle_new" RENAME TO "PlayerTitle";
DROP TYPE "PlayerTitle_old";
COMMIT;

-- AlterTable
ALTER TABLE "Player" ALTER COLUMN "title" DROP NOT NULL,
ALTER COLUMN "title" DROP DEFAULT;
