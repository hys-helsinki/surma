import { Box } from "@mui/material";
import { getPlayerName } from "../../utils";

const PlayersWithTargets = ({ players }) => {
  return (
    <>
      <h2>Pelaajien kohteet</h2>
      {players.map((player) => (
        <Box key={player.id}>
          <p>
            {player.user.firstName} {player.user.lastName}{" "}
            {player.state === "DEAD" && " (kuollut)"}
          </p>
          <ul>
            {player.targets.map((assignment) => (
              <li key={assignment.id}>
                {getPlayerName(assignment.targetId, players)}
              </li>
            ))}
          </ul>
        </Box>
      ))}
    </>
  );
};

export default PlayersWithTargets;
