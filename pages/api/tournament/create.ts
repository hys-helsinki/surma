import prisma from "../../../lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authConfig } from "../auth/[...nextauth]";
import { Prisma } from "@prisma/client";

const isCurrentUserAuthorized = async (req, res) => {
  const session = await getServerSession(req, res, authConfig);

  if (!session) return false;

  const currentUser = await prisma.user.findFirst({
    where: {
      id: session.user.id,
      role: "ADMIN"
    }
  });
  return !!currentUser;
};

export default async function create(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).end();
    return;
  }
  if (!(await isCurrentUserAuthorized(req, res))) {
    console.log("Unauthorized tournament creation attempt!");
    res.status(403).end();
    return;
  }

  const { tournament, umpires } = JSON.parse(req.body);

  try {
    const { createdTournament, umpireUsers } = await prisma.$transaction(
      async (tx) => {
        const createdTournament = await tx.tournament.create({
          data: tournament
        });

        const umpireUsers = await Promise.all(
          (Array.isArray(umpires) ? umpires : []).map((u) =>
            tx.umpire.create({
              data: {
                responsibility: u.responsibility,
                mainUmpire: u.mainUmpire,
                tournament: { connect: { id: createdTournament.id } },
                user: {
                  create: {
                    tournament: { connect: { id: createdTournament.id } },
                    firstName: u.firstName,
                    lastName: u.lastName,
                    email: u.email.toLowerCase(),
                    phone: u.phone,
                    role: "USER"
                  }
                }
              },
              include: {
                user: true
              }
            })
          )
        );

        return { createdTournament, umpireUsers };
      }
    );

    res.status(201).json({ createdTournament, umpireUsers });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      res.status(409).json({ message: "Email already exists" });
      return;
    }
    console.log(e);
    res
      .status(500)
      .json({ message: e instanceof Error ? e.message : "Unknown error" });
  }
}
