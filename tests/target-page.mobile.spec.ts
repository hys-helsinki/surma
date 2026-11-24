import { test, expect } from "./fixtures";
import type { Page } from "@playwright/test";
import type { Player, User } from "@prisma/client";
import { fullName, targetPageUrl } from "./helpers/navigation";
import {
  aliasHeading,
  expectCalendarShown,
  expectNoAlias,
  expectNoContactDetails,
  expectNoEditButtons,
  giveTargetCalendar,
  setupHunterWithTarget
} from "./helpers/target-page";

/** Checks both tabs: the calendar tab (open by default) and the details tab. */
const expectReadOnlyTabs = async (
  page: Page,
  target: Player & { user: User }
) => {
  await expect(page.getByRole("tab", { name: "Kalenteri" })).toBeVisible();
  await expectNoEditButtons(page);

  await page.getByRole("tab", { name: "Tiedot" }).click();
  await expect(page.getByText(target.address, { exact: true })).toBeVisible();
  await expectNoEditButtons(page);
  await expectNoContactDetails(page, target);
};

test.describe("target page (mobile)", () => {
  test("non-detective hunter sees no edit buttons, contact details or alias", async ({
    playerPage,
    playerSetup
  }) => {
    const { tournament, player } = playerSetup;
    const target = await setupHunterWithTarget(tournament, player, "ACTIVE");

    await playerPage.goto(targetPageUrl(tournament.id, target.userId));
    await expect(
      playerPage.getByRole("heading", { name: fullName(target.user), level: 1 })
    ).toBeVisible();

    await expectNoAlias(playerPage, target.alias);
    await expectReadOnlyTabs(playerPage, target);
  });

  test("target's calendar is shown on the default tab", async ({
    playerPage,
    playerSetup
  }) => {
    const { tournament, player } = playerSetup;
    const target = await setupHunterWithTarget(tournament, player);
    const { calendar } = await giveTargetCalendar(tournament, target);

    await playerPage.goto(targetPageUrl(tournament.id, target.userId));

    await expect(
      playerPage.getByRole("tab", { name: "Kalenteri" })
    ).toHaveAttribute("aria-selected", "true");
    await expectCalendarShown(playerPage, calendar);
  });

  test("detective sees the alias but no edit buttons or contact details", async ({
    playerPage,
    playerSetup
  }) => {
    const { tournament, player } = playerSetup;
    const target = await setupHunterWithTarget(tournament, player, "DETECTIVE");

    await playerPage.goto(targetPageUrl(tournament.id, target.userId));

    await expect(aliasHeading(playerPage, target.alias)).toBeVisible();
    await expectReadOnlyTabs(playerPage, target);
  });
});
