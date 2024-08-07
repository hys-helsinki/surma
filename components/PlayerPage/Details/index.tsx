import { Box } from "@mui/material";
import PlayerInfo from "./PlayerInfo";
import PlayerDetails from "./PlayerDetails";
import { useState } from "react";

const Details = ({ user, umpires, currentUserIsUmpire }) => {
  const [isUpdated, setIsUpdated] = useState(true);

  return (
    <Box>
      <button onClick={() => setIsUpdated(!isUpdated)}>
        {isUpdated ? "Muokkaa tietoja" : "Peruuta"}
      </button>
      <PlayerInfo
        user={user}
        currentUserIsUmpire={currentUserIsUmpire}
        umpires={umpires}
      />
      <PlayerDetails user={user} isUpdated={isUpdated} />
    </Box>
  );
};

export default Details;
