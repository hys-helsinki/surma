import prisma from "../../../lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function rings(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "DELETE") {
    const assignmentId = req.body;
    const deletedRing = await prisma.assignment.delete({
      where: {
        id: assignmentId
      }
    });
    res.status(200).end();
  } else if (req.method === "POST") {
    const newAssignment = JSON.parse(req.body);
    const savedAssigment = await prisma.assignment.create({
      data: newAssignment
    });
    res.json(savedAssigment);
  }
}
