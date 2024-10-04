import { Player, Tournament, User } from "@prisma/client";
import Link from "next/link";
import { useState } from "react";

interface PlayerWithUser extends Player {
  user: User;
}

const PlayerTable = ({
  playerList,
  tournament,
  handleMakeWanted
}: {
  playerList: PlayerWithUser[];
  tournament: Tournament;
  handleMakeWanted: (id: string) => Promise<void>;
}) => {
  const [players, setPlayers] = useState<PlayerWithUser[]>(playerList);

  const handlePlayerStatusChange = async (playerState: string, id: string) => {
    const data = { state: playerState };
    const res = await fetch(`/api/player/${id}/state`, {
      method: "PATCH",
      body: JSON.stringify(data)
    });
    const updatedPlayer: PlayerWithUser = await res.json();
    setPlayers(
      players.map((player) => (player.id !== id ? player : updatedPlayer))
    );
  };

  if (players.length === 0) return <p>Ei pelaajia</p>;

  const activePlayers = players.filter((player) => player.state === "ACTIVE");
  const deadPlayers = players.filter((player) => player.state === "DEAD");
  const detectivePlayers = players.filter(
    (player) => player.state === "DETECTIVE"
  );

  return (
    <div style={{ paddingLeft: "10px" }}>
      <h2>Pelaajat</h2>
      <table>
        <tbody>
          <tr>Elossa</tr>
          {activePlayers.map((player) => (
            <tr key={player.id}>
              <td>
                <Link
                  href={`/tournaments/${tournament.id}/users/${player.user.id}`}
                >
                  <a>
                    {player.user.firstName} {player.user.lastName} (
                    {player.alias})
                  </a>
                </Link>
              </td>

              <td>
                <button
                  onClick={() => handlePlayerStatusChange("DEAD", player.id)}
                >
                  Tapa
                </button>
              </td>
              <td>
                <button onClick={() => handleMakeWanted(player.id)}>
                  Etsintäkuuluta
                </button>
              </td>
            </tr>
          ))}
          <tr>Kuolleet</tr>
          {deadPlayers.map((player) => (
            <tr key={player.id}>
              <td>
                <Link
                  href={`/tournaments/${tournament.id}/users/${player.user.id}`}
                >
                  <a>
                    {player.user.firstName} {player.user.lastName} (
                    {player.alias})
                  </a>
                </Link>
              </td>

              <td>
                <button
                  onClick={() => handlePlayerStatusChange("ACTIVE", player.id)}
                >
                  Herätä henkiin
                </button>
              </td>

              <td>
                <button
                  onClick={() =>
                    handlePlayerStatusChange("DETECTIVE", player.id)
                  }
                >
                  Etsiväksi
                </button>
              </td>
            </tr>
          ))}
          <tr>Etsivät</tr>
          {detectivePlayers.map((player) => (
            <tr key={player.id}>
              <td>
                <Link
                  href={`/tournaments/${tournament.id}/users/${player.user.id}`}
                >
                  <a>
                    {player.user.firstName} {player.user.lastName} (
                    {player.alias})
                  </a>
                </Link>
              </td>
              <td>
                <button
                  onClick={() => handlePlayerStatusChange("ACTIVE", player.id)}
                >
                  Herätä henkiin
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PlayerTable;
