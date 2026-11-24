import { test, expect } from "./fixtures";

test.describe("session fixtures", () => {
  test("seeded session is recognized by NextAuth", async ({
    userPage,
    user
  }) => {
    const response = await userPage.request.get("/api/auth/session");
    const session = await response.json();
    expect(session.user.id).toBe(user.id);
    expect(session.user.email).toBe(user.email);
  });

  test("anonymous visitor has no session", async ({ page }) => {
    const response = await page.request.get("/api/auth/session");
    expect(await response.json()).toEqual({});
  });
});

test.describe("admin page access", () => {
  test("anonymous visitor is redirected away", async ({ page }) => {
    await page.goto("/admin/create-tournament");
    await expect(page).toHaveURL("/");
  });

  test("regular user is redirected away", async ({ userPage }) => {
    await userPage.goto("/admin/create-tournament");
    // Redirected to "/", which then forwards logged-in users to their own page.
    await expect(userPage).not.toHaveURL(/\/admin\//);
  });

  test("admin can open the page", async ({ adminPage }) => {
    await adminPage.goto("/admin/create-tournament");
    await expect(adminPage).toHaveURL("/admin/create-tournament");
  });
});

test.describe("umpire page access", () => {
  test("umpire can open their tournament's umpire page", async ({
    umpirePage,
    umpireSetup
  }) => {
    const url = `/tournaments/${umpireSetup.tournament.id}/umpire-page`;
    await umpirePage.goto(url);
    await expect(umpirePage).toHaveURL(url);
  });

  test("non-umpire is redirected away", async ({
    page,
    loginAs,
    createUser,
    umpireSetup
  }) => {
    const { tournament } = umpireSetup;
    const player = await createUser({ tournamentId: tournament.id });
    await loginAs(player);

    await page.goto(`/tournaments/${tournament.id}/umpire-page`);
    await expect(page).not.toHaveURL(/umpire-page/);
  });
});
