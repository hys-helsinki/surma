import { expect, type Page } from "@playwright/test";
import { randomUUID } from "crypto";

export const CREATE_TOURNAMENT_URL = "/admin/create-tournament";

const DAY_MS = 24 * 60 * 60 * 1000;

/** A unique tournament name, so the test can find (and delete) what it created. */
export const uniqueTournamentName = () =>
  `E2E-luotu turnaus ${randomUUID().slice(0, 8)}`;

/** `now + days`, rounded down to the minute (the picker has minute precision). */
export const daysFromNow = (days: number): Date => {
  const date = new Date(Date.now() + days * DAY_MS);
  date.setUTCSeconds(0, 0);
  return date;
};

/**
 * Formats a date the way the react-datetime picker shows and parses it with
 * the Finnish moment locale ("DD.MM.YYYY HH.mm"), in the browser's timezone
 * (pinned to Europe/Helsinki in playwright.config.ts).
 */
export const formatPickerDate = (date: Date): string => {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Helsinki",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23"
    })
      .formatToParts(date)
      .map((p) => [p.type, p.value])
  );
  return `${parts.day}.${parts.month}.${parts.year} ${parts.hour}.${parts.minute}`;
};

export type TournamentFormValues = {
  name: string;
  startTime: Date;
  endTime: Date;
  registrationStartTime: Date;
  registrationEndTime: Date;
  teamGame?: boolean;
};

export type UmpireFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  responsibility?: string;
  mainUmpire?: boolean;
};

/** Valid tournament values: registration open now, game starts in a week. */
export const validTournament = (
  overrides: Partial<TournamentFormValues> = {}
): TournamentFormValues => ({
  name: uniqueTournamentName(),
  registrationStartTime: daysFromNow(0),
  registrationEndTime: daysFromNow(6),
  startTime: daysFromNow(7),
  endTime: daysFromNow(14),
  ...overrides
});

export const uniqueEmail = () => `e2e-tuomari-${randomUUID()}@example.test`;

export const validUmpire = (
  overrides: Partial<UmpireFormValues> = {}
): UmpireFormValues => ({
  firstName: "Tuuli",
  lastName: "Tuomari",
  email: uniqueEmail(),
  phone: "040 111 2222",
  responsibility: "Kohdejako",
  mainUmpire: true,
  ...overrides
});

// The form's labels aren't associated with their inputs, so inputs are
// located by their `name` attribute.
const input = (page: Page, name: string) =>
  page.locator(`input[name="${name}"]`);

const setDate = async (page: Page, name: string, date: Date) => {
  const field = input(page, name);
  await field.fill(formatPickerDate(date));
  // Close the picker popup so it doesn't cover the next field.
  await field.press("Tab");
};

export const fillTournament = async (
  page: Page,
  values: TournamentFormValues
) => {
  await input(page, "tournamentName").fill(values.name);
  await setDate(page, "startTime", values.startTime);
  await setDate(page, "endTime", values.endTime);
  await setDate(page, "registrationStartTime", values.registrationStartTime);
  await setDate(page, "registrationEndTime", values.registrationEndTime);
  if (values.teamGame) {
    await input(page, "teamGame").check();
  }
};

/** Fills umpire number `index` (0-based). The umpire's section must exist. */
export const fillUmpire = async (
  page: Page,
  index: number,
  values: UmpireFormValues
) => {
  const prefix = `users[${index}]`;
  await input(page, `${prefix}.firstName`).fill(values.firstName);
  await input(page, `${prefix}.lastName`).fill(values.lastName);
  await input(page, `${prefix}.email`).fill(values.email);
  await input(page, `${prefix}.phone`).fill(values.phone);
  await input(page, `${prefix}.responsibility`).fill(
    values.responsibility ?? ""
  );
  const mainUmpire = input(page, `${prefix}.mainUmpire`);
  await mainUmpire.setChecked(values.mainUmpire ?? false);
};

export const addUmpireButton = (page: Page) =>
  page.getByRole("button", { name: "Lisää tuomari" });

export const submitButton = (page: Page) =>
  page.getByRole("button", { name: "Luo turnaus" });

export const successHeading = (page: Page) =>
  page.getByRole("heading", { name: "Turnauksen luominen onnistui!" });

/** Validation error shown above a field. */
export const fieldError = (page: Page, message: string) =>
  page.locator(".registration-error", { hasText: message });

/** Submits the form and returns the /api/tournament/create response. */
export const submit = async (page: Page) => {
  const response = page.waitForResponse(
    (r) =>
      new URL(r.url()).pathname === "/api/tournament/create" &&
      r.request().method() === "POST"
  );
  await submitButton(page).click();
  return response;
};

/** Submits the form and asserts that client-side validation blocked it. */
export const submitExpectingValidationError = async (page: Page) => {
  let requestSent = false;
  const listener = (request: { url: () => string }) => {
    if (request.url().includes("/api/tournament/create")) requestSent = true;
  };
  page.on("request", listener);
  await submitButton(page).click();
  // The validation errors are rendered synchronously after the click; give a
  // possible (wrong) fetch a moment to start before checking.
  await expect(successHeading(page)).toHaveCount(0);
  await page.waitForTimeout(300);
  page.off("request", listener);
  expect(requestSent, "form should not be submitted").toBe(false);
};
