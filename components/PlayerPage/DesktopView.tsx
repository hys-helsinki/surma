import { Container, Grid } from "@mui/material";
import ImageUploadForm from "../Registration/PlayerForm/ImageUploadForm";
import { Calendar } from "./Calendar";
import ImageComponent from "./Info/ImageComponent";
import { useState } from "react";
import PlayerForm from "../Registration/PlayerForm";
import Details from "./Details";
import Info from "./Info";

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
          <Info user={user} imageUrl={imageUrl} />
          <Details
            user={user}
            umpires={umpires}
            currentUserIsUmpire={currentUserIsUmpire}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Calendar player={user.player} tournament={tournament} />
        </Grid>
      </Grid>
    </Container>
  );
};

export default DesktopView;
