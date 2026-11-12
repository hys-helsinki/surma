import { test, expect } from "./fixtures";
import { createPlayer, makeUmpire } from "./helpers/factories";

/*
 * These endpoints used to call their async authorization check without
 * `await`, so the (always truthy) Promise let every request through.
 * The API is called the same way the app does: a JSON string body without
 * a content type, which the handlers JSON.parse themselves.
 */

test.describe("PUT /api/user/update/[id]", () => {
  const update = { address: "Murtautujankatu 666" };

  test("player can update their own details", async ({
    playerPage,
    playerSetup,
    prisma
  }) => {
    const { player } = playerSetup;
    const res = await playerPage.request.put(
      `/api/user/update/${player.userId}`,
      { data: JSON.stringify(update) }
    );
    expect(res.status()).toBe(200);
    const saved = await prisma.player.findUniqueOrThrow({
      where: { id: player.id }
    });
    expect(saved.address).toBe(update.address);
  });

  test("another player cannot update someone else's details", async ({
    page,
    loginAs,
    playerSetup,
    prisma
  }) => {
    const { tournament, player } = playerSetup;
    const attacker = await createPlayer(tournament.id);
    await loginAs(attacker.user);

    const res = await page.request.put(`/api/user/update/${player.userId}`, {
      data: JSON.stringify(update)
    });
    expect(res.status()).toBe(403);
    const saved = await prisma.player.findUniqueOrThrow({
      where: { id: player.id }
    });
    expect(saved.address).toBe(player.address);
  });

  test("anonymous visitor cannot update details", async ({
    page,
    playerSetup,
    prisma
  }) => {
    const { player } = playerSetup;
    const res = await page.request.put(`/api/user/update/${player.userId}`, {
      data: JSON.stringify(update)
    });
    expect(res.status()).toBe(403);
    const saved = await prisma.player.findUniqueOrThrow({
      where: { id: player.id }
    });
    expect(saved.address).toBe(player.address);
  });

  test("umpire of the tournament can update a player's details", async ({
    page,
    loginAs,
    createUser,
    playerSetup,
    prisma
  }) => {
    const { tournament, player } = playerSetup;
    const umpire = await createUser({ tournamentId: tournament.id });
    await makeUmpire(umpire.id, tournament.id);
    await loginAs(umpire);

    const res = await page.request.put(`/api/user/update/${player.userId}`, {
      data: JSON.stringify(update)
    });
    expect(res.status()).toBe(200);
    const saved = await prisma.player.findUniqueOrThrow({
      where: { id: player.id }
    });
    expect(saved.address).toBe(update.address);
  });

  test("umpire of another tournament cannot update a player's details", async ({
    umpirePage,
    playerSetup,
    prisma
  }) => {
    const { player } = playerSetup;
    const res = await umpirePage.request.put(
      `/api/user/update/${player.userId}`,
      { data: JSON.stringify(update) }
    );
    expect(res.status()).toBe(403);
    const saved = await prisma.player.findUniqueOrThrow({
      where: { id: player.id }
    });
    expect(saved.address).toBe(player.address);
  });
});

test.describe("PATCH /api/player/[id]/state", () => {
  test("player cannot change a player's state", async ({
    playerPage,
    playerSetup,
    prisma
  }) => {
    const { player } = playerSetup;
    const res = await playerPage.request.patch(
      `/api/player/${player.id}/state`,
      { data: JSON.stringify({ state: "DEAD", teamGame: false }) }
    );
    expect(res.status()).toBe(403);
    const saved = await prisma.player.findUniqueOrThrow({
      where: { id: player.id }
    });
    expect(saved.state).toBe("ACTIVE");
  });

  test("umpire of the tournament can change a player's state", async ({
    page,
    loginAs,
    createUser,
    playerSetup,
    prisma
  }) => {
    const { tournament, player } = playerSetup;
    const umpire = await createUser({ tournamentId: tournament.id });
    await makeUmpire(umpire.id, tournament.id);
    await loginAs(umpire);

    const res = await page.request.patch(`/api/player/${player.id}/state`, {
      data: JSON.stringify({ state: "DEAD", teamGame: false })
    });
    expect(res.status()).toBe(200);
    const saved = await prisma.player.findUniqueOrThrow({
      where: { id: player.id }
    });
    expect(saved.state).toBe("DEAD");
  });
});

test.describe("PUT /api/tournament/[id]/update", () => {
  test("player cannot update the tournament", async ({
    playerPage,
    playerSetup,
    prisma
  }) => {
    const { tournament } = playerSetup;
    const res = await playerPage.request.put(
      `/api/tournament/${tournament.id}/update`,
      { data: JSON.stringify({ name: "Kaapattu turnaus" }) }
    );
    expect(res.status()).toBe(403);
    const saved = await prisma.tournament.findUniqueOrThrow({
      where: { id: tournament.id }
    });
    expect(saved.name).toBe(tournament.name);
  });

  test("umpire can update their tournament", async ({
    umpirePage,
    umpireSetup,
    prisma
  }) => {
    const { tournament } = umpireSetup;
    const res = await umpirePage.request.put(
      `/api/tournament/${tournament.id}/update`,
      { data: JSON.stringify({ name: `${tournament.name} (muokattu)` }) }
    );
    expect(res.status()).toBe(200);
    const saved = await prisma.tournament.findUniqueOrThrow({
      where: { id: tournament.id }
    });
    expect(saved.name).toBe(`${tournament.name} (muokattu)`);
  });
});

test.describe("PATCH /api/player/[id]", () => {
  test("another player cannot update someone else's player data", async ({
    page,
    loginAs,
    playerSetup,
    prisma
  }) => {
    const { tournament, player } = playerSetup;
    const attacker = await createPlayer(tournament.id);
    await loginAs(attacker.user);

    const res = await page.request.patch(`/api/player/${player.userId}`, {
      data: JSON.stringify({ alias: "Kaapattu" })
    });
    expect(res.status()).toBe(403);
    const saved = await prisma.player.findUniqueOrThrow({
      where: { id: player.id }
    });
    expect(saved.alias).toBe(player.alias);
  });
});

test.describe("POST /api/player/[id]/wanted", () => {
  test("player cannot issue a wanted notice", async ({
    playerPage,
    playerSetup
  }) => {
    const { player } = playerSetup;
    const res = await playerPage.request.post(
      `/api/player/${player.id}/wanted`
    );
    expect(res.status()).toBe(403);
  });
});

test.describe("POST /api/sign-cloudinary-params", () => {
  const sign = (
    page: import("@playwright/test").Page,
    tournamentId: string,
    userId: string
  ) =>
    page.request.post("/api/sign-cloudinary-params", {
      data: {
        paramsToSign: {
          public_id: userId,
          folder: `hys_surma/${tournamentId}`,
          timestamp: Math.floor(Date.now() / 1000)
        }
      }
    });

  test("player can sign an upload of their own picture", async ({
    playerPage,
    playerSetup
  }) => {
    const { tournament, player } = playerSetup;
    const res = await sign(playerPage, tournament.id, player.userId);
    expect(res.status()).toBe(200);
    expect((await res.json()).signature).toBeTruthy();
  });

  test("player cannot sign an upload over another player's picture", async ({
    playerPage,
    playerSetup
  }) => {
    const { tournament } = playerSetup;
    const other = await createPlayer(tournament.id);
    const res = await sign(playerPage, tournament.id, other.userId);
    expect(res.status()).toBe(403);
  });

  test("anonymous visitor cannot sign uploads", async ({
    page,
    playerSetup
  }) => {
    const { tournament, player } = playerSetup;
    const res = await sign(page, tournament.id, player.userId);
    expect(res.status()).toBe(403);
  });
});
