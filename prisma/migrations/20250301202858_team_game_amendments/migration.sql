/*
  Warnings:

  - Added the required column `tournamentId` to the `Team` table without a default value. This is not possible if the table is not empty.
  - Added the required column `huntingTeamId` to the `TeamAssignment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `targetTeamId` to the `TeamAssignment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Assignment" DROP CONSTRAINT "Assignment_teamAssignmentRingId_fkey";

-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "tournamentId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "TeamAssignment" ADD COLUMN     "huntingTeamId" TEXT NOT NULL,
ADD COLUMN     "targetTeamId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamAssignment" ADD CONSTRAINT "TeamAssignment_huntingTeamId_fkey" FOREIGN KEY ("huntingTeamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamAssignment" ADD CONSTRAINT "TeamAssignment_targetTeamId_fkey" FOREIGN KEY ("targetTeamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
