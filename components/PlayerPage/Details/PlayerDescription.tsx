import { Box } from "@mui/material";
import { UpdateForm } from "./UpdateForm";
import { Dispatch, useContext, useState } from "react";
import { useTranslation } from "next-i18next";
import { UserContext } from "../../UserProvider";
import { useSession } from "next-auth/react";

const PlayerDescription = ({ setUser }: { setUser: Dispatch<any> }) => {
  const { t } = useTranslation("common");
  const user = useContext(UserContext);
  const [isUpdating, setIsUpdating] = useState(false);
  const { data: session } = useSession();
  const player = user.player;

  return (
    <Box>
      <Box sx={{ mt: 4 }}>
        <h2 style={{ marginBottom: "0" }}>
          <u>{t("playerPage.details.description.title")}</u>
        </h2>
        {user.id == session.user.id && (
          <button onClick={() => setIsUpdating(!isUpdating)}>
            {!isUpdating
              ? t("playerPage.details.description.editButton")
              : t("playerPage.details.description.cancelButton")}
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
              <b>{t("playerPage.details.description.safetyNotesTitle")}</b>
            </div>
            <pre style={{ whiteSpace: "pre-wrap", margin: "auto" }}>
              {player.safetyNotes}
            </pre>

            <p>
              <b>{t("playerPage.details.description.addressLabel")}:</b>{" "}
              {player.address}
            </p>
            <p>
              <b>
                {t("playerPage.details.description.learningInstitutionLabel")}:
              </b>{" "}
              {player.learningInstitution}
            </p>
            <p>
              <b>{t("playerPage.details.description.eyeColorLabel")}:</b>{" "}
              {player.eyeColor}
            </p>
            <p>
              <b>{t("playerPage.details.description.hairLabel")}:</b>{" "}
              {player.hair}
            </p>
            <p>
              <b>{t("playerPage.details.description.heightLabel")}:</b>{" "}
              {player.height}
            </p>
            <b>{t("playerPage.details.description.otherInfoLabel")} </b>
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
