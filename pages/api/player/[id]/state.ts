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
  if (req.method === "PATCH") {
    const playerId = req.query.id as string;
    const { state } = JSON.parse(req.body);
    const updatedPlayer = await prisma.player.update({
      where: { id: playerId },
      data: { state },
      include: {
        user: true
      }
    });
    res.json(updatedPlayer);
  }
}
