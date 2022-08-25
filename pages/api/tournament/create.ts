import prisma from "../../../lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

type Tournament = {
  name: string;
  start: Date;
  end: Date;
  registrationStart: Date;
  registrationEnd: Date;
};

export default async function create(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const tournament: Tournament = JSON.parse(req.body);

    const result = await prisma.tournament.create({
      data: {
        name: tournament.name,
        start: tournament.start,
        end: tournament.end,
        registrationStart: tournament.registrationStart,
        registrationEnd: tournament.registrationEnd
      }
    });
    res.status(201).end();
  }
}
