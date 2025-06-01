-- DropForeignKey
ALTER TABLE "AssignmentRing" DROP CONSTRAINT "AssignmentRing_tournamentId_fkey";

-- DropForeignKey
ALTER TABLE "Player" DROP CONSTRAINT "Player_tournamentId_fkey";

-- DropForeignKey
ALTER TABLE "Team" DROP CONSTRAINT "Team_tournamentId_fkey";

-- DropForeignKey
ALTER TABLE "TeamAssignment" DROP CONSTRAINT "TeamAssignment_teamAssignmentRingId_fkey";

-- DropForeignKey
ALTER TABLE "TeamAssignmentRing" DROP CONSTRAINT "TeamAssignmentRing_tournamentId_fkey";

-- DropForeignKey
ALTER TABLE "Umpire" DROP CONSTRAINT "Umpire_tournamentId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_tournamentId_fkey";

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Umpire" ADD CONSTRAINT "Umpire_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignmentRing" ADD CONSTRAINT "AssignmentRing_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamAssignment" ADD CONSTRAINT "TeamAssignment_teamAssignmentRingId_fkey" FOREIGN KEY ("teamAssignmentRingId") REFERENCES "TeamAssignmentRing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamAssignmentRing" ADD CONSTRAINT "TeamAssignmentRing_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;
