import prisma from "../../../lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import sendEmail from "../../../lib/ses_mailer";

export default async function create(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const playerData = JSON.parse(req.body);
    const result = await prisma.user.create({
      data: {
        firstName: playerData.firstName,
        lastName: playerData.lastName,
        phone: playerData.phone,
        email: playerData.email,
        tournament: { connect: { id: playerData.tournamentId } },
        player: {
          create: {
            tournament: { connect: { id: playerData.tournamentId } },
            alias: playerData.alias,
            address: playerData.address,
            learningInstitution: playerData.learningInstitution,
            eyeColor: playerData.eyeColor,
            hair: playerData.hair,
            height: playerData.height,
            glasses: playerData.glasses,
            other: playerData.other,
            calendar: playerData.calendar
          }
        }
      }
    });
    sendEmail(
      "tuomaristo@salamurhaajat.net",
      playerData.email,
      "Kiitos ilmoittautumisesta!",
      "Kiitos ilmoittautumisestasi! Tuomaristo tarkastaa sen lähiaikoina."
    );
    res.status(201).json(result);
  }
}
