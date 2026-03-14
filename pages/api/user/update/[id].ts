import prisma from "../../../../lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authConfig } from "../../auth/[...nextauth]";
import _ from "lodash";

const isCurrentUserAuthorized = async (userId, req, res) => {
  const session = await getServerSession(req, res, authConfig);

  const currentUser = await prisma.user.findFirst({
    where: {
      id: userId
    }
  });
  if (!currentUser) return false;

  const umpire = await prisma.umpire.findUnique({
    where: {
      userId: session.user.id,
      tournamentId: currentUser.tournamentId
    }
  });
  return currentUser.id === session.user.id || umpire;
};

export default async function update(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!isCurrentUserAuthorized(req.query.id, req, res)) {
    res.status(403).end();
  }
  if (req.method === "PUT") {
    const userId = req.query.id as string;
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

    await prisma.player.update({
      where: { userId },
      data: filteredUpdateData
    });

    const updatedUser = await prisma.user.findFirst({
      where: {
        id: userId
      },
      include: {
        player: {
          include: {
            umpire: {
              include: {
                user: true
              }
            }
          }
        }
      }
    });

    res.json(updatedUser);
  }
}
