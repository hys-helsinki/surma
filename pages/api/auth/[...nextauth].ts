import NextAuth, { DefaultSession } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "../../../lib/prisma";

export const authConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // Passwordless / email sign in
    EmailProvider({
      server: {
        host: process.env.SMTP_URL,
        port: process.env.SMTP_PORT,
        auth: {
          user: process.env.SMTP_USERNAME,
          pass: process.env.SMTP_PASSWORD
        }
      },
      from: "Surma authorization <no-reply.surma@salamurhaajat.net>"
    })
  ],
  callbacks: {
    async session({ session, token, user }) {
      return {
        ...session,
        user: { id: user.id, ...session.user }
      };
    },
    async signIn({ user, account, profile, email, credentials }) {
      console.log("user:", user);
      const currentUser = await prisma.user.findUnique({
        where: {
          id: user.id
        },
        select: {
          umpire: true
        }
      });
      const isAllowedToSignIn = currentUser && currentUser.umpire != null; // EI-TUOMARIPELAAJAT EIVÄT SAA KIRJAUTUA VIELÄ
      if (isAllowedToSignIn) {
        return true;
      } else {
        // Return false to display a default error message
        return false;
        // Or you can return a URL to redirect to:
        // return '/unauthorized'
      }
    }
  }
};

export default NextAuth(authConfig);
