import { Box, Tab, Tabs } from "@mui/material";
import { Calendar } from "./Calendar";
import { useState } from "react";
import Info from "./Info";
import Details from "./Details";

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
  currentUserIsHunter = false,
  umpires
}: {
  user;
  tournament;
  imageUrl;
  currentUserIsUmpire: boolean;
  currentUserIsHunter?: boolean;
  umpires;
}) => {
  const [value, setValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Info
        user={user}
        imageUrl={imageUrl}
        showStatusAndAlias={!currentUserIsHunter}
        showImageForm={!currentUserIsHunter && !currentUserIsUmpire}
      />

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
        <Calendar
          player={user.player}
          tournament={tournament}
          showEditButton={!currentUserIsHunter && !currentUserIsUmpire}
        />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <Details
          user={user}
          umpires={umpires}
          currentUserIsUmpire={currentUserIsUmpire}
          currentUserIsHunter={currentUserIsHunter}
        />
      </TabPanel>
    </Box>
  );
};

export default MobileView;
