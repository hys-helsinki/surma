import { Grid, Button, Box } from "@mui/material";
import { Tournament } from "@prisma/client";
import Link from "next/link";
import { Dispatch, SetStateAction, useState } from "react";
import WantedModal from "./WantedModal";
import {
  RingWithAssignments,
  UmpirePagePlayer,
  UmpirePageUser
} from "../../types/umpirepage";

const PlayerRow = ({
  player,
  players,
  setPlayers,
  tournament,
  setRings
}: {
  player: UmpirePagePlayer;
  players: UmpirePagePlayer[];
  setPlayers: Dispatch<SetStateAction<UmpirePagePlayer[]>>;
  tournament: Tournament;
  setRings: Dispatch<SetStateAction<RingWithAssignments[]>>;
}) => {
  const [isStateButtonLoading, setIsStateButtonLoading] = useState("");
  const [openModal, setOpenModal] = useState(false);

  const handlePlayerStatusChange = async (playerState: string, id: string) => {
    setIsStateButtonLoading(playerState);
    const searchedPlayer = players.find((player) => player.id === id);
    try {
      if (
        playerState !== "DEAD" ||
        window.confirm(
          `Haluatko varmasti merkitä pelaajan ${searchedPlayer.user.firstName} ${searchedPlayer.user.lastName} kuolleeksi? Pelaajan tappaminen poistaa toimeksiannot, joissa pelaaja on kohde tai metsästäjä.`
        )
      ) {
        const data = { state: playerState, teamGame: tournament.teamGame };
        const res = await fetch(`/api/player/${id}/state`, {
          method: "PATCH",
          body: JSON.stringify(data)
        });
        const {
          updatedPlayerList,
          rings
        }: {
          updatedPlayerList: UmpirePagePlayer[];
          rings: RingWithAssignments[];
        } = await res.json();
        setPlayers(updatedPlayerList);
        setRings(rings);
      }
    } catch (e) {
      console.log(e);
    }
    setIsStateButtonLoading("");
  };

  return (
    <Grid container key={player.id} sx={{ mb: 1 }}>
      <Grid size={{ xs: 12, md: 4 }}>
        <Link
          href={`/tournaments/${tournament.id}/users/${player.user.id}`}
          passHref
        >
          <p>
            {player.user.firstName} {player.user.lastName} ({player.alias})
          </p>
        </Link>
      </Grid>
      {player.state == "ACTIVE" && (
        <Grid
          size={{ xs: 3, md: 2 }}
          sx={{
            display: "flex",
            alignItems: "center"
          }}
        >
          <Button
            onClick={() => handlePlayerStatusChange("DEAD", player.id)}
            loading={isStateButtonLoading == "DEAD"}
            className="playerTableStateButton"
          >
            Tapa
          </Button>
        </Grid>
      )}
      {player.state == "ACTIVE" && (
        <Grid
          size={{ xs: 5, md: 2 }}
          sx={{
            display: "flex",
            alignItems: "center"
          }}
        >
          <Button
            onClick={() => setOpenModal(true)}
            loading={false}
            className="playerTableStateButton"
          >
            Etsintäkuuluta
          </Button>
        </Grid>
      )}
      {player.state == "DEAD" && (
        <Grid
          size={{ xs: 4, md: 2 }}
          sx={{
            display: "flex",
            alignItems: "center"
          }}
        >
          <Button
            onClick={() => handlePlayerStatusChange("DETECTIVE", player.id)}
            loading={isStateButtonLoading == "DETECTIVE"}
            className="playerTableStateButton"
          >
            Etsiväksi
          </Button>
        </Grid>
      )}
      {player.state != "ACTIVE" && (
        <Grid
          size={{ xs: 3, md: 2 }}
          sx={{
            display: "flex",
            alignItems: "center"
          }}
        >
          <Button
            onClick={() => handlePlayerStatusChange("ACTIVE", player.id)}
            loading={isStateButtonLoading == "ACTIVE"}
            className="playerTableStateButton"
          >
            Herätä henkiin
          </Button>
        </Grid>
      )}
      <WantedModal
        players={players}
        wantedPlayerId={player.id}
        open={openModal}
        setRings={setRings}
        setPlayers={setPlayers}
        setOpenModal={setOpenModal}
        tournament={tournament}
      />
    </Grid>
  );
};

const PlayerTable = ({
  players,
  setPlayers,
  tournament,
  setRings,
  users
}: {
  players: UmpirePagePlayer[];
  setPlayers: Dispatch<SetStateAction<UmpirePagePlayer[]>>;
  tournament: Tournament;
  setRings: Dispatch<SetStateAction<RingWithAssignments[]>>;
  users: UmpirePageUser[];
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
    <Box>
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
      <Box sx={{ borderBottom: "1px solid", my: 2 }}>
        <b>Elossa ({activePlayers.length})</b>
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
      </Box>
      <Box sx={{ borderBottom: "1px solid", my: 2 }}>
        <b>Kuolleet ({deadPlayers.length})</b>
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
      </Box>
      <Box sx={{ borderBottom: "1px solid", my: 2 }}>
        <b>Etsivät ({detectivePlayers.length})</b>
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
      </Box>
    </Box>
  );
};

export default PlayerTable;
