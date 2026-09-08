import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
  if (!adminEmail) {
    throw new Error("ADMIN_EMAIL must be set");
  }

  const firstName = process.env.ADMIN_FIRST_NAME || "Admin";
  const lastName = process.env.ADMIN_LAST_NAME || "Käyttäjä";

  const user = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      firstName,
      lastName,
      role: "ADMIN"
    },
    create: {
      email: adminEmail,
      firstName,
      lastName,
      role: "ADMIN"
    }
  });

  console.log(`Admin user ready: ${user.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
