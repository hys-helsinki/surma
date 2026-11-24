import { execSync } from "child_process";
import dotenv from "dotenv";
import { assertTestDatabaseUrl } from "./helpers/guard";

/**
 * Runs once before the whole test run: recreates the test database schema
 * from prisma/migrations so every run starts from an empty, up-to-date DB.
 *
 * Individual tests create their own uniquely named data (see
 * tests/helpers/factories.ts), so no truncation is needed between tests.
 */
export default async function globalSetup() {
  // playwright.config.ts already loads this, but be explicit: this function
  // is about to wipe a database and must never see the dev/prod URL.
  dotenv.config({ path: ".env.test", override: true });
  const url = assertTestDatabaseUrl(process.env.POSTGRES_URL);

  execSync("npx prisma migrate reset --force --skip-seed --skip-generate", {
    stdio: "inherit",
    env: { ...process.env, POSTGRES_URL: url }
  });
}
