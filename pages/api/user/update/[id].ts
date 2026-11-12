import prisma from "../../../../lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authConfig } from "../../auth/[...nextauth]";
import _ from "lodash";

const isCurrentUserAuthorized = async (userId, req, res) => {
  const session = await getServerSession(req, res, authConfig);
  if (!session) return false;

  const updatedUser = await prisma.user.findFirst({
    where: {
      id: userId
    }
  });
  if (!updatedUser) return false;
  if (updatedUser.id === session.user.id) return true;

  const umpire = await prisma.umpire.findFirst({
    where: {
      userId: session.user.id,
      tournamentId: updatedUser.tournamentId
    }
  });
  return umpire != null;
};

export default async function update(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!(await isCurrentUserAuthorized(req.query.id, req, res))) {
    return res.status(403).end();
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
