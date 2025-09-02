import prisma from "../../../../lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import { authConfig } from "../../auth/[...nextauth]";
import { FeatureFlag } from "../../../../lib/constants";

const updateTeamGameRings = async (killedPlayerId: string) => {
  // Nämä tehdään jos kyseessä joukkueturnaus
  if (FeatureFlag.DELETE_DEAD_HUNTER_ASSIGNMENTS) {
    // Käytössä featureflag, koska vuoden 2025 joukkueturnauksessa oli käytössä erikoissääntö jossa kohteita ei heti poisteta kuolleilta pelaajilta.
    // Sääntö oli toimiva, joten jätetään featureflag toistaiseksi.

    await prisma.assignment.deleteMany({
      where: {
        OR: [
          {
            hunterId: killedPlayerId
          },
          {
            targetId: killedPlayerId
          }
        ]
      }
    });
  } else {
    // Poistetaan joka tapauksessa pelaaja metsästäjien kohteista, koska muuten toimeksiannot pitää itse klikkailla pois kannasta.
    // Ideana kuitenkin on, ettei kuollutta pelaajaa jahtaa enää kukaan.
    await prisma.assignment.deleteMany({
      where: {
        targetId: killedPlayerId
      }
    });
  }
};

const updateSoloGameRings = async (killedPlayerId: string) => {
  // Tehdään vain yksilöturnauksissa, koska muuten menee hankalaksi
  const rings = await prisma.assignmentRing.findMany({
    include: { assignments: true }
  });

  let newAssignments = [];

  rings.forEach((ring) => {
    // Tehdään oletus, että yhdessä ringissä pelaaja jahtaa vain yhtä kohdetta ja hänellä on vain yksi metsästäjä
    const killedPlayerAsTarget = ring.assignments.find(
      (a) => a.targetId === killedPlayerId
    );
    const killedPlayerAsHunter = ring.assignments.find(
      (a) => a.hunterId === killedPlayerId
    );
    if (
      killedPlayerAsHunter &&
      killedPlayerAsTarget &&
      killedPlayerAsTarget.hunterId !== killedPlayerAsHunter.targetId // Jotta rinkiin ei tule toimeksiantoja, joissa pelaaja jahtaa itseään
    ) {
      newAssignments.push({
        hunterId: killedPlayerAsTarget.hunterId,
        targetId: killedPlayerAsHunter.targetId,
        ringId: ring.id
      });
    }
  });

  await prisma.assignment.createMany({
    data: newAssignments
  });

  await prisma.assignment.deleteMany({
    where: {
      OR: [
        {
          hunterId: killedPlayerId
        },
        {
          targetId: killedPlayerId
        }
      ]
    }
  });
};

const isCurrentUserAuthorized = async (playerId, req, res) => {
  const session = await unstable_getServerSession(req, res, authConfig);

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
    const { state, teamGame } = JSON.parse(req.body);

    if (state === "DEAD") {
      if (teamGame) {
        updateTeamGameRings(playerId);
      } else {
        updateSoloGameRings(playerId);
      }
    }

    await prisma.player.update({
      where: { id: playerId },
      data: { state }
    });

    const updatedPlayerList = await prisma.player.findMany({
      include: {
        user: true,
        team: true,
        targets: true
      }
    });
    const rings = await prisma.assignmentRing.findMany({
      include: { assignments: true }
    });
    res.json({ updatedPlayerList, rings });
  }
}
