import prisma from "../../../lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import sendEmail from "../../../lib/ses_mailer";
import { Prisma } from "@prisma/client";

export default async function create(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const teamData = JSON.parse(req.body);
    const { teamName, users, tournamentId } = teamData;

    try {
      const tournament = await prisma.tournament.findFirst({
        where: {
          id: tournamentId
        }
      });

      const team = await prisma.team.create({
        data: {
          tournament: { connect: { id: tournamentId } },
          name: teamName,
          users: {
            createMany: {
              data: users.map((user) => {
                return { ...user, email: user.email.toLowerCase() }; // normalize user email for next-auth
              })
            }
          }
        },
        include: {
          users: true
        }
      });

      try {
        const emailContent = `Joukkueen nimi: ${
          team.name
        }\nPelaajat: ${team.users.map(
          (user) =>
            `\n${user.firstName} ${user.lastName}\n(${process.env.BASE_URL}/tournaments/${tournamentId}/users/${user.id})`
        )}`;

        sendEmail(
          "surma@salamurhaajat.net",
          "tuomaristo@salamurhaajat.net",
          `${tournament.name}: Uusi ilmoittautuminen (${teamData.teamName})`,
          emailContent
        );
      } catch (e) {
        console.log("Sending email for umpires failed");
        console.log(e);
      }
      try {
        const emailContent = `
          Tervetuloa mukaan Helsingin yliopiston salamurhaajien turnaukseen ${
            tournament.name
          }! Voit nyt kirjautua Surmaan sähköpostilla, johon tämä viesti tuli, ja täyttää loput pelaajakohtaiset tietosi. Alla vielä kertauksena joukkueesi tiedot\n\n
          Joukkueesi nimi: ${team.name}\n
          Pelaajat: ${team.users.map(
            (user) => `\n${user.firstName} ${user.lastName}\n`
          )}\n
          Tämä on automaattinen vahvistusviesti. Älä vastaa tähän viestiin. Tuomaristo vastaa peliin liittyviin viesteihin osoitteessa tuomaristo@salamurhaajat.net.
        `;

        team.users
          .map((u) => u.email)
          .forEach((email) => {
            sendEmail(
              "surma@salamurhaajat.net",
              email,
              `Vahvistusviesti ilmoittautumisesta`,
              emailContent
            );
          });
      } catch (e) {
        console.log("Sending confirmation email for players failed");
        console.log(e);
      }

      res.status(200).json(team);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        res.status(400).json({ message: e, code: e.code });
      } else {
        res.status(500).json({ message: e });
      }
    }
  }
}
