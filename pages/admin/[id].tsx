import { Grid } from "@mui/material";
import { GetServerSideProps } from "next";
import { unstable_getServerSession } from "next-auth";
import { useEffect, useState } from "react";
import { AuthenticationRequired } from "../../components/AuthenticationRequired";
import { TournamentRings } from "../../components/Admin/TournamentRings";
import prisma from "../../lib/prisma";
import { authConfig } from "../api/auth/[...nextauth]";
import PlayerTable from "../../components/Admin/PlayerTable";

const isCurrentUserAuthorized = async (tournamentId, context) => {
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authConfig
  );

  const umpire = await prisma.umpire.findFirst({
    where: {
      userId: session.user.id,
      tournamentId: tournamentId
    }
  });
  return umpire != null;
};

export const getServerSideProps: GetServerSideProps = async ({
  params,
  ...context
}) => {
  if (!(await isCurrentUserAuthorized(params.id, context))) {
    console.log("Unauthorized admin tournament view!");
    return { redirect: { destination: "/personal", permanent: false } };
  }
  let tournament = await prisma.tournament.findUnique({
    where: {
      id: params.id as string
    }
  });
  let players = await prisma.player.findMany({
    where: {
      tournamentId: params.id as string
    },
    select: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      },
      id: true,
      targets: true,
      hunters: true,
      state: true,
      alias: true
    }
  });
  let ringList = await prisma.assignmentRing.findMany({
    where: {
      tournamentId: params.id as string
    },
    select: {
      id: true,
      name: true,
      assignments: true
    }
  });
  tournament = JSON.parse(JSON.stringify(tournament));
  const playerList = JSON.parse(JSON.stringify(players));
  ringList = JSON.parse(JSON.stringify(ringList));
  return {
    props: { tournament, playerList, ringList }
  };
};

export default function Tournament({ tournament, playerList, ringList }) {
  const [players, setPlayers] = useState<any[]>(playerList);
  const [rings, setRings] = useState<any[]>(ringList);

  const handlePlayerStatusChange = (playerState, id) => {
    const data = { state: playerState };
    fetch(`/api/player/${id}/state`, {
      method: "PATCH",
      body: JSON.stringify(data)
    });
    const playerToBeUpdated = players.find((p) => p.id == id);
    const updatedPlayer = { ...playerToBeUpdated, state: playerState };
    setPlayers(
      players.map((player) => (player.id !== id ? player : updatedPlayer))
    );
  };

  const handleMakeWanted = async (id) => {
    const res = await fetch(`/api/player/${id}/wanted`, {
      method: "POST"
    });

    const createdRing = await res.json();

    setRings((prevRings) => prevRings.concat(createdRing));
  };

  return (
    <AuthenticationRequired>
      <div>
        <h2 style={{ width: "100%" }}>{tournament.name}</h2>
        <Grid container>
          <Grid item xs={12} md={6}>
            <PlayerTable
              players={players}
              tournament={tournament}
              handlePlayerStatusChange={handlePlayerStatusChange}
              handleMakeWanted={handleMakeWanted}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TournamentRings
              tournament={tournament}
              players={players}
              rings={rings}
            />
          </Grid>
        </Grid>
      </div>
    </AuthenticationRequired>
  );
}
