import { Box } from "@mui/material";
import { getPlayerFullNameById } from "../../utils";
import { Player, Assignment, User, AssignmentRing } from "@prisma/client";

interface PlayerWithUser extends Player {
  user: User;
  targets: Assignment[];
}

interface RingWithAssignments extends AssignmentRing {
  assignments: Assignment[];
}

const PlayersWithTargets = ({
  players,
  rings
}: {
  players: PlayerWithUser[];
  rings: RingWithAssignments[];
}) => {
  const searchWantedPlayers = () => {
    const detectivePlayerIDs = players
      .filter((player) => player.state === "DETECTIVE")
      .map((player) => player.id);
    if (detectivePlayerIDs.length === 0) return;

    let wantedPlayerIDs = new Set<string>();

    rings.forEach((ring) => {
      ring.assignments.forEach((assignment) => {
        if (detectivePlayerIDs.includes(assignment.hunterId)) {
          wantedPlayerIDs.add(assignment.targetId);
        }
      });
    });
    return wantedPlayerIDs;
  };

  const wantedPlayers = searchWantedPlayers();

  const getPlayerState = (player) => {
    if (player.state === "DEAD") {
      return <i style={{ color: "red" }}>Kuollut</i>;
    }
    if (player.state === "DETECTIVE") {
      return <span style={{ color: "red" }}>Etsivä</span>;
    }
    if (wantedPlayers.has(player.id)) {
      return <span style={{ color: "red" }}>Etsintäkuulutettu</span>;
    }
    return;
  };
  return (
    <>
      <h2>Pelaajien kohteet</h2>
      {players.map((player) => (
        <Box key={player.id}>
          <p>
            {player.user.firstName} {player.user.lastName} ({player.alias}){" "}
            {getPlayerState(player)}
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
