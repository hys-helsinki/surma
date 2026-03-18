import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";
import { defaultProvider } from "@aws-sdk/credential-provider-node";
import nodemailer from "nodemailer";

export default async function sendEmail(
  from: String,
  to: String,
  subject: String,
  payload: String,
  htmlPayload?: String
) {
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
