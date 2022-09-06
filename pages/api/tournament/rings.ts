import prisma from "../../../lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function rings(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const newRing = JSON.parse(req.body);
    const savedRing = await prisma.assignmentRing.create({
      data: {
        name: newRing.name,
        tournamentId: newRing.tournament
      }
    });
    const r = newRing.assignments.map((a) => {
      return { ...a, ringId: savedRing.id };
    });
    const assignmentResult = await prisma.assignment.createMany({
      data: r
    });
    res.status(201).end();
  }
}
