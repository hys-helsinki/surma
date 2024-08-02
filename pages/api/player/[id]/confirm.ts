import prisma from "../../../../lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import { authConfig } from "../../auth/[...nextauth]";

const isCurrentUserAuthorized = async (playerId, req, res) => {
  const session = await unstable_getServerSession(req, res, authConfig);

  const updatedPlayer = await prisma.player.findFirst({
    where: {
      id: playerId,
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
  if (!(await isCurrentUserAuthorized(req.query.id, req, res))) {
    return res.status(403).send("Unauthorized");
  }
  if (req.method === "PATCH") {
    const playerId = req.query.id as string;
    const { confirmed } = JSON.parse(req.body);
    const result = await prisma.player.update({
      where: { id: playerId },
      data: { confirmed }
    });
    return res.status(200).send(result);
  }
}
