import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";
import { defaultProvider } from "@aws-sdk/credential-provider-node";
import nodemailer from "nodemailer";

export default async function sendEmail(
  from: string,
  to: string,
  subject: string,
  payload: string,
  htmlPayload?: string
) {
  // E2E tests: never send real email, just log it.
  if (process.env.E2E_DISABLE_EMAIL === "1") {
    console.log(
      `[E2E_DISABLE_EMAIL] Not sending email\nFrom: ${from}\nTo: ${to}\nSubject: ${subject}\n\n${payload}`
    );
    return;
  }

  const sesClient = new SESv2Client({
    region: "eu-north-1",
    credentials: defaultProvider()
  });

  const transporter = nodemailer.createTransport({
    SES: { sesClient, SendEmailCommand }
  });

  try {
    await transporter.sendMail({
      from,
      to,
      subject,
      text: payload,
      html: htmlPayload,
      ses: {
        EmailTags: [
          {
            Name: "test_tag",
            Value: "test_tag_value"
          }
        ]
      }
    });
  } catch (err) {
    console.log(err);
  }
}
