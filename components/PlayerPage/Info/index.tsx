import { useContext, useState } from "react";
import ImageUploadForm from "../../Registration/PlayerForm/ImageUploadForm";
import ImageComponent from "./ImageComponent";
import { useRouter } from "next/router";
import { Alert, Box, Snackbar } from "@mui/material";
import { UserContext } from "../../UserProvider";
import { LoadingButton } from "@mui/lab";

const states = {
  ACTIVE: "Elossa",
  DEAD: "Kuollut",
  DETECTIVE: "Etsivä",
  EXTRA: "Lisäkohde"
};

const Info = ({
  imageUrl,
  setImageUrl,
  showAlias,
  showStatus,
  showImageForm
}: {
  setImageUrl;
  imageUrl: string;
  showAlias: boolean;
  showStatus: boolean;
  showImageForm: boolean;
}) => {
  const user = useContext(UserContext);
  const [updateImage, setUpdateImage] = useState(false);
  const [showPicture, setShowPicture] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFileData, setSelectedFileData] = useState();
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const uploadImage = async (event) => {
    event.preventDefault();
    if (!selectedFileData) return;
    try {
      setIsLoading(true);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: JSON.stringify({
          url: selectedFileData,
          publicId: user.player.id,
          tournamentId: user.tournamentId
        })
      });

      const responseObject = await response.json();
      if (response.status === 200) {
        setImageUrl(responseObject.image.url);
      } else {
        setErrorMessage("Kuvan lataaminen palvelimelle epäonnistui");
        setShowError(true);
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
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
            Peitenimi: {user.player.alias}
          </h3>
        )}
        {showStatus && (
          <h3 style={{ marginTop: "5px", marginBottom: "10px" }}>
            Status: {states[user.player.state]}
          </h3>
        )}
      </Box>
      {imageUrl && !updateImage ? (
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
              {showPicture ? "Piilota" : "Näytä kuva"}
            </button>
            {showImageForm && (
              <button onClick={() => setUpdateImage(!updateImage)}>
                Vaihda kuva
              </button>
            )}
          </div>
        </>
      ) : !showImageForm ? (
        <p style={{ marginLeft: "1rem" }}>{"Ei kuvaa :("}</p>
      ) : (
        <div style={{ margin: "10px" }}>
          <ImageUploadForm setSelectedFileData={setSelectedFileData} />
          <div style={{ display: "flex", alignItems: "center" }}>
            {selectedFileData && (
              <LoadingButton
                onClick={async (e) => await uploadImage(e)}
                sx={{
                  textTransform: "none",
                  lineHeight: "normal",
                  fontFamily: "revert"
                }}
                loading={isLoading}
              >
                Lisää kuva
              </LoadingButton>
            )}
            {updateImage && (
              <button
                onClick={() => setUpdateImage(!updateImage)}
                style={{ marginLeft: 3 }}
              >
                Peruuta
              </button>
            )}
          </div>
          <Snackbar open={showError} onClose={() => setShowError(false)}>
            <Alert
              severity="error"
              variant="filled"
              sx={{ width: "100%" }}
              onClose={() => setShowError(false)}
            >
              {errorMessage}
            </Alert>
          </Snackbar>
        </div>
      )}
    </Box>
  );
};

export default Info;
