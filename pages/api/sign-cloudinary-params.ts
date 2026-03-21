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

export default async function upload(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!isCurrentUserAuthorized(req.query.id, req, res)) {
    res.status(403).end();
  }
  const { paramsToSign } = req.body;

  try {
    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET
    );
    res.status(200).json({
      signature
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
}
