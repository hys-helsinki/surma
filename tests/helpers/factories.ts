import { randomUUID } from "crypto";
import type {
  AssignmentRing,
  Player,
  Prisma,
  Team,
  Tournament,
  User,
  UserRole
} from "@prisma/client";
import { prisma } from "./db";

/**
 * Small helpers for creating test data directly in the test database.
 *
 * Every helper generates unique names/emails, so tests can run in parallel
 * without interfering with each other. Cleanup: everything that belongs to a
 * tournament (users with `tournamentId`, players, teams, umpires, rings)
 * cascades when the tournament is deleted; sessions/players/umpires also
 * cascade when their user is deleted. The fixtures in tests/fixtures.ts
 * track and delete the tournaments and users they create.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

const shortId = () => randomUUID().slice(0, 8);

/** Creates a tournament with registration currently open, starting in a week. */
export const createTournament = async (
  data: Partial<Prisma.TournamentCreateInput> = {}
): Promise<Tournament> => {
  const now = Date.now();
  return prisma.tournament.create({
    data: {
      name: `E2E-turnaus ${shortId()}`,
      registrationStartTime: new Date(now - DAY_MS),
      registrationEndTime: new Date(now + 6 * DAY_MS),
      startTime: new Date(now + 7 * DAY_MS),
      endTime: new Date(now + 14 * DAY_MS),
      ...data
    }
  });
};

export type CreateUserOptions = {
  role?: UserRole;
  tournamentId?: string;
  teamId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
};

export const createUser = async (
  options: CreateUserOptions = {}
): Promise<User> =>
  prisma.user.create({
    data: {
      firstName: options.firstName ?? "Testi",
      lastName: options.lastName ?? "Käyttäjä",
      email: options.email ?? `e2e-${randomUUID()}@example.test`,
      phone: options.phone,
      emailVerified: new Date(),
      role: options.role ?? "USER",
      tournamentId: options.tournamentId,
      teamId: options.teamId
    }
  });

export const makeUmpire = async (
  userId: string,
  tournamentId: string,
  options: { mainUmpire?: boolean; responsibility?: string } = {}
) =>
  prisma.umpire.create({
    data: {
      userId,
      tournamentId,
      mainUmpire: options.mainUmpire ?? false,
      responsibility: options.responsibility
    }
  });

export type CreatePlayerOptions = Partial<
  Omit<Prisma.PlayerUncheckedCreateInput, "userId" | "tournamentId">
> & {
  /** Existing user to attach the player to. A new user is created if omitted. */
  userId?: string;
  /** Options for the user created when `userId` is omitted. */
  user?: Omit<CreateUserOptions, "tournamentId">;
};

/**
 * Creates a registered player in the tournament (and its user, unless
 * `userId` is given). Mirrors what /api/player/create stores.
 */
export const createPlayer = async (
  tournamentId: string,
  options: CreatePlayerOptions = {}
): Promise<Player & { user: User }> => {
  const { userId: existingUserId, user: userOptions, ...playerData } = options;
  const userId =
    existingUserId ??
    (
      await createUser({
        ...userOptions,
        tournamentId,
        teamId: userOptions?.teamId ?? playerData.teamId ?? undefined
      })
    ).id;

  return prisma.player.create({
    data: {
      alias: `Alias ${shortId()}`,
      address: "Testikatu 1, Helsinki",
      lastVisit: new Date(),
      ...playerData,
      userId,
      tournamentId
    },
    include: { user: true }
  });
};

/** Creates a team in the tournament. Add members with `createPlayer(..., { teamId })`. */
export const createTeam = async (
  tournamentId: string,
  name = `E2E-tiimi ${shortId()}`
): Promise<Team> =>
  prisma.team.create({ data: { name, tournamentId } });

/**
 * Creates an assignment ring where each player hunts the next one and the
 * last hunts the first — like the rings the umpire page generates.
 */
export const createRing = async (
  tournamentId: string,
  players: Pick<Player, "id">[],
  name = `E2E-rinki ${shortId()}`
): Promise<AssignmentRing> =>
  prisma.assignmentRing.create({
    data: {
      name,
      tournamentId,
      assignments: {
        createMany: {
          data: players.map((hunter, i) => ({
            hunterId: hunter.id,
            targetId: players[(i + 1) % players.length].id
          }))
        }
      }
    }
  });
