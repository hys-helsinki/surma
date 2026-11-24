import { test, expect } from "./fixtures";
import { createUser, makeUmpire } from "./helpers/factories";
import { prisma } from "./helpers/db";
import { setTournamentPhase } from "./helpers/navigation";
import {
  answerNextConfirm,
  gotoUmpirePage,
  openTab,
  SLOW
} from "./helpers/umpire-page";

const DELETE_BUTTON = "Poista kaikki turnausdata";

test.describe("umpire page: settings tab", () => {
  test("shows the tournament's dates in the edit form", async ({
    umpirePage,
    umpireSetup
  }) => {
    await gotoUmpirePage(umpirePage, umpireSetup.tournament);
    await openTab(umpirePage, "settings");

    await expect(
      umpirePage.getByRole("heading", { name: "Asetukset", level: 2 })
    ).toBeVisible();
    for (const label of [
      "Turnaus alkaa",
      "Turnaus päättyy",
      "Ilmoittautuminen alkaa",
      "Ilmoittautuminen päättyy"
    ]) {
      await expect(umpirePage.getByText(label, { exact: true })).toBeVisible();
    }
    for (const name of [
      "startTime",
      "endTime",
      "registrationStartTime",
      "registrationEndTime"
    ]) {
      await expect(umpirePage.locator(`input[name="${name}"]`)).not.toHaveValue(
        ""
      );
    }
  });

  test("umpire changes the tournament's end date", async ({
    umpirePage,
    umpireSetup
  }) => {
    const { tournament } = umpireSetup;
    await gotoUmpirePage(umpirePage, tournament);
    await openTab(umpirePage, "settings");

    const endInput = umpirePage.locator('input[name="endTime"]');
    const original = await endInput.inputValue();
    const year = Number(original.match(/\d{4}/)[0]);
    await endInput.fill(original.replace(String(year), String(year + 1)));
    // Close the date picker popup, which would cover the save button.
    await umpirePage
      .getByRole("heading", { name: "Asetukset", level: 2 })
      .click();

    const response = umpirePage.waitForResponse(
      (r) =>
        r.url().endsWith(`/api/tournament/${tournament.id}/update`) &&
        r.request().method() === "PUT"
    );
    await umpirePage
      .getByRole("button", { name: "Tallenna muutokset" })
      .click();
    expect((await response).status()).toBe(200);

    const updated = await prisma.tournament.findUniqueOrThrow({
      where: { id: tournament.id }
    });
    expect(updated.endTime.getTime()).toBeGreaterThan(
      tournament.endTime.getTime()
    );
    expect(
      updated.endTime.getTime() - tournament.endTime.getTime()
    ).toBeGreaterThan(360 * 24 * 60 * 60 * 1000);
    // Other dates are unchanged.
    expect(updated.startTime.getTime()).toBe(tournament.startTime.getTime());
  });

  test("invalid date is rejected without saving", async ({
    umpirePage,
    umpireSetup
  }) => {
    const { tournament } = umpireSetup;
    await gotoUmpirePage(umpirePage, tournament);
    await openTab(umpirePage, "settings");

    await umpirePage.locator('input[name="startTime"]').fill("ei päivämäärä");
    await umpirePage
      .getByRole("heading", { name: "Asetukset", level: 2 })
      .click();
    await umpirePage
      .getByRole("button", { name: "Tallenna muutokset" })
      .click();

    await expect(
      umpirePage.getByText("Tarkista päivämäärän formaatti")
    ).toBeVisible();
    const unchanged = await prisma.tournament.findUniqueOrThrow({
      where: { id: tournament.id }
    });
    expect(unchanged.startTime.getTime()).toBe(tournament.startTime.getTime());
  });

  test("delete button is disabled until the tournament has ended", async ({
    umpirePage,
    umpireSetup
  }) => {
    const { tournament } = umpireSetup;
    await gotoUmpirePage(umpirePage, tournament);
    await openTab(umpirePage, "settings");

    await expect(
      umpirePage.getByRole("button", { name: DELETE_BUTTON })
    ).toBeDisabled();

    await setTournamentPhase(tournament, "ended");
    await umpirePage.reload();
    await openTab(umpirePage, "settings");
    await expect(
      umpirePage.getByRole("button", { name: DELETE_BUTTON })
    ).toBeEnabled();
  });

  test("only the main umpire sees the delete button", async ({
    page,
    loginAs,
    umpireSetup
  }) => {
    const { tournament } = umpireSetup;
    const other = await createUser({
      firstName: "Apu",
      tournamentId: tournament.id
    });
    await makeUmpire(other.id, tournament.id, { mainUmpire: false });
    await setTournamentPhase(tournament, "ended");
    await loginAs(other);

    await gotoUmpirePage(page, tournament);
    await openTab(page, "settings");

    await expect(
      page.getByRole("button", { name: "Tallenna muutokset" })
    ).toBeVisible();
    await expect(page.getByRole("button", { name: DELETE_BUTTON })).toHaveCount(
      0
    );
  });

  test("main umpire deletes the finished tournament's data", async ({
    umpirePage,
    umpireSetup
  }) => {
    const { tournament } = umpireSetup;
    await setTournamentPhase(tournament, "ended");
    await gotoUmpirePage(umpirePage, tournament);
    await openTab(umpirePage, "settings");

    // Dismissing keeps everything.
    const dismissed = answerNextConfirm(umpirePage, false);
    await umpirePage.getByRole("button", { name: DELETE_BUTTON }).click();
    await dismissed;
    expect(
      await prisma.tournament.findUnique({ where: { id: tournament.id } })
    ).not.toBeNull();

    const accepted = answerNextConfirm(umpirePage);
    const response = umpirePage.waitForResponse(
      (r) =>
        r.url().endsWith(`/api/tournament/${tournament.id}/delete`) &&
        r.request().method() === "DELETE"
    );
    await umpirePage.getByRole("button", { name: DELETE_BUTTON }).click();
    expect(await accepted).toContain("poistaa kaiken");
    expect((await response).status()).toBe(200);

    await expect(umpirePage).toHaveURL(/\/$/, SLOW);
    expect(
      await prisma.tournament.findUnique({ where: { id: tournament.id } })
    ).toBeNull();
  });
});
