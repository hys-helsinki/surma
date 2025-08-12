import prisma from "../../../lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authConfig } from "../auth/[...nextauth]";

const isCurrentUserAuthorized = async (tournamentId, req, res) => {
  const session = await getServerSession(req, res, authConfig);

  const umpire = await prisma.umpire.findFirst({
    where: {
      userId: session.user.id,
      tournamentId: tournamentId
    }
  });
  return !!umpire;
};

const isDeleteAuthorized = async (assignmentId, req, res) => {
  const assignmentToDelete = await prisma.assignment.findUnique({
    where: {
      id: assignmentId
    },
    include: {
      ring: true
    }
  });
  return isCurrentUserAuthorized(
    assignmentToDelete.ring.tournamentId,
    req,
    res
  );
};

const isCreateAuthorized = async (ringId, req, res) => {
  const ring = await prisma.assignmentRing.findUnique({
    where: {
      id: ringId
    }
  });
  return isCurrentUserAuthorized(ring.tournamentId, req, res);
};

export default async function rings(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "DELETE") {
    const assignmentId = req.body;
    if (!(await isDeleteAuthorized(assignmentId, req, res))) {
      console.log("Unauthorized assigment delete attempt!");
      res.status(403).end();
    }
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
    if (!(await isCreateAuthorized(newAssignment.ringId, req, res))) {
      console.log("Unauthorized assigment create attempt!");
      res.status(403).end();
    }
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
