import { Box } from "@mui/material";
import { UpdateForm } from "./UpdateForm";
import { useState } from "react";

const PlayerDescription = ({ player: p, showUpdateButton }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [player, setPlayer] = useState(p);

  return (
    <Box>
      <Box sx={{ mt: 4 }}>
        <h2>
          <u>Kuvaus</u>
        </h2>
        {showUpdateButton && (
          <button onClick={() => setIsUpdating(!isUpdating)}>
            {!isUpdating ? "Muokkaa tietoja" : "Peruuta"}
          </button>
        )}
        {!isUpdating ? (
          <Box>
            <div
              style={{
                display: "flex",
                alignItems: "center"
              }}
            >
              <b
                style={{
                  color: "orange",
                  fontSize: "xxx-large"
                }}
              >
                !
              </b>
              <b>
                Turvallisuushuomiot (esim. pelin ulkopuolelle rajatut ajat ja
                paikat):
              </b>
            </div>
            <pre style={{ whiteSpace: "pre-wrap", margin: "auto" }}>
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
            <b>Ulkonäkö, kulkuvälineet ja muut lisätiedot: </b>
            <pre style={{ whiteSpace: "pre-wrap", margin: "auto" }}>
              {player.other}
            </pre>
          </Box>
        ) : (
          <UpdateForm player={player} setPlayer={setPlayer} />
        )}
      </Box>
    </Box>
  );
};

export default PlayerDescription;
