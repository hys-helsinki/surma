import type { NextApiRequest, NextApiResponse } from "next";
require("dotenv").config();
const cloudinary = require("cloudinary").v2;

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
      console.log("Error on Cloudinary upload:", error);
      res.status(500).json({ error: "something went wrong" });
    }
  }
}
