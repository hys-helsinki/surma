import { Grid } from "@mui/material";
import { GetServerSideProps } from "next";
import { unstable_getServerSession } from "next-auth";
import { useState } from "react";
import { AuthenticationRequired } from "../../components/AuthenticationRequired";
import { TournamentRings } from "../../components/Admin/TournamentRings";
import prisma from "../../lib/prisma";
import { authConfig } from "../api/auth/[...nextauth]";
import PlayerTable from "../../components/Admin/PlayerTable";
import Link from "next/link";

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

  let users = await prisma.user.findMany({
    where: {
      tournamentId: params.id as string
    },
    include: {
      player: true,
      umpire: true
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
  const userList = JSON.parse(JSON.stringify(users));
  ringList = JSON.parse(JSON.stringify(ringList));
  return {
    props: { tournament, userList, ringList }
  };
};

export default function Tournament({ tournament, userList, ringList }) {
  const [users, setUsers] = useState<any[]>(userList);
  const [rings, setRings] = useState<any[]>(ringList);

  const handlePlayerStatusChange = (playerState, id) => {
    const data = { state: playerState };
    fetch(`/api/player/${id}/state`, {
      method: "PATCH",
      body: JSON.stringify(data)
    });
    const playerToBeUpdated = users.find((p) => p.id == id);
    const updatedPlayer = { ...playerToBeUpdated, state: playerState };
    setUsers(
      users.map((player) => (player.id !== id ? player : updatedPlayer))
    );
  };

  const handleMakeWanted = async (id) => {
    const res = await fetch(`/api/player/${id}/wanted`, {
      method: "POST"
    });

    const createdRing = await res.json();

    setRings((prevRings) => prevRings.concat(createdRing));
  };

  const unfinishedRegistrations = users.filter(
    (user) => !user.player && !user.umpire
  );

  const finishedRegistrations = users.filter((user) => user.player);

  return (
    <AuthenticationRequired>
      <div>
        <h2 style={{ width: "100%" }}>{tournament.name}</h2>
        <Grid container>
          <Grid item xs={12} md={6}>
            <div style={{ paddingLeft: "10px", marginBottom: "30px" }}>
              <h3>Keskeneräiset ilmoittautumiset</h3>
              {unfinishedRegistrations.map((user) => (
                <Link
                  href={`/tournaments/${tournament.id}/users/${user.id}`}
                  key={user.id}
                >
                  <a>
                    {user.firstName} {user.lastName}
                  </a>
                </Link>
              ))}
            </div>
            <PlayerTable
              users={finishedRegistrations}
              tournament={tournament}
              handlePlayerStatusChange={handlePlayerStatusChange}
              handleMakeWanted={handleMakeWanted}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TournamentRings
              tournament={tournament}
              users={finishedRegistrations}
              rings={rings}
            />
          </Grid>
        </Grid>
      </div>
    </AuthenticationRequired>
  );
}
