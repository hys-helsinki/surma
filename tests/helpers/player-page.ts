import { expect, type Page } from "@playwright/test";

/** Description fields shown on the player page and editable via UpdateForm. */
export type PlayerDescription = {
  safetyNotes: string;
  address: string;
  learningInstitution: string;
  eyeColor: string;
  hair: string;
  height: string;
  other: string;
};

export const playerPageUrl = (tournamentId: string, userId: string) =>
  `/tournaments/${tournamentId}/users/${userId}`;

/**
 * Field locators for the description update form. The form's <label>s are
 * not associated with their inputs (TextInput doesn't set an id), so the
 * fields are located by name instead of by label.
 */
const field = (page: Page, name: keyof PlayerDescription) =>
  page.locator(`[name="${name}"]`);

/** Asserts that every description value is shown on the page. */
export const expectDescriptionVisible = async (
  page: Page,
  description: PlayerDescription
) => {
  for (const value of Object.values(description)) {
    await expect(page.getByText(value, { exact: true })).toBeVisible();
  }
};

/** Opens the description form, replaces every field and saves. */
export const editDescription = async (
  page: Page,
  description: PlayerDescription
) => {
  await page.getByRole("button", { name: "Muokkaa tietoja" }).click();
  for (const [name, value] of Object.entries(description)) {
    await field(page, name as keyof PlayerDescription).fill(value);
  }
  await page.getByRole("button", { name: "Tallenna", exact: true }).click();
  // The form closes once the update request has finished.
  await expect(page.getByRole("button", { name: "Muokkaa tietoja" })).toBeVisible();
};

/** Example of new values, distinct from the playerSetup fixture's values. */
export const updatedDescription = (): PlayerDescription => ({
  safetyNotes: "Ei pelata työpaikalla",
  address: "Uusikatu 5 B 12, Espoo",
  learningInstitution: "Aalto-yliopisto",
  eyeColor: "Vihreät",
  hair: "Pitkät ja vaaleat",
  height: "172 cm",
  other: "Käyttää aina mustaa reppua"
});
