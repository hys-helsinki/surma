import prisma from "../../../lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import { authConfig } from "../auth/[...nextauth]";

const isCurrentUserAuthorized = async (tournamentId, req, res) => {
  const session = await unstable_getServerSession(req, res, authConfig);

  const umpire = await prisma.umpire.findFirst({
    where: {
      userId: session.user.id,
      tournamentId: tournamentId
    }
  });
  return umpire;
};

export default async function rings(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const newRing = JSON.parse(req.body);
    // TODO make a dynamic route to supply tournament id as path parameter and move this before method check
    if (!isCurrentUserAuthorized(newRing.tournament, req, res)) {
      res.status(403).end();
    }
    const savedRing = await prisma.assignmentRing.create({
      data: {
        name: newRing.name,
        tournamentId: newRing.tournament
      }
    });
    const newAssignments = newRing.assignments.map((a) => {
      return { ...a, ringId: savedRing.id };
    });
    const assignmentResult = await prisma.assignment.createMany({
      data: newAssignments
    });
    res.status(201).end();
  }
}
