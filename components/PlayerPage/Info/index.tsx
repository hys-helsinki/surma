import { Dispatch, SetStateAction, useContext, useState } from "react";
import { useTranslation } from "next-i18next";
import ImageUploadForm from "../../Common/ImageUploadForm";
import ImageComponent from "./ImageComponent";
import { UserContext } from "../../UserProvider";
import { Box } from "@mui/material";

const Info = ({
  imageUrl,
  setImageUrl,
  showAlias,
  showStatus,
  showImageForm
}: {
  setImageUrl: Dispatch<SetStateAction<string>>;
  imageUrl: string;
  showAlias: boolean;
  showStatus: boolean;
  showImageForm: boolean;
}) => {
  const { t } = useTranslation("common");
  const user = useContext(UserContext);
  const [showPicture, setShowPicture] = useState(false);

  const states = {
    ACTIVE: t("playerPage.info.state.active"),
    DEAD: t("playerPage.info.state.dead"),
    DETECTIVE: t("playerPage.info.state.detective"),
    EXTRA: t("playerPage.info.state.extra")
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "0 1rem"
        }}
      >
        <h1>
          {user.player.title} {user.firstName} {user.lastName}
        </h1>

        {showAlias && (
          <h3 style={{ marginTop: "5px", marginBottom: "5px" }}>
            {t("playerPage.info.aliasLabel")} {user.player.alias}
          </h3>
        )}
        {showStatus && (
          <h3 style={{ marginTop: "5px", marginBottom: "10px" }}>
            {t("playerPage.info.statusLabel")} {states[user.player.state]}
          </h3>
        )}
      </Box>
      {imageUrl ? (
        <>
          <ImageComponent imageUrl={imageUrl} showPicture={showPicture} />
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              gap: "10px"
            }}
          >
            <button onClick={() => setShowPicture(!showPicture)}>
              {showPicture
                ? t("imageUpload.hidePicture")
                : t("imageUpload.showPicture")}
            </button>
            {showImageForm && (
              <ImageUploadForm
                setImageUrl={setImageUrl}
                tournamentId={user.tournamentId}
                userId={user.id}
                uploadLabel={t("imageUpload.changePicture")}
              />
            )}
          </div>
        </>
      ) : !showImageForm ? (
        <p style={{ marginLeft: "1rem" }}>{t("imageUpload.noPicture")}</p>
      ) : (
        <div style={{ margin: "10px" }}>
          <ImageUploadForm
            setImageUrl={setImageUrl}
            tournamentId={user.tournamentId}
            userId={user.id}
            uploadLabel={t("imageUpload.uploadLabel")}
          />
        </div>
      )}
    </Box>
  );
};

export default Info;
