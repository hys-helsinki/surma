import { test as base, expect } from "./fixtures";
import { prisma } from "./helpers/db";
import {
  CREATE_TOURNAMENT_URL,
  addUmpireButton,
  daysFromNow,
  fieldError,
  fillTournament,
  fillUmpire,
  submit,
  submitExpectingValidationError,
  successHeading,
  uniqueEmail,
  validTournament,
  validUmpire
} from "./helpers/create-tournament";

/**
 * Tournaments created through the form/API aren't made by the factories, so
 * the tests register their (unique) names here and they are deleted, with
 * their umpire users, after the test.
 */
const test = base.extend<{ cleanupTournament: (name: string) => void }>({
  cleanupTournament: async ({}, use) => {
    const names: string[] = [];
    await use((name) => names.push(name));
    await prisma.tournament.deleteMany({ where: { name: { in: names } } });
  }
});

const findTournament = (name: string) =>
  prisma.tournament.findFirst({
    where: { name },
    include: {
      umpires: {
        include: { user: true },
        orderBy: { user: { firstName: "asc" } }
      }
    }
  });

test.describe("create tournament form", () => {
  test("admin creates a tournament with two umpires", async ({
    adminPage: page,
    cleanupTournament
  }) => {
    const tournament = validTournament({ teamGame: true });
    cleanupTournament(tournament.name);
    const mainUmpire = validUmpire({
      firstName: "Aino",
      lastName: "Päätuomari",
      // Emails are stored in lower case so the magic-link login matches.
      email: uniqueEmail().replace("e2e-", "E2E-Iso-"),
      responsibility: "Kohdejako",
      mainUmpire: true
    });
    const otherUmpire = validUmpire({
      firstName: "Bertta",
      lastName: "Apulainen",
      phone: "050 333 4444",
      responsibility: "Kuolinilmoitukset",
      mainUmpire: false
    });

    await page.goto(CREATE_TOURNAMENT_URL);
    await expect(
      page.getByRole("heading", { name: "Turnauksen luominen", exact: true })
    ).toBeVisible();
    await fillTournament(page, tournament);
    await fillUmpire(page, 0, mainUmpire);
    await addUmpireButton(page).click();
    await fillUmpire(page, 1, otherUmpire);

    const response = await submit(page);
    expect(response.status()).toBe(201);

    // Confirmation message
    await expect(successHeading(page)).toBeVisible();
    await expect(page.getByText(`Nimi: ${tournament.name}`)).toBeVisible();
    await expect(page.getByText("Joukkueturnaus: Kyllä")).toBeVisible();
    for (const umpire of [mainUmpire, otherUmpire]) {
      await expect(
        page.getByText(`${umpire.firstName} ${umpire.lastName}`)
      ).toBeVisible();
      await expect(
        page.getByText(`Sähköposti: ${umpire.email.toLowerCase()}`)
      ).toBeVisible();
      await expect(
        page.getByText(`Vastuualue: ${umpire.responsibility}`)
      ).toBeVisible();
    }

    // Database
    const saved = await findTournament(tournament.name);
    expect(saved).not.toBeNull();
    expect(saved.teamGame).toBe(true);
    expect(saved.startTime).toEqual(tournament.startTime);
    expect(saved.endTime).toEqual(tournament.endTime);
    expect(saved.registrationStartTime).toEqual(
      tournament.registrationStartTime
    );
    expect(saved.registrationEndTime).toEqual(tournament.registrationEndTime);

    expect(saved.umpires).toHaveLength(2);
    const [savedMain, savedOther] = saved.umpires;
    expect(savedMain).toMatchObject({
      mainUmpire: true,
      responsibility: mainUmpire.responsibility,
      user: {
        firstName: mainUmpire.firstName,
        lastName: mainUmpire.lastName,
        email: mainUmpire.email.toLowerCase(),
        phone: mainUmpire.phone,
        role: "USER",
        tournamentId: saved.id
      }
    });
    expect(savedOther).toMatchObject({
      mainUmpire: false,
      responsibility: otherUmpire.responsibility,
      user: {
        firstName: otherUmpire.firstName,
        email: otherUmpire.email,
        role: "USER",
        tournamentId: saved.id
      }
    });
  });

  test("created umpire is taken to the new tournament's umpire page", async ({
    adminPage: page,
    context,
    loginAs,
    cleanupTournament
  }) => {
    // Visits three pages; on the dev server each may need to compile first.
    test.slow();
    const tournament = validTournament();
    cleanupTournament(tournament.name);
    const umpire = validUmpire();

    await page.goto(CREATE_TOURNAMENT_URL);
    await fillTournament(page, tournament);
    await fillUmpire(page, 0, umpire);
    expect((await submit(page)).status()).toBe(201);

    const saved = await findTournament(tournament.name);
    await context.clearCookies();
    await loginAs(saved.umpires[0].user);
    await page.goto("/");
    await expect(page).toHaveURL(`/tournaments/${saved.id}/umpire-page`);
  });

  test("required fields are validated", async ({ adminPage: page }) => {
    await page.goto(CREATE_TOURNAMENT_URL);
    await submitExpectingValidationError(page);

    // Name + first name, last name, email and phone of the umpire.
    await expect(fieldError(page, "Pakollinen")).toHaveCount(5);
    // Shown even though the umpire's other fields are invalid too.
    await expect(
      fieldError(page, "Valitse vähintään yksi päätuomari")
    ).toBeVisible();
  });

  test("at least one main umpire is required", async ({ adminPage: page }) => {
    await page.goto(CREATE_TOURNAMENT_URL);
    await fillTournament(page, validTournament());
    await fillUmpire(page, 0, validUmpire({ mainUmpire: false }));
    await addUmpireButton(page).click();
    await fillUmpire(page, 1, validUmpire({ mainUmpire: false }));

    await submitExpectingValidationError(page);
    await expect(
      fieldError(page, "Valitse vähintään yksi päätuomari")
    ).toBeVisible();
  });

  test("tournament cannot end before it starts", async ({
    adminPage: page
  }) => {
    await page.goto(CREATE_TOURNAMENT_URL);
    await fillTournament(
      page,
      validTournament({ startTime: daysFromNow(14), endTime: daysFromNow(7) })
    );
    await fillUmpire(page, 0, validUmpire());

    await submitExpectingValidationError(page);
    await expect(
      fieldError(page, "Turnaus ei voi päättyä ennen alkamista")
    ).toBeVisible();
  });

  test("tournament cannot start or end in the past", async ({
    adminPage: page
  }) => {
    await page.goto(CREATE_TOURNAMENT_URL);
    await fillTournament(
      page,
      validTournament({
        startTime: daysFromNow(-7),
        endTime: daysFromNow(-1),
        registrationStartTime: daysFromNow(-14),
        registrationEndTime: daysFromNow(-8)
      })
    );
    await fillUmpire(page, 0, validUmpire());

    await submitExpectingValidationError(page);
    await expect(
      fieldError(page, "Turnaus ei voi alkaa menneisyydessä")
    ).toBeVisible();
    await expect(
      fieldError(page, "Turnaus ei voi päättyä menneisyydessä")
    ).toBeVisible();
    await expect(
      fieldError(page, "Ilmoittautuminen ei voi päättyä menneisyydessä")
    ).toBeVisible();
  });

  test("registration cannot end before it starts", async ({
    adminPage: page
  }) => {
    await page.goto(CREATE_TOURNAMENT_URL);
    await fillTournament(
      page,
      validTournament({
        registrationStartTime: daysFromNow(5),
        registrationEndTime: daysFromNow(2)
      })
    );
    await fillUmpire(page, 0, validUmpire());

    await submitExpectingValidationError(page);
    await expect(
      fieldError(
        page,
        "Turnauksen ilmoittautuminen ei voi päättyä ennen alkamista"
      )
    ).toBeVisible();
  });

  test("added umpire can be removed, the first one cannot", async ({
    adminPage: page
  }) => {
    await page.goto(CREATE_TOURNAMENT_URL);
    const removeButtons = page.getByRole("button", { name: "Poista tuomari" });
    await expect(removeButtons).toHaveCount(0);

    await addUmpireButton(page).click();
    await addUmpireButton(page).click();
    await expect(
      page.getByRole("heading", { name: "Tuomari 3" })
    ).toBeVisible();
    await expect(removeButtons).toHaveCount(2);

    await removeButtons.first().click();
    await expect(page.getByRole("heading", { name: "Tuomari 3" })).toHaveCount(
      0
    );
    await expect(
      page.getByRole("heading", { name: "Tuomari 2" })
    ).toBeVisible();
    await expect(removeButtons).toHaveCount(1);
  });

  test("existing email shows an error and creates nothing", async ({
    adminPage: page,
    createUser,
    cleanupTournament
  }) => {
    const existing = await createUser();
    const tournament = validTournament();
    cleanupTournament(tournament.name);

    await page.goto(CREATE_TOURNAMENT_URL);
    await fillTournament(page, tournament);
    // Upper case: the API lower-cases emails before saving.
    await fillUmpire(
      page,
      0,
      validUmpire({ email: existing.email.toUpperCase() })
    );

    const response = await submit(page);
    expect(response.status()).toBe(409);
    await expect(
      page
        .getByRole("alert")
        .getByText(
          "Jokin annetuista sähköposteista on jo olemassa. Kokeile toista osoitetta"
        )
    ).toBeVisible();
    await expect(successHeading(page)).toHaveCount(0);

    // The tournament is created in the same transaction, so it's rolled back.
    expect(await findTournament(tournament.name)).toBeNull();
  });
});

test.describe("POST /api/tournament/create", () => {
  const body = (name: string, email = uniqueEmail()) =>
    JSON.stringify({
      tournament: {
        name,
        startTime: daysFromNow(7),
        endTime: daysFromNow(14),
        registrationStartTime: daysFromNow(0),
        registrationEndTime: daysFromNow(6)
      },
      umpires: [
        {
          firstName: "Api",
          lastName: "Tuomari",
          email,
          phone: "040 000 0000",
          mainUmpire: true
        }
      ]
    });

  test("other methods than POST are rejected with 405", async ({
    adminPage
  }) => {
    // Used to leave the request hanging without a response.
    const res = await adminPage.request.get("/api/tournament/create", {
      timeout: 10_000
    });
    expect(res.status()).toBe(405);
    expect(res.headers()["allow"]).toBe("POST");
  });

  test("anonymous visitor cannot create a tournament", async ({
    page,
    cleanupTournament
  }) => {
    const name = `${validTournament().name} anon`;
    cleanupTournament(name);
    const res = await page.request.post("/api/tournament/create", {
      data: body(name)
    });
    expect(res.status()).toBe(403);
    expect(await findTournament(name)).toBeNull();
  });

  test("regular user cannot create a tournament", async ({
    userPage,
    cleanupTournament
  }) => {
    const name = `${validTournament().name} user`;
    cleanupTournament(name);
    const res = await userPage.request.post("/api/tournament/create", {
      data: body(name)
    });
    expect(res.status()).toBe(403);
    expect(await findTournament(name)).toBeNull();
  });

  test("umpire cannot create a tournament", async ({
    umpirePage,
    cleanupTournament
  }) => {
    const name = `${validTournament().name} umpire`;
    cleanupTournament(name);
    const res = await umpirePage.request.post("/api/tournament/create", {
      data: body(name)
    });
    expect(res.status()).toBe(403);
    expect(await findTournament(name)).toBeNull();
  });

  test("admin can create a tournament", async ({
    adminPage,
    cleanupTournament
  }) => {
    const name = validTournament().name;
    cleanupTournament(name);
    const email = uniqueEmail().toUpperCase();
    const res = await adminPage.request.post("/api/tournament/create", {
      data: body(name, email)
    });
    expect(res.status()).toBe(201);
    const json = await res.json();
    expect(json.createdTournament.name).toBe(name);
    expect(json.umpireUsers).toHaveLength(1);
    expect(json.umpireUsers[0].user.email).toBe(email.toLowerCase());

    const saved = await findTournament(name);
    expect(saved.id).toBe(json.createdTournament.id);
    expect(saved.umpires).toHaveLength(1);
    expect(saved.umpires[0].mainUmpire).toBe(true);
    expect(saved.umpires[0].user.email).toBe(email.toLowerCase());
  });

  test("duplicate umpire email returns 409 and rolls back", async ({
    adminPage,
    cleanupTournament
  }) => {
    const name = validTournament().name;
    cleanupTournament(name);
    const email = uniqueEmail();
    const payload = JSON.parse(body(name, email));
    payload.umpires.push({ ...payload.umpires[0], firstName: "Toinen" });

    const res = await adminPage.request.post("/api/tournament/create", {
      data: JSON.stringify(payload)
    });
    expect(res.status()).toBe(409);
    expect(await findTournament(name)).toBeNull();
    expect(await prisma.user.findUnique({ where: { email } })).toBeNull();
  });
});
