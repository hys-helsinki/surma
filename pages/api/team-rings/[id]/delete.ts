import prisma from "../../../../lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import { authConfig } from "../../auth/[...nextauth]";

const isCurrentUserAuthorized = async (tournamentId, req, res) => {
  const session = await unstable_getServerSession(req, res, authConfig);

  const umpire = await prisma.umpire.findFirst({
    where: {
      userId: session.user.id,
      tournamentId: tournamentId
    }
  });
  return umpire;
};

export default async function rings(req: NextApiRequest, res: NextApiResponse) {
  const data = JSON.parse(req.body);
  if (!(await isCurrentUserAuthorized(data.tournamentId, req, res))) {
    console.log("Unauthorized ring delete attempt!");
    res.status(403).end();
  }

  const deletedRing = await prisma.teamAssignmentRing.delete({
    where: {
      id: data.ringId
    }
  });
  res.json(deletedRing);
}
