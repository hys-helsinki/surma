import prisma from "../../../lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authConfig } from "../auth/[...nextauth]";

// Note: despite the route name, the id is the player's *user* id (see the
// update below).
const isCurrentUserAuthorized = async (userId, req, res) => {
  const session = await getServerSession(req, res, authConfig);
  if (!session) return false;

  const updatedPlayer = await prisma.player.findUnique({
    where: { userId }
  });
  if (!updatedPlayer) return false;
  if (updatedPlayer.userId === session.user.id) return true;

  const umpire = await prisma.umpire.findFirst({
    where: {
      userId: session.user.id,
      tournamentId: updatedPlayer.tournamentId
    }
  });
  return umpire != null;
};

export default async function update(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!(await isCurrentUserAuthorized(req.query.id, req, res))) {
    return res.status(403).end();
  }
  if (req.method === "PATCH") {
    const playerId = req.query.id as string;
    const playerData = JSON.parse(req.body);
    const result = await prisma.player.update({
      where: { userId: playerId },
      data: playerData
    });
    res.status(204).end();
  }
}
