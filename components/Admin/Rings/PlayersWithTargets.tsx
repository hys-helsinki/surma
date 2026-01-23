import { Box } from "@mui/material";
import { getPlayerFullNameById } from "../../utils";
import { RingComponentProps } from "../../../types/umpirepage";

const PlayersWithTargets = ({
  players,
  playerRings,
  tournament
}: RingComponentProps) => {
  const searchWantedPlayers = () => {
    const detectivePlayerIDs = players
      .filter((player) => player.state === "DETECTIVE")
      .map((player) => player.id);
    if (detectivePlayerIDs.length === 0) return;

    let wantedPlayerIDs = new Set<string>();

    playerRings.forEach((ring) => {
      ring.assignments.forEach((assignment) => {
        if (detectivePlayerIDs.includes(assignment.hunterId)) {
          wantedPlayerIDs.add(assignment.targetId);
        }
      });
    });
    return wantedPlayerIDs;
  };

  const wantedPlayers = searchWantedPlayers();

  const displayPlayerState = (player) => {
    if (player.state === "DEAD") {
      return <i style={{ color: "red" }}>Kuollut</i>;
    }
    if (player.state === "DETECTIVE") {
      return <span style={{ color: "red" }}>Etsivä</span>;
    }
    if (wantedPlayers?.has(player.id)) {
      return <span style={{ color: "red" }}>Etsintäkuulutettu</span>;
    }
    return;
  };

  const sortedPlayers = tournament.teamGame
    ? players.sort(
        (a, b) =>
          a.team.name.localeCompare(b.team.name) ||
          a.user.firstName.localeCompare(b.user.firstName)
      )
    : players.sort((a, b) => a.user.firstName.localeCompare(b.user.firstName));
  return (
    <>
      <h2>Pelaajien kohteet</h2>
      {sortedPlayers.map((player) => (
        <Box key={player.id}>
          <p>
            {tournament.teamGame && `${player.team.name}: `}
            {player.user.firstName} {player.user.lastName} ({player.alias}){" "}
            {displayPlayerState(player)}
          </p>
          <ul>
            {player.targets.map((assignment) => (
              <li key={assignment.id}>
                {getPlayerFullNameById(assignment.targetId, players)}
              </li>
            ))}
          </ul>
        </Box>
      ))}
    </>
  );
};

export default PlayersWithTargets;
