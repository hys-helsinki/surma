import prisma from "../../../lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authConfig } from "../auth/[...nextauth]";
import {
  RingWithAssignments,
  UmpirePagePlayer
} from "../../../types/umpirepage";
import { umpirePagePlayerSelect } from "../../../lib/prisma-selects";

const isCurrentUserAuthorized = async (tournamentId, req, res) => {
  const session = await getServerSession(req, res, authConfig);

  const umpire = await prisma.umpire.findFirst({
    where: {
      userId: session.user.id,
      tournamentId: tournamentId
    }
  });
  return umpire;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const data = JSON.parse(req.body);
  if (!(await isCurrentUserAuthorized(data.tournamentId, req, res))) {
    console.log("Unauthorized ring delete attempt!");
    return res.status(403).end();
  }

  const ringToDelete = await prisma.teamAssignmentRing.findFirst({
    where: { id: data.ringId, tournamentId: data.tournamentId }
  });
  if (!ringToDelete) return res.status(404).end();

  await prisma.teamAssignment.deleteMany({
    where: {
      teamAssignmentRingId: data.ringId
    }
  });

  const deletedRing = await prisma.teamAssignmentRing.delete({
    where: {
      id: data.ringId
    }
  });

  await prisma.assignment.deleteMany({
    where: {
      teamAssignmentRingId: deletedRing.id
    }
  });

  await prisma.assignmentRing.deleteMany({
    where: {
      assignments: {
        none: {}
      },
      name: deletedRing.name
    }
  });

  const updatedPlayers: UmpirePagePlayer[] = await prisma.player.findMany({
    where: { tournamentId: data.tournamentId },
    select: umpirePagePlayerSelect
  });

  const playerRings: RingWithAssignments[] =
    await prisma.assignmentRing.findMany({
      where: {
        tournamentId: data.tournamentId,
        assignments: {
          some: {}
        }
      },
      include: {
        assignments: true
      }
    });

  res.json({ deletedRing, players: updatedPlayers, playerRings });
}
