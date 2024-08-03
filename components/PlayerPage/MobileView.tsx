import { Box, Container, Grid, Tab, Tabs } from "@mui/material";
import ImageUploadForm from "../Registration/PlayerForm/ImageUploadForm";
import { Calendar } from "./Calendar";
import ImageComponent from "./ImageComponent";
import PlayerDetails from "./PlayerDetails";
import PlayerInfo from "./PlayerInfo";
import { useState } from "react";
import PlayerForm from "../Registration/PlayerForm";
import { styled } from "@mui/material/styles";

const states = {
  ACTIVE: "Elossa",
  DEAD: "Kuollut",
  DETECTIVE: "Etsivä",
  EXTRA: "Lisäkohde"
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
    >
      {value === index && <Box padding={2}>{children}</Box>}
    </div>
  );
};

const MobileView = ({
  user,
  tournament,
  imageUrl,
  currentUserIsUmpire,
  umpires
}) => {
  const [fileInputState, setFileInputState] = useState("");
  const [selectedFile, setSelectedFile] = useState();
  const [selectedFileName, setSelectedFileName] = useState("");

  const [value, setValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

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
    <Box sx={{ width: "100%" }}>
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

      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={value}
          onChange={handleTabChange}
          variant="fullWidth"
          textColor="inherit"
          TabIndicatorProps={{
            style: {
              backgroundColor: "#f72a2a"
            }
          }}
        >
          <Tab label="Kalenteri" />
          <Tab label="Tiedot" />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        <Calendar player={user.player} tournament={tournament} />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <Box>
          <PlayerInfo
            user={user}
            currentUserIsUmpire={currentUserIsUmpire}
            umpires={umpires}
          />
          <PlayerDetails user={user} />
        </Box>
      </TabPanel>
    </Box>
  );
};

export default MobileView;
