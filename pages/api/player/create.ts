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
    glasses?: string
    other?: string
    calendar?: object
    title: "noTitle" | "KK" | "MM" | "TT"
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
            glasses: playerData.glasses,
            other: playerData.other,
            calendar: playerData.calendar,
            title: playerData.title
        }
      });
      res.status(201).send(result);
  }
  