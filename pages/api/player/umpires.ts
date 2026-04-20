import prisma from "../../../lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authConfig } from "../auth/[...nextauth]";

const isCurrentUserAuthorized = async (tournamentId, req, res) => {
  const session = await getServerSession(req, res, authConfig);

  const umpire = await prisma.umpire.findFirst({
    where: {
      userId: session.user.id,
      tournamentId
    }
  });
  return umpire != null;
};

const assignUmpireToPlayer = async (id: string, umpireId: string) => {
  await prisma.player.update({
    where: {
      id: id
    },
    data: {
      umpireId: umpireId
    }
  });
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { values, tournamentId } = JSON.parse(req.body);

  if (!(await isCurrentUserAuthorized(tournamentId, req, res))) {
    return res.status(403).send("Unauthorized request");
  }
  if (req.method === "PATCH") {
    const noEmptyValues = Object.entries(values).filter((d) => d[1]);
    if (noEmptyValues.length === 0) return res.send("No data");

    try {
      await Promise.all(
        noEmptyValues.map(async (pair) => {
          await assignUmpireToPlayer(pair[0], pair[1] as string);
        })
      );
      return res.status(200).send("Updating players succeeded");
    } catch (error) {
      return res.status(500).send("Updating players failed");
    }
  }
}
