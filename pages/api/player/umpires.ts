import prisma from "../../../lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import { authConfig } from "../auth/[...nextauth]";

const isCurrentUserAuthorized = async (playerId, req, res) => {
  const session = await unstable_getServerSession(req, res, authConfig);

  const updatedPlayer = await prisma.player.findFirst({
    where: {
      id: playerId
    },
    include: {
      tournament: true
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

const assignUmpireToPlayer = async (id: string, umpireId: string) => {
  const updatedPlayer = await prisma.player.update({
    where: {
      id: id
    },
    data: {
      umpireId: umpireId
    }
  });
  return updatedPlayer;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!isCurrentUserAuthorized(req.query.id, req, res)) {
    res.status(403).end();
  }
  if (req.method === "PATCH") {
    const data = JSON.parse(req.body);

    const noEmptyValues = Object.entries(data).filter((d) => d[1]);
    if (noEmptyValues.length === 0) return res.send("No data");

    try {
      noEmptyValues.forEach(async (pair) => {
        await assignUmpireToPlayer(pair[0], pair[1] as string);
      });
    } catch (error) {
      res.status(500).send("Updating players failed");
    }
    res.status(200).send("Updated successfully");
  }
}
