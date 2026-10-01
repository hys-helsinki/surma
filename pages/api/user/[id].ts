import prisma from "../../../lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authConfig } from "../auth/[...nextauth]";

const isCurrentUserAuthorized = async (
  tournamentId: string,
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const session = await getServerSession(req, res, authConfig);

  if (!session) return false;

  const umpire = await prisma.umpire.findFirst({
    where: {
      userId: session.user.id,
      tournamentId: tournamentId
    }
  });
  return !!umpire;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "DELETE") {
    const data = JSON.parse(req.body);
    const userId = req.query.id as string;

    if (!data || !userId) return res.status(400).end();
    if (!(await isCurrentUserAuthorized(data.tournamentId, req, res))) {
      console.log("Unauthorized user delete attempt!");
      return res.status(403).end();
    }
    try {
      const player = await prisma.player.findFirst({
        where: {
          userId: userId,
          tournamentId: data.tournamentId
        }
      });

      const umpire = await prisma.umpire.findFirst({
        where: {
          userId: userId,
          tournamentId: data.tournamentId
        }
      });

      if (player || umpire) {
        return res.status(409).json({
          error:
            "User has active tournament registrations and cannot be deleted"
        });
      }

      const deletedUser = await prisma.user.delete({
        where: {
          id: userId
        }
      });

      if (!deletedUser) return res.status(400).end();
      return res.json({ deletedUser });
    } catch (e) {
      console.log(e);
      return res.status(500).end();
    }
  }
}
