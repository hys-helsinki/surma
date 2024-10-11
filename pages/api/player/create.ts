import { PlayerTitle } from "../../../lib/constants";
import prisma from "../../../lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import sendEmail from "../../../lib/ses_mailer";

type PlayerFormData = {
  userId: string;
  tournamentId: string;
  alias: string;
  address: string;
  learningInstitution?: string;
  eyeColor?: string;
  hair?: string;
  height?: string;
  other?: string;
  safetyNotes?: string;
  calendar?: object;
  title?: PlayerTitle;
};

export default async function create(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const playerData: PlayerFormData = JSON.parse(req.body);
  const user = await prisma.user.findFirst({
    where: {
      id: {
        equals: playerData.userId
      }
    },
    include: {
      tournament: true
    }
  });

  const result = await prisma.player.create({
    data: {
      user: { connect: { id: playerData.userId } },
      tournament: { connect: { id: playerData.tournamentId } },
      alias: playerData.alias,
      address: playerData.address,
      learningInstitution: playerData.learningInstitution,
      eyeColor: playerData.eyeColor,
      hair: playerData.hair,
      height: parseInt(playerData.height),
      other: playerData.other,
      safetyNotes: playerData.safetyNotes,
      calendar: playerData.calendar,
      title: playerData.title
    }
  });
  sendEmail(
    "surma@salamurhaajat.net",
    user.email,
    `Kiitos ilmoittautumisestasi salamurhaturnaukseen ${user.tournament.name}!`,
    `Kiitos ilmoittautumisestasi! Tuomaristo tarkistaa ilmoittautumisesi vielä ennen pelin alkua, ja saat sähköpostitse vahvistusviestin, kun ilmoittautumisesi on hyväksytty. Tuomaristo ottaa erikseen yhteyttä, mikäli antamiasi tietoja pitää täydentää tai muokata.\n\nTämä on automaattinen vahvistusviesti. Älä vastaa tähän viestiin. Tuomaristo vastaa peliin liittyviin viesteihin osoitteessa tuomaristo@salamurhaajat.net.`
  );
  res.status(201).send(result);
}
