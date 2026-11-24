import { expect, type Page } from "@playwright/test";
import type { Player, Tournament, User } from "@prisma/client";
import { prisma } from "./db";
import { createPlayer, createRing } from "./factories";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Tournament start/end times relative to now. */
export const tournamentPhases = {
  upcoming: () => ({
    startTime: new Date(Date.now() + 7 * DAY_MS),
    endTime: new Date(Date.now() + 14 * DAY_MS)
  }),
  running: () => ({
    startTime: new Date(Date.now() - DAY_MS),
    endTime: new Date(Date.now() + 7 * DAY_MS)
  }),
  ended: () => ({
    startTime: new Date(Date.now() - 14 * DAY_MS),
    endTime: new Date(Date.now() - DAY_MS)
  })
};

export type TournamentPhase = keyof typeof tournamentPhases;

export const setTournamentPhase = (
  tournament: Pick<Tournament, "id">,
  phase: TournamentPhase
) =>
  prisma.tournament.update({
    where: { id: tournament.id },
    data: tournamentPhases[phase]()
  });

/**
 * Creates two new players in the tournament and assigns both as the hunter's
 * targets (one ring per target, so the hunter has two targets at once).
 */
export const createTargetsFor = async (
  tournamentId: string,
  hunter: Pick<Player, "id">
): Promise<(Player & { user: User })[]> => {
  const targets = [
    await createPlayer(tournamentId, {
      user: { firstName: "Kalle", lastName: "Kohde" }
    }),
    await createPlayer(tournamentId, {
      user: { firstName: "Tiina", lastName: "Toinen" }
    })
  ];
  for (const target of targets) {
    await createRing(tournamentId, [hunter, target]);
  }
  return targets;
};

/**
 * Navigates to `url` and waits until the navigation bar has received its
 * data. Returns the targets the API sent, so tests asserting that the target
 * menu is *missing* don't pass just because the data hadn't loaded yet.
 */
export const gotoAndWaitForNavbar = async (
  page: Page,
  url: string
): Promise<{ id: string }[]> => {
  const navbarResponse = page.waitForResponse(
    (response) =>
      /\/api\/user\/[^/]+\/navbar_data$/.test(new URL(response.url()).pathname) &&
      response.request().method() === "GET"
  );
  await page.goto(url);
  const response = await navbarResponse;
  expect(response.ok()).toBe(true);
  const json = await response.json();
  return json.player?.targets ?? [];
};

export const targetPageUrl = (tournamentId: string, userId: string) =>
  `/tournaments/${tournamentId}/targets/${userId}`;

export const fullName = (user: Pick<User, "firstName" | "lastName">) =>
  `${user.firstName} ${user.lastName}`;
