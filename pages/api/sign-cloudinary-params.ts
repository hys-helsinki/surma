import prisma from "../../lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { v2 as cloudinary } from "cloudinary";
import { authConfig } from "./auth/[...nextauth]";

/**
 * Users may only sign uploads of their own picture, i.e. the exact path
 * ImageUploadForm uses: hys_surma/<tournamentId>/<userId>. Otherwise anyone
 * could overwrite other players' pictures. (The user may not have a Player
 * row yet: the picture can be uploaded on the registration form.)
 */
const isCurrentUserAuthorized = async (paramsToSign, req, res) => {
  const session = await getServerSession(req, res, authConfig);
  if (!session || !paramsToSign) return false;

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, tournamentId: true }
  });
  if (!currentUser?.tournamentId) return false;

  return (
    paramsToSign.public_id === currentUser.id &&
    paramsToSign.folder === `hys_surma/${currentUser.tournamentId}`
  );
};

export default async function upload(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { paramsToSign } = req.body ?? {};
  if (!(await isCurrentUserAuthorized(paramsToSign, req, res))) {
    return res.status(403).end();
  }

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
