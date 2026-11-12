import { test, expect } from "./fixtures";
import { createPlayer } from "./helpers/factories";
import {
  editDescription,
  expectDescriptionVisible,
  playerPageUrl,
  updatedDescription
} from "./helpers/player-page";

test.describe("player's own page", () => {
  test("logged-in player is forwarded from the front page to their own page", async ({
    playerPage,
    playerSetup
  }) => {
    const { tournament, player } = playerSetup;
    await playerPage.goto("/");
    await expect(playerPage).toHaveURL(
      playerPageUrl(tournament.id, player.userId)
    );
  });

  test("/personal forwards to the player's own page", async ({
    playerPage,
    playerSetup
  }) => {
    const { tournament, player } = playerSetup;
    await playerPage.goto("/personal");
    await expect(playerPage).toHaveURL(
      playerPageUrl(tournament.id, player.userId)
    );
  });

  test("player cannot open another player's page", async ({
    playerPage,
    playerSetup
  }) => {
    const { tournament, player } = playerSetup;
    const other = await createPlayer(tournament.id);

    await playerPage.goto(playerPageUrl(tournament.id, other.userId));
    // Unauthorized viewers are sent to /personal, i.e. their own page.
    await expect(playerPage).toHaveURL(
      playerPageUrl(tournament.id, player.userId)
    );
  });

  test("player sees their own information", async ({
    playerPage,
    playerSetup
  }) => {
    const { tournament, player } = playerSetup;
    await playerPage.goto(playerPageUrl(tournament.id, player.userId));

    await expect(
      playerPage.getByRole("heading", { name: "Pekka Pelaaja", level: 1 })
    ).toBeVisible();
    await expect(
      playerPage.getByRole("heading", { name: `Peitenimi: ${player.alias}` })
    ).toBeVisible();
    await expect(
      playerPage.getByRole("heading", { name: "Status: Elossa" })
    ).toBeVisible();
    await expect(
      playerPage.getByText("Puhelinnumero: 040 123 4567")
    ).toBeVisible();
    await expect(
      playerPage.getByText(`Sähköpostiosoite: ${player.user.email}`)
    ).toBeVisible();

    await expectDescriptionVisible(playerPage, {
      safetyNotes: player.safetyNotes,
      address: player.address,
      learningInstitution: player.learningInstitution,
      eyeColor: player.eyeColor,
      hair: player.hair,
      height: player.height,
      other: player.other
    });
  });

  test("unconfirmed player sees a warning about it", async ({
    playerPage,
    playerSetup
  }) => {
    const { tournament, player } = playerSetup;
    await playerPage.goto(playerPageUrl(tournament.id, player.userId));
    await expect(
      playerPage.getByText(
        "Tuomaristo ei ole vielä hyväksynyt ilmoittautumista."
      )
    ).toBeVisible();
    // Only umpires can confirm a registration.
    await expect(
      playerPage.getByRole("button", { name: "Hyväksy ilmoittautuminen" })
    ).toHaveCount(0);
  });

  test("player can edit their description", async ({
    playerPage,
    playerSetup,
    prisma
  }) => {
    const { tournament, player } = playerSetup;
    const url = playerPageUrl(tournament.id, player.userId);
    const updated = updatedDescription();

    await playerPage.goto(url);
    await editDescription(playerPage, updated);

    // The page shows the new values right away...
    await expectDescriptionVisible(playerPage, updated);
    await expect(playerPage.getByText(player.address)).toHaveCount(0);

    // ...they are saved to the database...
    const saved = await prisma.player.findUniqueOrThrow({
      where: { id: player.id }
    });
    expect(saved).toMatchObject(updated);

    // ...and still there after a reload.
    await playerPage.reload();
    await expectDescriptionVisible(playerPage, updated);
  });

  test("cancelling the edit keeps the old values", async ({
    playerPage,
    playerSetup,
    prisma
  }) => {
    const { tournament, player } = playerSetup;
    await playerPage.goto(playerPageUrl(tournament.id, player.userId));

    await playerPage.getByRole("button", { name: "Muokkaa tietoja" }).click();
    await playerPage.locator('[name="address"]').fill("Ei tallenneta 1");
    await playerPage.getByRole("button", { name: "Peruuta" }).click();

    await expect(
      playerPage.getByText(player.address, { exact: true })
    ).toBeVisible();
    await expect(playerPage.getByText("Ei tallenneta 1")).toHaveCount(0);
    const saved = await prisma.player.findUniqueOrThrow({
      where: { id: player.id }
    });
    expect(saved.address).toBe(player.address);
  });
});
