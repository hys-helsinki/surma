import { Box } from "@mui/material";
import PlayerInfo from "./PlayerInfo";
import PlayerDetails from "./PlayerDetails";
import { useState } from "react";

const Details = ({
  user,
  umpires,
  currentUserIsUmpire,
  currentUserIsHunter
}) => {
  const [isUpdating, setIsUpdating] = useState(false);

  return (
    <Box>
      {!currentUserIsHunter && !currentUserIsUmpire && (
        <button onClick={() => setIsUpdating(!isUpdating)}>
          {!isUpdating ? "Muokkaa tietoja" : "Peruuta"}
        </button>
      )}
      <PlayerInfo
        user={user}
        showContactDetails={!currentUserIsHunter}
        umpires={umpires}
        showLastVisit={currentUserIsUmpire}
      />
      <PlayerDetails user={user} isUpdating={isUpdating} />
    </Box>
  );
};

export default Details;
