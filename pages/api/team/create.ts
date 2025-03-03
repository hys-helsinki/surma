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

    const team = await prisma.team.create({
      data: {
        tournament: { connect: { id: tournamentId } },
        name: teamName,
        users: {
          createMany: {
            data: users
          }
        }
      },
      include: {
        users: true
      }
    });

    res.json(team);
  }
}
