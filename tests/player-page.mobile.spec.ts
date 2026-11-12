import { test, expect } from "./fixtures";
import {
  editDescription,
  expectDescriptionVisible,
  playerPageUrl,
  updatedDescription
} from "./helpers/player-page";

test.describe("player's own page (mobile)", () => {
  test("player sees their information on the details tab and can edit it", async ({
    playerPage,
    playerSetup,
    prisma
  }) => {
    const { tournament, player } = playerSetup;
    await playerPage.goto(playerPageUrl(tournament.id, player.userId));

    await expect(
      playerPage.getByRole("heading", { name: "Pekka Pelaaja", level: 1 })
    ).toBeVisible();
    await expect(
      playerPage.getByRole("heading", { name: "Status: Elossa" })
    ).toBeVisible();

    // The calendar tab is open by default; details are on the second tab.
    await playerPage.getByRole("tab", { name: "Tiedot" }).click();
    await expect(
      playerPage.getByText(`Sähköpostiosoite: ${player.user.email}`)
    ).toBeVisible();
    await expect(
      playerPage.getByText(player.address, { exact: true })
    ).toBeVisible();

    const updated = updatedDescription();
    await editDescription(playerPage, updated);
    await expectDescriptionVisible(playerPage, updated);

    const saved = await prisma.player.findUniqueOrThrow({
      where: { id: player.id }
    });
    expect(saved).toMatchObject(updated);
  });
});
