import { randomBytes } from "crypto";
import type { BrowserContext } from "@playwright/test";
import { prisma } from "./db";

// NEXTAUTH_URL is http:// in tests, so NextAuth uses the non-secure cookie name.
// (Over https it would be "__Secure-next-auth.session-token".)
export const SESSION_COOKIE = "next-auth.session-token";

const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * Creates a database session for the user, exactly like NextAuth's Prisma
 * adapter does after a successful magic-link login, and returns its token.
 */
export const createSession = async (userId: string): Promise<string> => {
  const sessionToken = randomBytes(32).toString("hex");
  await prisma.session.create({
    data: {
      sessionToken,
      userId,
      expires: new Date(Date.now() + SESSION_TTL_MS)
    }
  });
  return sessionToken;
};

/** Logs the browser context in as the given user by setting the session cookie. */
export const loginAs = async (
  context: BrowserContext,
  userId: string,
  baseURL: string
): Promise<void> => {
  const sessionToken = await createSession(userId);
  await context.addCookies([
    {
      name: SESSION_COOKIE,
      value: sessionToken,
      url: baseURL,
      httpOnly: true,
      sameSite: "Lax"
    }
  ]);
};
