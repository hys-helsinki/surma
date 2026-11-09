import { PrismaClient } from "@prisma/client";

const url = process.env.POSTGRES_URL ?? "";

// Safety guard: tests write to and delete from the database. Refuse to run
// against anything that isn't the local test database.
const isLocal = /@(localhost|127\.0\.0\.1)[:/]/.test(url);
const isTestDb = /_test(\?|$)/.test(url);
if (!isLocal || !isTestDb) {
  throw new Error(
    `Refusing to run E2E tests against a non-test database (POSTGRES_URL host/db must be localhost and end in "_test"). ` +
      `Make sure .env.test is loaded.`
  );
}

export const prisma = new PrismaClient({ datasourceUrl: url });
