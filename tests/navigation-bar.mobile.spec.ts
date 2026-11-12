import { test, expect } from "./fixtures";
import { playerPageUrl } from "./helpers/player-page";
import {
  createTargetsFor,
  fullName,
  gotoAndWaitForNavbar,
  setTournamentPhase,
  targetPageUrl,
  type TournamentPhase
} from "./helpers/navigation";

test.describe("navigation bar targets (mobile)", () => {
  test("player sees their targets during the tournament and can open their pages", async ({
    playerPage,
    playerSetup
  }) => {
    const { tournament, player } = playerSetup;
    await setTournamentPhase(tournament, "running");
    const targets = await createTargetsFor(tournament.id, player);

    await gotoAndWaitForNavbar(
      playerPage,
      playerPageUrl(tournament.id, player.userId)
    );

    await playerPage
      .getByRole("button", { name: "account of current user" })
      .click();
    const menu = playerPage.getByRole("menu");
    await menu.getByRole("button", { name: "Kohteet" }).click();
    for (const target of targets) {
      await expect(
        menu.getByRole("link", { name: fullName(target.user) })
      ).toBeVisible();
    }
    // Only the player's own targets are listed.
    await expect(menu.locator('a[href*="/targets/"]')).toHaveCount(
      targets.length
    );

    const [first] = targets;
    await menu.getByRole("link", { name: fullName(first.user) }).click();
    await expect(playerPage).toHaveURL(
      targetPageUrl(tournament.id, first.userId)
    );
    await expect(
      playerPage.getByRole("heading", { name: fullName(first.user), level: 1 })
    ).toBeVisible();
  });

  for (const phase of ["upcoming", "ended"] as TournamentPhase[]) {
    test(`target list is empty when the tournament is ${phase}, even with assigned targets`, async ({
      playerPage,
      playerSetup
    }) => {
      const { tournament, player } = playerSetup;
      await setTournamentPhase(tournament, phase);
      await createTargetsFor(tournament.id, player);

      const targets = await gotoAndWaitForNavbar(
        playerPage,
        playerPageUrl(tournament.id, player.userId)
      );
      expect(targets).toEqual([]);

      await playerPage
        .getByRole("button", { name: "account of current user" })
        .click();
      const menu = playerPage.getByRole("menu");
      // The menu is open and has the other items, but no targets.
      await expect(menu.getByRole("link", { name: "Oma sivu" })).toBeVisible();
      await expect(menu.getByRole("button", { name: "Kohteet" })).toHaveCount(0);
    });
  }
});
