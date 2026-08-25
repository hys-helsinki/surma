import { Box, Grid } from "@mui/material";
import { Tournament } from "@prisma/client";
import Link from "next/link";
import React, { Dispatch, SetStateAction, useState } from "react";
import {
  RingWithAssignments,
  UmpirePagePlayer,
  UmpirePageTeam,
  UmpirePageUser
} from "../../types/umpirepage";
import WantedModal from "./WantedModal";
import SurmaButton from "../Common/SurmaButton";

const states = {
  ACTIVE: "Elossa",
  DEAD: "Kuollut",
  DETECTIVE: "Etsivä",
  EXTRA: "Extra"
};

const PlayerRow = ({
  player,
  players,
  setPlayers,
  tournament,
  setRings,
  setTeams,
  teams,
  setOpenModal,
  setWantedPlayerId
}: {
  player: UmpirePagePlayer;
  players: UmpirePagePlayer[];
  setPlayers: Dispatch<SetStateAction<UmpirePagePlayer[]>>;
  tournament: Tournament;
  setRings: Dispatch<SetStateAction<RingWithAssignments[]>>;
  setTeams: Dispatch<SetStateAction<UmpirePageTeam[]>>;
  teams: UmpirePageTeam[];
  setOpenModal: Dispatch<SetStateAction<boolean>>;
  setWantedPlayerId: Dispatch<SetStateAction<string>>;
}) => {
  const [isStateButtonLoading, setIsStateButtonLoading] = useState("");

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
        setTeams(
          teams.map((team) =>
            team.id === player.team.id
              ? {
                  ...team,
                  players: updatedPlayerList.filter(
                    (player) => player.team.id === team.id
                  )
                }
              : team
          )
        );
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
      <Grid
        size={{ xs: 3, md: 2 }}
        sx={{
          display: "flex",
          alignItems: "center"
        }}
      >
        {states[player.state]}
      </Grid>
      {player.state == "ACTIVE" && (
        <Grid
          size={{ xs: 3, md: 2 }}
          sx={{
            display: "flex",
            alignItems: "center"
          }}
        >
          <SurmaButton
            onClick={() => handlePlayerStatusChange("DEAD", player.id)}
            loading={isStateButtonLoading == "DEAD"}
            className="loadingButton"
          >
            Tapa
          </SurmaButton>
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
          <SurmaButton
            onClick={() => {
              setOpenModal(true), setWantedPlayerId(player.id);
            }}
            loading={false}
            className="loadingButton"
          >
            Etsintäkuuluta
          </SurmaButton>
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
          <SurmaButton
            onClick={() => handlePlayerStatusChange("DETECTIVE", player.id)}
            loading={isStateButtonLoading == "DETECTIVE"}
            className="loadingButton"
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
            className="loadingButton"
          >
            Herätä henkiin
          </SurmaButton>
        </Grid>
      )}
    </Grid>
  );
};

const TeamTable = ({
  players,
  setPlayers,
  tournament,
  setRings,
  users,
  teams,
  setTeams
}: {
  players: UmpirePagePlayer[];
  setPlayers: Dispatch<SetStateAction<UmpirePagePlayer[]>>;
  tournament: Tournament;
  setRings: Dispatch<SetStateAction<RingWithAssignments[]>>;
  users: UmpirePageUser[];
  teams: UmpirePageTeam[];
  setTeams: Dispatch<SetStateAction<UmpirePageTeam[]>>;
}) => {
  const [openModal, setOpenModal] = useState(false);
  const [wantedPlayerId, setWantedPlayerId] = useState("");

  if (teams.length === 0) return <p>Ei pelaajia</p>;

  const sortedTeams = [...teams].sort((a, b) => a.name.localeCompare(b.name));

  const unfinishedRegistrations = users
    .filter((user) => !user.player && !user.umpire)
    .sort((a, b) => a.firstName.localeCompare(b.firstName));

  return (
    <Grid sx={{ marginBottom: "30px" }} container>
      <Grid size={{ xs: 12, lg: 7 }}>
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
          <Box key={team.id} sx={{ borderBottom: "1px solid", my: 2, pb: 2 }}>
            <h3>{team.name} </h3>

            {[...team.players]
              .sort((a, b) => a.user.lastName.localeCompare(b.user.lastName))
              .map((player) => (
                <PlayerRow
                  setOpenModal={setOpenModal}
                  setWantedPlayerId={setWantedPlayerId}
                  key={player.id}
                  player={player}
                  tournament={tournament}
                  setRings={setRings}
                  players={players}
                  setPlayers={setPlayers}
                  setTeams={setTeams}
                  teams={teams}
                />
              ))}
          </Box>
        ))}
      </Grid>
      <WantedModal
        players={players}
        wantedPlayerId={wantedPlayerId}
        open={openModal}
        setRings={setRings}
        setPlayers={setPlayers}
        setOpenModal={setOpenModal}
        tournament={tournament}
      />
    </Grid>
  );
};

export default TeamTable;
