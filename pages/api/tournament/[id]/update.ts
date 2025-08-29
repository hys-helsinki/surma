import prisma from "../../../../lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import { authConfig } from "../../auth/[...nextauth]";

const isCurrentUserAuthorized = async (tournamentId, req, res) => {
  const session = await unstable_getServerSession(req, res, authConfig);

  const tournament = await prisma.tournament.findFirst({
    where: {
      id: tournamentId
    }
  });
  const umpire = await prisma.umpire.findFirst({
    where: {
      userId: session.user.id,
      tournamentId: tournament.id
    }
  });
  return umpire != null;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const tournamentId = req.query.id as string;
  if (!isCurrentUserAuthorized(tournamentId, req, res)) {
    res.status(403).end();
  }
  if (req.method === "PUT") {
    const updatedTournamentData = JSON.parse(req.body);

    const result = await prisma.tournament.update({
      where: {
        id: tournamentId
      },
      data: updatedTournamentData
    });
    res.status(200).end();
  }
}
