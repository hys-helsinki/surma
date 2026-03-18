import NextAuth from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "../../../lib/prisma";
import { Prisma } from "@prisma/client";
import sendEmail from "../../../lib/ses_mailer";

// Jos joku keksii miten nämä lokalisoidaan, niin saa toteuttaa. Laitoin nyt englanniksi.

const emailText = "Sign in to Surma using the button below";
const emailButton = "Sign in here";
const emailNote =
  "NOTE! The login link in this email is valid for 24 hours. After that, you can send a new link through the Surma login button.";

const html = (url: string) => {
  return `
<body style="background: #f9f9f9">
  <table
    width="100%"
    border="0"
    cellspacing="20"
    cellpadding="0"
    style="
      background: #fff;
      max-width: 600px;
      margin: auto;
      border-radius: 10px;
    "
  >
    <tr>
      <td
        align="center"
        style="
          padding: 10px 0px;
          font-size: 22px;
          font-family: Helvetica, Arial, sans-serif;
          color: #444;
        "
      >
        ${emailText}
      </td>
    </tr>
    <tr>
      <td align="center" style="padding: 20px 0">
        <table border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td
              align="center"
              style="border-radius: 5px"
              bgcolor="black"
            >
              <a
                href="${url}"
                target="_blank"
                style="
                  font-size: 18px;
                  font-family: Helvetica, Arial, sans-serif;
                  color: #fff;
                  text-decoration: none;
                  border-radius: 5px;
                  padding: 10px 20px;
                  border: 1px solid black;
                  display: inline-block;
                  font-weight: bold;
                "
                >${emailButton}</a
              >
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td
        align="center"
        style="
          padding: 0px 0px 10px 0px;
          font-size: 16px;
          line-height: 22px;
          font-family: Helvetica, Arial, sans-serif;
          color: #444;
        "
      >
        ${emailNote}
      </td>
  </table>
</body>

`;
};

const text = (url: string) => {
  return `Sign in to Surma\n${url}\n\nNOTE! The login link in this email is valid for 24 hours. After that, you can send a new link through the Surma login button.`;
};

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
      from: "Surma authorization <no-reply.surma@salamurhaajat.net>",
      async sendVerificationRequest({
        identifier: email,
        url,
        provider: { server, from }
      }) {
        const htmlContents = html(url);
        const textContents = text(url);
        sendEmail(from, email, "Sign in to Surma", textContents, htmlContents);
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
