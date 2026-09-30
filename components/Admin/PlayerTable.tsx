import { Grid, Box } from "@mui/material";
import { Tournament, User } from "@prisma/client";
import Link from "next/link";
import { Dispatch, SetStateAction, useState } from "react";
import WantedModal from "./WantedModal";
import {
  RingWithAssignments,
  UmpirePagePlayer,
  UmpirePageUser
} from "../../types/umpirepage";
import SurmaButton from "../Common/SurmaButton";

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
      <Grid size={{ xs: 12, md: 4, xl: 2 }}>
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
          size={{ xs: 3, md: 1, xl: 1 }}
          sx={{
            display: "flex",
            alignItems: "center"
          }}
        >
          <SurmaButton
            onClick={() => handlePlayerStatusChange("DEAD", player.id)}
            loading={isStateButtonLoading == "DEAD"}
            sx={{ margin: "0" }}
          >
            Tapa
          </SurmaButton>
        </Grid>
      )}
      {player.state == "ACTIVE" && (
        <Grid
          size={{ xs: 5, md: 1, xl: 1 }}
          sx={{
            display: "flex",
            alignItems: "center"
          }}
        >
          <SurmaButton
            onClick={() => setOpenModal(true)}
            loading={false}
            sx={{ margin: "0" }}
          >
            Etsintäkuuluta
          </SurmaButton>
        </Grid>
      )}
      {player.state == "DEAD" && (
        <Grid
          size={{ xs: 4, md: 1, xl: 1 }}
          sx={{
            display: "flex",
            alignItems: "center"
          }}
        >
          <SurmaButton
            onClick={() => handlePlayerStatusChange("DETECTIVE", player.id)}
            loading={isStateButtonLoading == "DETECTIVE"}
            sx={{ margin: "0" }}
          >
            Etsiväksi
          </SurmaButton>
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
          <SurmaButton
            onClick={() => handlePlayerStatusChange("ACTIVE", player.id)}
            loading={isStateButtonLoading == "ACTIVE"}
            sx={{ margin: "0" }}
          >
            Herätä henkiin
          </SurmaButton>
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
  users: userList
}: {
  players: UmpirePagePlayer[];
  setPlayers: Dispatch<SetStateAction<UmpirePagePlayer[]>>;
  tournament: Tournament;
  setRings: Dispatch<SetStateAction<RingWithAssignments[]>>;
  users: UmpirePageUser[];
}) => {
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [users, setUsers] = useState(userList);
  if (users.length === 0) return <p>Ei pelaajia</p>;

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

  const deleteUser = async (id: string) => {
    setIsButtonLoading(true);
    const searchedUser = users.find((user) => user.id === id);
    try {
      if (
        window.confirm(
          `Haluatko varmasti poistaa pelaajan ${searchedUser.firstName} ${searchedUser.lastName}?`
        )
      ) {
        const data = { tournamentId: tournament.id };
        const res = await fetch(`/api/user/${id}`, {
          method: "DELETE",
          body: JSON.stringify(data)
        });
        const {
          deletedUser
        }: {
          deletedUser: User;
        } = await res.json();
        setUsers(users.filter((u) => u.id !== deletedUser.id));
      }
    } catch (e) {
      console.log(e);
    }
    setIsButtonLoading(false);
  };

  return (
    <Box>
      {unfinishedRegistrations.length > 0 && (
        <div style={{ marginBottom: "30px" }}>
          <h2>Keskeneräiset ilmoittautumiset</h2>

          {unfinishedRegistrations.map((user) => (
            <Grid container sx={{ display: "flex", alignItems: "center" }}>
              <Grid key={user.id} size={{ xs: 6, md: 2, lg: 2, xl: 1 }}>
                <Link href={`/tournaments/${tournament.id}/users/${user.id}`}>
                  {user.firstName} {user.lastName}
                </Link>
              </Grid>
              <Grid size={{ xs: 6, md: 2, lg: 2, xl: 1 }}>
                <SurmaButton
                  onClick={() => deleteUser(user.id)}
                  loading={isButtonLoading}
                  sx={{ margin: 0.5 }}
                >
                  Poista pelaaja
                </SurmaButton>
              </Grid>
            </Grid>
          ))}
        </div>
      )}
      <h2>Pelaajat</h2>
      <Box sx={{ borderBottom: "1px solid", my: 2, pb: 2 }}>
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
      <Box sx={{ borderBottom: "1px solid", my: 2, pb: 2 }}>
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
      <Box sx={{ borderBottom: "1px solid", my: 2, pb: 2 }}>
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
