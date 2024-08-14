import { useState } from "react";
import ImageUploadForm from "../../Registration/PlayerForm/ImageUploadForm";
import ImageComponent from "./ImageComponent";
import { useRouter } from "next/router";
import { Box } from "@mui/material";

const states = {
  ACTIVE: "Elossa",
  DEAD: "Kuollut",
  DETECTIVE: "Etsivä",
  EXTRA: "Lisäkohde"
};

const Info = ({ user, imageUrl }) => {
  const [fileInputState, setFileInputState] = useState("");
  const [selectedFile, setSelectedFile] = useState();
  const [selectedFileName, setSelectedFileName] = useState("");
  const [updateImage, setUpdateImage] = useState(false);
  const router = useRouter();

  const uploadImage = async (event) => {
    event.preventDefault();
    if (!selectedFile) return;
    try {
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      reader.onloadend = async () => {
        await fetch("/api/upload", {
          method: "POST",
          body: JSON.stringify({
            url: reader.result,
            publicId: user.player.id
          })
        });
        setFileInputState("");
        setSelectedFileName("");
        setSelectedFile(null);
        router.reload();
      };
    } catch (error) {
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
        <h3 style={{ marginTop: "5px", marginBottom: "5px" }}>
          Peitenimi: {user.player.alias}
        </h3>
        <h3 style={{ marginTop: "5px", marginBottom: "10px" }}>
          Status: {states[user.player.state]}
        </h3>
      </Box>
      {imageUrl && !updateImage ? (
        <ImageComponent imageUrl={imageUrl} setUpdateImage={setUpdateImage} />
      ) : (
        <div style={{ margin: "10px" }}>
          <ImageUploadForm
            setSelectedFile={setSelectedFile}
            setSelectedFileName={setSelectedFileName}
            setFileInputState={setFileInputState}
            selectedFileName={selectedFileName}
            fileInputState={fileInputState}
          />
          {selectedFile && (
            <button
              onClick={async (e) => await uploadImage(e)}
              style={{ marginRight: "10px" }}
            >
              Lisää kuva
            </button>
          )}
          {updateImage && (
            <button onClick={() => setUpdateImage(!updateImage)}>
              Peruuta
            </button>
          )}
        </div>
      )}
    </Box>
  );
};

export default Info;
