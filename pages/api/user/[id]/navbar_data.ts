import prisma from "../../../../lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import { authConfig } from "../../auth/[...nextauth]";

const isCurrentUserAuthorized = async (userId, req, res) => {
  const session = await unstable_getServerSession(req, res, authConfig);
  return session.user.id == userId;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const userId = req.query.id as string;
  if (!isCurrentUserAuthorized(userId, req, res)) {
    res.status(403).end();
  }

  const isTournamentRunning = (startTime: Date, endTime: Date) => {
    const currentTime = new Date().getTime();
    return startTime.getTime() < currentTime && currentTime < endTime.getTime();
  };

  let user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      player: {
        select: {
          targets: {
            select: {
              target: {
                select: {
                  user: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true
                    }
                  }
                }
              }
            }
          }
        }
      },
      umpire: true,
      tournament: {
        select: {
          startTime: true,
          endTime: true
        }
      }
    }
  });

  const targets =
    isTournamentRunning(
      new Date(user.tournament.startTime),
      new Date(user.tournament.endTime)
    ) && user.player
      ? user.player.targets
      : [];

  user = { ...user, player: { ...user.player, targets } };

  res.json(user);
}
