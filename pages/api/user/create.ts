import prisma from "../../../lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function create(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const playerData = JSON.parse(req.body);
    const result = await prisma.user.create({
      data: {
        firstName: playerData.firstName,
        lastName: playerData.lastName,
        email: playerData.email,
        tournament: { connect: { id: playerData.tournamentId } },
      }
    });
    res.status(201).send(result);
  }
}
