import { Box } from "@mui/material";
import PlayerDescription from "./PlayerDescription";
import ContactDetails from "./ContactDetails";
import Umpires from "./Umpires";

const Details = ({
  user,
  umpires,
  currentUserIsUmpire,
  currentUserIsHunter
}) => {
  return (
    <Box>
      {!currentUserIsHunter && (
        <ContactDetails user={user} showLastVisit={currentUserIsUmpire} />
      )}
      <Umpires player={user.player} umpires={umpires} />
      <PlayerDescription
        player={user.player}
        showUpdateButton={!currentUserIsHunter && !currentUserIsUmpire}
      />
    </Box>
  );
};

export default Details;
