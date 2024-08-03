import { Box } from "@mui/material";
import { UpdateForm } from "./UpdateForm";
import { useRouter } from "next/router";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";

type FormData = {
  address: string;
  learningInstitution: string;
  eyeColor: string;
  hair: string;
  height: number;
  other: string;
  security: string;
};

const PlayerDetails = ({ user, isUpdated }) => {
  const router = useRouter();
  const { id } = router.query;

  const player = user.player;

  const handleDetailsSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const data: FormData = {
      address: event.currentTarget.address.value,
      learningInstitution: event.currentTarget.learningInstitution.value,
      eyeColor: event.currentTarget.eyeColor.value,
      hair: event.currentTarget.hair.value,
      height: parseInt(event.currentTarget.height.value),
      other: event.currentTarget.other.value,
      security: event.currentTarget.security.value
    };
    try {
      await fetch(`/api/user/update/${id}`, {
        method: "PUT",
        body: JSON.stringify(data)
      });
      router.reload();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Box>
      <Box sx={{ mt: 4 }}>
        <h2>Kuvaus</h2>
        {isUpdated ? (
          <>
            <p>
              <PriorityHighIcon
                color="warning"
                fontSize="small"
                sx={{ mr: 1 }}
              />
              <b>
                Turvallisuushuomiot (esim. pelin ulkopuolelle rajatut ajat ja
                paikat):{" "}
              </b>
              {player.security}
            </p>
            <p>
              <b>Osoite:</b> {player.address}
            </p>
            <p>
              <b>Opinahjo:</b> {player.learningInstitution}
            </p>
            <p>
              <b>Silmät:</b> {player.eyeColor}
            </p>
            <p>
              <b>Hiukset:</b> {player.hair}
            </p>
            <p>
              <b>Pituus:</b> {player.height}
            </p>
            <p>
              <b>Ulkonäkö, kulkuvälineet ja muut lisätiedot:</b> {player.other}
            </p>
          </>
        ) : (
          <UpdateForm player={user.player} handleSubmit={handleDetailsSubmit} />
        )}
      </Box>
    </Box>
  );
};

export default PlayerDetails;
