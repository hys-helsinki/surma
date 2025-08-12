import prisma from "../../../../lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authConfig } from "../../auth/[...nextauth]";
import { FeatureFlag } from "../../../../lib/constants";

const isCurrentUserAuthorized = async (playerId, req, res) => {
  const session = await getServerSession(req, res, authConfig);

  const updatedPlayer = await prisma.player.findFirst({
    where: {
      id: playerId
    },
    select: {
      tournamentId: true
    }
  });
  const umpire = await prisma.umpire.findFirst({
    where: {
      userId: session.user.id,
      tournamentId: updatedPlayer.tournamentId
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
  if (req.method === "PATCH") {
    const playerId = req.query.id as string;
    const { state } = JSON.parse(req.body);
    const updatedPlayer = await prisma.player.update({
      where: { id: playerId },
      data: { state },
      include: {
        user: true,
        team: true,
        tournament: true
      }
    });

    if (state === "DEAD") {
      if (FeatureFlag.DELETE_DEAD_HUNTER_ASSIGNMENTS) {
        // teamGame-tarkistus, koska vuoden 2025 joukkueturnauksessa on käytössä erikoissääntö jossa kohteita ei heti poisteta kuolleilta pelaajilta.
        // Otetaan tarkistus pois turnauksen jälkeen jos näyttää siltä ettei erikoissääntöä jatkossa haluta käyttää joukkueturnauksissa.

        await prisma.assignment.deleteMany({
          where: {
            OR: [
              {
                hunterId: playerId
              },
              {
                targetId: playerId
              }
            ]
          }
        });
      } else {
        // Poistetaan joka tapauksessa pelaaja metsästäjien kohteista, koska muuten toimeksiannot pitää itse klikkailla pois kannasta.
        // Ideana kuitenkin on, ettei kuollutta pelaajaa jahtaa enää kukaan.
        await prisma.assignment.deleteMany({
          where: {
            targetId: playerId
          }
        });
      }
    }
    res.json(updatedPlayer);
  }
}
