import { useContext, useState } from "react";
import ImageUploadForm from "../../Registration/PlayerForm/ImageUploadForm";
import ImageComponent from "./ImageComponent";
import { useRouter } from "next/router";
import { Box } from "@mui/material";
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
  showAlias,
  showStatus,
  showImageForm
}: {
  imageUrl: string;
  showAlias: boolean;
  showStatus: boolean;
  showImageForm: boolean;
}) => {
  const [fileInputState, setFileInputState] = useState("");
  const user = useContext(UserContext);
  const [selectedFile, setSelectedFile] = useState();
  const [selectedFileName, setSelectedFileName] = useState("");
  const [updateImage, setUpdateImage] = useState(false);
  const [showPicture, setShowPicture] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const uploadImage = async (event) => {
    event.preventDefault();
    if (!selectedFile) return;
    try {
      setIsLoading(true);
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      reader.onloadend = async () => {
        await fetch("/api/upload", {
          method: "POST",
          body: JSON.stringify({
            url: reader.result,
            publicId: user.player.id,
            tournamentId: user.tournamentId
          })
        });
        setFileInputState("");
        setSelectedFileName("");
        setSelectedFile(null);
        setIsLoading(false);
        router.reload();
      };
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
          alignItems: "center"
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
          <ImageUploadForm
            setSelectedFile={setSelectedFile}
            setSelectedFileName={setSelectedFileName}
            setFileInputState={setFileInputState}
            selectedFileName={selectedFileName}
            fileInputState={fileInputState}
          />
          <div style={{ display: "flex", alignItems: "center" }}>
            {selectedFile && (
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
        </div>
      )}
    </Box>
  );
};

export default Info;
