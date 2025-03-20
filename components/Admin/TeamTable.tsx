import { LoadingButton } from "@mui/lab";
import { Grid } from "@mui/material";
import { Player, Team, Tournament, User } from "@prisma/client";
import Link from "next/link";
import React, { useState } from "react";

interface PlayerWithUser extends Player {
  user: User;
}

interface TeamWithPlayers extends Team {
  players: PlayerWithUser[];
}

const PlayerRow = ({ player: p, tournament, setRings }) => {
  const [player, setPlayer] = useState(p);
  const [isStateButtonLoading, setIsStateButtonLoading] = useState("");
  const [isWantedLoading, setIsWantedLoading] = useState(false);

  const handlePlayerStatusChange = async (playerState: string, id: string) => {
    setIsStateButtonLoading(playerState);
    const data = { state: playerState };
    try {
      const res = await fetch(`/api/player/${id}/state`, {
        method: "PATCH",
        body: JSON.stringify(data)
      });
      const updatedPlayer = await res.json();
      setPlayer(updatedPlayer);
      setIsStateButtonLoading("");
    } catch (error) {
      console.log(error);
      setIsStateButtonLoading("");
    }
  };

  const handleMakeWanted = async (id: string) => {
    setIsWantedLoading(true);
    try {
      const res = await fetch(`/api/player/${id}/wanted`, {
        method: "POST"
      });
      const createdRing = await res.json();
      setRings((prevRings) => prevRings.concat(createdRing));
      setIsWantedLoading(false);
    } catch (error) {
      console.log(error);
      setIsWantedLoading(false);
    }
  };

  return (
    <tr key={player.id}>
      <td style={{ width: "40%" }}>
        <Link
          href={`/tournaments/${tournament.id}/users/${player.user.id}`}
          passHref
        >
          <p>
            {player.user.firstName} {player.user.lastName} ({player.alias})
          </p>
        </Link>
      </td>
      <td style={{ width: "15%" }}>{player.state}</td>
      {player.state == "ACTIVE" && (
        <td>
          <LoadingButton
            onClick={() => handlePlayerStatusChange("DEAD", player.id)}
            style={{ margin: 0 }}
            loading={isStateButtonLoading == "DEAD"}
          >
            Tapa
          </LoadingButton>
        </td>
      )}
      {player.state == "ACTIVE" && (
        <td>
          <LoadingButton
            onClick={() => handleMakeWanted(player.id)}
            style={{ margin: 0 }}
            loading={isWantedLoading}
          >
            Etsintäkuuluta
          </LoadingButton>
        </td>
      )}
      {player.state == "DEAD" && (
        <td>
          <LoadingButton
            onClick={() => handlePlayerStatusChange("DETECTIVE", player.id)}
            style={{ margin: 0 }}
            loading={isStateButtonLoading == "DETECTIVE"}
          >
            Etsiväksi
          </LoadingButton>
        </td>
      )}
      {player.state != "ACTIVE" && (
        <td>
          <LoadingButton
            onClick={() => handlePlayerStatusChange("ACTIVE", player.id)}
            style={{ margin: 0 }}
            loading={isStateButtonLoading == "ACTIVE"}
          >
            Herätä henkiin
          </LoadingButton>
        </td>
      )}
    </tr>
  );
};

const TeamTable = ({
  tournament,
  teams,
  users,
  setRings
}: {
  tournament: Tournament;
  teams: TeamWithPlayers[];
  users: any[];
  setRings: any;
}) => {
  if (!teams) return;
  if (teams.length === 0) return <p>Ei pelaajia</p>;

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
                    <PlayerRow
                      key={player.id}
                      player={player}
                      tournament={tournament}
                      setRings={setRings}
                    />
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
