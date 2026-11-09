import { randomUUID } from "crypto";
import type { Prisma, Tournament } from "@prisma/client";
import { prisma } from "./db";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Creates a tournament with registration currently open, starting in a week. */
export const createTournament = async (
  data: Partial<Prisma.TournamentCreateInput> = {}
): Promise<Tournament> => {
  const now = Date.now();
  return prisma.tournament.create({
    data: {
      name: `E2E-turnaus ${randomUUID().slice(0, 8)}`,
      registrationStartTime: new Date(now - DAY_MS),
      registrationEndTime: new Date(now + 6 * DAY_MS),
      startTime: new Date(now + 7 * DAY_MS),
      endTime: new Date(now + 14 * DAY_MS),
      ...data
    }
  });
};
