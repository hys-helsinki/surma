import type { NextApiRequest, NextApiResponse } from "next";
require("dotenv").config();
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export default async function upload(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const imageData = JSON.parse(req.body);
      const uploadedResponse = await cloudinary.uploader.upload(imageData.url, {
        public_id: imageData.publicId
      });
      res.json({ msg: "jee toimii!" });
    } catch (error) {
      res.status(500).json({ error: "something went wrong" });
    }
  }
}
