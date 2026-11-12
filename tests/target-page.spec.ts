import { test, expect } from "./fixtures";
import { fullName, targetPageUrl } from "./helpers/navigation";
import { makeUmpire } from "./helpers/factories";
import { expectDescriptionVisible, playerPageUrl } from "./helpers/player-page";
import {
  aliasHeading,
  expectCalendarShown,
  expectNoAlias,
  expectNoContactDetails,
  expectNoEditButtons,
  giveTargetCalendar,
  setupHunterWithTarget
} from "./helpers/target-page";

test.describe("target page", () => {
  test("hunter sees the target's description but no contact details or edit buttons", async ({
    playerPage,
    playerSetup
  }) => {
    const { tournament, player } = playerSetup;
    const target = await setupHunterWithTarget(tournament, player);

    await playerPage.goto(targetPageUrl(tournament.id, target.userId));

    await expect(
      playerPage.getByRole("heading", { name: fullName(target.user), level: 1 })
    ).toBeVisible();
    await expectDescriptionVisible(playerPage, {
      safetyNotes: target.safetyNotes,
      address: target.address,
      learningInstitution: target.learningInstitution,
      eyeColor: target.eyeColor,
      hair: target.hair,
      height: target.height,
      other: target.other
    });

    await expectNoEditButtons(playerPage);
    await expectNoContactDetails(playerPage, target);
  });

  test("hunter sees the target's calendar", async ({
    playerPage,
    playerSetup
  }) => {
    const { tournament, player } = playerSetup;
    const target = await setupHunterWithTarget(tournament, player);
    const { calendar } = await giveTargetCalendar(tournament, target);

    await playerPage.goto(targetPageUrl(tournament.id, target.userId));

    await expectCalendarShown(playerPage, calendar);
    // The whole one-week tournament fits on one page.
    await expect(playerPage.getByRole("button", { name: "Seuraava" })).toHaveCount(0);
    await expect(playerPage.getByRole("button", { name: "Edellinen" })).toHaveCount(0);
    await expect(
      playerPage.getByRole("button", { name: "Muokkaa kalenteria" })
    ).toHaveCount(0);
  });

  test("only the tournament's own umpires are listed", async ({
    playerPage,
    playerSetup,
    createTournament,
    createUser
  }) => {
    const { tournament, player } = playerSetup;
    const target = await setupHunterWithTarget(tournament, player);

    const ownUmpire = await createUser({
      firstName: "Oma",
      lastName: "Tuomari",
      tournamentId: tournament.id
    });
    await makeUmpire(ownUmpire.id, tournament.id);
    const otherTournament = await createTournament();
    const otherUmpire = await createUser({
      firstName: "Vieras",
      lastName: "Tuomari",
      tournamentId: otherTournament.id
    });
    await makeUmpire(otherUmpire.id, otherTournament.id);

    for (const url of [
      targetPageUrl(tournament.id, target.userId),
      playerPageUrl(tournament.id, player.userId)
    ]) {
      await playerPage.goto(url);
      // The umpire list is collapsed by default.
      await playerPage
        .getByRole("heading", { name: "Turnauksen tuomarit" })
        .locator("xpath=..")
        .getByRole("button")
        .click();
      await expect(playerPage.getByText(fullName(ownUmpire))).toBeVisible();
      await expect(playerPage.getByText(fullName(otherUmpire))).toHaveCount(0);
      expect(await playerPage.content()).not.toContain(otherUmpire.email);
    }
  });

  test("non-detective hunter does not see the target's alias", async ({
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
  });

  test("detective sees the target's alias", async ({
    playerPage,
    playerSetup
  }) => {
    const { tournament, player } = playerSetup;
    const target = await setupHunterWithTarget(tournament, player, "DETECTIVE");

    await playerPage.goto(targetPageUrl(tournament.id, target.userId));

    await expect(aliasHeading(playerPage, target.alias)).toBeVisible();
    // Being a detective doesn't reveal anything else.
    await expectNoEditButtons(playerPage);
    await expectNoContactDetails(playerPage, target);
  });
});
