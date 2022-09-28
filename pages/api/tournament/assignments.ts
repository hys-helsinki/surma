import prisma from "../../../lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function rings(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "DELETE") {
    const assignmentId = req.body;
    const deletedAssignment = await prisma.assignment.delete({
      where: {
        id: assignmentId
      }
    });
    const updatedRing = await prisma.assignmentRing.findUnique({
      where: {
        id: deletedAssignment.ringId
      },
      include: {
        assignments: true
      }
    });
    res.json(updatedRing);
  } else if (req.method === "POST") {
    const newAssignment = JSON.parse(req.body);
    const savedAssigment = await prisma.assignment.create({
      data: newAssignment
    });

    const updatedRing = await prisma.assignmentRing.findUnique({
      where: {
        id: savedAssigment.ringId
      },
      include: {
        assignments: true
      }
    });
    res.json(updatedRing);
  }
}
