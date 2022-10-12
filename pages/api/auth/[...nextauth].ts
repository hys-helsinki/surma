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
      await prisma.player.update({
        where: { userId: user.id },
        data: { lastVisit: new Date() }
      });
      return {
        ...session,
        user: { id: user.id, ...session.user }
      };
    }
  }
};

export default NextAuth(authConfig);
