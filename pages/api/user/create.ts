import prisma from "../../../lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import sendEmail from "../../../lib/ses_mailer";

export default async function create(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const playerData = JSON.parse(req.body);
    const tournament = await prisma.tournament.findFirst({
      where: {
        id: {
          equals: playerData.tournamentId
        }
      }
    });
    const user = await prisma.user.create({
      data: {
        firstName: playerData.firstName,
        lastName: playerData.lastName,
        email: playerData.email.toLowerCase(), // normalize user email for next-auth
        phone: playerData.phone,
        tournament: { connect: { id: playerData.tournamentId } }
      }
    });

    const playerUrl = `${process.env.BASE_URL}/tournaments/${playerData.tournamentId}/users/${user.id}`;
    sendEmail(
      "surma@salamurhaajat.net",
      "tuomaristo@salamurhaajat.net",
      `${tournament.name}: Uusi ilmoittautuminen (${user.firstName} ${user.lastName})`,
      `${user.firstName} ${user.lastName} ilmoittautui mukaan turnaukseen ${tournament.name}.\n\n${playerUrl}`
    );
    res.status(201).send(user);
  }
}
