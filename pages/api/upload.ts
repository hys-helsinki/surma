import prisma from "../../lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { v2 as cloudinary } from "cloudinary";
import { authConfig } from "./auth/[...nextauth]";

const isCurrentUserAuthorized = async (playerId, req, res) => {
  const session = await getServerSession(req, res, authConfig);

  const currentPlayer = await prisma.player.findFirst({
    where: {
      id: playerId,
      userId: session.user.id
    }
  });
  return currentPlayer;
};

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
  if (!isCurrentUserAuthorized(req.query.id, req, res)) {
    res.status(403).end();
  }
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
