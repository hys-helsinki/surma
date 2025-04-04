import prisma from "../../../lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import { authConfig } from "../auth/[...nextauth]";

const isCurrentUserAuthorized = async (tournamentId, req, res) => {
  const session = await unstable_getServerSession(req, res, authConfig);

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
  if (req.method === "POST") {
    const data = JSON.parse(req.body);
    // TODO make a dynamic route to supply tournament id as path parameter and move this before method check
    if (!(await isCurrentUserAuthorized(data.tournamentId, req, res))) {
      console.log("Unauthorized ring creation attempt!");
      res.status(403).end();
    }

    const createdRing = await prisma.teamAssignmentRing.create({
      data: {
        name: data.name,
        tournamentId: data.tournamentId,
        assignments: {
          createMany: {
            data: data.assignments
          }
        }
      },
      include: {
        assignments: true
      }
    });

    const teams = await prisma.team.findMany({
      include: {
        players: true
      }
    });

    let playerAssignments = [];

    createdRing.assignments.forEach((assignment) => {
      const hunterPlayers = teams.find(
        (team) => team.id === assignment.huntingTeamId
      ).players;

      const targetPlayers = teams.find(
        (team) => team.id === assignment.targetTeamId
      ).players;

      hunterPlayers.forEach((hunter) => {
        targetPlayers.forEach((target) => {
          playerAssignments.push({
            hunterId: hunter.id,
            targetId: target.id,
            teamAssignmentRingId: createdRing.id
          });
        });
      });
    });

    await prisma.assignmentRing.create({
      data: {
        tournamentId: createdRing.tournamentId,
        assignments: {
          createMany: {
            data: playerAssignments
          }
        }
      }
    });

    res.json(createdRing);
  }
}
