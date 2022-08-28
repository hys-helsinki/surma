import prisma from "../../../lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function rings(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    console.log("bäkkäri ok");
    const ring = JSON.parse(req.body);
    const result = await prisma.assignmentRing.create({
      data: {
        name: ring.name,
        tournamentId: ring.tournament
      }
    });
    console.log(result.id);
    const r = ring.assignments.map((a) => {
      return { ...a, ringId: result.id };
    });
    const assignmentResult = await prisma.assignment.createMany({
      data: r
    });
    res.status(201).end();
  }
}
