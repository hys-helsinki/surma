import { test, expect } from "./fixtures";
import {
  createPlayer,
  createTeam,
  createUser,
  makeUmpire
} from "./helpers/factories";
import { prisma } from "./helpers/db";
import { gotoUmpirePage, openTab, SLOW } from "./helpers/umpire-page";
import { fullName } from "./helpers/navigation";

const label = (p: {
  user: { firstName: string; lastName: string };
  alias: string;
}) => `${fullName(p.user)} (${p.alias})`;

test.describe("umpire page: umpire assignment tab", () => {
  test("lists every player with a select of the tournament's umpires", async ({
    umpirePage,
    umpireSetup
  }) => {
    const { tournament, umpire } = umpireSetup;
    const second = await createUser({
      firstName: "Toinen",
      lastName: "Tuomari",
      tournamentId: tournament.id
    });
    await makeUmpire(second.id, tournament.id);
    const player = await createPlayer(tournament.id, {
      user: { firstName: "Pelaaja" }
    });

    await gotoUmpirePage(umpirePage, tournament);
    await openTab(umpirePage, "umpires");

    await expect(
      umpirePage.getByRole("heading", { name: "Pelaajien tuomarit" })
    ).toBeVisible();
    const select = umpirePage.getByLabel(label(player));
    // An empty option plus this tournament's two umpires.
    await expect(select.locator("option")).toHaveCount(3);
    const texts = await select.locator("option").allTextContents();
    expect(texts.sort()).toEqual(
      ["", fullName(umpire), fullName(second)].sort()
    );
    await expect(select).toHaveValue("");
  });

  test("umpire assigns umpires to players", async ({
    umpirePage,
    umpireSetup
  }) => {
    const { tournament, umpire } = umpireSetup;
    const umpireRow = await prisma.umpire.findFirstOrThrow({
      where: { userId: umpire.id, tournamentId: tournament.id }
    });
    const a = await createPlayer(tournament.id, {
      user: { firstName: "Aarne" }
    });
    const b = await createPlayer(tournament.id, {
      user: { firstName: "Bertta" }
    });
    const c = await createPlayer(tournament.id, {
      user: { firstName: "Cecilia" }
    });

    await gotoUmpirePage(umpirePage, tournament);
    await openTab(umpirePage, "umpires");
    await umpirePage
      .getByLabel(label(a))
      .selectOption({ label: fullName(umpire) });
    await umpirePage
      .getByLabel(label(b))
      .selectOption({ label: fullName(umpire) });
    await umpirePage.getByRole("button", { name: "Tallenna tuomarit" }).click();

    await expect(
      umpirePage.getByText("Tuomarien asettaminen onnistui!")
    ).toBeVisible(SLOW);
    const umpireIdOf = async (id: string) =>
      (await prisma.player.findUniqueOrThrow({ where: { id } })).umpireId;
    expect(await umpireIdOf(a.id)).toBe(umpireRow.id);
    expect(await umpireIdOf(b.id)).toBe(umpireRow.id);
    expect(await umpireIdOf(c.id)).toBeNull();

    // The assignment shows on the players tab as "Omat pelaajani".
    await openTab(umpirePage, "players");
    await expect(
      umpirePage.getByRole("heading", { name: /Omat pelaajani/ })
    ).toBeVisible();
  });

  test("existing assignments are preselected", async ({
    umpirePage,
    umpireSetup
  }) => {
    const { tournament, umpire } = umpireSetup;
    const umpireRow = await prisma.umpire.findFirstOrThrow({
      where: { userId: umpire.id, tournamentId: tournament.id }
    });
    const assigned = await createPlayer(tournament.id, {
      umpireId: umpireRow.id,
      user: { firstName: "Valmis" }
    });

    await gotoUmpirePage(umpirePage, tournament);
    await openTab(umpirePage, "umpires");

    await expect(umpirePage.getByLabel(label(assigned))).toHaveValue(
      umpireRow.id
    );
  });

  test("team tournament prefixes players with their team", async ({
    umpirePage,
    umpireSetup
  }) => {
    const { tournament } = umpireSetup;
    await prisma.tournament.update({
      where: { id: tournament.id },
      data: { teamGame: true }
    });
    const team = await createTeam(tournament.id, "Siniset");
    const member = await createPlayer(tournament.id, {
      teamId: team.id,
      user: { firstName: "Jäsen" }
    });

    await gotoUmpirePage(umpirePage, tournament);
    await openTab(umpirePage, "umpires");

    await expect(
      umpirePage.getByText(
        `Siniset: ${fullName(member.user)} (${member.alias})`
      )
    ).toBeVisible();
  });
});
