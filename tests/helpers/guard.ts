/**
 * Safety guard: tests write to and delete from the database. Refuse to run
 * against anything that isn't the local test database.
 */
export const assertTestDatabaseUrl = (url: string | undefined): string => {
  const value = url ?? "";
  const isLocal = /@(localhost|127\.0\.0\.1)[:/]/.test(value);
  const isTestDb = /_test(\?|$)/.test(value);
  if (!isLocal || !isTestDb) {
    throw new Error(
      `Refusing to run E2E tests against a non-test database (POSTGRES_URL host/db must be localhost and end in "_test"). ` +
        `Make sure .env.test is loaded.`
    );
  }
  return value;
};
