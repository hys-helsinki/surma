import prisma from "../../../lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

type PlayerFormData = {
    userId: string
    tournamentId: string
    alias: string
    address: string
    learningInstitution?: string
    eyeColor?: string
    hair?: string
    height?: string
    other?: string
    security?: string
    calendar?: object
    title?: "LL" | "KK" | "MM" | "TT"
}

export default async function create(
    req: NextApiRequest,
    res: NextApiResponse
  ) {
      const playerData: PlayerFormData = JSON.parse(req.body);
      const result = await prisma.player.create({
        data: {
            user: { connect: { id: playerData.userId } },
            tournament: { connect: { id: playerData.tournamentId } },
            alias: playerData.alias,
            address: playerData.address,
            learningInstitution: playerData.learningInstitution,
            eyeColor: playerData.eyeColor,
            hair: playerData.hair,
            height: parseInt(playerData.height),
            other: playerData.other,
            security: playerData.security,
            calendar: playerData.calendar,
            title: playerData.title
        }
      });
      res.status(201).send(result);
  }
  