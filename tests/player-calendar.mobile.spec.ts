import { test, expect } from "./fixtures";
import { createPlayer } from "./helpers/factories";
import { playerPageUrl } from "./helpers/player-page";
import {
  buildCalendar,
  calendarDay,
  calendarField,
  expectShownDates,
  openCalendarEditor,
  saveCalendar,
  tournamentDates,
  tournamentTimes
} from "./helpers/calendar";

test.describe("player calendar (mobile)", () => {
  test("calendar is on the default tab and can be browsed and edited", async ({
    page,
    createTournament,
    loginAs,
    prisma
  }) => {
    const times = tournamentTimes(7, 14);
    const tournament = await createTournament(times);
    const dates = tournamentDates(times.startTime, times.endTime);
    const calendar = buildCalendar(dates, (i) => `Päivä ${i + 1}`);
    const player = await createPlayer(tournament.id, { calendar });
    await loginAs(player.user);

    await page.goto(playerPageUrl(tournament.id, player.userId));

    // The calendar tab is selected by default.
    await expect(page.getByRole("tab", { name: "Kalenteri" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    await expectShownDates(page, dates.slice(0, 7));
    await page.getByRole("button", { name: "Seuraava" }).click();
    await expectShownDates(page, dates.slice(7, 14));

    await openCalendarEditor(page);
    await calendarField(page, 7).fill("Kotona aamupäivän");
    await saveCalendar(page);

    // The view stays on the week that was open before editing.
    await expect(calendarDay(page, dates[7])).toContainText(
      "Kotona aamupäivän"
    );
    const saved = await prisma.player.findUniqueOrThrow({
      where: { id: player.id }
    });
    expect(saved.calendar).toEqual([
      ...calendar.slice(0, 7),
      [dates[7], "Kotona aamupäivän"],
      ...calendar.slice(8)
    ]);
  });
});
