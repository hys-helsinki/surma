import { Grid, Box, Alert, Snackbar } from "@mui/material";
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
import { useSession } from "next-auth/react";
import StarIcon from "@mui/icons-material/Star";

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
    <Grid container key={player.id}>
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
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { data } = useSession();

  if (!data) return null;

  if (users.length === 0) return <p>Ei pelaajia</p>;

  const sortedPlayers = players.sort((a, b) =>
    a.user.firstName.localeCompare(b.user.firstName)
  );

  const myPlayers = sortedPlayers.filter(
    (player) => player.umpire && player.umpire.user.id === data.user.id
  );

  const otherPlayers = sortedPlayers.filter(
    (player) => !myPlayers.map((p) => p.id).includes(player.id)
  );

  const myActivePlayers = myPlayers.filter(
    (player) => player.state === "ACTIVE"
  );
  const myDeadPlayers = myPlayers.filter((player) => player.state === "DEAD");
  const myDetectivePlayers = myPlayers.filter(
    (player) => player.state === "DETECTIVE"
  );

  const activePlayers = otherPlayers.filter(
    (player) => player.state === "ACTIVE"
  );
  const deadPlayers = otherPlayers.filter((player) => player.state === "DEAD");
  const detectivePlayers = otherPlayers.filter(
    (player) => player.state === "DETECTIVE"
  );

  const unfinishedRegistrations = users
    .filter((user) => !user.player && !user.umpire)
    .sort((a, b) => a.firstName.localeCompare(b.firstName));

  const deleteUser = async (id: string) => {
    setIsButtonLoading(true);
    const searchedUser = users.find((user) => user.id === id);
    if (!searchedUser) {
      setIsButtonLoading(false);
      return;
    }
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
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          const error = errorData.error || "Pelaajan poistaminen epäonnistui";
          setErrorMessage(error);
          setShowError(true);
          setIsButtonLoading(false);
          return;
        }
        const {
          deletedUser
        }: {
          deletedUser: User;
        } = await res.json();
        setUsers(users.filter((u) => u.id !== deletedUser.id));
        setIsButtonLoading(false);
      } else {
        setIsButtonLoading(false);
      }
    } catch (e) {
      console.log(e);
      setErrorMessage("Pelaajan poistaminen epäonnistui");
      setShowError(true);
      setIsButtonLoading(false);
    }
  };

  const playerGroupSx = {
    borderBottom: "1px solid rgba(255, 255, 255, 0.25)",
    py: 2,
    "&:last-child": { borderBottom: "0" }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {unfinishedRegistrations.length > 0 && (
        <Box
          sx={{
            border: "1px solid rgba(255, 255, 255, 0.25)",
            borderRadius: 1,
            backgroundColor: "rgba(0, 0, 0, 0.15)",
            px: { xs: 2, md: 3 },
            pb: 2
          }}
        >
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
        </Box>
      )}
      {myPlayers.length > 0 && (
        <Box
          sx={{
            border: "1px solid rgba(255, 255, 255, 0.45)",
            borderRadius: 1,
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            px: { xs: 2, md: 3 }
          }}
        >
          <h2 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            Omat pelaajani <StarIcon />
          </h2>
          <Box sx={playerGroupSx}>
            <b>Elossa ({myActivePlayers.length})</b>
            {myActivePlayers.map((player) => (
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
          <Box sx={playerGroupSx}>
            <b>Kuolleet ({myDeadPlayers.length})</b>
            {myDeadPlayers.map((player) => (
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
          <Box sx={playerGroupSx}>
            <b>Etsivät ({myDetectivePlayers.length})</b>
            {myDetectivePlayers.map((player) => (
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
      )}

      <Box
        sx={{
          border:
            myPlayers.length > 0
              ? "1px solid rgba(255, 255, 255, 0.25)"
              : "1px solid rgba(255, 255, 255, 0.45)",
          borderRadius: 1,
          backgroundColor:
            myPlayers.length > 0
              ? "rgba(0, 0, 0, 0.15)"
              : "rgba(255, 255, 255, 0.05)",
          px: { xs: 2, md: 3 }
        }}
      >
        <h2>{myPlayers.length > 0 ? "Muut pelaajat" : "Pelaajat"}</h2>
        <Box sx={playerGroupSx}>
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
        <Box sx={playerGroupSx}>
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
        <Box sx={playerGroupSx}>
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
      <Snackbar
        open={showError}
        onClose={() => setShowError(false)}
        autoHideDuration={4000}
      >
        <Alert
          severity="error"
          variant="filled"
          sx={{ width: "100%" }}
          onClose={() => setShowError(false)}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PlayerTable;
