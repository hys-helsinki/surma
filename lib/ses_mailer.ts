import { SES, SendRawEmailCommand } from "@aws-sdk/client-ses";
import nodemailer from "nodemailer";
import { defaultProvider } from "@aws-sdk/credential-provider-node";

export default function sendEmail(
  from: String,
  to: String,
  subject: String,
  payload: String
) {
  const ses = new SES({
    apiVersion: "2010-12-01",
    region: "eu-north-1",
    credentialDefaultProvider: defaultProvider
  });

  // TODO: would this be better as singleton?
  let transporter = nodemailer.createTransport({
    SES: { ses, aws: { SendRawEmailCommand } }
  });

  transporter.sendMail(
    {
      from,
      to,
      subject,
      text: payload,
      ses: {
        // optional extra arguments for SendRawEmail
        Tags: [
          {
            Name: "test_tag",
            Value: "test_tag_value"
          }
        ]
      }
    },
    (err, info) => {
      console.log(err);
      if (info) {
        console.log(info.envelope);
        console.log(info.messageId);
      }
    }
  );
}
