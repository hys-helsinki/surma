import type { NextApiRequest, NextApiResponse } from "next";
import { v2 as cloudinary } from "cloudinary";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb"
    }
  }
};

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
      res.status(200).send(uploadedResponse);
    } catch (error) {
      console.log("Error on Cloudinary upload:", error);
      res.status(500).json({ error: "something went wrong" });
    }
  }
}
