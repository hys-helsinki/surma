import { v2 as cloudinary } from "cloudinary";

// E2E tests run with dummy credentials: skip all Cloudinary API calls.
const isDisabled = () => process.env.E2E_DISABLE_CLOUDINARY === "1";

const folder = (tournamentId: string) => `hys_surma/${tournamentId}/`;

/** Returns the URL of the user's uploaded image, or "" if there is none. */
export const getUserImageUrl = async (
  tournamentId: string,
  userId: string
): Promise<string> => {
  if (isDisabled()) return "";
  try {
    const result = await cloudinary.api.resource(
      `${folder(tournamentId)}${userId}`
    );
    return result.secure_url;
  } catch (error) {
    if (error?.error?.http_code !== 404) {
      console.error(error);
    }
    return "";
  }
};

/** Deletes all images uploaded for the tournament. */
export const deleteTournamentImages = async (tournamentId: string) => {
  if (isDisabled()) return;
  await cloudinary.api.delete_resources_by_prefix(
    folder(tournamentId),
    function (result) {
      console.log(result);
    }
  );
};
