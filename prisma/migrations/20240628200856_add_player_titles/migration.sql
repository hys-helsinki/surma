-- CreateEnum
CREATE TYPE "PlayerTitle" AS ENUM ('noTitle', 'KK', 'MM', 'TT');

-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "title" "PlayerTitle" NOT NULL DEFAULT 'noTitle';
