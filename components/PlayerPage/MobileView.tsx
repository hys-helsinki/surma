import { Box, Tab, Tabs } from "@mui/material";
import { Calendar } from "./Calendar";
import { Dispatch, useState } from "react";
import Info from "./Info";
import Details from "./Details";
import { Tournament, Umpire, User } from "@prisma/client";
import { useParams } from "next/navigation";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface UmpireWithUser extends Umpire {
  user: User;
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
  tournament,
  imageUrl,
  currentUserIsUmpire,
  currentUserIsHunter = false,
  currentUserIsDetective = false,
  currentUserId,
  umpires,
  setUser
}: {
  tournament: Tournament;
  imageUrl: string;
  currentUserIsUmpire: boolean;
  currentUserIsHunter?: boolean;
  currentUserIsDetective?: boolean;
  currentUserId: string;
  umpires: UmpireWithUser[];
  setUser: Dispatch<any>;
}) => {
  const [value, setValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const { id: userId } = useParams();

  return (
    <Box sx={{ width: "100%", marginBottom: "2rem" }}>
      <Info
        imageUrl={imageUrl}
        showAlias={
          currentUserIsDetective ||
          currentUserIsUmpire ||
          userId === currentUserId
        }
        showStatus={currentUserIsUmpire || userId === currentUserId}
        showImageForm={userId === currentUserId}
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
          setUser={setUser}
          tournament={tournament}
          showEditButton={userId === currentUserId}
        />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <Details
          umpires={umpires}
          currentUserIsUmpire={currentUserIsUmpire}
          currentUserIsHunter={currentUserIsHunter}
          setUser={setUser}
        />
      </TabPanel>
    </Box>
  );
};

export default MobileView;
