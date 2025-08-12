import prisma from "../../../lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authConfig } from "../auth/[...nextauth]";

type Tournament = {
  name: string;
  startTime: Date;
  endTime: Date;
  registrationStartTime: Date;
  registrationEndTime: Date;
};

const isCurrentUserAuthorized = async (req, res) => {
  const session = await getServerSession(req, res, authConfig);

  const currentUser = await prisma.user.findUnique({
    where: {
      id: session.user.id
    }
  });
  return false; // TODO tarvitsee turnauksen luontiin kykenevän oman käyttäjäluokan
};

export default async function create(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!(await isCurrentUserAuthorized(req, res))) {
    console.log("Unauthorized tournament creation attempt!");
    res.status(403).end();
  }
  if (req.method === "POST") {
    const tournament: Tournament = JSON.parse(req.body);

    const result = await prisma.tournament.create({
      data: tournament
    });
    res.status(201).end();
  }
}
