import type { Page } from "@playwright/test";
import { test as base, expect } from "./fixtures";
import { createPlayer, makeUmpire } from "./helpers/factories";
import { playerPageUrl } from "./helpers/player-page";
import {
  buildCalendar,
  calendarDay,
  calendarField,
  expectShownDates,
  openCalendarEditor,
  saveCalendar,
  tournamentDates,
  tournamentTimes,
  type CalendarData
} from "./helpers/calendar";

type CalendarFixtures = {
  /**
   * A two-week tournament starting in a week, with a player whose calendar
   * has an entry ("Päivä N") for every day.
   */
  calendarSetup: {
    url: string;
    dates: string[];
    calendar: CalendarData;
    playerId: string;
    userId: string;
    tournamentId: string;
  };
  /** `page` logged in as the calendarSetup player. */
  calendarPage: Page;
};

const test = base.extend<CalendarFixtures>({
  calendarSetup: async ({ createTournament }, use) => {
    const times = tournamentTimes(7, 14);
    const tournament = await createTournament(times);
    const dates = tournamentDates(times.startTime, times.endTime);
    const calendar = buildCalendar(dates, (i) => `Päivä ${i + 1}`);
    const player = await createPlayer(tournament.id, { calendar });
    await use({
      url: playerPageUrl(tournament.id, player.userId),
      dates,
      calendar,
      playerId: player.id,
      userId: player.userId,
      tournamentId: tournament.id
    });
  },

  calendarPage: async ({ page, calendarSetup, loginAs }, use) => {
    await loginAs({ id: calendarSetup.userId });
    await use(page);
  }
});

test.describe("player calendar", () => {
  test("shows the first week of an upcoming tournament", async ({
    calendarPage: page,
    calendarSetup: { url, dates }
  }) => {
    await page.goto(url);

    await expectShownDates(page, dates.slice(0, 7));
    await expect(calendarDay(page, dates[0])).toContainText("Päivä 1");
    await expect(calendarDay(page, dates[6])).toContainText("Päivä 7");
    await expect(page.getByText("Päivä 8", { exact: true })).toHaveCount(0);
  });

  test("can be browsed a week at a time", async ({
    calendarPage: page,
    calendarSetup: { url, dates }
  }) => {
    await page.goto(url);
    const next = page.getByRole("button", { name: "Seuraava" });
    const previous = page.getByRole("button", { name: "Edellinen" });

    // First week: only "next".
    await expect(previous).toHaveCount(0);
    await next.click();

    // Last (second) week: only "previous".
    await expectShownDates(page, dates.slice(7, 14));
    await expect(calendarDay(page, dates[13])).toContainText("Päivä 14");
    await expect(next).toHaveCount(0);

    await previous.click();
    await expectShownDates(page, dates.slice(0, 7));
  });

  test("a partial last week shows only the remaining days", async ({
    page,
    createTournament,
    loginAs
  }) => {
    const times = tournamentTimes(7, 10);
    const tournament = await createTournament(times);
    const dates = tournamentDates(times.startTime, times.endTime);
    const player = await createPlayer(tournament.id, {
      calendar: buildCalendar(dates)
    });
    await loginAs(player.user);

    await page.goto(playerPageUrl(tournament.id, player.userId));
    await page.getByRole("button", { name: "Seuraava" }).click();
    await expectShownDates(page, dates.slice(7));
  });

  test("opens on the current week while the tournament is running", async ({
    page,
    createTournament,
    loginAs
  }) => {
    // Started 8 days ago, so today is in the second week.
    const times = tournamentTimes(-8, 15);
    const tournament = await createTournament(times);
    const dates = tournamentDates(times.startTime, times.endTime);
    const player = await createPlayer(tournament.id, {
      calendar: buildCalendar(dates)
    });
    await loginAs(player.user);

    await page.goto(playerPageUrl(tournament.id, player.userId));
    await expectShownDates(page, dates.slice(7, 14));
    await expect(page.getByRole("button", { name: "Edellinen" })).toBeVisible();
  });

  test("renders entries as Markdown", async ({
    page,
    createTournament,
    loginAs
  }) => {
    const times = tournamentTimes(7, 7);
    const tournament = await createTournament(times);
    const dates = tournamentDates(times.startTime, times.endTime);
    const calendar = buildCalendar(dates);
    calendar[0][1] = "**Luennolla** klo 10–12\nSalilla klo 18";
    const player = await createPlayer(tournament.id, { calendar });
    await loginAs(player.user);

    await page.goto(playerPageUrl(tournament.id, player.userId));
    const day = calendarDay(page, dates[0]);
    await expect(day.locator("strong")).toHaveText("Luennolla");
    // remark-breaks turns single newlines into line breaks.
    await expect(day.locator("br")).toHaveCount(1);
    await expect(day).toContainText("Salilla klo 18");
  });

  test("is not shown for a player without a calendar", async ({
    playerPage,
    playerSetup
  }) => {
    const { tournament, player } = playerSetup;
    await playerPage.goto(playerPageUrl(tournament.id, player.userId));

    await expect(
      playerPage.getByRole("heading", { name: "Pekka Pelaaja", level: 1 })
    ).toBeVisible();
    await expect(playerPage.locator(".calendar")).toHaveCount(0);
    await expect(
      playerPage.getByRole("button", { name: "Muokkaa kalenteria" })
    ).toHaveCount(0);
  });

  test("player can edit their calendar", async ({
    calendarPage: page,
    calendarSetup: { url, dates, calendar, playerId },
    prisma
  }) => {
    await page.goto(url);
    await openCalendarEditor(page);

    // The form has a field for every tournament day, prefilled.
    await expect(page.locator(".calendar textarea")).toHaveCount(dates.length);
    await expect(calendarField(page, 0)).toHaveValue("Päivä 1");
    await expect(calendarField(page, 13)).toHaveValue("Päivä 14");

    await calendarField(page, 1).fill("Töissä koko päivän");
    await calendarField(page, 9).fill("");
    await saveCalendar(page);

    // The view shows the new values right away...
    await expect(calendarDay(page, dates[1])).toContainText(
      "Töissä koko päivän"
    );
    await expect(page.getByText("Päivä 2", { exact: true })).toHaveCount(0);

    // ...only the edited days changed in the database...
    const expected = calendar.map(([date, content], i) => [
      date,
      i === 1 ? "Töissä koko päivän" : i === 9 ? "" : content
    ]);
    const saved = await prisma.player.findUniqueOrThrow({
      where: { id: playerId }
    });
    expect(saved.calendar).toEqual(expected);

    // ...and they are still there after a reload.
    await page.reload();
    await expect(calendarDay(page, dates[1])).toContainText(
      "Töissä koko päivän"
    );
    await page.getByRole("button", { name: "Seuraava" }).click();
    await expect(calendarDay(page, dates[9])).not.toContainText("Päivä 10");
  });

  test("cancelling the edit keeps the old calendar", async ({
    calendarPage: page,
    calendarSetup: { url, dates, calendar, playerId },
    prisma
  }) => {
    await page.goto(url);
    await openCalendarEditor(page);
    await calendarField(page, 0).fill("Ei tallenneta");
    await page.getByRole("button", { name: "Peruuta" }).click();

    await expect(calendarDay(page, dates[0])).toContainText("Päivä 1");
    await expect(page.getByText("Ei tallenneta")).toHaveCount(0);
    const saved = await prisma.player.findUniqueOrThrow({
      where: { id: playerId }
    });
    expect(saved.calendar).toEqual(calendar);
  });

  test("umpire sees the player's calendar but cannot edit it", async ({
    calendarSetup: { url, dates, tournamentId },
    page,
    createUser,
    loginAs
  }) => {
    const umpire = await createUser({ firstName: "Tuomari", tournamentId });
    await makeUmpire(umpire.id, tournamentId);
    await loginAs(umpire);

    await page.goto(url);
    await expect(calendarDay(page, dates[0])).toContainText("Päivä 1");
    await expect(
      page.getByRole("button", { name: "Muokkaa kalenteria" })
    ).toHaveCount(0);
  });
});
