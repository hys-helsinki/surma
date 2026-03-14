import prisma from "../../../../lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authConfig } from "../../auth/[...nextauth]";
import sendEmail from "../../../../lib/ses_mailer";

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
  if (!(await isCurrentUserAuthorized(req.query.id, req, res))) {
    return res.status(403).send("Unauthorized");
  }
  if (req.method === "PATCH") {
    const playerId = req.query.id as string;
    const { confirmed } = JSON.parse(req.body);

    const player = await prisma.player.findFirst({
      where: {
        id: playerId
      },
      include: {
        user: true,
        tournament: true
      }
    });

    const result = await prisma.player.update({
      where: { id: playerId },
      data: { confirmed }
    });
    sendEmail(
      "surma@salamurhaajat.net",
      player.user.email,
      `Ilmoittautumisesi on nyt vahvistettu!`,
      `Tervetuloa mukaan Helsingin Yliopiston Salamurhaajien turnaukseen ${player.tournament.name}! Tuomaristo on tarkistanut ilmoittautumisesi ja vahvistanut sen.\n\nTämä on automaattinen vahvistusviesti. Älä vastaa tähän viestiin. Tuomaristo vastaa peliin liittyviin viesteihin osoitteessa tuomaristo@salamurhaajat.net.`
    );
    return res.status(200).send(result);
  }
}
