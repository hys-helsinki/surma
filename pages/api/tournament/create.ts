import prisma from "../../../lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

type Tournament = {
  name: string;
  startTime: Date;
  endTime: Date;
  registrationStartTime: Date;
  registrationEndTime: Date;
};

export default async function create(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const tournament: Tournament = JSON.parse(req.body);

    const result = await prisma.tournament.create({
      data: tournament
    });
    res.status(201).end();
  }
}
