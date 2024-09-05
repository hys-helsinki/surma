import prisma from "../../../../lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import { authConfig } from "../../auth/[...nextauth]";

const isCurrentUserAuthorized = async (playerId, req, res) => {
  const session = await unstable_getServerSession(req, res, authConfig);

  const updatedPlayer = await prisma.player.findFirst({
    where: {
      id: playerId,
      userId: session.user.id
    },
    select: {
      tournamentId: true
    }
  });
  const umpire = await prisma.umpire.findFirst({
    where: {
      userId: session.user.id,
      tournamentId: updatedPlayer.tournamentId
    }
  });
  return umpire != null;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!isCurrentUserAuthorized(req.query.id, req, res)) {
    res.status(403).end();
  }
  if (req.method === "POST") {
    const playerId = req.query.id as string;

    const player = await prisma.player.findUnique({
      where: { id: playerId },
      include: {
        tournament: true
      }
    });

    const detectives = await prisma.player.findMany({
      where: {
        state: "DETECTIVE"
      }
    });

    if (detectives.length === 0) {
      return res.send("No detectives found");
    }

    const wantedRing = await prisma.assignmentRing.create({
      data: {
        name: "Etsintäkuulutus",
        tournamentId: player.tournament.id
      }
    });

    const assignments = detectives.map((detective) => ({
      ringId: wantedRing.id,
      hunterId: detective.id,
      targetId: player.id
    }));

    const savedAssigments = await prisma.assignment.createMany({
      data: assignments
    });

    res.status(204).send(savedAssigments);
  }
}
