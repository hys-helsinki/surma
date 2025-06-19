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

export default async function rings(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const data = JSON.parse(req.body);
    // TODO make a dynamic route to supply tournament id as path parameter and move this before method check
    if (!(await isCurrentUserAuthorized(data.tournamentId, req, res))) {
      console.log("Unauthorized ring creation attempt!");
      res.status(403).end();
    }

    const createdRing = await prisma.assignmentRing.create({
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

    const updatedPlayers = await prisma.player.findMany({
      include: {
        user: true,
        targets: true
      }
    });
    res.json({ createdRing, players: updatedPlayers });
  } else if (req.method === "DELETE") {
    const data = JSON.parse(req.body);
    if (!(await isCurrentUserAuthorized(data.tournamentId, req, res))) {
      console.log("Unauthorized ring delete attempt!");
      res.status(403).end();
    }

    const deletedRing = await prisma.assignmentRing.delete({
      where: {
        id: data.ringId
      }
    });
    const updatedPlayers = await prisma.player.findMany({
      include: {
        user: true,
        targets: true
      }
    });
    res.json({ deletedRing, players: updatedPlayers });
  }
}
