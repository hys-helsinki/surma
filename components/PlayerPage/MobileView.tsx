import { Box, Container, Grid, Tab, Tabs } from "@mui/material";
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

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const CustomTabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`
  };
}

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

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
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
          onChange={handleChange}
          aria-label="basic tabs example"
        >
          <Tab label="Kalenteri" {...a11yProps(0)} />
          <Tab label="Tiedot" {...a11yProps(1)} />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        <Calendar player={user.player} tournament={tournament} />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <Box>
          <PlayerInfo
            user={user}
            currentUserIsUmpire={currentUserIsUmpire}
            umpires={umpires}
          />
          <PlayerDetails user={user} />
        </Box>
      </CustomTabPanel>
    </Box>
  );
};

export default MobileView;
