import { Box } from "@mui/material";
import { UpdateForm } from "./UpdateForm";
import { useRouter } from "next/router";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import { useState } from "react";

type FormData = {
  address: string;
  learningInstitution: string;
  eyeColor: string;
  hair: string;
  height: number;
  other: string;
  safetyNotes: string;
};

const PlayerDetails = ({ user, isUpdating }) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { id } = router.query;

  const player = user.player;

  const handleDetailsSubmit = async (values) => {
    setIsLoading(true);
    const data: FormData = values;
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
        {!isUpdating ? (
          <>
            <pre style={{ whiteSpace: "pre-wrap" }}>
              <PriorityHighIcon
                color="warning"
                fontSize="small"
                sx={{ mr: 1 }}
              />
              <b>
                Turvallisuushuomiot (esim. pelin ulkopuolelle rajatut ajat ja
                paikat):{" "}
              </b>
              {player.safetyNotes}
            </pre>
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
            <pre style={{ whiteSpace: "pre-wrap" }}>
              <b>Ulkonäkö, kulkuvälineet ja muut lisätiedot: </b>
              {player.other}
            </pre>
          </>
        ) : (
          <UpdateForm
            player={user.player}
            handleSubmit={handleDetailsSubmit}
            isLoading={isLoading}
          />
        )}
      </Box>
    </Box>
  );
};

export default PlayerDetails;
