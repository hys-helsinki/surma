import { SESClient } from "@aws-sdk/client-ses";

const SES_CONFIG = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: "eu-north-1"
};

export default function sendMail(recipient: String, payload: String) {
  const client = new SESClient(SES_CONFIG);
  client.send;
}
