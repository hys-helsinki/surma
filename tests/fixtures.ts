import { test as base, expect, type Page } from "@playwright/test";
import type { Player, Prisma, Tournament, User } from "@prisma/client";
import { prisma } from "./helpers/db";
import { loginAs as loginContextAs } from "./helpers/auth";
import {
  createPlayer,
  createTournament as createTournamentRow,
  createUser as createUserRow,
  makeUmpire,
  type CreateUserOptions
} from "./helpers/factories";

type Fixtures = {
  /** Test database client. */
  prisma: typeof prisma;
  /** Creates a user; deleted automatically after the test. */
  createUser: (options?: CreateUserOptions) => Promise<User>;
  /** Creates a tournament; deleted (with its users/players) after the test. */
  createTournament: (
    data?: Partial<Prisma.TournamentCreateInput>
  ) => Promise<Tournament>;
  /** Logs the test's browser context in as the given user. */
  loginAs: (user: Pick<User, "id">) => Promise<void>;

  /** A regular user (role USER) without a tournament. */
  user: User;
  /** A user with role ADMIN. */
  admin: User;
  /** A tournament with an umpire user attached. */
  umpireSetup: { tournament: Tournament; umpire: User };
  /** A tournament with one registered player (with a full description). */
  playerSetup: { tournament: Tournament; player: Player & { user: User } };

  /** `page` logged in as `user`. */
  userPage: Page;
  /** `page` logged in as `admin`. */
  adminPage: Page;
  /** `page` logged in as `umpireSetup.umpire`. */
  umpirePage: Page;
  /** `page` logged in as `playerSetup.player.user`. */
  playerPage: Page;

  /** Runs automatically: blocks browser requests to external services. */
  blockExternalServices: void;
};

export const test = base.extend<Fixtures>({
  blockExternalServices: [
    async ({ context }, use) => {
      // Upload widget, image CDN and API all live under *.cloudinary.com.
      // Tests that need images can override this with a more specific
      // context.route()/page.route() that fulfills with a fake response.
      await context.route(/^https:\/\/([^/]+\.)?cloudinary\.com\//, (route) =>
        route.abort("blockedbyclient")
      );
      await use();
    },
    { auto: true }
  ],

  prisma: async ({}, use) => {
    await use(prisma);
  },

  createUser: async ({}, use) => {
    const ids: string[] = [];
    await use(async (options) => {
      const user = await createUserRow(options);
      ids.push(user.id);
      return user;
    });
    // Sessions, players and umpire rows cascade on user delete.
    await prisma.user.deleteMany({ where: { id: { in: ids } } });
  },

  createTournament: async ({}, use) => {
    const ids: string[] = [];
    await use(async (data) => {
      const tournament = await createTournamentRow(data);
      ids.push(tournament.id);
      return tournament;
    });
    await prisma.tournament.deleteMany({ where: { id: { in: ids } } });
  },

  loginAs: async ({ context, baseURL }, use) => {
    await use((user) => loginContextAs(context, user.id, baseURL));
  },

  user: async ({ createUser }, use) => {
    await use(await createUser());
  },

  admin: async ({ createUser }, use) => {
    await use(await createUser({ role: "ADMIN", firstName: "Admin" }));
  },

  umpireSetup: async ({ createUser, createTournament }, use) => {
    const tournament = await createTournament();
    const umpire = await createUser({
      firstName: "Tuomari",
      tournamentId: tournament.id
    });
    await makeUmpire(umpire.id, tournament.id, { mainUmpire: true });
    await use({ tournament, umpire });
  },

  playerSetup: async ({ createTournament }, use) => {
    const tournament = await createTournament();
    // The player's user belongs to the tournament, so it is deleted with it.
    const player = await createPlayer(tournament.id, {
      user: {
        firstName: "Pekka",
        lastName: "Pelaaja",
        phone: "040 123 4567"
      },
      address: "Testikatu 1, Helsinki",
      learningInstitution: "Helsingin yliopisto",
      eyeColor: "Siniset",
      hair: "Lyhyet ja ruskeat",
      height: "180 cm",
      other: "Kulkee punaisella polkupyörällä",
      safetyNotes: "Ei pelata kotona"
    });
    await use({ tournament, player });
  },

  userPage: async ({ page, user, loginAs }, use) => {
    await loginAs(user);
    await use(page);
  },

  adminPage: async ({ page, admin, loginAs }, use) => {
    await loginAs(admin);
    await use(page);
  },

  umpirePage: async ({ page, umpireSetup, loginAs }, use) => {
    await loginAs(umpireSetup.umpire);
    await use(page);
  },

  playerPage: async ({ page, playerSetup, loginAs }, use) => {
    await loginAs(playerSetup.player.user);
    await use(page);
  }
});

export { expect };
