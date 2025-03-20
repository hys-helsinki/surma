import { Player, Tournament, User } from "@prisma/client";
import Link from "next/link";
import { useState } from "react";

interface PlayerWithUser extends Player {
  user: User;
}

const PlayerTable = ({
  playerList,
  tournament,
  setRings
}: {
  playerList: PlayerWithUser[];
  tournament: Tournament;
  setRings: any;
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

  const handleMakeWanted = async (id: string) => {
    const res = await fetch(`/api/player/${id}/wanted`, {
      method: "POST"
    });

    const createdRing = await res.json();
    setRings((prevRings) => prevRings.concat(createdRing));
  };

  if (players.length === 0) return <p>Ei pelaajia</p>;

  const sortedPlayers = players.sort((a, b) =>
    a.user.firstName.localeCompare(b.user.firstName)
  );

  const activePlayers = sortedPlayers.filter(
    (player) => player.state === "ACTIVE"
  );
  const deadPlayers = sortedPlayers.filter((player) => player.state === "DEAD");
  const detectivePlayers = sortedPlayers.filter(
    (player) => player.state === "DETECTIVE"
  );

  return (
    <div style={{ paddingLeft: "10px" }}>
      <h2>Pelaajat</h2>
      <table>
        <tbody>
          <tr>
            <td>
              <p>Elossa</p>
            </td>
          </tr>
          {activePlayers.map((player) => (
            <tr key={player.id}>
              <td>
                <Link
                  href={`/tournaments/${tournament.id}/users/${player.user.id}`}
                >
                  {player.user.firstName} {player.user.lastName}({player.alias})
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
          <tr>
            <td>
              <p>Kuolleet</p>
            </td>
          </tr>
          {deadPlayers.map((player) => (
            <tr key={player.id}>
              <td>
                <Link
                  href={`/tournaments/${tournament.id}/users/${player.user.id}`}
                >
                  {player.user.firstName} {player.user.lastName}({player.alias})
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
          <tr>
            <td>
              <p>Etsivät</p>
            </td>
          </tr>
          {detectivePlayers.map((player) => (
            <tr key={player.id}>
              <td>
                <Link
                  href={`/tournaments/${tournament.id}/users/${player.user.id}`}
                >
                  {player.user.firstName} {player.user.lastName}({player.alias})
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
