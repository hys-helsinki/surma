import prisma from "../../../../lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function update(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "PUT") {
    const playerId = req.query.id;
    console.log(playerId);
    const playerData = JSON.parse(req.body);
    const result = await prisma.player.update({
      where: { id: playerId },
      data: playerData
    });
    res.status(204).end();
  }
}