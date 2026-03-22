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
  const newTeamAssignments = JSON.parse(req.body);
  if (
    !(await isCreateAuthorized(
      newTeamAssignments[0].teamAssignmentRingId,
      req,
      res
    ))
  ) {
    console.log("Unauthorized assignment create attempt!");
    return res.status(403).end();
  }
  const savedTeamAssignments = await prisma.teamAssignment.createManyAndReturn({
    data: newTeamAssignments
  });

  const assignment = await prisma.assignment.findFirst({
    where: {
      teamAssignmentRingId: savedTeamAssignments[0].teamAssignmentRingId
    }
  });

  const teams = await prisma.team.findMany({
    include: {
      players: true
    }
  });

  let playerAssignments = [];

  savedTeamAssignments.forEach((savedTeamAssignment) => {
    const hunterPlayers = teams.find(
      (team) => team.id === savedTeamAssignment.huntingTeamId
    )?.players;

    const targetPlayers = teams
      .find((team) => team.id === savedTeamAssignment.targetTeamId)
      ?.players.filter((player) => player.state === "ACTIVE");

    hunterPlayers.forEach((hunter) => {
      targetPlayers.forEach((target) => {
        playerAssignments.push({
          hunterId: hunter.id,
          targetId: target.id,
          teamAssignmentRingId: savedTeamAssignment.teamAssignmentRingId,
          ringId: assignment.ringId
        });
      });
    });
  });

  await prisma.assignment.createMany({
    data: playerAssignments
  });

  const updatedPlayers = await prisma.player.findMany({
    include: {
      user: true,
      targets: true,
      team: true
    }
  });

  const playerRings = await prisma.assignmentRing.findMany({
    where: {
      assignments: {
        some: {}
      }
    },
    include: {
      assignments: true
    }
  });

  res.json({ savedTeamAssignments, players: updatedPlayers, playerRings });
}
