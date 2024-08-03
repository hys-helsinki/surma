import { useState } from "react";
import ImageUploadForm from "../../Registration/PlayerForm/ImageUploadForm";
import ImageComponent from "./ImageComponent";

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
      };
      setFileInputState("");
      setSelectedFileName("");
      setSelectedFile(null);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div
      style={{
        paddingLeft: "10px",
        display: "inline-block"
      }}
    >
      <h1>
        {user.player.title} {user.firstName} {user.lastName}
      </h1>
      <h2>Peitenimi: {user.player.alias}</h2>

      {/* Show this when the tournament is on */}
      <h3>Status: {states[user.player.state]}</h3>
      {imageUrl == "" ? (
        <ImageComponent imageUrl={imageUrl} />
      ) : (
        <>
          <ImageUploadForm
            setSelectedFile={setSelectedFile}
            setSelectedFileName={setSelectedFileName}
            setFileInputState={setFileInputState}
            selectedFileName={selectedFileName}
            fileInputState={fileInputState}
          />
          {selectedFile && (
            <button onClick={(e) => uploadImage(e)}>Lisää kuva</button>
          )}
        </>
      )}
    </div>
  );
};

export default Info;
