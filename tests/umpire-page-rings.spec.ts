import { test, expect } from "./fixtures";
import { createPlayer, createRing } from "./helpers/factories";
import { prisma } from "./helpers/db";
import {
  answerNextConfirm,
  gotoUmpirePage,
  openTab,
  SLOW,
  pickAutocomplete
} from "./helpers/umpire-page";
import { fullName } from "./helpers/navigation";

test.describe("umpire page: rings tab", () => {
  test("lists rings and every player's targets", async ({
    umpirePage,
    umpireSetup
  }) => {
    const { tournament } = umpireSetup;
    const a = await createPlayer(tournament.id, {
      user: { firstName: "Aarne" }
    });
    const b = await createPlayer(tournament.id, {
      user: { firstName: "Bertta" }
    });
    const c = await createPlayer(tournament.id, {
      user: { firstName: "Cecilia" }
    });
    const ring = await createRing(tournament.id, [a, b, c], "Testirinki");

    await gotoUmpirePage(umpirePage, tournament);
    await openTab(umpirePage, "rings");

    await expect(
      umpirePage.getByRole("heading", { name: "Ringit", level: 2 })
    ).toBeVisible();
    await expect(
      umpirePage.getByRole("button", { name: ring.name })
    ).toBeVisible();
    await expect(
      umpirePage.getByRole("button", { name: "Luo uusi rinki" })
    ).toBeVisible();

    // "Pelaajien kohteet": each player followed by their target.
    await expect(
      umpirePage.getByRole("heading", { name: "Pelaajien kohteet" })
    ).toBeVisible();
    const aBlock = umpirePage
      .locator("p", { hasText: fullName(a.user) })
      .locator("xpath=..");
    await expect(aBlock.getByRole("listitem")).toHaveText([fullName(b.user)]);
  });

  test("expanding a ring shows its assignments", async ({
    umpirePage,
    umpireSetup
  }) => {
    const { tournament } = umpireSetup;
    const a = await createPlayer(tournament.id, {
      user: { firstName: "Aarne" }
    });
    const b = await createPlayer(tournament.id, {
      user: { firstName: "Bertta" }
    });
    const ring = await createRing(tournament.id, [a, b]);

    await gotoUmpirePage(umpirePage, tournament);
    await openTab(umpirePage, "rings");

    await expect(
      umpirePage.getByRole("button", { name: "Poista toimeksianto" })
    ).toHaveCount(0);
    await umpirePage.getByRole("button", { name: ring.name }).click();
    await expect(
      umpirePage.getByRole("button", { name: "Poista toimeksianto" })
    ).toHaveCount(2);
    await expect(
      umpirePage.getByText(`Metsästäjä: ${fullName(a.user)}`)
    ).toBeVisible();
    await expect(
      umpirePage.getByText(`Kohde: ${fullName(b.user)}`)
    ).toBeVisible();
  });

  test("shows dead and detective players and wanted targets", async ({
    umpirePage,
    umpireSetup
  }) => {
    const { tournament } = umpireSetup;
    const dead = await createPlayer(tournament.id, {
      state: "DEAD",
      user: { firstName: "Kuollut" }
    });
    const detective = await createPlayer(tournament.id, {
      state: "DETECTIVE",
      user: { firstName: "Etsivä" }
    });
    const wanted = await createPlayer(tournament.id, {
      user: { firstName: "Etsitty" }
    });
    await createRing(tournament.id, [detective, wanted]);

    await gotoUmpirePage(umpirePage, tournament);
    await openTab(umpirePage, "rings");

    const line = (p: { user: { firstName: string; lastName: string } }) =>
      umpirePage.locator("p", { hasText: fullName(p.user) });
    await expect(line(dead)).toContainText("Kuollut");
    await expect(line(detective)).toContainText("Etsivä");
    await expect(line(wanted)).toContainText("Etsintäkuulutettu");
  });

  test("umpire creates a new ring", async ({ umpirePage, umpireSetup }) => {
    const { tournament } = umpireSetup;
    const a = await createPlayer(tournament.id, {
      user: { firstName: "Aarne" }
    });
    const b = await createPlayer(tournament.id, {
      user: { firstName: "Bertta" }
    });

    await gotoUmpirePage(umpirePage, tournament);
    await openTab(umpirePage, "rings");
    await umpirePage.getByRole("button", { name: "Luo uusi rinki" }).click();
    await umpirePage.locator('input[name="name"]').fill("Uusi rinki");
    await pickAutocomplete(
      umpirePage,
      umpirePage,
      "Metsästäjä",
      fullName(a.user)
    );
    await pickAutocomplete(umpirePage, umpirePage, "Kohde", fullName(b.user));
    await umpirePage.getByRole("button", { name: "Tallenna rinki" }).click();

    await expect(
      umpirePage.getByRole("button", { name: "Uusi rinki", exact: true })
    ).toBeVisible(SLOW);
    const ring = await prisma.assignmentRing.findFirstOrThrow({
      where: { tournamentId: tournament.id, name: "Uusi rinki" },
      include: { assignments: true }
    });
    expect(ring.assignments).toHaveLength(1);
    expect(ring.assignments[0]).toMatchObject({
      hunterId: a.id,
      targetId: b.id
    });
  });

  test("umpire adds an assignment to an existing ring", async ({
    umpirePage,
    umpireSetup
  }) => {
    const { tournament } = umpireSetup;
    const a = await createPlayer(tournament.id, {
      user: { firstName: "Aarne" }
    });
    const b = await createPlayer(tournament.id, {
      user: { firstName: "Bertta" }
    });
    const c = await createPlayer(tournament.id, {
      user: { firstName: "Cecilia" }
    });
    const ring = await createRing(tournament.id, [a, b]);

    await gotoUmpirePage(umpirePage, tournament);
    await openTab(umpirePage, "rings");
    await umpirePage.getByRole("button", { name: ring.name }).click();
    await pickAutocomplete(
      umpirePage,
      umpirePage,
      "Metsästäjä",
      fullName(c.user)
    );
    await pickAutocomplete(umpirePage, umpirePage, "Kohde", fullName(a.user));
    await umpirePage
      .getByRole("button", { name: "Tallenna toimeksiannot" })
      .click();

    await expect
      .poll(() => prisma.assignment.count({ where: { ringId: ring.id } }), SLOW)
      .toBe(3);
    expect(
      await prisma.assignment.count({
        where: { ringId: ring.id, hunterId: c.id, targetId: a.id }
      })
    ).toBe(1);
  });

  test("umpire deletes an assignment after confirming", async ({
    umpirePage,
    umpireSetup
  }) => {
    const { tournament } = umpireSetup;
    const a = await createPlayer(tournament.id, {
      user: { firstName: "Aarne" }
    });
    const b = await createPlayer(tournament.id, {
      user: { firstName: "Bertta" }
    });
    const c = await createPlayer(tournament.id, {
      user: { firstName: "Cecilia" }
    });
    const ring = await createRing(tournament.id, [a, b, c]);

    await gotoUmpirePage(umpirePage, tournament);
    await openTab(umpirePage, "rings");
    await umpirePage.getByRole("button", { name: ring.name }).click();

    const card = umpirePage
      .locator(".MuiCard-root")
      .filter({ hasText: `Metsästäjä: ${fullName(a.user)}` });
    const dismissed = answerNextConfirm(umpirePage, false);
    await card.getByRole("button", { name: "Poista toimeksianto" }).click();
    await dismissed;
    expect(await prisma.assignment.count({ where: { ringId: ring.id } })).toBe(
      3
    );

    const accepted = answerNextConfirm(umpirePage);
    await card.getByRole("button", { name: "Poista toimeksianto" }).click();
    expect(await accepted).toContain("toimeksiannon");

    await expect(card).toHaveCount(0, SLOW);
    expect(await prisma.assignment.count({ where: { ringId: ring.id } })).toBe(
      2
    );
    expect(
      await prisma.assignment.count({
        where: { hunterId: a.id, ringId: ring.id }
      })
    ).toBe(0);
  });

  test("umpire deletes a ring after confirming", async ({
    umpirePage,
    umpireSetup
  }) => {
    const { tournament } = umpireSetup;
    const a = await createPlayer(tournament.id, {
      user: { firstName: "Aarne" }
    });
    const b = await createPlayer(tournament.id, {
      user: { firstName: "Bertta" }
    });
    const ring = await createRing(tournament.id, [a, b]);

    await gotoUmpirePage(umpirePage, tournament);
    await openTab(umpirePage, "rings");

    const ringBox = umpirePage
      .locator("div")
      .filter({ has: umpirePage.getByRole("button", { name: ring.name }) })
      .last();
    const confirmed = answerNextConfirm(umpirePage);
    await ringBox.locator("button").nth(1).click(); // trash icon next to the ring name
    expect(await confirmed).toContain(ring.name);

    await expect(
      umpirePage.getByRole("button", { name: ring.name })
    ).toHaveCount(0, SLOW);
    expect(
      await prisma.assignmentRing.findUnique({ where: { id: ring.id } })
    ).toBeNull();
  });

  test("team tournament has team and player views", async ({
    umpirePage,
    umpireSetup,
    prisma: db
  }) => {
    const { tournament } = umpireSetup;
    await db.tournament.update({
      where: { id: tournament.id },
      data: { teamGame: true }
    });

    await gotoUmpirePage(umpirePage, tournament);
    await openTab(umpirePage, "rings");

    const teamView = umpirePage.getByRole("radio", { name: "Joukkuenäkymä" });
    const playerView = umpirePage.getByRole("radio", { name: "Pelaajanäkymä" });
    await expect(teamView).toBeChecked();
    await expect(
      umpirePage.getByRole("button", { name: "Luo uusi rinki" })
    ).toBeVisible();
    // Switching to the player view replaces the team ring list.
    await playerView.check();
    await expect(playerView).toBeChecked();
    await expect(teamView).not.toBeChecked();
    await expect(
      umpirePage.getByRole("button", { name: "Luo uusi rinki" })
    ).toBeVisible();
  });
});
