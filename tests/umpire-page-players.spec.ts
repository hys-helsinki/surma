import { test, expect } from "./fixtures";
import {
  createPlayer,
  createTeam,
  createUser,
  makeUmpire
} from "./helpers/factories";
import { prisma } from "./helpers/db";
import {
  answerNextConfirm,
  gotoUmpirePage,
  SLOW,
  playerRow,
  playerState
} from "./helpers/umpire-page";
import { fullName } from "./helpers/navigation";

const rowText = (p: {
  user: { firstName: string; lastName: string };
  alias: string;
}) => `${fullName(p.user)} (${p.alias})`;

test.describe("umpire page: players tab", () => {
  test("non-umpire is redirected away from the umpire page", async ({
    playerPage,
    playerSetup
  }) => {
    await playerPage.goto(
      `/tournaments/${playerSetup.tournament.id}/umpire-page`
    );
    // /personal forwards a registered player to their own player page.
    await expect(playerPage).not.toHaveURL(/umpire-page/);
    await expect(playerPage.getByRole("tab", { name: "Pelaajat" })).toHaveCount(
      0
    );
  });

  test("lists players grouped by state with counts", async ({
    umpirePage,
    umpireSetup
  }) => {
    const { tournament } = umpireSetup;
    const alive = await createPlayer(tournament.id, {
      user: { firstName: "Elävä" }
    });
    const alive2 = await createPlayer(tournament.id, {
      user: { firstName: "Toinen" }
    });
    const dead = await createPlayer(tournament.id, {
      state: "DEAD",
      user: { firstName: "Kuollut" }
    });
    const detective = await createPlayer(tournament.id, {
      state: "DETECTIVE",
      user: { firstName: "Etsivä" }
    });

    await gotoUmpirePage(umpirePage, tournament);

    await expect(
      umpirePage.getByRole("heading", { name: "Pelaajat", level: 2 })
    ).toBeVisible();
    await expect(umpirePage.getByText("Omat pelaajani")).toHaveCount(0);
    await expect(umpirePage.getByText("Elossa (2)")).toBeVisible();
    await expect(umpirePage.getByText("Kuolleet (1)")).toBeVisible();
    await expect(umpirePage.getByText("Etsivät (1)")).toBeVisible();
    for (const p of [alive, alive2, dead, detective]) {
      await expect(umpirePage.getByText(rowText(p))).toBeVisible();
    }

    // Buttons depend on the player's state.
    await expect(
      playerRow(umpirePage, rowText(alive)).getByRole("button", {
        name: "Tapa"
      })
    ).toBeVisible();
    await expect(
      playerRow(umpirePage, rowText(alive)).getByRole("button", {
        name: "Etsintäkuuluta"
      })
    ).toBeVisible();
    await expect(
      playerRow(umpirePage, rowText(dead)).getByRole("button", {
        name: "Etsiväksi"
      })
    ).toBeVisible();
    await expect(
      playerRow(umpirePage, rowText(dead)).getByRole("button", {
        name: "Herätä henkiin"
      })
    ).toBeVisible();
    await expect(
      playerRow(umpirePage, rowText(detective)).getByRole("button", {
        name: "Herätä henkiin"
      })
    ).toBeVisible();
    await expect(
      playerRow(umpirePage, rowText(detective)).getByRole("button", {
        name: "Tapa"
      })
    ).toHaveCount(0);
  });

  test("player's own umpire sees them under 'Omat pelaajani'", async ({
    umpirePage,
    umpireSetup
  }) => {
    const { tournament, umpire } = umpireSetup;
    const umpireRow = await prisma.umpire.findFirstOrThrow({
      where: { userId: umpire.id, tournamentId: tournament.id }
    });
    const mine = await createPlayer(tournament.id, {
      umpireId: umpireRow.id,
      user: { firstName: "Minun" }
    });
    const other = await createPlayer(tournament.id, {
      user: { firstName: "Muiden" }
    });

    await gotoUmpirePage(umpirePage, tournament);

    await expect(
      umpirePage.getByRole("heading", { name: /Omat pelaajani/ })
    ).toBeVisible();
    await expect(
      umpirePage.getByRole("heading", { name: "Muut pelaajat" })
    ).toBeVisible();
    const myBox = umpirePage
      .locator("div")
      .filter({
        has: umpirePage.getByRole("heading", { name: /Omat pelaajani/ })
      })
      .last();
    await expect(myBox.getByText(rowText(mine))).toBeVisible();
    await expect(myBox.getByText(rowText(other))).toHaveCount(0);
  });

  test("umpire kills a player after confirming", async ({
    umpirePage,
    umpireSetup
  }) => {
    const { tournament } = umpireSetup;
    const victim = await createPlayer(tournament.id, {
      user: { firstName: "Uhri" }
    });

    await gotoUmpirePage(umpirePage, tournament);

    // Dismissing the confirmation changes nothing.
    const dismissed = answerNextConfirm(umpirePage, false);
    await playerRow(umpirePage, rowText(victim))
      .getByRole("button", { name: "Tapa" })
      .click();
    expect(await dismissed).toContain(fullName(victim.user));
    expect(await playerState(victim.id)).toBe("ACTIVE");

    const accepted = answerNextConfirm(umpirePage);
    await playerRow(umpirePage, rowText(victim))
      .getByRole("button", { name: "Tapa" })
      .click();
    expect(await accepted).toContain("kuolleeksi");

    await expect(umpirePage.getByText("Kuolleet (1)")).toBeVisible(SLOW);
    await expect(umpirePage.getByText("Elossa (0)")).toBeVisible();
    await expect(
      playerRow(umpirePage, rowText(victim)).getByRole("button", {
        name: "Herätä henkiin"
      })
    ).toBeVisible(SLOW);
    await expect(
      playerRow(umpirePage, rowText(victim)).getByRole("button", {
        name: "Tapa"
      })
    ).toHaveCount(0);
    expect(await playerState(victim.id)).toBe("DEAD");
  });

  test("umpire turns a dead player into a detective and revives them", async ({
    umpirePage,
    umpireSetup
  }) => {
    const { tournament } = umpireSetup;
    const player = await createPlayer(tournament.id, {
      state: "DEAD",
      user: { firstName: "Haamu" }
    });

    await gotoUmpirePage(umpirePage, tournament);

    await playerRow(umpirePage, rowText(player))
      .getByRole("button", { name: "Etsiväksi" })
      .click();
    await expect.poll(() => playerState(player.id), SLOW).toBe("DETECTIVE");
    await expect(
      playerRow(umpirePage, rowText(player)).getByRole("button", {
        name: "Etsiväksi"
      })
    ).toHaveCount(0);

    await playerRow(umpirePage, rowText(player))
      .getByRole("button", { name: "Herätä henkiin" })
      .click();
    await expect.poll(() => playerState(player.id), SLOW).toBe("ACTIVE");
    await expect(
      playerRow(umpirePage, rowText(player)).getByRole("button", {
        name: "Tapa"
      })
    ).toBeVisible(SLOW);
  });

  test("wanted notice gives selected detectives the player as a target", async ({
    umpirePage,
    umpireSetup
  }) => {
    const { tournament } = umpireSetup;
    const wanted = await createPlayer(tournament.id, {
      user: { firstName: "Etsitty" }
    });
    const detective = await createPlayer(tournament.id, {
      state: "DETECTIVE",
      user: { firstName: "Salapoliisi" }
    });

    await gotoUmpirePage(umpirePage, tournament);
    await playerRow(umpirePage, rowText(wanted))
      .getByRole("button", { name: "Etsintäkuuluta" })
      .click();

    const modal = umpirePage
      .getByRole("presentation")
      .filter({ hasText: "annat kohteeksi" });
    await expect(modal.getByText(fullName(wanted.user))).toBeVisible();
    // The label is not tied to the checkbox, so tick the checkbox itself.
    await modal.getByRole("checkbox").check();
    await modal.getByRole("button", { name: "Etsintäkuuluta" }).click();

    await expect
      .poll(
        () =>
          prisma.assignment.count({
            where: { hunterId: detective.id, targetId: wanted.id }
          }),
        SLOW
      )
      .toBe(1);
    const ring = await prisma.assignmentRing.findFirstOrThrow({
      where: { tournamentId: tournament.id }
    });
    expect(ring.name).toBe(`Etsintäkuulutus ${fullName(wanted.user)}`);
  });

  test("unfinished registrations can be deleted", async ({
    umpirePage,
    umpireSetup
  }) => {
    const { tournament } = umpireSetup;
    const unfinished = await createUser({
      firstName: "Keskenerainen",
      lastName: "Ilmo",
      tournamentId: tournament.id
    });

    await gotoUmpirePage(umpirePage, tournament);

    await expect(
      umpirePage.getByRole("heading", {
        name: "Keskeneräiset ilmoittautumiset"
      })
    ).toBeVisible();
    const link = umpirePage.getByRole("link", { name: fullName(unfinished) });
    await expect(link).toBeVisible();
    // The umpire themself is not listed as an unfinished registration.
    await expect(
      umpirePage.getByRole("link", { name: fullName(umpireSetup.umpire) })
    ).toHaveCount(0);

    const confirmed = answerNextConfirm(umpirePage);
    await umpirePage.getByRole("button", { name: "Poista pelaaja" }).click();
    expect(await confirmed).toContain(fullName(unfinished));

    await expect(link).toHaveCount(0, SLOW);
    expect(
      await prisma.user.findUnique({ where: { id: unfinished.id } })
    ).toBeNull();
  });

  test("team tournament lists players under their teams", async ({
    umpirePage,
    createTournament,
    createUser: createUserFixture
  }) => {
    const tournament = await createTournament({ teamGame: true });
    const umpireUser = await createUserFixture({
      firstName: "Tiimituomari",
      tournamentId: tournament.id
    });
    await makeUmpire(umpireUser.id, tournament.id, { mainUmpire: true });
    const team = await createTeam(tournament.id, "Punaiset");
    const member = await createPlayer(tournament.id, {
      teamId: team.id,
      user: { firstName: "Jäsen" }
    });
    // Log in as this tournament's umpire instead of the default one.
    await umpirePage.context().clearCookies();
    const { loginAs } = await import("./helpers/auth");
    await loginAs(umpirePage.context(), umpireUser.id, "http://localhost:3000");

    await gotoUmpirePage(umpirePage, tournament);

    await expect(
      umpirePage.getByRole("heading", { name: "Joukkueet" })
    ).toBeVisible();
    await expect(umpirePage.getByText("Punaiset").first()).toBeVisible();
    await expect(
      umpirePage.getByText(fullName(member.user)).first()
    ).toBeVisible();
  });
});
