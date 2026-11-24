import { expect, type Locator, type Page } from "@playwright/test";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Player.calendar as the player page reads it: `[date, content]` pairs. */
export type CalendarData = [string, string][];

/**
 * Formats a date like the app's getTournamentDates() does ("d.m.yyyy"),
 * in the browser's pinned timezone (see playwright.config.ts) so the result
 * doesn't depend on the timezone the test runner happens to run in.
 */
export const formatCalendarDate = (date: Date) => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Helsinki",
    day: "numeric",
    month: "numeric",
    year: "numeric"
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type).value;
  return `${get("day")}.${get("month")}.${get("year")}`;
};

/**
 * Start and end times for a tournament that lasts `days` calendar days and
 * starts `startOffsetDays` days from today. Times are pinned to midday so the
 * day count is stable regardless of the timezone.
 */
export const tournamentTimes = (startOffsetDays: number, days: number) => {
  const start = new Date(Date.now() + startOffsetDays * DAY_MS);
  start.setUTCHours(10, 0, 0, 0);
  const end = new Date(start.getTime() + (days - 1) * DAY_MS);
  return { startTime: start, endTime: end };
};

/** Every date of the tournament in "d.m.yyyy" format. */
export const tournamentDates = (startTime: Date, endTime: Date) => {
  const dates: string[] = [];
  for (let t = startTime.getTime(); t <= endTime.getTime(); t += DAY_MS) {
    dates.push(formatCalendarDate(new Date(t)));
  }
  return dates;
};

/** Builds a calendar for the dates, with `content(index)` for each day. */
export const buildCalendar = (
  dates: string[],
  content: (index: number) => string = () => ""
): CalendarData => dates.map((date, i) => [date, content(i)]);

/** The list item of a single day in the (read-only) calendar view. */
export const calendarDay = (page: Page, date: string): Locator =>
  page
    .locator(".calendar li")
    .filter({ has: page.getByText(date, { exact: true }) });

/** Asserts that exactly the given dates are shown in the calendar view. */
export const expectShownDates = async (page: Page, dates: string[]) => {
  await expect(page.locator(".calendar li > p:first-child")).toHaveText(dates);
};

/**
 * Textarea of the n:th tournament day in the calendar edit form. The form's
 * <label>s aren't associated with the textareas, so locate them by name.
 */
export const calendarField = (page: Page, index: number) =>
  page.locator(`.calendar textarea[name="calendar${index}"]`);

export const openCalendarEditor = async (page: Page) => {
  await page.getByRole("button", { name: "Muokkaa kalenteria" }).click();
  await expect(calendarField(page, 0)).toBeVisible();
};

export const saveCalendar = async (page: Page) => {
  // The form has a save button both above and below the fields.
  await page
    .getByRole("button", { name: "Tallenna muokkaukset" })
    .first()
    .click();
  // The view switches back from the form once the update has finished.
  await expect(
    page.getByRole("button", { name: "Muokkaa kalenteria" })
  ).toBeVisible();
};
