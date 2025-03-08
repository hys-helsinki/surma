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
  return !!umpire;
};

const isDeleteAuthorized = async (assignmentId, req, res) => {
  const assignmentToDelete = await prisma.teamAssignment.findUnique({
    where: {
      id: assignmentId
    },
    include: {
      teamAssignmentRing: true
    }
  });
  return isCurrentUserAuthorized(
    assignmentToDelete.teamAssignmentRing.tournamentId,
    req,
    res
  );
};

export default async function rings(req: NextApiRequest, res: NextApiResponse) {
  const assignmentId = req.body;
  if (!(await isDeleteAuthorized(assignmentId, req, res))) {
    console.log("Unauthorized assigment delete attempt!");
    res.status(403).end();
  }
  const deletedTeamAssignment = await prisma.teamAssignment.delete({
    where: {
      id: assignmentId
    },
    include: {
      huntingTeam: {
        include: {
          players: true
        }
      },
      targetTeam: {
        include: {
          players: true
        }
      }
    }
  });

  const updatedRing = await prisma.teamAssignmentRing.findUnique({
    where: {
      id: deletedTeamAssignment.teamAssignmentRingId
    },
    include: {
      assignments: true
    }
  });

  const hunterIds = deletedTeamAssignment.huntingTeam.players.map((p) => p.id);
  const targetIds = deletedTeamAssignment.targetTeam.players.map((p) => p.id);

  await prisma.assignment.deleteMany({
    where: {
      AND: [
        {
          hunterId: {
            in: hunterIds
          }
        },
        {
          targetId: {
            in: targetIds
          }
        }
      ]
    }
  });

  res.json(updatedRing);
}
