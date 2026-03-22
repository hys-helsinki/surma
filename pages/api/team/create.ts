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

      if (!tournament)
        return res.status(400).json({ message: "Tournament not found" });

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

      const emailContent = `Joukkueen nimi: ${
        team.name
      }\nPelaajat: ${team.users.map(
        (user) =>
          `\n${user.firstName} ${user.lastName}\n(${process.env.BASE_URL}/tournaments/${tournamentId}/users/${user.id})`
      )}`;

      await sendEmail(
        "surma@salamurhaajat.net",
        "tuomaristo@salamurhaajat.net",
        `${tournament.name}: Uusi ilmoittautuminen (${teamData.teamName})`,
        emailContent
      );

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
          .forEach(async (email) => {
            await sendEmail(
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
        if (e.code === "P2002") {
          res.status(409).json({ message: "Email already exists" });
        } else {
          res.status(500).json({ message: e.message });
        }
      } else {
        res
          .status(500)
          .json({ message: e instanceof Error ? e.message : "Unknown error" });
      }
    }
  }
}
