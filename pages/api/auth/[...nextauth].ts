import NextAuth from "next-auth";
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
  ]
};

export default NextAuth(authConfig);
