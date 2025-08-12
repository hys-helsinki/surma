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

const isCreateAuthorized = async (ringId, req, res) => {
  const ring = await prisma.teamAssignmentRing.findUnique({
    where: {
      id: ringId
    }
  });
  return isCurrentUserAuthorized(ring.tournamentId, req, res);
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const newTeamAssignment = JSON.parse(req.body);
  if (
    !(await isCreateAuthorized(
      newTeamAssignment.teamAssignmentRingId,
      req,
      res
    ))
  ) {
    console.log("Unauthorized assigment create attempt!");
    res.status(403).end();
  }
  const savedTeamAssigment = await prisma.teamAssignment.create({
    data: newTeamAssignment
  });

  const assignment = await prisma.assignment.findFirst({
    where: {
      teamAssignmentRingId: savedTeamAssigment.teamAssignmentRingId
    }
  });

  const teams = await prisma.team.findMany({
    include: {
      players: true
    }
  });

  let playerAssignments = [];

  const hunterPlayers = teams.find(
    (team) => team.id === savedTeamAssigment.huntingTeamId
  ).players;

  const targetPlayers = teams.find(
    (team) => team.id === savedTeamAssigment.targetTeamId
  ).players;

  hunterPlayers.forEach((hunter) => {
    targetPlayers.forEach((target) => {
      playerAssignments.push({
        hunterId: hunter.id,
        targetId: target.id,
        teamAssignmentRingId: savedTeamAssigment.teamAssignmentRingId,
        ringId: assignment.ringId
      });
    });
  });

  await prisma.assignment.createMany({
    data: playerAssignments
  });

  res.json(savedTeamAssigment);
}
