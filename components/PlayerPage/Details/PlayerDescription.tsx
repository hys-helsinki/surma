import { Box } from "@mui/material";
import { UpdateForm } from "./UpdateForm";
import { Dispatch, useContext, useState } from "react";
import { useTranslation } from "next-i18next";
import { UserContext } from "../../UserProvider";
import { useSession } from "next-auth/react";
import Markdown from "../../Common/Markdown";
import SurmaButton from "../../Common/SurmaButton";

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
          <SurmaButton onClick={() => setIsUpdating(!isUpdating)}>
            {!isUpdating
              ? t("playerPage.details.description.editButton")
              : t("playerPage.details.description.cancelButton")}
          </SurmaButton>
        )}
        {!isUpdating ? (
          <Box>
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center"
                }}
                className="safety-notes-label"
              >
                <b
                  style={{
                    color: "orange",
                    fontSize: "xxx-large"
                  }}
                >
                  !
                </b>
                <h3>{t("playerPage.details.description.safetyNotesTitle")}</h3>
              </div>

              <Markdown className="safety-notes-contents">
                {player.safetyNotes}
              </Markdown>
            </div>
            <div>
              <h3 className="address-label">
                {t("playerPage.details.description.addressLabel")}:
              </h3>
              <Markdown className="address-contents">{player.address}</Markdown>
            </div>
            <div>
              <h3 className="learning-institution">
                {t("playerPage.details.description.learningInstitutionLabel")}:
              </h3>{" "}
              <Markdown className="learning-institution-contents">
                {player.learningInstitution}
              </Markdown>
            </div>
            <div>
              <h3 className="eye-color-label">
                {t("playerPage.details.description.eyeColorLabel")}:
              </h3>{" "}
              <Markdown className="eye-color-contents">
                {player.eyeColor}
              </Markdown>
            </div>
            <div>
              <h3 className="hair-label">
                {t("playerPage.details.description.hairLabel")}:
              </h3>{" "}
              <Markdown className="hair-contents">{player.hair}</Markdown>
            </div>
            <div>
              <h3 className="height-label">
                {t("playerPage.details.description.heightLabel")}:
              </h3>{" "}
              <Markdown className="height-contents">{player.height}</Markdown>
            </div>
            <div>
              <h3 className="other-info-label">
                {t("playerPage.details.description.otherInfoLabel")}{" "}
              </h3>
              <Markdown className="other-info-contents">
                {player.other}
              </Markdown>
            </div>
          </Box>
        ) : (
          <UpdateForm setUser={setUser} setIsUpdating={setIsUpdating} />
        )}
      </Box>
    </Box>
  );
};

export default PlayerDescription;
