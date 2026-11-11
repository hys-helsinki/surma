import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const seed = async () => {
  await prisma.user.deleteMany();
  await prisma.tournament.deleteMany();

  const tournament = await prisma.tournament.create({
    data: {
      name: "Testiturnaus",
      startTime: new Date("2026-12-01T00:00:00Z"),
      endTime: new Date("2026-12-03T00:00:00Z"),
      registrationStartTime: new Date("2026-01-01T00:00:00Z"),
      registrationEndTime: new Date("2026-12-31T00:00:00Z")
    }
  });

  await prisma.user.create({
    data: {
      firstName: "Testi",
      lastName: "Käyttäjä",
      email: "test@email",
      tournament: { connect: { id: tournament.id } },
      player: {
        create: {
          tournament: { connect: { id: tournament.id } },
          alias: "Testi alias",
          address: "Testiosoite 1",
          calendar: [
            ["1.12.2026", ""],
            ["2.12.2026", ""],
            ["3.12.2026", "Testikalenteri"]
          ]
        }
      }
    }
  });

  await prisma.user.create({
    data: {
      firstName: "Toinen",
      lastName: "Käyttäjä",
      email: "test@emaaili",
      tournament: { connect: { id: tournament.id } },
      player: {
        create: {
          tournament: { connect: { id: tournament.id } },
          alias: "Jeeeeeeee",
          address: "Testiosoite 2",
          calendar: [
            ["1.12.2026", ""],
            ["2.12.2026", ""],
            ["3.12.2026", "Testikalenteri"]
          ]
        }
      }
    }
  });

  // SEED_EMAIL can be added if the developer wants to login to the app with their own email right after the seeding.
  await prisma.user.create({
    data: {
      firstName: "Tuomari",
      lastName: "Käyttäjä",
      email: process.env.SEED_EMAIL ?? "tuomari@test.fi",
      tournament: { connect: { id: tournament.id } },
      umpire: {
        create: {
          tournament: { connect: { id: tournament.id } },
          responsibility: "Päätuomari",
          mainUmpire: true
        }
      }
    }
  });

  await prisma.user.create({
    data: {
      firstName: "Tuomari",
      lastName: "Käyttäjä2",
      email: "tuomari2@test.fi",
      tournament: { connect: { id: tournament.id } },
      umpire: {
        create: {
          tournament: { connect: { id: tournament.id } },
          responsibility: "Asetuomari",
          mainUmpire: false
        }
      }
    }
  });

  await prisma.user.create({
    data: {
      firstName: "Admini",
      lastName: "Käyttäjä",
      email: process.env.ADMIN_EMAIL,
      role: "ADMIN"
    }
  });

  console.log("Seeding done!");
};

seed()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
