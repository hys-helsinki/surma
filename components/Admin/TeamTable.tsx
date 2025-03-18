import { Grid } from "@mui/material";
import { Player, Team, Tournament, User } from "@prisma/client";
import Link from "next/link";
import { useState } from "react";

interface PlayerWithUser extends Player {
  user: User;
}

interface TeamWithPlayers extends Team {
  players: PlayerWithUser[];
}

const TeamTable = ({
  tournament,
  handleMakeWanted,
  teams: teamList,
  users
}: {
  tournament: Tournament;
  handleMakeWanted: (id: string) => Promise<void>;
  teams: TeamWithPlayers[];
  users: any[];
}) => {
  const [teams, setTeams] = useState(teamList);

  if (!teams) return;

  if (teams.length === 0) return <p>Ei pelaajia</p>;

  const handlePlayerStatusChange = async (playerState: string, id: string) => {
    const data = { state: playerState };
    const res = await fetch(`/api/player/${id}/state`, {
      method: "PATCH",
      body: JSON.stringify(data)
    });
    const updatedPlayer: PlayerWithUser = await res.json();

    const t = teams.find((team) => team.id === updatedPlayer.id);
    const updatedTeam = {
      ...t,
      players: t.players.map((player) =>
        player.id !== id ? player : updatedPlayer
      )
    };
    setTeams(teams.map((team) => (team.id !== id ? team : updatedTeam)));
  };

  const sortedTeams = teams.sort((a, b) => a.name.localeCompare(b.name));

  const unfinishedRegistrations = users
    .filter((user) => !user.player && !user.umpire)
    .sort((a, b) => a.firstName.localeCompare(b.firstName));

  return (
    <Grid sx={{ marginBottom: "30px" }} container className="firstAndLastName">
      <Grid item xs={12} lg={7}>
        {unfinishedRegistrations.length > 0 && (
          <div style={{ marginBottom: "30px" }}>
            <h2>Keskeneräiset ilmoittautumiset</h2>
            {unfinishedRegistrations.map((user) => (
              <div key={user.id}>
                <Link href={`/tournaments/${tournament.id}/users/${user.id}`}>
                  {user.firstName} {user.lastName} ({user.team.name})
                </Link>
              </div>
            ))}
          </div>
        )}
        <h2>Joukkueet</h2>
        {sortedTeams.map((team) => (
          <div key={team.id}>
            <h3>{team.name} </h3>
            <div style={{ overflowX: "auto" }}>
              <table width="100%">
                <tbody>
                  {team.players.map((player) => (
                    <tr key={player.id}>
                      <td style={{ width: "50%" }}>
                        <Link
                          href={`/tournaments/${tournament.id}/users/${player.user.id}`}
                          passHref
                        >
                          <p>
                            {player.user.firstName} {player.user.lastName} (
                            {player.alias})
                          </p>
                        </Link>
                      </td>
                      {player.state == "ACTIVE" && (
                        <td>
                          <button
                            onClick={() =>
                              handlePlayerStatusChange("DEAD", player.id)
                            }
                            style={{ margin: 0 }}
                          >
                            Tapa
                          </button>
                        </td>
                      )}
                      {player.state == "ACTIVE" && (
                        <td>
                          <button
                            onClick={() => handleMakeWanted(player.id)}
                            style={{ margin: 0 }}
                          >
                            Etsintäkuuluta
                          </button>
                        </td>
                      )}
                      {player.state == "DEAD" && (
                        <td>
                          <button
                            onClick={() =>
                              handlePlayerStatusChange("DETECTIVE", player.id)
                            }
                            style={{ margin: 0 }}
                          >
                            Etsiväksi
                          </button>
                        </td>
                      )}
                      {player.state != "ACTIVE" && (
                        <td>
                          <button
                            onClick={() =>
                              handlePlayerStatusChange("ACTIVE", player.id)
                            }
                            style={{ margin: 0 }}
                          >
                            Herätä henkiin
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </Grid>
    </Grid>
  );
};

export default TeamTable;
