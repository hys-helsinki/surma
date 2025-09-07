import { Box } from "@mui/material";
import { UpdateForm } from "./UpdateForm";
import { Dispatch, useContext, useState } from "react";
import { UserContext } from "../../UserProvider";
import { useSession } from "next-auth/react";

const PlayerDescription = ({ setUser }: { setUser: Dispatch<any> }) => {
  const user = useContext(UserContext);
  const [isUpdating, setIsUpdating] = useState(false);
  const { data: session } = useSession();
  const player = user.player;

  return (
    <Box>
      <Box sx={{ mt: 4 }}>
        <h2 style={{ marginBottom: "0" }}>
          <u>Kuvaus</u>
        </h2>
        {user.id == session.user.id && (
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
          <UpdateForm setUser={setUser} setIsUpdating={setIsUpdating} />
        )}
      </Box>
    </Box>
  );
};

export default PlayerDescription;
