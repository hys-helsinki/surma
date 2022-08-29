import aws from "@aws-sdk/client-ses";
import nodemailer from "nodemailer";
import { defaultProvider } from "@aws-sdk/credential-provider-node";
// const SES_CONFIG = {
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
// };

export default function sendEmail(
  from: String,
  to: String,
  subject: String,
  payload: String
) {
  const ses = new aws.SES({
    apiVersion: "2010-12-01",
    region: "eu-north-1",
    credentialDefaultProvider: defaultProvider
  });

  // create Nodemailer SES transporter
  let transporter = nodemailer.createTransport({
    SES: { ses, aws }
  });

  // send some mail
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
      console.log(info.envelope);
      console.log(info.messageId);
    }
  );
}
// export default function sendMail(recipient: String, payload: String) {
//   const client = new SESClient(SES_CONFIG);
//   const sendCommand = new SendEmailCommand();
//   client.send;
// }
