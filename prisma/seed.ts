import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const seed = async() => {
  await prisma.user.deleteMany()
  await prisma.tournament.deleteMany()

  const tournament = await prisma.tournament.create({
    data: {
      name: 'Testiturnaus',
      startTime: new Date('2024-01-01T00:00:00Z'),
      endTime: new Date('2024-01-01T00:00:00Z'),
      registrationStartTime: new Date('2024-01-01T00:00:00Z'),
      registrationEndTime: new Date('2024-12-31T00:00:00Z')
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
          tournament: { connect: { id: tournament.id  } },
          alias: "Testi alias",
          address: "Testiosoite 1",
        }
      }
    }
  })

  await prisma.user.create({
    data: {
      firstName: "Toinen",
      lastName: "Käyttäjä",
      email: "test@emaaili",
      tournament: { connect: { id: tournament.id } },
      player: {
        create: {
          tournament: { connect: { id: tournament.id  } },
          alias: "Jeeeeeeee",
          address: "Testiosoite 2",
        }
      }
    }
  })

  await prisma.user.create({
    data: {
      firstName: "Admini",
      lastName: "Käyttäjä",
      email: process.env.ADMIN_EMAIL,
      tournament: { connect: { id: tournament.id } },
      umpire: {
        create: {
          tournament: { connect: { id: tournament.id  } },
        }
      }
    }
  })
  console.log("Seeding done!")
}

seed()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })