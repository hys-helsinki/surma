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
  if (req.method === "POST") {
    const locale = (req.query.locale as string) || "fi";
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

      if (!user) return res.status(400).json({ message: "user not found" });

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

      const emailTitleFi = `Kiitos ilmoittautumisestasi salamurhaturnaukseen ${user.tournament.name}!`;
      const emailBodyFi = `Kiitos ilmoittautumisestasi! Tuomaristo tarkistaa tietosi vielä ennen pelin alkua, ja saat sähköpostitse vahvistusviestin, kun ilmoittautumisesi on hyväksytty. Tuomaristo ottaa erikseen yhteyttä, mikäli antamiasi tietoja pitää täydentää tai muokata.\n\nTämä on automaattinen vahvistusviesti. Älä vastaa tähän viestiin. Tuomaristo vastaa peliin liittyviin viesteihin osoitteessa tuomaristo@salamurhaajat.net.`;

      const emailTitleEn = `Thank you for registering for the ${user.tournament.name} assassination tournament!`;
      const emailBodyEn = `Thank you for registering! The umpires will review your information before the game starts, and you will receive a confirmation email once your registration has been accepted. The umpires will contact you separately if any of the information you provided needs to be supplemented or modified.\n\nThis is an automatic confirmation message. Please do not reply to this message. The umpires answers messages related to the game at tuomaristo@salamurhaajat.net`;

      await sendEmail(
        "surma@salamurhaajat.net",
        user.email,
        locale === "fi" ? emailTitleFi : emailTitleEn,
        locale === "fi" ? emailBodyFi : emailBodyEn
      );

      res.status(200).json({ player: createdPlayer });
    } catch (e) {
      console.log(e);
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        res.status(400).json({ message: "invalid data" });
      } else {
        res
          .status(500)
          .json({ message: e instanceof Error ? e.message : "unknown error" });
      }
    }
  }
}
