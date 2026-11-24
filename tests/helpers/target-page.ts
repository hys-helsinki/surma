import { expect, type Page } from "@playwright/test";
import type { Player, PlayerState, Tournament, User } from "@prisma/client";
import { prisma } from "./db";
import { createPlayer, createRing } from "./factories";
import { setTournamentPhase } from "./navigation";
import {
  buildCalendar,
  calendarDay,
  expectShownDates,
  tournamentDates,
  tournamentTimes,
  type CalendarData
} from "./calendar";

/**
 * Puts the tournament in progress and gives the hunter a target with a full
 * description and contact details, so the tests can check that the contact
 * details are *not* shown. The hunter's state is set to `hunterState`.
 */
export const setupHunterWithTarget = async (
  tournament: Pick<Tournament, "id">,
  hunter: Pick<Player, "id">,
  hunterState: PlayerState = "ACTIVE"
): Promise<Player & { user: User }> => {
  await setTournamentPhase(tournament, "running");
  await prisma.player.update({
    where: { id: hunter.id },
    data: { state: hunterState }
  });
  const target = await createPlayer(tournament.id, {
    user: {
      firstName: "Kalle",
      lastName: "Kohde",
      phone: "050 987 6543"
    },
    address: "Kohdekuja 7, Vantaa",
    learningInstitution: "Taideyliopisto",
    eyeColor: "Ruskeat",
    hair: "Kalju",
    height: "165 cm",
    other: "Juoksee aamuisin Töölönlahdella",
    safetyNotes: "Ei pelata kirjastossa"
  });
  await createRing(tournament.id, [hunter, target]);
  return target;
};

/**
 * Makes the tournament a one-week tournament that started yesterday (so it is
 * running and the whole calendar fits on one page) and fills the target's
 * calendar with "Kohteen päivä N" entries. Returns the tournament's dates.
 */
export const giveTargetCalendar = async (
  tournament: Pick<Tournament, "id">,
  target: Pick<Player, "id">
): Promise<{ dates: string[]; calendar: CalendarData }> => {
  const times = tournamentTimes(-1, 7);
  await prisma.tournament.update({ where: { id: tournament.id }, data: times });
  const dates = tournamentDates(times.startTime, times.endTime);
  const calendar = buildCalendar(dates, (i) => `Kohteen päivä ${i + 1}`);
  await prisma.player.update({ where: { id: target.id }, data: { calendar } });
  return { dates, calendar };
};

/** Asserts that the calendar shows every day of `calendar` with its content. */
export const expectCalendarShown = async (
  page: Page,
  calendar: CalendarData
) => {
  await expectShownDates(
    page,
    calendar.map(([date]) => date)
  );
  for (const [date, content] of calendar) {
    await expect(calendarDay(page, date)).toContainText(content);
  }
};

/** Names of every button that would let the viewer change the player's data. */
const EDIT_BUTTONS = [
  "Muokkaa tietoja",
  "Muokkaa kalenteria",
  "Tallenna",
  "Tallenna muokkaukset",
  "Lisää kuva",
  "Vaihda kuva"
];

/** Asserts that none of the edit/upload buttons are on the page. */
export const expectNoEditButtons = async (page: Page) => {
  for (const name of EDIT_BUTTONS) {
    await expect(
      page.getByRole("button", { name, exact: true }),
      `"${name}" button should not be shown`
    ).toHaveCount(0);
  }
};

/**
 * Asserts that the target's phone number and email are neither shown nor
 * included anywhere in the page's HTML (including the __NEXT_DATA__ props).
 */
export const expectNoContactDetails = async (
  page: Page,
  target: Player & { user: User }
) => {
  await expect(page.getByText("Puhelinnumero:")).toHaveCount(0);
  await expect(page.getByText("Sähköpostiosoite:")).toHaveCount(0);
  await expect(page.getByText(target.user.phone)).toHaveCount(0);
  await expect(page.getByText(target.user.email)).toHaveCount(0);

  const html = await page.content();
  expect(html).not.toContain(target.user.phone);
  expect(html).not.toContain(target.user.email);
};

export const aliasHeading = (page: Page, alias: string) =>
  page.getByRole("heading", { name: `Peitenimi: ${alias}` });

/** Asserts that the target's alias is not shown nor sent to the browser. */
export const expectNoAlias = async (page: Page, alias: string) => {
  await expect(page.getByText("Peitenimi:")).toHaveCount(0);
  expect(await page.content()).not.toContain(alias);
};
