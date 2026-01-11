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
  const assignmentToDelete = await prisma.assignment.findUnique({
    where: {
      id: assignmentId
    },
    include: {
      ring: true
    }
  });
  return isCurrentUserAuthorized(
    assignmentToDelete.ring.tournamentId,
    req,
    res
  );
};

const isCreateAuthorized = async (ringId, req, res) => {
  const ring = await prisma.assignmentRing.findUnique({
    where: {
      id: ringId
    }
  });
  return isCurrentUserAuthorized(ring.tournamentId, req, res);
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "DELETE") {
    const assignmentId = req.body;
    if (!(await isDeleteAuthorized(assignmentId, req, res))) {
      console.log("Unauthorized assigment delete attempt!");
      res.status(403).end();
    }
    const deletedAssignment = await prisma.assignment.delete({
      where: {
        id: assignmentId
      }
    });

    // Poistetaan tyhjät ringit
    await prisma.assignmentRing.deleteMany({
      where: {
        assignments: {
          none: {}
        }
      }
    });

    const updatedPlayers = await prisma.player.findMany({
      include: {
        user: true,
        targets: true,
        team: true
      }
    });
    res.json({ deletedAssignment, players: updatedPlayers });
  } else if (req.method === "POST") {
    const newAssignments = JSON.parse(req.body);
    if (!(await isCreateAuthorized(newAssignments[0].ringId, req, res))) {
      console.log("Unauthorized assigment create attempt!");
      res.status(403).end();
    }

    const savedAssignments = await prisma.assignment.createManyAndReturn({
      data: newAssignments
    });

    const updatedPlayers = await prisma.player.findMany({
      include: {
        user: true,
        targets: true,
        team: true
      }
    });

    res.json({ savedAssignments, players: updatedPlayers });
  }
}
