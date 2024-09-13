import prisma from "../../../../lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import { authConfig } from "../../auth/[...nextauth]";
import _ from "lodash";

const isCurrentUserAuthorized = async (playerId, req, res) => {
  const session = await unstable_getServerSession(req, res, authConfig);

  const currentPlayer = await prisma.player.findFirst({
    where: {
      id: playerId,
      userId: session.user.id
    }
  });
  // TODO add tournamentId to where clause
  const umpire = await prisma.umpire.findUnique({
    where: {
      userId: session.user.id
    }
  });
  return currentPlayer || umpire;
};

export default async function update(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!isCurrentUserAuthorized(req.query.id, req, res)) {
    res.status(403).end();
  }
  if (req.method === "PUT") {
    const playerId = req.query.id as string;
    const allowedFields = [
      "address",
      "learningInstitution",
      "eyeColor",
      "hair",
      "height",
      "glasses",
      "other",
      "calendar",
      "safetyNotes"
    ];
    const filteredUpdateData = _.pick(JSON.parse(req.body), allowedFields);

    const result = await prisma.player.update({
      where: { userId: playerId },
      data: filteredUpdateData
    });
    res.json(result);
  }
}
