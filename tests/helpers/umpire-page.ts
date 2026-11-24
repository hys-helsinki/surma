import { expect, type Locator, type Page } from "@playwright/test";
import type { Tournament } from "@prisma/client";
import { prisma } from "./db";

export const umpirePageUrl = (tournamentId: string) =>
  `/tournaments/${tournamentId}/umpire-page`;

export const TABS = {
  players: "Pelaajat",
  rings: "Ringit",
  umpires: "Tuomarien asettaminen",
  settings: "Asetukset"
} as const;

/** Opens the umpire page and waits for the tab bar to render. */
export const gotoUmpirePage = async (
  page: Page,
  tournament: Pick<Tournament, "id">
) => {
  await page.goto(umpirePageUrl(tournament.id));
  // The first request compiles the page in dev mode, which can be slow.
  await expect(page.getByRole("tab", { name: TABS.players })).toBeVisible({
    timeout: 30_000
  });
};

export const openTab = async (page: Page, tab: keyof typeof TABS) => {
  const locator = page.getByRole("tab", { name: TABS[tab], exact: true });
  await locator.click();
  await expect(locator).toHaveAttribute("aria-selected", "true");
};

/** Accepts (or dismisses) the next window.confirm() and returns its message. */
export const answerNextConfirm = (page: Page, accept = true) =>
  new Promise<string>((resolve) => {
    page.once("dialog", async (dialog) => {
      const message = dialog.message();
      if (accept) await dialog.accept();
      else await dialog.dismiss();
      resolve(message);
    });
  });

/** The row/card of the player list that contains `text`. */
export const playerRow = (page: Page, text: string): Locator =>
  page.locator(".MuiGrid-container").filter({ hasText: text }).last();

/** Picks the option `name` in the MUI Autocomplete with the given label. */
export const pickAutocomplete = async (
  scope: Page | Locator,
  page: Page,
  label: string,
  name: string,
  index = 0
) => {
  const input = scope.getByRole("combobox", { name: label }).nth(index);
  await input.click();
  await page.getByRole("option", { name, exact: true }).click();
};

export const playerState = async (id: string) =>
  (await prisma.player.findUniqueOrThrow({ where: { id } })).state;

/**
 * Timeout for assertions that wait for an API call. In dev mode the first
 * request to an API route compiles it, which can take a while.
 */
export const SLOW = { timeout: 20_000 };
