import { Container, Grid } from "@mui/material";
import ImageUploadForm from "../Registration/PlayerForm/ImageUploadForm";
import { Calendar } from "./Calendar";
import ImageComponent from "./ImageComponent";
import PlayerDetails from "./PlayerDetails";
import PlayerInfo from "./PlayerInfo";
import { useState } from "react";
import PlayerForm from "../Registration/PlayerForm";

const states = {
  ACTIVE: "Elossa",
  DEAD: "Kuollut",
  DETECTIVE: "Etsivä",
  EXTRA: "Lisäkohde"
};

const DesktopView = ({
  user,
  tournament,
  imageUrl,
  currentUserIsUmpire,
  umpires
}) => {
  const [fileInputState, setFileInputState] = useState("");
  const [selectedFile, setSelectedFile] = useState();
  const [selectedFileName, setSelectedFileName] = useState("");

  if (!Boolean(user.player)) {
    return <PlayerForm tournament={user.tournament} />;
  }

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
    <Container>
      <Grid container>
        <Grid item xs={12} md={6}>
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
            <PlayerInfo
              user={user}
              currentUserIsUmpire={currentUserIsUmpire}
              umpires={umpires}
            />
            <PlayerDetails user={user} />
          </div>
        </Grid>
        <Grid item xs={12} md={6}>
          <Calendar player={user.player} tournament={tournament} />
        </Grid>
      </Grid>
    </Container>
  );
};

export default DesktopView;
