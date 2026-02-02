import { PlayerTitle } from "../../../lib/constants";
import prisma from "../../../lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import sendEmail from "../../../lib/ses_mailer";
import { Prisma } from "@prisma/client";

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
  try {
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

    const team = user.teamId ? { connect: { id: user.teamId } } : {};

    const createdPlayer = await prisma.player.create({
      data: {
        user: { connect: { id: playerData.userId } },
        tournament: { connect: { id: playerData.tournamentId } },
        alias: playerData.alias,
        address: playerData.address,
        learningInstitution: playerData.learningInstitution,
        eyeColor: playerData.eyeColor,
        hair: playerData.hair,
        height: playerData.height,
        other: playerData.other,
        safetyNotes: playerData.safetyNotes,
        calendar: playerData.calendar,
        title: playerData.title,
        lastVisit: new Date(),
        team
      }
    });

    try {
      sendEmail(
        "surma@salamurhaajat.net",
        user.email,
        `Kiitos ilmoittautumisestasi salamurhaturnaukseen ${user.tournament.name}!`,
        `Kiitos ilmoittautumisestasi! Tuomaristo tarkistaa tietosi vielä ennen pelin alkua, ja saat sähköpostitse vahvistusviestin, kun ilmoittautumisesi on hyväksytty. Tuomaristo ottaa erikseen yhteyttä, mikäli antamiasi tietoja pitää täydentää tai muokata.\n\nTämä on automaattinen vahvistusviesti. Älä vastaa tähän viestiin. Tuomaristo vastaa peliin liittyviin viesteihin osoitteessa tuomaristo@salamurhaajat.net.`
      );
    } catch (e) {
      console.log("sending confirmation email for player registration failed");
      console.log(e);
    }

    res.status(200).json({ player: createdPlayer });
  } catch (e) {
    console.log(e);
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      res.status(400).json({ message: "invalid data" });
    } else {
      res.status(500).json({ message: e });
    }
  }
}
