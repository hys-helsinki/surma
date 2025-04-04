import prisma from "../../../lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import sendEmail from "../../../lib/ses_mailer";

export default async function create(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const teamData = JSON.parse(req.body);
    const { teamName, users, tournamentId } = teamData;

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

    const emailContent = `Joukkueen nimi: ${
      teamData.teamName
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

    res.json(team);
  }
}
