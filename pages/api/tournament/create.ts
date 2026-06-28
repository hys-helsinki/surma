import prisma from "../../../lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authConfig } from "../auth/[...nextauth]";
import { Prisma } from "@prisma/client";

const isCurrentUserAuthorized = async (req, res) => {
  const session = await getServerSession(req, res, authConfig);

  const currentUser = await prisma.user.findUnique({
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
  if (!(await isCurrentUserAuthorized(req, res))) {
    console.log("Unauthorized tournament creation attempt!");
    return res.status(403).end();
  }
  if (req.method === "POST") {
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
                  mainUmpire: u.isMainUmpire,
                  tournament: { connect: { id: createdTournament.id } },
                  user: {
                    create: {
                      tournament: { connect: { id: createdTournament.id } },
                      firstName: u.firstName,
                      lastName: u.lastName,
                      email: u.email,
                      phone: u.phone,
                      role: "USER"
                    }
                  }
                }
              })
            )
          );

          return { createdTournament, umpireUsers };
        }
      );

      return res.status(201).json({ createdTournament, umpireUsers });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2002") {
          res.status(409).json({ message: "Email already exists" });
        } else {
          console.log(e);
          res.status(500).json({ message: e.message });
        }
      } else {
        console.log(e);
        res
          .status(500)
          .json({ message: e instanceof Error ? e.message : "Unknown error" });
      }
    }
  }
}
