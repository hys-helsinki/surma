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
  return !!umpire;
};

const isCreateAuthorized = async (ringId, req, res) => {
  const ring = await prisma.teamAssignmentRing.findUnique({
    where: {
      id: ringId
    }
  });
  return isCurrentUserAuthorized(ring.tournamentId, req, res);
};

export default async function rings(req: NextApiRequest, res: NextApiResponse) {
  const newAssignment = JSON.parse(req.body);
  if (
    !(await isCreateAuthorized(newAssignment.teamAssignmentRingId, req, res))
  ) {
    console.log("Unauthorized assigment create attempt!");
    res.status(403).end();
  }
  const savedAssigment = await prisma.teamAssignment.create({
    data: newAssignment
  });

  const assignment = await prisma.assignment.findFirst({
    where: {
      teamAssignmentRingId: savedAssigment.teamAssignmentRingId
    }
  });

  const teams = await prisma.team.findMany({
    include: {
      players: true
    }
  });

  let playerAssignments = [];

  const hunterPlayers = teams.find(
    (team) => team.id === savedAssigment.huntingTeamId
  ).players;

  const targetPlayers = teams.find(
    (team) => team.id === savedAssigment.targetTeamId
  ).players;

  hunterPlayers.map((hunter) => {
    targetPlayers.map((target) => {
      playerAssignments.push({
        hunterId: hunter.id,
        targetId: target.id,
        teamAssignmentRingId: savedAssigment.teamAssignmentRingId,
        ringId: assignment.ringId
      });
    });
  });

  await prisma.assignment.createMany({
    data: playerAssignments
  });

  res.json(savedAssigment);
}
