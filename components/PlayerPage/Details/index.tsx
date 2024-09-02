import { Box } from "@mui/material";
import PlayerInfo from "./PlayerInfo";
import PlayerDetails from "./PlayerDetails";
import { useState } from "react";

const Details = ({ user, umpires, currentUserIsUmpire }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  return (
    <Box>
      <button onClick={() => setIsUpdating(!isUpdating)}>
        {!isUpdating ? "Muokkaa tietoja" : "Peruuta"}
      </button>
      <PlayerInfo
        user={user}
        currentUserIsUmpire={currentUserIsUmpire}
        umpires={umpires}
      />
      <PlayerDetails user={user} isUpdating={isUpdating} />
    </Box>
  );
};

export default Details;
