import NextAuth, { DefaultSession } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "../../../lib/prisma";
import { Prisma } from "@prisma/client";
import bcrypt from "bcrypt";

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
    }),
    CredentialsProvider({
      id: "admin-login",
      name: "Credentials",
      credentials: {
        username: {
          label: "Email",
          type: "text",
          placeholder: "your username"
        },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        // Find user by username (or email)
        const adminUser = await prisma.adminUser.findUnique({
          where: { email: credentials.username } // Or use another unique field for username
        });

        if (adminUser && adminUser.password) {
          const isValid = await bcrypt.compare(
            credentials.password,
            adminUser.password
          );
          if (isValid) {
            return { id: "ADMIN", name: "ADMIN", email: adminUser.email };
          }
        }
        // Reject if not valid
        return null;
      }
    })
  ],
  callbacks: {
    async session({ session, token, user }) {
      try {
        await prisma.player.update({
          where: { userId: user.id },
          data: { lastVisit: new Date() }
        });
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code == "P2025") {
            console.log(
              `Unable to log lastVisit for ${user.id}, user has no player entry`
            );
          } else {
            console.log(
              `Unable to log lastVisit for ${user.id}, error: ${error.code} : ${error.message}`
            );
          }
        }
      }
      return {
        ...session,
        user: { id: user.id, tournamentId: user.tournamentId, ...session.user }
      };
    }
  }
};

export default NextAuth(authConfig);
