import LoadingButton from "@mui/lab/LoadingButton";
import {
  Assignment,
  AssignmentRing,
  Player,
  Team,
  Tournament,
  User
} from "@prisma/client";
import Link from "next/link";
import { useState } from "react";

interface PlayerWithUser extends Player {
  user: User;
  targets: Assignment[];
  team?: Team;
}

const PlayerRow = ({ player, players, setPlayers, tournament, setRings }) => {
  const [isStateButtonLoading, setIsStateButtonLoading] = useState("");
  const [isWantedLoading, setIsWantedLoading] = useState(false);

  const handlePlayerStatusChange = async (playerState: string, id: string) => {
    setIsStateButtonLoading(playerState);
    try {
      if (
        playerState !== "DEAD" ||
        window.confirm(
          "Haluatko varmasti merkitä pelaajan kuolleeksi? Pelaajan tappaminen poistaa toimeksiannot, joissa pelaaja on kohde tai metsästäjä"
        )
      ) {
        const data = { state: playerState, teamGame: tournament.teamGame };
        const res = await fetch(`/api/player/${id}/state`, {
          method: "PATCH",
          body: JSON.stringify(data)
        });
        const {
          updatedPlayer,
          rings
        }: { updatedPlayer: PlayerWithUser; rings: AssignmentRing } =
          await res.json();
        setPlayers(
          players.map((player) => (player.id !== id ? player : updatedPlayer))
        );
        setRings(rings);
      }
    } catch (e) {
      console.log(e);
    }
    setIsStateButtonLoading("");
  };

  const handleMakeWanted = async (id: string) => {
    setIsWantedLoading(true);
    try {
      const res = await fetch(`/api/player/${id}/wanted`, {
        method: "POST"
      });

      const { wantedRing, players } = await res.json();
      setRings((prevRings) => prevRings.concat(wantedRing));
      setPlayers(players);
    } catch (e) {
      console.log(e);
    }
    setIsWantedLoading(false);
  };

  return (
    <tr key={player.id}>
      <td style={{ width: "50%" }}>
        <Link
          href={`/tournaments/${tournament.id}/users/${player.user.id}`}
          passHref
        >
          <p>
            {player.user.firstName} {player.user.lastName} ({player.alias})
          </p>
        </Link>
      </td>
      {player.state == "ACTIVE" && (
        <td>
          <LoadingButton
            onClick={() => handlePlayerStatusChange("DEAD", player.id)}
            style={{ margin: "0 5px 0 0" }}
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
            style={{ margin: "0 5px 0 0" }}
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
            style={{ margin: "0 5px 0 0" }}
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
            style={{ margin: "0 5px 0 0" }}
            loading={isStateButtonLoading == "ACTIVE"}
          >
            Herätä henkiin
          </LoadingButton>
        </td>
      )}
    </tr>
  );
};

const PlayerTable = ({
  players,
  setPlayers,
  tournament,
  setRings,
  users
}: {
  players: PlayerWithUser[];
  setPlayers: any;
  tournament: Tournament;
  setRings: any;
  users: any[];
}) => {
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

  const unfinishedRegistrations = users
    .filter((user) => !user.player && !user.umpire)
    .sort((a, b) => a.firstName.localeCompare(b.firstName));

  return (
    <div style={{ paddingLeft: "10px" }}>
      {unfinishedRegistrations.length > 0 && (
        <div style={{ marginBottom: "30px" }}>
          <h2>Keskeneräiset ilmoittautumiset</h2>
          {unfinishedRegistrations.map((user) => (
            <div key={user.id}>
              <Link href={`/tournaments/${tournament.id}/users/${user.id}`}>
                {user.firstName} {user.lastName}
              </Link>
            </div>
          ))}
        </div>
      )}
      <h2>Pelaajat</h2>
      <table>
        <tbody>
          <tr>
            <td>
              <b>Elossa</b>
            </td>
          </tr>
          {activePlayers.map((player) => (
            <PlayerRow
              key={player.id}
              player={player}
              tournament={tournament}
              setRings={setRings}
              players={players}
              setPlayers={setPlayers}
            />
          ))}
          <tr>
            <td>
              <b>Kuolleet</b>
            </td>
          </tr>
          {deadPlayers.map((player) => (
            <PlayerRow
              key={player.id}
              player={player}
              tournament={tournament}
              setRings={setRings}
              players={players}
              setPlayers={setPlayers}
            />
          ))}
          <tr>
            <td>
              <b>Etsivät</b>
            </td>
          </tr>
          {detectivePlayers.map((player) => (
            <PlayerRow
              key={player.id}
              player={player}
              tournament={tournament}
              setRings={setRings}
              players={players}
              setPlayers={setPlayers}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PlayerTable;
