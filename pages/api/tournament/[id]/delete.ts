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
  if (!isCurrentUserAuthorized(req.query.id, req, res)) {
    res.status(403).end();
  }
  if (req.method === "DELETE") {
    try {
      await cloudinary.api.delete_resources_by_prefix(
        "surma/",
        function (result) {}
      );
    } catch (error) {
      console.log(error);
      return res.status(500).end();
    }

    return res.status(200).end();
  }
}
