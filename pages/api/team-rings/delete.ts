import prisma from "../../../lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authConfig } from "../auth/[...nextauth]";
import {
  RingWithAssignments,
  UmpirePagePlayer
} from "../../../types/umpirepage";

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
    res.status(403).end();
  }

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
    select: {
      id: true,
      title: true,
      alias: true,
      state: true,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      },
      team: {
        select: {
          id: true,
          name: true
        }
      },
      umpire: {
        select: {
          id: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        }
      },
      targets: true
    }
  });

  const playerRings: RingWithAssignments[] =
    await prisma.assignmentRing.findMany({
      where: {
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
