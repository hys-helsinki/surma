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
      {!currentUserIsHunter && (
        <button onClick={() => setIsUpdating(!isUpdating)}>
          {!isUpdating ? "Muokkaa tietoja" : "Peruuta"}
        </button>
      )}
      <PlayerInfo
        user={user}
        currentUserIsUmpire={currentUserIsUmpire}
        umpires={umpires}
        currentUserIsHunter={currentUserIsHunter}
      />
      <PlayerDetails user={user} isUpdating={isUpdating} />
    </Box>
  );
};

export default Details;
