import prisma from "../../../../lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import { authConfig } from "../../auth/[...nextauth]";
import { v2 as cloudinary } from "cloudinary";

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
  if (req.method === "DELETE") {
    const tournament = await prisma.tournament.findUnique({
      where: {
        id: tournamentId
      }
    });

    const currentTime = new Date().getTime();

    if (currentTime > new Date(tournament.endTime).getTime()) {
      try {
        await cloudinary.api.delete_resources_by_prefix(
          `surma/${tournamentId}/`,
          function (result) {
            console.log(result);
          }
        );
        await prisma.tournament.delete({
          where: {
            id: tournamentId
          }
        });
      } catch (error) {
        console.log(error);
        return res.status(500).end();
      }

      return res.status(200).end();
    }
  }
}
